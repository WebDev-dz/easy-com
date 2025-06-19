import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, AlertTriangle } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useGetRecievedSupplierOrders } from '@/hooks/supplier-order-hooks';
import { OrdersGrid } from '@/components/orders-grid';
import { useSupplier } from '@/hooks/supplier-hooks';

export default function StoreOrdersScreen() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const { user } = useAuth();
  const { storeId } = useLocalSearchParams();
  const { data: store, isPending: isStoreLoading } = useSupplier(Number(storeId) || 0);
  const { data: orders = [], isPending, error, mutate: getSupplierOrders } = useGetRecievedSupplierOrders();



  useEffect(() => {
    if (user && store) {
      if (store?.user_id === user.id) {
        getSupplierOrders(store.id);
      }
    }
  }, [user, store]);

  const statusFilters = [
    { key: 'all', label: 'All Orders' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Processing' },
    { key: 'delivered', label: 'Delivered' },
  ];

  const filteredOrders = selectedStatus === 'all' 
    ? (orders || [])
    : (orders || []).filter(order =>  order.status == selectedStatus);

  


  if (isStoreLoading || isPending) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!store || store.user_id !== user?.id) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/stores")} style={styles.backButton}>
            <ArrowLeft size={24} color="#1E293B" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Access Denied</Text>
            <Text style={styles.subtitle}>You are not authorized to view these orders</Text>
          </View>
        </View>
        <View style={styles.unauthorizedContainer}>
          <AlertTriangle size={48} color="#EF4444" />
          <Text style={styles.unauthorizedText}>
            You don't have permission to view orders for this store
          </Text>
          <TouchableOpacity 
            style={styles.backToStoresButton}
            onPress={() => router.push('/stores')}
          >
            <Text style={styles.backToStoresButtonText}>Back to Stores</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Orders Received</Text>
          <Text style={styles.subtitle}>Manage your store orders</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        {statusFilters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              selectedStatus === filter.key && styles.filterChipActive,
            ]}
            onPress={() => setSelectedStatus(filter.key)}
          >
            <Text
              style={[
                styles.filterText,
                selectedStatus === filter.key && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.ordersContainer}>
        <OrdersGrid
          isPending={isPending}
          error={error}
          orders={filteredOrders}
          onStatusUpdate={getSupplierOrders}
        />
      </View>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 4,
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexGrow: 0,
  },
  filterChip: {
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
  filterChipActive: {
    backgroundColor: '#8B5CF6',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  ordersContainer: {
    flex: 1,
    padding: 24,
  },
  ordersGrid: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  unauthorizedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  unauthorizedText: {
    fontSize: 16,
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  backToStoresButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backToStoresButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});