import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { SelectBox } from '@/components/SelectBox';
import { LOCATIONS } from '@/assets/mockdata/CommunityData';
import { searchStyles } from '@/constants/NativeWindStyles';

interface LocationWizardProps {
    selectedCountry: string;
    selectedProvince: string;
    selectedCity: string;
    onCountryChange: (val: string) => void;
    onProvinceChange: (val: string) => void;
    onCityChange: (val: string) => void;
    onNext: () => void;
}

export const LocationWizard: React.FC<LocationWizardProps> = ({
    selectedCountry,
    selectedProvince,
    selectedCity,
    onCountryChange,
    onProvinceChange,
    onCityChange,
    onNext
}) => {
    const isComplete = selectedCountry && selectedProvince && selectedCity;

    return (
        <ScrollView className={searchStyles.wizardScroll} contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
            <View className={searchStyles.wizardContent}>
                <View className={searchStyles.headerContainer}>
                    <Text className={searchStyles.headerTitle}>Where do you live?</Text>
                    <Text className={searchStyles.headerSubtitle}>
                        Help us narrow down the directory to your neighborhood.
                    </Text>
                </View>

                <View className={searchStyles.formContainer}>
                    <SelectBox
                        label="Country"
                        value={selectedCountry}
                        onChange={onCountryChange}
                        placeholder="Select Country"
                        options={Object.keys(LOCATIONS).map(key => ({ value: key, label: LOCATIONS[key as keyof typeof LOCATIONS].name }))}
                    />

                    <SelectBox
                        label="Province"
                        value={selectedProvince}
                        onChange={onProvinceChange}
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
                        onChange={onCityChange}
                        disabled={!selectedProvince}
                        placeholder={selectedProvince ? "Select City" : "Select Province first"}
                        options={selectedCountry && selectedProvince ? LOCATIONS[selectedCountry as keyof typeof LOCATIONS].provinces[selectedProvince as keyof typeof LOCATIONS['Canada']['provinces']].cities.map(city => ({
                            value: city,
                            label: city
                        })) : []}
                    />
                </View>

                <Pressable
                    onPress={onNext}
                    disabled={!isComplete}
                    className={`${searchStyles.continueButtonBase} ${isComplete ? searchStyles.continueButtonActive : searchStyles.continueButtonDisabled}`}
                >
                    <Text className={`${searchStyles.continueTextBase} ${isComplete ? searchStyles.continueTextActive : searchStyles.continueTextDisabled}`}>
                        Continue
                    </Text>
                    <ArrowRight size={20} color={!isComplete ? '#a8b5c9' : 'white'} />
                </Pressable>
            </View>
        </ScrollView>
    );
};
