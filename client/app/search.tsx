import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Stack, useNavigation } from 'expo-router';
import { LocationWizard } from '@/components/LocationWizard';
import { BuildingSearch } from '@/components/BuildingSearch';
import { MOCK_BUILDINGS } from '@/assets/mockdata/CommunityData';
import { searchStyles } from '@/constants/NativeWindStyles';

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
    <View className={searchStyles.pageContainer}>
      <Stack.Screen
        options={{
          headerTitle: step === 1 ? 'Join Another Apartment' : 'Find Building',
          headerBackTitle: "",
        }}
      />

      {/* --- STEP 1: LOCATION SELECTION --- */}
      {step === 1 && (
        <LocationWizard
          selectedCountry={selectedCountry}
          selectedProvince={selectedProvince}
          selectedCity={selectedCity}
          onCountryChange={handleCountryChange}
          onProvinceChange={handleProvinceChange}
          onCityChange={setSelectedCity}
          onNext={handleNextStep}
        />
      )}

      {/* --- STEP 2: SPECIFIC SEARCH --- */}
      {step === 2 && (
        <BuildingSearch
          selectedCity={selectedCity}
          selectedProvince={selectedProvince}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filteredBuildings={filteredBuildings}
          onChangeLocation={() => setStep(1)}
          onJoin={onJoin}
        />
      )}
    </View>
  );
}