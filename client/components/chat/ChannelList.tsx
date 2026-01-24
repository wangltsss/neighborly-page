import React from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useQuery } from '@apollo/client';
import { useRouter } from 'expo-router';
import { LIST_CHANNELS } from '@/lib/graphql/queries';
import BuildingCard from './BuildingCard';

/**
 * Channel item type
 */
interface Channel {
  channelId: string;
  buildingId: string;
  name: string;
  description?: string;
}

/**
 * Props for ChannelList component
 */
interface ChannelListProps {
  buildingId: string;
  activeChannelId?: string;
  onChannelSelect: (channelId: string, name: string, description?: string) => void;
}

/**
 * ChannelList Component
 * 
 * Displays a list of channels for a building.
 * Highlights the currently active channel.
 * 
 * Phase 1: Basic channel list without unread badges
 */
export default function ChannelList({ 
  buildingId, 
  activeChannelId, 
  onChannelSelect 
}: ChannelListProps) {
  const router = useRouter();
  
  const { data, loading, error } = useQuery<{
    listChannels: Channel[];
  }>(LIST_CHANNELS, {
    variables: { buildingId },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading channels...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error loading channels</Text>
      </View>
    );
  }

  const channels: Channel[] = data?.listChannels || [];

  return (
    <View style={styles.container}>
      {/* Building info card */}
      <BuildingCard buildingId={buildingId} />
      
      <Text style={styles.header}>Channels</Text>
      <FlatList
        data={channels}
        keyExtractor={(item) => item.channelId}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.channelItem,
              item.channelId === activeChannelId && styles.activeChannelItem,
            ]}
            onPress={() => onChannelSelect(item.channelId, item.name, item.description)}
          >
            <Text style={[
              styles.channelName,
              item.channelId === activeChannelId && styles.activeChannelName,
            ]}>
              # {item.name}
            </Text>
            {item.description && (
              <Text style={styles.channelDescription}>{item.description}</Text>
            )}
          </TouchableOpacity>
        )}
      />
      
      {/* Back button footer */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.push('/')}
      >
        <Text style={styles.backButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  channelItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  activeChannelItem: {
    backgroundColor: '#e3f2fd',
  },
  channelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  activeChannelName: {
    color: '#1976d2',
  },
  channelDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    textAlign: 'center',
  },
  backButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#1976d2',
    borderRadius: 8,
    alignItems: 'center' as const,
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600' as const,
  },
});
