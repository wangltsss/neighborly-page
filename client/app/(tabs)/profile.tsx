import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@apollo/client';
import { LogOut, User, Mail, Calendar, Building2 } from 'lucide-react-native';

import { Text, View } from '@/components/Themed';
import { Button } from '@/components/Button';
import { useToast } from '@/components/Toast';
import { GET_USER } from '@/lib/graphql/queries';
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

  const { data, loading, error, refetch } = useQuery<{ getUser: UserData }>(
    GET_USER,
    {
      variables: { userId },
      skip: !userId,
      fetchPolicy: 'cache-and-network',
    }
  );

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
        <Button title="Retry" onPress={() => refetch()} />
      </View>
    );
  }

  const user = data?.getUser;

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
        <Text style={styles.sectionTitle}>Account Information</Text>

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
            <Text style={styles.infoValue}>
              {user?.username || 'Not set'}
            </Text>
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

      {/* Buildings Section */}
      <View
        style={styles.sectionCard}
        lightColor={AppColors.white}
        darkColor={AppColors.darkCard}
      >
        <Text style={styles.sectionTitle}>My Buildings</Text>

        {user?.joinedBuildings && user.joinedBuildings.length > 0 ? (
          user.joinedBuildings.map((buildingId, index) => (
            <View key={buildingId} style={styles.buildingRow}>
              <View style={styles.infoIcon}>
                <Building2 size={20} color={AppColors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoValue}>Building {index + 1}</Text>
                <Text style={styles.buildingId}>{buildingId}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Building2 size={32} color={AppColors.placeholder} />
            <Text style={styles.emptyText}>
              You haven't joined any buildings yet
            </Text>
            <Button
              title="Join a Building"
              variant="secondary"
              onPress={() => router.push('/search')}
              style={styles.joinButton}
            />
          </View>
        )}
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
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    marginBottom: Spacing.lg,
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
  buildingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  buildingId: {
    fontSize: FontSize.xs,
    color: AppColors.placeholder,
    fontFamily: 'monospace',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: AppColors.placeholder,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  joinButton: {
    minWidth: 150,
  },
  logoutSection: {
    marginTop: Spacing.md,
  },
  logoutButton: {
    borderColor: '#DC2626',
  },
});
