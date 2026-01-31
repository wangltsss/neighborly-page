import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { XCircle } from 'lucide-react-native';

interface ErrorDialogProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

/**
 * Reusable error dialog component
 * Shows an error message with confirmation button
 * Styled to match SuccessDialog but with error colors
 */
export const ErrorDialog: React.FC<ErrorDialogProps> = ({
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
          {/* Error Icon */}
          <View className="items-center pt-8 pb-4">
            <View className="bg-red-100 p-4 rounded-full mb-4">
              <XCircle size={48} color="#ef4444" />
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
              className="px-6 py-3 rounded-xl bg-red-600 active:bg-red-700"
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
