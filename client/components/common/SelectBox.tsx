import React, { useState, useCallback, memo } from 'react';
import { View, Text, Pressable, Modal, FlatList } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { selectBoxStyles } from '@/constants/NativeWindStyles';

interface Option {
    value: string;
    label: string;
}

interface SelectBoxProps {
    label: string;
    value: string;
    onChange: (val: string) => void;
    options: Option[];
    disabled?: boolean;
    placeholder?: string;
}

// Memoized Option Component
const SelectOption = memo(({ item, isSelected, onSelect }: { item: Option, isSelected: boolean, onSelect: (val: string) => void }) => (
    <Pressable
        onPress={() => onSelect(item.value)}
        className={selectBoxStyles.optionItem}
    >
        <Text className={isSelected ? selectBoxStyles.optionTextSelected : selectBoxStyles.optionTextNormal}>
            {item.label}
        </Text>
    </Pressable>
));

export const SelectBox: React.FC<SelectBoxProps> = ({
    label,
    value,
    onChange,
    options,
    disabled = false,
    placeholder = "Select..."
}) => {
    const [showPicker, setShowPicker] = useState(false);

    const handleSelect = useCallback((val: string) => {
        onChange(val);
        setShowPicker(false);
    }, [onChange]);

    return (
        <View className={selectBoxStyles.container}>
            <Text className={selectBoxStyles.label}>
                {label}
            </Text>
            <Pressable
                onPress={() => !disabled && setShowPicker(true)}
                className={`${selectBoxStyles.pickerBase} ${disabled ? selectBoxStyles.pickerDisabled : selectBoxStyles.pickerActive}`}
            >
                <Text className={`${selectBoxStyles.textBase} ${disabled ? selectBoxStyles.textDisabled : selectBoxStyles.textActive}`}>
                    {value ? options.find(o => o.value === value)?.label : placeholder}
                </Text>
                <ChevronDown size={18} color={disabled ? '#cbd5e1' : '#64748b'} />
            </Pressable>

            <Modal
                visible={showPicker}
                transparent
                animationType="fade"
                onRequestClose={() => setShowPicker(false)}
            >
                <Pressable
                    className={selectBoxStyles.modalOverlay}
                    onPress={() => setShowPicker(false)}
                >
                    <View className={selectBoxStyles.modalContent}>
                        <Text className={selectBoxStyles.modalTitle}>{label}</Text>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <SelectOption
                                    item={item}
                                    isSelected={value === item.value}
                                    onSelect={handleSelect}
                                />
                            )}
                            scrollEnabled
                            nestedScrollEnabled
                            initialNumToRender={10}
                            maxToRenderPerBatch={10}
                            windowSize={5}
                        />
                        <Pressable
                            onPress={() => setShowPicker(false)}
                            className={selectBoxStyles.cancelButton}
                        >
                            <Text className={selectBoxStyles.cancelText}>Cancel</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};
