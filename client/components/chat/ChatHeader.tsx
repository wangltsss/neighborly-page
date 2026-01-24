import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

interface ChatHeaderProps {
  channelName: string;
  channelDescription?: string;
}

/**
 * ChatHeader Component
 * Displays channel name and description at top of message area
 */
export default function ChatHeader({ channelName, channelDescription }: ChatHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.push('/')}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
      
      <View style={styles.channelInfo}>
        <Text style={styles.channelName}># {channelName}</Text>
        {channelDescription && (
          <Text style={styles.channelDescription}>{channelDescription}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: 'white',
  },
  backButton: {
    paddingRight: 16,
    paddingVertical: 4,
  },
  backButtonText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '600',
  },
  channelInfo: {
    flex: 1,
  },
  channelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  channelDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});
