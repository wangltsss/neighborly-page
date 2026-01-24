import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

interface Member {
  userId: string;
  username?: string;
  isOnline?: boolean;
}

interface MemberListProps {
  members: Member[];
}

/**
 * MemberList Component
 * Displays list of channel members on the right side
 * 
 * TODO Phase 1:
 * - [ ] Replace mock data with GraphQL query (GetBuildingMembers)
 * - [ ] Add resolver to query Users table filtered by buildingId
 * 
 * TODO Phase 2:
 * - [ ] Implement real-time online status using subscriptions
 * - [ ] Add user avatars
 * - [ ] Add role badges (admin, moderator, etc.)
 */
export default function MemberList({ members }: MemberListProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Members ({members.length})</Text>
      <FlatList
        data={members}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => (
          <View style={styles.memberItem}>
            <View style={[
              styles.statusDot, 
              item.isOnline && styles.statusDotOnline
            ]} />
            <Text style={styles.memberName}>
              {item.username || item.userId.substring(0, 8)}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '20%',
    borderLeftWidth: 1,
    borderLeftColor: '#ddd',
    backgroundColor: '#f9f9f9',
    padding: 16,
  },
  header: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginRight: 8,
  },
  statusDotOnline: {
    backgroundColor: '#4caf50',
  },
  memberName: {
    fontSize: 13,
    color: '#333',
  },
});
