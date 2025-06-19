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
import { ArrowLeft, Package, Clock, CircleCheck as CheckCircle, Truck, AlertCircle } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useGetUserOrders } from '@/hooks/supplier-order-hooks';
import { OrderStatus, SupplierOrder } from '@/services/supplierOrders';

const statusFilters: { key: OrderStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All Orders' },
  { key: 'pending', label: 'Pending' },
  { key: 'processing', label: 'In Progress' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];



const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'pending': return '#F59E0B';
    case 'processing': return '#3B82F6';
    case 'delivered': return '#10B981';
    case 'cancelled': return '#EF4444';
    default: return '#6B7280';
  }
};

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case 'pending': return Clock;
    case 'processing': return Package;
    case 'delivered': return CheckCircle;
    case 'cancelled': return AlertCircle;
    default: return Clock;
  }
};

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Invalid date';
  }
};
export default function MyOrdersScreen() {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">("all");
  const { user } = useAuth();
  const { data: orders, isPending: isLoading, error, mutate: getUserOrders } = useGetUserOrders();

  const filteredOrders = (selectedStatus === 'all' 
    ? orders 
    : orders?.filter((order: SupplierOrder) => order.status === selectedStatus)) || [];

  const formatPrice = (amount: number | undefined) => {
    if (typeof amount !== 'number') return 'DA 0.00';
    return `DA ${amount.toFixed(2)}`;
  };

  useEffect(() => {
    if (user) {
      getUserOrders(user.id);
    }
  }, [user]);

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
            <Text style={styles.errorSubtext}>Please try again later</Text>
          </View>
        )}
        
        {!isLoading && !error && filteredOrders?.length > 0 ? (
          filteredOrders.map((order: SupplierOrder) => {
            const StatusIcon = getStatusIcon(order.status);
            return (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>Order #{order.id}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(order.status)}20` }]}>
                    <StatusIcon size={12} color={getStatusColor(order.status)} />
                    <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderContent}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {(order as any).title || 'Service Order'}
                    </Text>
                    <Text style={styles.storeName}>{order.full_name}</Text>
                    <Text style={styles.deliveryAddress}>
                      Deadline: {(order as any).deadline ? formatDate((order as any).deadline) : 'Not set'}
                    </Text>
                    {order.address && (
                      <Text style={styles.address} numberOfLines={1}>
                        📍 {order.address}
                      </Text>
                    )}
                  </View>
                  <View style={styles.priceContainer}>
                    <Text style={styles.totalPrice}>
                      {formatPrice((order as any).total_amount)}
                    </Text>
                    {order.is_validated && (
                      <View style={styles.validatedBadge}>
                        <CheckCircle size={10} color="#10B981" />
                        <Text style={styles.validatedText}>Validated</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.orderFooter}>
                  <Text style={styles.orderDate}>
                    Ordered on {formatDate(order.created_at)}
                  </Text>
                  <TouchableOpacity 
                    style={styles.trackButton}
                    onPress={() => router.push(`/orders/${order.id.toString()}`)}
                  >
                    <Text style={styles.trackButtonText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : !isLoading && !error && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Package size={48} color="#9CA3AF" />
            </View>
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
    padding: 24,
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
  errorSubtext: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  orderContent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  orderInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  storeName: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  quantity: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  deliveryAddress: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  address: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  priceContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 4,
  },
  validatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B98115',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 2,
  },
  validatedText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '500',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  orderDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  trackButton: {
    backgroundColor: '#EBF4FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  trackButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2563EB',
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