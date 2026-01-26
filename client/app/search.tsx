import React, { useState, useEffect } from 'react';
import { Button, View } from 'react-native';
import { Stack, useNavigation } from 'expo-router';
import { LocationWizard } from '@/components/search/LocationWizard';
import { BuildingSearch } from '@/components/search/BuildingSearch';
import { buildingService, Building } from '@/services/building.service';
import { apolloClient } from '@/lib/apollo-client';
import { JOIN_BUILDING } from '@/lib/graphql/mutations';
import { ConfirmJoinDialog } from '@/components/search/ConfirmJoinDialog';
import { SuccessDialog } from '@/components/common/SuccessDialog';
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
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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

  const handleNextStep = async () => {
    if (selectedCountry && selectedProvince && selectedCity) {
      setLoading(true);
      setError('');
      try {
        // Fetch buildings for selected location
        const results = await buildingService.searchBuildings({
          city: selectedCity,
          state: selectedProvince, // Note: frontend uses "province" but backend uses "state"
        });
        setBuildings(results);
        setStep(2);
      } catch (err) {
        setError('Failed to load buildings. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleJoinBuilding = (buildingId: string) => {
    // Find the selected building
    const building = buildings.find(b => b.buildingId === buildingId);
    if (!building) return;

    // Show custom confirmation dialog
    setSelectedBuilding(building);
    setShowConfirmDialog(true);
  };

  const handleConfirmJoin = async () => {
    if (!selectedBuilding) return;

    setLoading(true);
    try {
      // Call joinBuilding mutation and wait for response
      await apolloClient.mutate({
        mutation: JOIN_BUILDING,
        variables: { buildingId: selectedBuilding.buildingId },
      });

      // Close confirm dialog
      setShowConfirmDialog(false);
      
      // Show success dialog
      setSuccessMessage(`You have successfully joined ${selectedBuilding.name || 'the building'}!`);
      setShowSuccessDialog(true);
    } catch (err) {
      console.error('Failed to join building:', err);
      setShowConfirmDialog(false);
      // Show error using window.alert as fallback
      setTimeout(() => {
        window.alert('Error: Failed to join building. Please try again.');
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessDialog(false);
    setSelectedBuilding(null);
    
    // Navigate to home page after user confirms success
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // @ts-ignore - router navigation
      navigation.navigate('index');
    }
  };

  const handleCancelJoin = () => {
    setShowConfirmDialog(false);
    setSelectedBuilding(null);
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
  const filteredBuildings = buildings.filter(b => {
    const matchesQuery =
      searchQuery === '' ||
      b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesQuery;
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
          onJoin={handleJoinBuilding}
        />
      )}

      {/* Confirm Join Dialog */}
      {selectedBuilding && (
        <ConfirmJoinDialog
          visible={showConfirmDialog}
          buildingName={selectedBuilding.name}
          address={selectedBuilding.address}
          memberCount={selectedBuilding.memberCount}
          onConfirm={handleConfirmJoin}
          onCancel={handleCancelJoin}
          loading={loading}
        />
      )}

      {/* Success Dialog */}
      <SuccessDialog
        visible={showSuccessDialog}
        title="Success!"
        message={successMessage}
        onConfirm={handleSuccessConfirm}
      />
    </View>
  );
}