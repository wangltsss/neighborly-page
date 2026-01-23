import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { buildingCardStyles } from '@/constants/NativeWindStyles';

interface BuildingCardProps {
    name: string;
    location: string;
    imageColor?: string;
    onPress: () => void;
}

export const BuildingCard: React.FC<BuildingCardProps> = ({
    name,
    location,
    imageColor = 'bg-slate-200',
    onPress
}) => {
    return (
        <View className={buildingCardStyles.card}>
            {/* Circle Image Placeholder */}
            {/* TODO: Add image fetching prop*/}
            <View className={`${buildingCardStyles.imageContainer} ${imageColor}`}>
                {/* Placeholder for actual image */}
                <View className={buildingCardStyles.imagePlaceholder} />
            </View>

            <Text className={buildingCardStyles.name}>
                {name}
            </Text>

            <Text className={buildingCardStyles.location}>
                {location}
            </Text>

            <Pressable
                onPress={onPress}
                className={buildingCardStyles.button}
            >
                <Text className={buildingCardStyles.buttonText}>View</Text>
            </Pressable>
        </View>
    );
};
