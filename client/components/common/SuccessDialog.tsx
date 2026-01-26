import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { CheckCircle2, X } from 'lucide-react-native';

interface SuccessDialogProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

/**
 * Reusable success dialog component
 * Shows a success message with confirmation button
 */
export const SuccessDialog: React.FC<SuccessDialogProps> = ({
  visible,
  title,
  message,
  onConfirm,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onConfirm}
    >
      {/* Backdrop */}
      <Pressable 
        className="flex-1 bg-black/50 items-center justify-center p-6"
        onPress={onConfirm}
      >
        {/* Dialog Content */}
        <Pressable 
          className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Success Icon */}
          <View className="items-center pt-8 pb-4">
            <View className="bg-green-100 p-4 rounded-full mb-4">
              <CheckCircle2 size={48} color="#22c55e" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              {title}
            </Text>
            <Text className="text-base text-gray-600 text-center px-6">
              {message}
            </Text>
          </View>

          {/* Footer */}
          <View className="px-6 pb-6 pt-2">
            <Pressable
              onPress={onConfirm}
              className="px-6 py-3 rounded-xl bg-green-600 active:bg-green-700"
            >
              <Text className="text-center text-base font-semibold text-white">
                OK
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
