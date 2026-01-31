import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery, useMutation } from '@apollo/client';
import { User, Mail, Calendar, Pencil, Check, X } from 'lucide-react-native';

import { Text, View } from '@/components/Themed';
import { Button } from '@/components/Button';
import { useToast } from '@/components/Toast';
import { GET_USER } from '@/lib/graphql/queries';
import { UPDATE_USER } from '@/lib/graphql/mutations';
import { signOut, getCurrentUserId } from '@/services/authService';
import {
  Spacing,
  BorderRadius,
  FontSize,
  AppColors,
  Shadow,
} from '@/constants/Theme';

interface UserData {
  userId: string;
  email: string;
  username: string | null;
  joinedBuildings: string[] | null;
  createdTime: string;
}

export default function ProfileScreen() {
  const { showToast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    loadUserId();
    return () => {
      isMounted.current = false;
    };
  }, []);

  const loadUserId = async () => {
    const id = await getCurrentUserId();
    if (isMounted.current) {
      setUserId(id);
      if (!id) {
        showToast('Please sign in to view your profile', 'error');
        router.replace('/login');
      }
    }
  };

  const { data, loading, error, refetch } = useQuery<{ getUser: UserData | null }>(
    GET_USER,
    {
      variables: { userId },
      skip: !userId,
      fetchPolicy: 'cache-and-network',
      onError: (err) => {
        console.log('Profile query error:', err.message);
      },
    }
  );

  const [updateUser, { loading: updating }] = useMutation(UPDATE_USER, {
    onCompleted: () => {
      showToast('Profile updated successfully', 'success');
      setIsEditing(false);
      refetch();
    },
    onError: (err) => {
      showToast(err.message || 'Failed to update profile', 'error');
    },
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleLogout = () => {
    signOut();
    showToast('Signed out successfully', 'success');
    router.replace('/login');
  };

  const handleEditStart = () => {
    setEditUsername(data?.getUser?.username || '');
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditUsername('');
  };

  const handleEditSave = () => {
    if (!editUsername.trim()) {
      showToast('Username cannot be empty', 'error');
      return;
    }
    updateUser({ variables: { username: editUsername.trim() } });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading && !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load profile</Text>
        <Text style={styles.errorDetail}>{error.message}</Text>
        <Button title="Retry" onPress={() => refetch()} />
        <Button
          title="Sign Out"
          variant="secondary"
          onPress={() => {
            signOut();
            router.replace('/login');
          }}
          style={{ marginTop: Spacing.md }}
        />
      </View>
    );
  }

  const user = data?.getUser;

  // Handle case where user exists in Cognito but not in DynamoDB
  if (!loading && !user && userId) {
    return (
      <View style={styles.errorContainer}>
        <User size={48} color={AppColors.placeholder} />
        <Text style={styles.errorText}>Profile not found</Text>
        <Text style={styles.errorDetail}>
          Your account exists but profile data is missing.
          This can happen if you signed up before the system was fully deployed.
        </Text>
        <Text style={styles.userIdText}>User ID: {userId}</Text>
        <Button title="Retry" onPress={() => refetch()} />
        <Button
          title="Sign Out"
          variant="secondary"
          onPress={() => {
            signOut();
            router.replace('/login');
          }}
          style={{ marginTop: Spacing.md }}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Profile Header */}
      <View
        style={styles.headerCard}
        lightColor={AppColors.white}
        darkColor={AppColors.darkCard}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <User size={48} color={AppColors.white} />
          </View>
        </View>
        <Text style={styles.username}>
          {user?.username || 'Neighbor'}
        </Text>
        <Text style={styles.memberSince}>
          Member since {user?.createdTime ? formatDate(user.createdTime) : '...'}
        </Text>
      </View>

      {/* User Info Section */}
      <View
        style={styles.sectionCard}
        lightColor={AppColors.white}
        darkColor={AppColors.darkCard}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          {!isEditing && (
            <Pressable onPress={handleEditStart} style={styles.editButton}>
              <Pencil size={18} color={AppColors.primary} />
            </Pressable>
          )}
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Mail size={20} color={AppColors.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email || '...'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <User size={20} color={AppColors.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Username</Text>
            {isEditing ? (
              <View style={styles.editRow}>
                <TextInput
                  style={styles.editInput}
                  value={editUsername}
                  onChangeText={setEditUsername}
                  placeholder="Enter username"
                  placeholderTextColor={AppColors.placeholder}
                  autoFocus
                  editable={!updating}
                />
                <Pressable
                  onPress={handleEditSave}
                  style={[styles.actionButton, styles.saveButton]}
                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator size="small" color={AppColors.white} />
                  ) : (
                    <Check size={18} color={AppColors.white} />
                  )}
                </Pressable>
                <Pressable
                  onPress={handleEditCancel}
                  style={[styles.actionButton, styles.cancelButton]}
                  disabled={updating}
                >
                  <X size={18} color={AppColors.white} />
                </Pressable>
              </View>
            ) : (
              <Text style={styles.infoValue}>
                {user?.username || 'Not set'}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Calendar size={20} color={AppColors.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Joined</Text>
            <Text style={styles.infoValue}>
              {user?.createdTime ? formatDate(user.createdTime) : '...'}
            </Text>
          </View>
        </View>
      </View>

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <Button
          title="Sign Out"
          variant="secondary"
          onPress={handleLogout}
          style={styles.logoutButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSize.md,
    color: AppColors.placeholder,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    fontSize: FontSize.md,
    color: '#DC2626',
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  errorDetail: {
    fontSize: FontSize.sm,
    color: AppColors.placeholder,
    textAlign: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  userIdText: {
    fontSize: FontSize.xs,
    color: AppColors.placeholder,
    fontFamily: 'monospace',
    marginBottom: Spacing.md,
  },
  headerCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadow.card,
  },
  avatarContainer: {
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: AppColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  memberSince: {
    fontSize: FontSize.sm,
    color: AppColors.placeholder,
  },
  sectionCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadow.card,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  editButton: {
    padding: Spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: `${AppColors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: FontSize.xs,
    color: AppColors.placeholder,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: FontSize.md,
    fontWeight: '500',
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editInput: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: '500',
    borderWidth: 1,
    borderColor: AppColors.primary,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginRight: Spacing.sm,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.xs,
  },
  saveButton: {
    backgroundColor: '#16A34A',
  },
  cancelButton: {
    backgroundColor: '#DC2626',
  },
  logoutSection: {
    marginTop: Spacing.md,
  },
  logoutButton: {
    borderColor: '#DC2626',
  },
});
