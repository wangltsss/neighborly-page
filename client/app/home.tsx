import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { LogOut, PlusCircle, MinusCircle } from 'lucide-react-native';
import { ActionButton } from '@/components/ActionButton';
import { BuildingCard } from '@/components/BuildingCard';
import { MOCK_BUILDINGS } from '@/assets/mockdata/CommunityData';

export default function NeighborlyHome() {
  return (
    <View className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="w-full"
      >
        <View className="flex-1 flex-col px-6 py-10">

          {/* Header */}
          <Text className="text-xl font-bold text-emerald-800 text-center mb-6 w-full mt-4">
            Your Community
          </Text>

          {/* Building Grid */}
          <View className="flex-row flex-wrap justify-center w-full mb-12 gap-10">
            {MOCK_BUILDINGS.map((building) => (
              <BuildingCard
                key={building.id}
                name={building.name}
                location={`${building.city}, ${building.province}, Canada`}
                imageColor={building.imageColor}
                onPress={() => alert(`Viewing ${building.name}`)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons - Fixed at Bottom */}
      <View className="w-full flex-col items-start gap-4 px-6 pb-6 pt-4 border-t border-slate-100 bg-white">

        <ActionButton
          label="Join an Apartment"
          icon={<PlusCircle size={24} />}
          variant="primary"
          onPress={() => alert("Navigating to Building Directory...")}
        />

        <ActionButton
          label="Leave Apartment"
          icon={<MinusCircle size={24} />}
          variant="secondary"
          disabled={true}
          onPress={() => alert("Opening Leave Apartment Modal...")}
        />

        <ActionButton
          label="Log out"
          icon={<LogOut size={24} />}
          variant="danger"
          onPress={() => alert("Logging out...")}
        />

      </View>
    </View>
  );
}
