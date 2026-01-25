import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ChatHeaderProps {
  channelName: string;
  channelDescription?: string;
}

/**
 * ChatHeader Component
 * Displays channel name and description at top of message area
 */
export default function ChatHeader({ channelName, channelDescription }: ChatHeaderProps) {
  return (
    <View style={styles.container}>
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
