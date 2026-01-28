package com.neighborly.handlers;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.neighborly.models.AppSyncEvent;
import com.neighborly.models.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Lambda handler for updating user profile information.
 *
 * Handles the updateUser GraphQL mutation.
 * Only allows users to update their own profile (uses Cognito identity).
 */
public class UpdateUserHandler implements RequestHandler<AppSyncEvent, User> {
    private static final Logger logger = LoggerFactory.getLogger(UpdateUserHandler.class);
    private final DynamoDbClient dynamoDbClient;
    private final String tableName;

    public UpdateUserHandler() {
        this.dynamoDbClient = DynamoDbClient.create();
        this.tableName = System.getenv("USERS_TABLE_NAME");
        if (this.tableName == null || this.tableName.isEmpty()) {
            throw new IllegalStateException("USERS_TABLE_NAME environment variable not set");
        }
    }

    // Constructor for testing with mocked client
    public UpdateUserHandler(DynamoDbClient dynamoDbClient, String tableName) {
        this.dynamoDbClient = dynamoDbClient;
        this.tableName = tableName;
    }

    @Override
    public User handleRequest(AppSyncEvent event, Context context) {
        logger.info("UpdateUserHandler invoked for field: {}", event.getFieldName());

        // Get the authenticated user's ID from Cognito identity
        String userId = event.getUserId();
        if (userId == null || userId.isEmpty()) {
            logger.error("No authenticated user identity found");
            throw new RuntimeException("Unauthorized: No user identity");
        }

        // Get the username from arguments
        Map<String, Object> arguments = event.getArguments();
        String newUsername = (String) arguments.get("username");

        if (newUsername == null || newUsername.trim().isEmpty()) {
            throw new RuntimeException("Username cannot be empty");
        }

        logger.info("Updating username for user: {} to: {}", userId, newUsername);

        try {
            // Update the user in DynamoDB
            Map<String, AttributeValue> key = new HashMap<>();
            key.put("userId", AttributeValue.builder().s(userId).build());

            Map<String, AttributeValueUpdate> updates = new HashMap<>();
            updates.put("username", AttributeValueUpdate.builder()
                    .value(AttributeValue.builder().s(newUsername.trim()).build())
                    .action(AttributeAction.PUT)
                    .build());

            UpdateItemRequest updateRequest = UpdateItemRequest.builder()
                    .tableName(tableName)
                    .key(key)
                    .attributeUpdates(updates)
                    .returnValues(ReturnValue.ALL_NEW)
                    .build();

            UpdateItemResponse response = dynamoDbClient.updateItem(updateRequest);
            Map<String, AttributeValue> updatedItem = response.attributes();

            // Convert to User object
            return mapToUser(updatedItem);

        } catch (DynamoDbException e) {
            logger.error("DynamoDB error updating user: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to update user profile: " + e.getMessage());
        }
    }

    /**
     * Convert DynamoDB item to User object.
     */
    private User mapToUser(Map<String, AttributeValue> item) {
        User user = new User();

        if (item.containsKey("userId")) {
            user.setUserId(item.get("userId").s());
        }
        if (item.containsKey("email")) {
            user.setEmail(item.get("email").s());
        }
        if (item.containsKey("username")) {
            user.setUsername(item.get("username").s());
        }
        if (item.containsKey("createdTime")) {
            user.setCreatedTime(item.get("createdTime").s());
        }
        if (item.containsKey("joinedBuildings") && item.get("joinedBuildings").l() != null) {
            List<String> buildings = item.get("joinedBuildings").l().stream()
                    .map(AttributeValue::s)
                    .collect(Collectors.toList());
            user.setJoinedBuildings(buildings);
        }

        return user;
    }
}
