import React, { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

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

export const SelectBox: React.FC<SelectBoxProps> = ({
    label,
    value,
    onChange,
    options,
    disabled = false,
    placeholder = "Select..."
}) => {
    const [showPicker, setShowPicker] = useState(false);

    return (
        <View className="mb-5 w-full">
            <Text className="text-sm font-semibold text-slate-700 mb-2">
                {label}
            </Text>
            <Pressable
                onPress={() => !disabled && setShowPicker(true)}
                className={`flex-row items-center px-4 py-3.5 border rounded-xl
          ${disabled ? 'bg-slate-100 border-slate-200' : 'bg-white border-slate-300'}
        `}
            >
                <Text className={`flex-1 ${disabled ? 'text-slate-400' : 'text-slate-900'}`}>
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
                    className="flex-1 bg-black/50 justify-end"
                    onPress={() => setShowPicker(false)}
                >
                    <View className="bg-white rounded-t-2xl p-4 max-h-[70%]">
                        <Text className="text-lg font-bold text-slate-900 mb-4">{label}</Text>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <Pressable
                                    onPress={() => {
                                        onChange(item.value);
                                        setShowPicker(false);
                                    }}
                                    className="py-3 px-4 border-b border-slate-100 active:bg-slate-50"
                                >
                                    <Text className={value === item.value ? 'font-bold text-indigo-600' : 'text-slate-900'}>
                                        {item.label}
                                    </Text>
                                </Pressable>
                            )}
                            scrollEnabled
                            nestedScrollEnabled
                        />
                        <Pressable
                            onPress={() => setShowPicker(false)}
                            className="mt-4 py-3 px-4 bg-slate-100 rounded-xl"
                        >
                            <Text className="text-center font-semibold text-slate-700">Cancel</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};
