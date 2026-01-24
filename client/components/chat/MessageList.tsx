import React, { useEffect, useRef } from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { useQuery } from '@apollo/client';
import { LIST_MESSAGES } from '@/lib/graphql/queries';

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

  // oldest appear first (backend returns newest-first)
  const messages: Message[] = [...(data?.listMessages?.items || [])].reverse();

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
            <Text style={styles.userId}>{message.userId.substring(0, 8)}...</Text>
            <Text style={styles.timestamp}>
              {new Date(message.sentTime).toLocaleString()}
            </Text>
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
    justifyContent: 'space-between',
    marginBottom: 8,
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
