package com.neighborly.handlers;

import com.neighborly.models.AppSyncEvent;
import com.neighborly.models.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.*;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class UpdateUserHandlerTest {

    @Mock
    private DynamoDbClient mockDynamoDbClient;

    private UpdateUserHandler handler;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        handler = new UpdateUserHandler(mockDynamoDbClient, "test-users-table");
    }

    @Test
    void testUpdateUsername_Success() {
        // Arrange
        String userId = "test-user-123";
        String newUsername = "TestUser";

        AppSyncEvent event = createEvent(userId, newUsername);

        Map<String, AttributeValue> updatedItem = new HashMap<>();
        updatedItem.put("userId", AttributeValue.builder().s(userId).build());
        updatedItem.put("email", AttributeValue.builder().s("test@example.com").build());
        updatedItem.put("username", AttributeValue.builder().s(newUsername).build());
        updatedItem.put("createdTime", AttributeValue.builder().s("2024-01-01T00:00:00Z").build());

        UpdateItemResponse mockResponse = UpdateItemResponse.builder()
                .attributes(updatedItem)
                .build();

        when(mockDynamoDbClient.updateItem(any(UpdateItemRequest.class)))
                .thenReturn(mockResponse);

        // Act
        User result = handler.handleRequest(event, null);

        // Assert
        assertNotNull(result);
        assertEquals(userId, result.getUserId());
        assertEquals(newUsername, result.getUsername());
        assertEquals("test@example.com", result.getEmail());
    }

    @Test
    void testUpdateUsername_NoIdentity_ThrowsException() {
        // Arrange
        AppSyncEvent event = new AppSyncEvent();
        event.setFieldName("updateUser");
        Map<String, Object> args = new HashMap<>();
        args.put("username", "TestUser");
        event.setArguments(args);
        // No identity set

        // Act & Assert
        assertThrows(RuntimeException.class, () -> handler.handleRequest(event, null));
    }

    @Test
    void testUpdateUsername_EmptyUsername_ThrowsException() {
        // Arrange
        AppSyncEvent event = createEvent("user-123", "");

        // Act & Assert
        assertThrows(RuntimeException.class, () -> handler.handleRequest(event, null));
    }

    private AppSyncEvent createEvent(String userId, String username) {
        AppSyncEvent event = new AppSyncEvent();
        event.setFieldName("updateUser");
        event.setTypeName("Mutation");

        Map<String, Object> args = new HashMap<>();
        args.put("username", username);
        event.setArguments(args);

        AppSyncEvent.Identity identity = new AppSyncEvent.Identity();
        identity.setSub(userId);
        event.setIdentity(identity);

        return event;
    }
}
