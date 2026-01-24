import React, { useState, useEffect } from 'react';
import { Button, View } from 'react-native';
import { Stack, useNavigation } from 'expo-router';
import { LocationWizard } from '@/components/search/LocationWizard';
import { BuildingSearch } from '@/components/search/BuildingSearch';
import { MOCK_BUILDINGS } from '@/assets/mockdata/CommunityData';
import { searchStyles } from '@/constants/NativeWindStyles';

interface BuildingDiscoveryProps {
  onBack?: () => void;
  onJoin?: (buildingId: string) => void;
}

export default function BuildingDiscovery({ onBack, onJoin }: BuildingDiscoveryProps) {
  // State for Wizard Flow
  const [step, setStep] = useState<number>(1);
  const navigation = useNavigation();

  // State for Selection (Step 1)
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  // State for Search (Step 2)
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  // Keep track of step in a ref to access inside listener without re-binding
  const stepRef = React.useRef(step);
  useEffect(() => { stepRef.current = step; }, [step]);

  // Intercept Back Navigation for Wizard Step
  useEffect(() => {
    const handleBeforeRemove = (e: any) => {
      // Access the current step value from the ref
      if (stepRef.current === 2) {
        // Prevent default behavior (leaving the screen)
        e.preventDefault();
        // Go back to step 1
        setStep(1);
        setSearchQuery('');
      } else if (onBack) {
        // If on step 1, allow default behavior or call onBack prop
        e.preventDefault(); // Prevent default behavior to handle with onBack
        onBack();
      }
      // If no onBack, default behavior (router.back()) will occur
    };

    const unsubscribe = navigation.addListener('beforeRemove', handleBeforeRemove);

    return () => {
      unsubscribe();
    };
  }, [navigation, onBack]); // Listener is now stable across step changes

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