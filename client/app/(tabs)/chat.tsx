import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import ChannelList from '@/components/chat/ChannelList';
import ChatHeader from '@/components/chat/ChatHeader';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import MemberList from '@/components/chat/MemberList';

/**
 * Chat Screen Component
 * 
 * Main chat interface with channel list and message area.
 * 
 * TODO Phase 1 Completion:
 * - [ ] Replace hardcoded buildingId with route param from Home tab navigation
 * - [ ] Implement real member list query (currently mock data)
 * - [ ] Deploy AuthStack to enable message sending
 * 
 * TODO Phase 2:
 * - [ ] Add real-time subscriptions for new messages
 * - [ ] Implement user presence/online status
 * - [ ] Add unread message badges
 * - [ ] Migrate to Context API for state management
 */
export default function ChatScreen() {
  const [activeChannelId, setActiveChannelId] = useState<string | undefined>();
  const [activeChannelName, setActiveChannelName] = useState<string>('');
  const [activeChannelDesc, setActiveChannelDesc] = useState<string | undefined>();
  
  // TODO: Get buildingId from route params when integrated with Home tab
  // Expected: const { buildingId } = useLocalSearchParams<{ buildingId: string }>();
  const buildingId = 'test-building-1';
  
  // TODO: Replace mock data with real GraphQL query
  // Need to add resolver: query GetBuildingMembers($buildingId: ID!)
  // Mock members for Phase 1
  const members = [
    { userId: 'api-test-user', username: 'Test User', isOnline: true },
  ];
  
  const handleChannelSelect = (channelId: string, name: string, description?: string) => {
    setActiveChannelId(channelId);
    setActiveChannelName(name);
    setActiveChannelDesc(description);
  };

  return (
    <View style={styles.container}>
      {/* Left sidebar - Channel list */}
      <View style={styles.channelListContainer}>
        <ChannelList
          buildingId={buildingId}
          activeChannelId={activeChannelId}
          onChannelSelect={(id, name, desc) => handleChannelSelect(id, name, desc)}
        />
      </View>

      {/* Main area - Messages */}
      <View style={styles.messageAreaContainer}>
        {activeChannelId ? (
          <>
            <ChatHeader 
              channelName={activeChannelName} 
              channelDescription={activeChannelDesc}
            />
            <MessageList channelId={activeChannelId} />
            <MessageInput channelId={activeChannelId} />
          </>
        ) : (
          <View style={styles.emptyState}>
            {/* Empty state when no channel selected */}
          </View>
        )}
      </View>
      
      {/* Right sidebar - Member list */}
      {activeChannelId && (
        <MemberList members={members} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
  },
  channelListContainer: {
    width: '30%',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  messageAreaContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});
