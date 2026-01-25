import React, { useEffect, useRef, useMemo } from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { useQuery } from '@apollo/client';
import { LIST_MESSAGES, GET_USERS_BY_IDS } from '@/lib/graphql/queries';
import Avatar from './Avatar';

/**
 * Message item type
 */
interface Message {
  messageId: string;
  channelId: string;
  userId: string;
  content: string;
  mediaUrl?: string;
  sentTime: string;
}

/**
 * Props for MessageList component
 */
interface MessageListProps {
  channelId: string;
}

/**
 * MessageList Component
 * 
 * Displays messages in a channel.
 * Auto-scrolls to bottom when new messages arrive.
 * 
 * Phase 1 limitations:
 * - No pagination (loads all messages)
 * - No real-time subscriptions
 * - No "New Message" divider
 * - Displays userId instead of username
 */
export default function MessageList({ channelId }: MessageListProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  
  const { data, loading, error } = useQuery<{
    listMessages: {
      items: Message[];
      nextToken?: string;
    };
  }>(LIST_MESSAGES, {
    variables: { channelId },
    pollInterval: 5000, // Poll every 5 seconds as temp solution for real-time
  });

  // Reverse messages so oldest appear first
  const messages: Message[] = [...(data?.listMessages?.items || [])].reverse();

  // IDs should be unique
  const userIds = useMemo(() => {
    return Array.from(new Set(messages.map(m => m.userId)));
  }, [messages]);

  // Fetch for all unique user IDs
  const { data: usersData } = useQuery<{
    getUsersByIds: Array<{
      userId: string;
      username?: string;
      email: string;
    }>;
  }>(GET_USERS_BY_IDS, {
    variables: { userIds },
    skip: userIds.length === 0,
  });

  // Create user ID to user map for quick lookup
  const userMap = useMemo(() => {
    const map = new Map<string, { username?: string; email: string }>();
    usersData?.getUsersByIds?.forEach(user => {
      map.set(user.userId, { username: user.username, email: user.email });
    });
    return map;
  }, [usersData]);

  // Get display name with fallback chain
  const getDisplayName = (userId: string): string => {
    const user = userMap.get(userId);
    if (user?.username) return user.username;
    if (user?.email) return user.email.split('@')[0];
    return userId.substring(0, 8);
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  if (loading && messages.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  if (error) {
    console.error('MessageList error:', error);
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error loading messages</Text>
        <Text style={styles.errorText}>{error.message}</Text>
      </View>
    );
  }

  if (messages.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No messages yet. Start the conversation!</Text>
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {messages.map((message) => (
        <View key={message.messageId} style={styles.messageItem}>
          <View style={styles.messageHeader}>
            <Avatar username={getDisplayName(message.userId)} size={32} />
            <View style={styles.userInfo}>
              <Text style={styles.userId}>{getDisplayName(message.userId)}</Text>
              <Text style={styles.timestamp}>
                {new Date(message.sentTime).toLocaleString()}
              </Text>
            </View>
          </View>
          <Text style={styles.messageContent}>{message.content}</Text>
          {message.mediaUrl && (
            <Text style={styles.mediaUrl}>📎 {message.mediaUrl}</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  messageItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#1976d2',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  userInfo: {
    flex: 1,
  },
  userId: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976d2',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
  },
  messageContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  mediaUrl: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
