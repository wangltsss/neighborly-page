import React from 'react';
import { View, Text } from 'react-native';
import { Building2, MapPin, Users } from 'lucide-react-native';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

interface ConfirmJoinDialogProps {
  visible: boolean;
  buildingName?: string;
  address: string;
  memberCount: number;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * Confirmation dialog specifically for joining a building
 * Uses the reusable ConfirmDialog with building-specific content
 */
export const ConfirmJoinDialog: React.FC<ConfirmJoinDialogProps> = ({
  visible,
  buildingName,
  address,
  memberCount,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  return (
    <ConfirmDialog
      visible={visible}
      title="Join Building"
      message={`Do you want to join ${buildingName || 'this building'}?`}
      icon={Building2}
      iconColor="#4f46e5"
      iconBgColor="bg-indigo-100"
      confirmText="Join"
      confirmColor="bg-indigo-600 active:bg-indigo-700"
      onConfirm={onConfirm}
      onCancel={onCancel}
      loading={loading}
    >
      {/* Building Details */}
      <View className="bg-gray-50 rounded-xl p-4 gap-3">
        {/* Address */}
        <View className="flex-row items-start gap-3">
          <MapPin size={18} color="#6b7280" />
          <Text className="flex-1 text-sm text-gray-700">{address}</Text>
        </View>

        {/* Members */}
        <View className="flex-row items-center gap-3">
          <Users size={18} color="#6b7280" />
          <Text className="text-sm text-gray-700">
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </Text>
        </View>
      </View>
    </ConfirmDialog>
  );
};
