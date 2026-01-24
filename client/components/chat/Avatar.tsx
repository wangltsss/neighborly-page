import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AvatarProps {
  username: string;
  size?: number;
}

/**
 * Avatar Component
 * 
 * Displays user initials in a colored circle.
 * Color is consistently generated from username hash.
 * 
 * @param username - User's display name
 * @param size - Avatar diameter in pixels (default: 40)
 */
export default function Avatar({ username, size = 40 }: AvatarProps) {
  const initial = username?.charAt(0).toUpperCase() || '?';
  const backgroundColor = stringToColor(username || '');
  
  return (
    <View style={[styles.container, { width: size, height: size, backgroundColor }]}>
      <Text style={[styles.initial, { fontSize: size * 0.5 }]}>
        {initial}
      </Text>
    </View>
  );
}

/**
 * Generate consistent HSL color from string
 * Same string always produces same color
 */
function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Use hash to generate hue (0-360)
  const hue = Math.abs(hash) % 360;
  
  // Return HSL color with good saturation and lightness
  return `hsl(${hue}, 65%, 50%)`;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 999, // Fully rounded
    justifyContent: 'center',
    alignItems: 'center',
  },
  initial: {
    color: 'white',
    fontWeight: 'bold',
  },
});
