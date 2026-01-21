import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, BackHandler } from 'react-native';
import { Search, MapPin, Users, ArrowRight, CheckCircle2, Building2 } from 'lucide-react-native';
import { Stack, router, useNavigation } from 'expo-router';
import { SelectBox } from '@/components/SelectBox';
import { LOCATIONS, MOCK_BUILDINGS } from '@/assets/mockdata/CommunityData';

interface BuildingDiscoveryProps {
  onBack?: () => void;
  onJoin?: (buildingId: string) => void;
}

export default function BuildingDiscovery({ onBack, onJoin }: BuildingDiscoveryProps) {
  // State for Wizard Flow
  const [step, setStep] = useState(1);
  const navigation = useNavigation();

  // State for Selection (Step 1)
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // State for Search (Step 2)
  const [searchQuery, setSearchQuery] = useState('');

  // --- HANDLERS ---
  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    setSelectedProvince('');
    setSelectedCity('');
  };

  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value);
    setSelectedCity('');
  };

  const handleNextStep = () => {
    if (selectedCountry && selectedProvince && selectedCity) {
      setStep(2);
    }
  };

  // Intercept Back Navigation for Wizard Step
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (step === 2) {
        // Prevent default behavior (leaving the screen)
        e.preventDefault();
        // Go back to step 1
        setStep(1);
        setSearchQuery('');
      } else {
        // If on step 1, allow default behavior or call onBack prop
        if (onBack) {
          e.preventDefault(); // Prevent default behavior to handle with onBack
          onBack();
        }
        // If no onBack, default behavior (router.back()) will occur
      }
    });

    return unsubscribe;
  }, [navigation, step, onBack]);

  // --- FILTER LOGIC ---
  const filteredBuildings = MOCK_BUILDINGS.filter(b => {
    const matchesLocation =
      (!selectedProvince || b.province === selectedProvince) &&
      (!selectedCity || b.city === selectedCity);

    const matchesQuery =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.address.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesLocation && matchesQuery;
  });

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen
        options={{
          headerTitle: step === 1 ? 'Join Another Apartment' : 'Find Building',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#1e293b',
          headerTitleStyle: { fontWeight: 'bold' },
          headerBackTitle: "",
        }}
      />

      {/* --- STEP 1: LOCATION SELECTION --- */}
      {step === 1 && (
        <ScrollView className="flex-1 w-full" contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
          <View className="max-w-lg mx-auto w-full">
            <View className="mb-8">
              <Text className="text-2xl font-bold text-slate-900 mb-2">Where do you live?</Text>
              <Text className="text-slate-500 text-base leading-relaxed">
                Help us narrow down the directory to your neighborhood.
              </Text>
            </View>

            <View className="flex-1">
              <SelectBox
                label="Country"
                value={selectedCountry}
                onChange={handleCountryChange}
                placeholder="Select Country"
                options={Object.keys(LOCATIONS).map(key => ({ value: key, label: LOCATIONS[key as keyof typeof LOCATIONS].name }))}
              />

              <SelectBox
                label="Province"
                value={selectedProvince}
                onChange={handleProvinceChange}
                disabled={!selectedCountry}
                placeholder={selectedCountry ? "Select Province" : "Select Country first"}
                options={selectedCountry ? Object.keys(LOCATIONS[selectedCountry as keyof typeof LOCATIONS].provinces).map(prov => ({
                  value: prov,
                  label: LOCATIONS[selectedCountry as keyof typeof LOCATIONS].provinces[prov as keyof typeof LOCATIONS['Canada']['provinces']].name
                })) : []}
              />

              <SelectBox
                label="City"
                value={selectedCity}
                onChange={(val) => setSelectedCity(val)}
                disabled={!selectedProvince}
                placeholder={selectedProvince ? "Select City" : "Select Province first"}
                options={selectedCountry && selectedProvince ? LOCATIONS[selectedCountry as keyof typeof LOCATIONS].provinces[selectedProvince as keyof typeof LOCATIONS['Canada']['provinces']].cities.map(city => ({
                  value: city,
                  label: city
                })) : []}
              />
            </View>

            <Pressable
              onPress={handleNextStep}
              disabled={!selectedCountry || !selectedProvince || !selectedCity}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-sm mt-8 flex-row items-center justify-center gap-2
                ${(!selectedCountry || !selectedProvince || !selectedCity)
                  ? 'bg-slate-200'
                  : 'bg-indigo-600 active:bg-indigo-700'}
              `}
            >
              <Text className={`text-lg font-bold ${(!selectedCountry || !selectedProvince || !selectedCity) ? 'text-slate-400' : 'text-white'}`}>
                Continue
              </Text>
              <ArrowRight size={20} color={(!selectedCountry || !selectedProvince || !selectedCity) ? '#a8b5c9' : 'white'} />
            </Pressable>
          </View>
        </ScrollView>
      )}

      {/* --- STEP 2: SPECIFIC SEARCH --- */}
      {step === 2 && (
        <View className="flex-1 flex flex-col">
          {/* Context Header */}
          <View className="bg-indigo-50 px-4 py-3 border-b border-indigo-100 flex-row justify-between items-center">
            <View className="flex items-center flex-row">
              <MapPin size={14} color="#1e1b4b" className="mr-1.5" />
              <Text className="text-indigo-900 text-sm font-medium">
                {selectedCity}, {selectedProvince}
              </Text>
            </View>
            <Pressable onPress={() => setStep(1)}>
              <Text className="text-xs text-indigo-600 font-semibold underline">
                Change
              </Text>
            </Pressable>
          </View>

          {/* Search Input */}
          <View className="p-4 bg-white border-b border-slate-100 z-10 shadow-sm flex-row items-center">
            <Search size={18} color="#cbd5e1" />
            <TextInput
              autoFocus
              className="flex-1 ml-3 py-3 text-sm bg-white text-slate-900"
              placeholder="Search specific address or building name..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#94a3b8"
            />
          </View>

          <ScrollView className="flex-1 p-4 bg-slate-50">
            {/* Results Header */}
            <View className="mb-4 flex flex-row justify-between items-center">
              <Text className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Available Buildings
              </Text>
              <View className="bg-white border border-slate-200 px-2 py-1 rounded-md shadow-sm">
                <Text className="text-xs text-slate-400 font-medium">{filteredBuildings.length} found</Text>
              </View>
            </View>

            {/* List */}
            {filteredBuildings.length > 0 ? (
              <View className="gap-3 pb-8">
                {filteredBuildings.map((building) => (
                  <Pressable
                    key={building.id}
                    onPress={() => onJoin ? onJoin(building.id) : console.log('Selected:', building.name)}
                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex-row items-center gap-4 active:bg-slate-50"
                  >
                    <View className={`w-14 h-14 rounded-lg flex items-center justify-center shrink-0 ${building.imageColor}`}>
                      <Building2 size={24} color="#475569" opacity={0.7} />
                    </View>

                    <View className="flex-1 min-w-0">
                      <View className="flex-row items-center gap-1 mb-0.5">
                        <Text className="font-bold text-slate-900 flex-1 truncate" numberOfLines={1}>
                          {building.name}
                        </Text>
                        {building.verified && (
                          <CheckCircle2 size={14} color="#3b82f6" />
                        )}
                      </View>

                      <View className="flex-row items-center text-slate-500 text-xs mb-1">
                        <MapPin size={12} color="#94a3b8" />
                        <Text className="text-slate-500 text-xs ml-1" numberOfLines={1}>
                          {building.address}
                        </Text>
                      </View>

                      <View className="flex-row items-center text-slate-500 text-xs">
                        <Users size={12} color="#94a3b8" />
                        <Text className="text-slate-500 text-xs ml-1">
                          {building.residents} neighbors
                        </Text>
                      </View>
                    </View>

                    <ArrowRight size={20} color="#cbd5e1" />
                  </Pressable>
                ))}
              </View>
            ) : (
              <View className="py-12 flex flex-col items-center">
                <View className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Building2 size={24} color="#9ca3af" />
                </View>
                <Text className="text-slate-900 font-medium mb-1">No buildings here yet</Text>
                <Text className="text-slate-500 text-sm max-w-[220px] text-center leading-relaxed">
                  We don't have any verified communities in {selectedCity} matching your search.
                </Text>
                <Pressable className="mt-6">
                  <Text className="text-indigo-600 font-semibold text-sm underline">
                    Create a new community
                  </Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}