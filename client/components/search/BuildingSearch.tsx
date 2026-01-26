import React from 'react';
import { View, Text, Pressable, TextInput, FlatList } from 'react-native';
import { Search, MapPin, Users, CheckCircle2, Building2, ArrowRight } from 'lucide-react-native';
import { Building } from '@/services/building.service';
import { buildingSearchStyles } from '@/constants/NativeWindStyles';

interface BuildingSearchProps {
    selectedCity: string;
    selectedProvince: string;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    filteredBuildings: Building[];
    onChangeLocation: () => void;
    onJoin?: (id: string) => void;
}

export const BuildingSearch: React.FC<BuildingSearchProps> = ({
    selectedCity,
    selectedProvince,
    searchQuery,
    onSearchChange,
    filteredBuildings,
    onChangeLocation,
    onJoin
}) => {
    return (
        <View className={buildingSearchStyles.container}>
            {/* Context Header */}
            <View className={buildingSearchStyles.contextHeader}>
                <View className={buildingSearchStyles.contextTextContainer}>
                    <MapPin size={14} color="#1e1b4b" style={{ marginRight: 6 }} />
                    <Text className={buildingSearchStyles.contextText}>
                        {selectedCity}, {selectedProvince}
                    </Text>
                </View>
                <Pressable onPress={onChangeLocation}>
                    <Text className={buildingSearchStyles.changeText}>
                        Change
                    </Text>
                </Pressable>
            </View>

            {/* Search Input */}
            <View className={buildingSearchStyles.searchContainer}>
                <Search size={18} color="#cbd5e1" />
                <TextInput
                    autoFocus
                    className={buildingSearchStyles.searchInput}
                    placeholder="Search specific address or building name..."
                    value={searchQuery}
                    onChangeText={onSearchChange}
                    placeholderTextColor="#94a3b8"
                />
            </View>

            <FlatList
                className={buildingSearchStyles.resultsScroll}
                data={filteredBuildings}
                keyExtractor={(item) => item.buildingId}
                ListHeaderComponent={
                    <View className={buildingSearchStyles.resultsHeader}>
                        <Text className={buildingSearchStyles.resultsTitle}>
                            Available Buildings
                        </Text>
                        <View className={buildingSearchStyles.resultsCountContainer}>
                            <Text className={buildingSearchStyles.resultsCountText}>{filteredBuildings.length} found</Text>
                        </View>
                    </View>
                }
                ItemSeparatorComponent={() => <View className="h-3" />}
                ListFooterComponent={filteredBuildings.length > 0 ? <View className="h-8" /> : null}
                ListEmptyComponent={
                    <View className={buildingSearchStyles.emptyStateContainer}>
                        <View className={buildingSearchStyles.emptyStateIcon}>
                            <Building2 size={24} color="#9ca3af" />
                        </View>
                        <Text className={buildingSearchStyles.emptyStateTitle}>No buildings here yet</Text>
                        <Text className={buildingSearchStyles.emptyStateDescription}>
                            We don't have any verified communities in {selectedCity} matching your search.
                        </Text>
                    </View>
                }
                renderItem={({ item: building }) => (
                    <Pressable
                        onPress={() => onJoin ? onJoin(building.buildingId) : alert(`Selected: ${building.name}`)}
                        className={buildingSearchStyles.cardContainer}
                    >
                        <View className={`${buildingSearchStyles.cardImagePlaceholder} bg-indigo-100`}>
                            <Building2 size={24} color="#475569" opacity={0.7} />
                        </View>

                        <View className={buildingSearchStyles.cardContent}>
                            <View className={buildingSearchStyles.cardRow}>
                                <Text className={buildingSearchStyles.cardTitle} numberOfLines={1}>
                                    {building.name || 'Unnamed Building'}
                                </Text>
                            </View>

                            <View className={buildingSearchStyles.cardMetaRow}>
                                <MapPin size={12} color="#94a3b8" />
                                <Text className={buildingSearchStyles.cardMetaText} numberOfLines={1}>
                                    {building.address}
                                </Text>
                            </View>

                            <View className={buildingSearchStyles.cardMetaRow}>
                                <Users size={12} color="#94a3b8" />
                                <Text className={buildingSearchStyles.cardMetaText}>
                                    {building.memberCount} neighbors
                                </Text>
                            </View>
                        </View>

                        <ArrowRight size={20} color="#cbd5e1" />
                    </Pressable>
                )}
            />
        </View>
    );
};
