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
 * Lambda handler for retrieving user profile information.
 *
 * Handles the getUser GraphQL query.
 */
public class GetUserHandler implements RequestHandler<AppSyncEvent, User> {
    private static final Logger logger = LoggerFactory.getLogger(GetUserHandler.class);
    private final DynamoDbClient dynamoDbClient;
    private final String tableName;

    public GetUserHandler() {
        this.dynamoDbClient = DynamoDbClient.create();
        this.tableName = System.getenv("USERS_TABLE_NAME");
        if (this.tableName == null || this.tableName.isEmpty()) {
            throw new IllegalStateException("USERS_TABLE_NAME environment variable not set");
        }
    }

    // Constructor for testing with mocked client
    public GetUserHandler(DynamoDbClient dynamoDbClient, String tableName) {
        this.dynamoDbClient = dynamoDbClient;
        this.tableName = tableName;
    }

    @Override
    public User handleRequest(AppSyncEvent event, Context context) {
        logger.info("GetUserHandler invoked for field: {}", event.getFieldName());

        // Get userId from arguments
        Map<String, Object> arguments = event.getArguments();
        String userId = (String) arguments.get("userId");

        if (userId == null || userId.isEmpty()) {
            logger.error("userId argument is required");
            throw new RuntimeException("userId is required");
        }

        logger.info("Fetching user profile for: {}", userId);

        try {
            // Get the user from DynamoDB
            Map<String, AttributeValue> key = new HashMap<>();
            key.put("userId", AttributeValue.builder().s(userId).build());

            GetItemRequest getRequest = GetItemRequest.builder()
                    .tableName(tableName)
                    .key(key)
                    .build();

            GetItemResponse response = dynamoDbClient.getItem(getRequest);

            if (!response.hasItem() || response.item().isEmpty()) {
                logger.info("User not found: {}", userId);
                return null;
            }

            return mapToUser(response.item());

        } catch (DynamoDbException e) {
            logger.error("DynamoDB error fetching user: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch user profile: " + e.getMessage());
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
