import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';

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
        <View className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 items-center w-80">
            {/* Circle Image Placeholder */}
            <View className={`w-20 h-20 rounded-full mb-3 ${imageColor} items-center justify-center overflow-hidden`}>
                {/* Placeholder for actual image */}
                <View className="w-full h-full bg-black/5" />
            </View>

            <Text className="font-bold text-slate-900 text-center mb-1 text-base">
                {name}
            </Text>

            <Text className="text-slate-500 text-xs text-center mb-4">
                {location}
            </Text>

            <Pressable
                onPress={onPress}
                className="bg-indigo-600 w-full py-2.5 rounded-lg items-center active:bg-indigo-700"
            >
                <Text className="text-white font-semibold text-sm">View</Text>
            </Pressable>
        </View>
    );
};
