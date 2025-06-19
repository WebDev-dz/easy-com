import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Store, ShoppingCart, User, Package, TrendingUp, Inbox } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useStats } from '@/hooks/stats-hooks';

export default function HomeScreen() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { userStats, isLoading: isStatsLoading, error: statsError, refetch } = useStats();

  const handleNavigateToStores = () => {
    router.push('/(tabs)/stores');
  };

  const handleNavigateToOrders = () => {
    router.push('/orders/my-orders');
  };

  const handleNavigateToOrdersReceived = () => {
    router.push('/orders/all-received');
  };

  const handleNavigateToProfile = () => {
    router.push('/(tabs)/profile');
  };

  const quickActions = [
    {
      icon: Store,
      title: 'My Stores',
      subtitle: 'Manage your stores',
      color: '#8B5CF6',
      onPress: handleNavigateToStores,
    },
    {
      icon: ShoppingCart,
      title: 'My Orders',
      subtitle: 'Track your purchases',
      color: '#059669',
      onPress: handleNavigateToOrders,
    },
    {
      icon: Inbox,
      title: 'Orders Received',
      subtitle: 'Manage incoming orders',
      color: '#DC2626',
      onPress: handleNavigateToOrdersReceived,
    },
    {
      icon: User,
      title: 'Profile',
      subtitle: 'Account settings',
      color: '#7C3AED',
      onPress: handleNavigateToProfile,
    },
  ];

  const statsCards = [
    { label: 'Active Stores', value: userStats.totalStores.toString(), icon: Store },
    { label: 'Products Listed', value: userStats.totalProducts.toString(), icon: Package },
    { label: 'Orders Received', value: userStats.totalOrders.toString(), icon: ShoppingCart },
    { label: 'Total Reviews', value: userStats.totalReviews.toString(), icon: TrendingUp },
  ];

  if (isAuthLoading || isStatsLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </SafeAreaView>
    );
  }

  const userName = user?.email?.split('@')[0] || 'User';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <View style={styles.profileImage}>
            <Image
              source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}` }}
              style={styles.profileImageSource}
            />
          </View>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Your Business Overview</Text>
          <View style={styles.statsGrid}>
            {statsCards.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <stat.icon size={24} color="#6B7280" />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionCard}
              onPress={action.onPress}
            >
              <View style={[styles.actionIcon, { backgroundColor: `${action.color}15` }]}>
                <action.icon size={24} color={action.color} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.recentActivity}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            {userStats.recentActivity.length > 0 ? (
              userStats.recentActivity.map((activity) => (
                <View key={activity.id} style={styles.activityItem}>
                  <View style={styles.activityDot} />
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{activity.description}</Text>
                    <Text style={styles.activityTime}>
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noActivityText}>No recent activities</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  profileImageSource: {
    width: '100%',
    height: '100%',
  },
  statsContainer: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  quickActionsContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  recentActivity: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  activityTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  noActivityText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    padding: 16,
  },
});