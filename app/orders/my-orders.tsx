import React, { useEffect, useState } from 'react';
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
import { ArrowLeft, Package, Clock, CircleCheck as CheckCircle, Truck, AlertCircle, ShoppingBag } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useGetUserOrders } from '@/hooks/supplier-order-hooks';
import { OrderStatus } from '@/services/supplierOrders';
import { Order } from '@/types/orders';
import { SupplierOrderCard } from '@/components/supplier-order';

const statusFilters: { key: OrderStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All Orders' },
  { key: 'pending', label: 'Pending' },
  { key: 'processing', label: 'In Progress' },
  { key: 'delivered', label: 'Delivered' },
];

export default function MyOrdersScreen() {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">("all");
  const { user } = useAuth();
  const { data: orders, isPending: isLoading, error, mutate: getUserOrders } = useGetUserOrders();

  const handleRefetch = () => {
    if (user) {
      getUserOrders(user.id);
    }
  };

  useEffect(() => {
    if (user) {
      getUserOrders(user.id);
    }
  }, [user]);
  
  const filteredOrders: Order[] = (selectedStatus === 'all' 
    ? orders 
    : orders?.filter((order: Order) => order.status === selectedStatus)) || [];

  const formatPrice = (amount: number | undefined) => {
    if (typeof amount !== 'number') return 'DA 0.00';
    return `DA ${amount.toFixed(2)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>My Orders</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
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

      <ScrollView style={styles.ordersContainer} showsVerticalScrollIndicator={false}>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        )}
        
        {error && (
          <View style={styles.errorContainer}>
            <AlertCircle size={48} color="#EF4444" />
            <Text style={styles.errorText}>Failed to load orders</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRefetch}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {!isLoading && !error && filteredOrders.length > 0 ? (
          filteredOrders.map((order: Order) => (
            <TouchableOpacity 
              key={order.id}
              onPress={() => router.push(`/orders/${order.id.toString()}`)}
            >
              <SupplierOrderCard
              // @ts-ignore
                order={order}
                onStatusUpdate={handleRefetch}
                small={true}
              />
            </TouchableOpacity>
          ))
        ) : !isLoading && !error && (
          <View style={styles.emptyState}>
            <ShoppingBag size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No Orders Found</Text>
            <Text style={styles.emptyDescription}>
              {selectedStatus === 'all' 
                ? "You haven't placed any orders yet."
                : `You don't have any ${selectedStatus} orders.`}
            </Text>
            <TouchableOpacity 
              style={styles.shopButton}
              onPress={() => router.push('/(tabs)')}
            >
              <Text style={styles.shopButtonText}>Browse Services</Text>
            </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: 32,
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexGrow: 0,
  },
  filtersContent: {
    paddingHorizontal: 24,
  },
  filterChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  ordersContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
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
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 32,
    lineHeight: 24,
  },
  shopButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});