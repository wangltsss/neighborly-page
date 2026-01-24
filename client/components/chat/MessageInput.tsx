import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useMutation } from '@apollo/client';
import { CREATE_MESSAGE } from '@/lib/graphql/mutations';
import { LIST_MESSAGES } from '@/lib/graphql/queries';

/**
 * Props for MessageInput component
 */
interface MessageInputProps {
  channelId: string;
  onMessageSent?: () => void;
}

/**
 * MessageInput Component
 * 
 * Allows users to send text messages to a channel.
 * 
 * TODO Phase 1:
 * - [ ] Deploy AuthStack to enable message creation (resolver updated but not deployed)
 * 
 * TODO Phase 2:
 * - [ ] Add file upload support
 * - [ ] Add emoji picker
 * - [ ] Add typing indicator
 * - [ ] Add @ mention autocomplete
 */
export default function MessageInput({ channelId, onMessageSent }: MessageInputProps) {
  const [content, setContent] = useState('');
  
  const [createMessage, { loading }] = useMutation(CREATE_MESSAGE, {
    // Refetch messages after sending to update the list
    refetchQueries: [
      { query: LIST_MESSAGES, variables: { channelId } }
    ],
  });

  const handleSend = async () => {
    const trimmedContent = content.trim();
    
    if (!trimmedContent) {
      return;
    }

    try {
      await createMessage({
        variables: {
          channelId,
          content: trimmedContent,
        },
      });
      
      setContent('');
      onMessageSent?.();
    } catch (error) {
      console.error('Error sending message:', error);
      // TODO: Show error to user
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={content}
        onChangeText={setContent}
        placeholder="Type your message..."
        placeholderTextColor="#999"
        multiline
        maxLength={1000}
        editable={!loading}
      />
      <TouchableOpacity
        style={[styles.sendButton, loading && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={loading || !content.trim()}
      >
        <Text style={styles.sendButtonText}>
          {loading ? '...' : 'Send'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    fontSize: 14,
    marginRight: 8,
  },
  sendButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#1976d2',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
