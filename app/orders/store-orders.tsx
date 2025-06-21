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
import { ArrowLeft, AlertTriangle, Package, Clock, CircleCheck as CheckCircle, Truck, ShoppingBag } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useGetRecievedSupplierOrders } from '@/hooks/supplier-order-hooks';
import { useSupplier } from '@/hooks/supplier-hooks';
import { OrderStatus } from '@/services/supplierOrders';
import { Order } from '@/types/orders';
import { SupplierOrderCard } from '@/components/supplier-order';

const statusFilters: { key: OrderStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All Orders' },
  { key: 'pending', label: 'Pending' },
  { key: 'processing', label: 'In Progress' },
  { key: 'delivered', label: 'Delivered' },
  // { key: 'cancelled', label: 'Cancelled' },
];

export default function StoreOrdersScreen() {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const { user } = useAuth();
  const { storeId } = useLocalSearchParams();
  const { data: store, isPending: isStoreLoading } = useSupplier(Number(storeId) || 0);
  const { data: orders = [], isPending, error, mutate: getSupplierOrders } = useGetRecievedSupplierOrders();

  const handleStatusUpdate = () => {
    if (user && store) {
      if (store?.user_id === user.id) {
        getSupplierOrders(store.id);
      }
    }
  };

  useEffect(() => {
    handleStatusUpdate();
  }, [user, store]);

  const filteredOrders: Order[] = selectedStatus === 'all' 
    ? (orders || [])
    : (orders || []).filter((order: Order) =>  order.status == selectedStatus);

  if (isStoreLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
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
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Orders Received</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer} contentContainerStyle={styles.filtersContent}>
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

      <ScrollView style={styles.ordersContainer}>
        {isPending ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <AlertTriangle size={48} color="#EF4444" />
            <Text style={styles.errorText}>Failed to load orders</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleStatusUpdate}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredOrders.length > 0 ? (
          filteredOrders?.map((order) => (
            <SupplierOrderCard
              key={order.id}
              // @ts-ignore
              order={order}
              currentSupplierId={store.id}
              onStatusUpdate={handleStatusUpdate}
              small={true}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <ShoppingBag size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No Orders Found</Text>
            <Text style={styles.emptyDescription}>
              {selectedStatus === 'all' 
                ? "You haven't received any orders yet."
                : `You don't have any ${selectedStatus} orders.`}
            </Text>
          </View>
        )}
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
  filtersContent: {
    paddingHorizontal: 0,
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
    lineHeight: 24,
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
  placeholder: {
    width: 32,
  },
});