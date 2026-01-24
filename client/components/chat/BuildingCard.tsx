import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useQuery } from '@apollo/client';
import { GET_BUILDING } from '@/lib/graphql/queries';

interface BuildingCardProps {
  buildingId: string;
}

/**
 * BuildingCard Component
 * 
 * Displays building information at the top of channel list.
 * Shows building name and address in a compact card format.
 * 
 * TODO Phase 2:
 * - Add building image (placeholder icon for now)
 * - Parse address to extract city/province/country
 * - Add member count display
 */
export default function BuildingCard({ buildingId }: BuildingCardProps) {
  const { data, loading, error } = useQuery<{
    getBuilding: {
      buildingId: string;
      name?: string;
      address: string;
      memberCount: number;
    };
  }>(GET_BUILDING, {
    variables: { buildingId },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error || !data?.getBuilding) {
    return null; // Don't show card if building not found
  }

  const building = data.getBuilding;
  
  // Extract city from address (simple parsing)
  // Format: "100 King St, Waterloo, ON, Canada" -> "Waterloo, ON"
  const getLocationFromAddress = (address: string): string => {
    const parts = address.split(',').map(p => p.trim());
    if (parts.length >= 3) {
      return `${parts[1]}, ${parts[2]}`;
    }
    return address;
  };

  return (
    <View style={styles.container}>
      {/* Building icon placeholder */}
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>🏢</Text>
      </View>
      
      {/* Building info */}
      <View style={styles.infoContainer}>
        <Text style={styles.buildingName} numberOfLines={1}>
          {building.name || 'Building'}
        </Text>
        <Text style={styles.location} numberOfLines={1}>
          {getLocationFromAddress(building.address)}
        </Text>
        <Text style={styles.memberCount}>
          {building.memberCount} members
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 28,
  },
  infoContainer: {
    flex: 1,
  },
  buildingName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  location: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  memberCount: {
    fontSize: 12,
    color: '#999',
  },
  loadingText: {
    fontSize: 14,
    color: '#999',
  },
});
