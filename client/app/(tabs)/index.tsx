import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';

import { ActionButton } from '@/components/ActionButton';
import { BuildingCard } from '@/components/BuildingCard';
import { MOCK_BUILDINGS } from '@/assets/mockdata/CommunityData';
import { homeStyles } from '@/constants/NativeWindStyles';

import '../../global.css';

export default function HomeScreen() {
  return (
    <View className={homeStyles.container}>
      {/* Sidebar (Left) */}
      <View className={homeStyles.sidebarContainer}>

        <ActionButton
          label="Join an Apartment"
          variant="primary"
          onPress={() => router.push('/search')}
        />

        <ActionButton
          label="Leave Apartment"
          variant="secondary"
          disabled={true}
          onPress={() => alert("Opening Leave Apartment Modal...")}
        />

        <ActionButton
          label="Log out"
          variant="danger"
          onPress={() => alert("Logging out...")}
        />

      </View>

      {/* Main Content (Right) */}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className={homeStyles.scrollView}
      >
        <View className={homeStyles.contentContainer}>

          {/* Header */}
          <Text className={homeStyles.headerTitle}>
            Your Community
          </Text>

          {/* Building Grid */}
          <View className={homeStyles.gridContainer}>
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
    </View>
  );
}
