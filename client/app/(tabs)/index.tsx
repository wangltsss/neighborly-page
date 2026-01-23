import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { LogOut, PlusCircle, MinusCircle } from 'lucide-react-native';

import { ActionButton } from '@/components/common/ActionButton';
import { BuildingCard } from '@/components/home/BuildingCard';
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
          icon={<PlusCircle size={24} color="white" />}
          variant="primary"
          onPress={() => router.push('/search')}
        />

        <ActionButton
          label="Leave Apartment"
          icon={<MinusCircle size={24} color="#334155" />}
          variant="secondary"
          disabled={true}
          onPress={() => alert("Opening Leave Apartment Modal...")}
        />

        <ActionButton
          label="Log out"
          icon={<LogOut size={24} color="#ef4444" />}
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
