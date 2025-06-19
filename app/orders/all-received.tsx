import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Package, Clock, CircleCheck as CheckCircle, User, Phone, X } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useGetRecievedSupplierOrders, useUpdateSupplierOrderStatus } from '@/hooks/supplier-order-hooks';
import { SupplierOrder, OrderStatus } from '@/services/supplierOrders';
import { UpdateOrderStatusRequest } from '@/services/types';
import { toastAlert } from '@/lib/toastAlert';
import { dialogService } from '@/components/dialog';

export default function AllReceivedOrdersScreen() {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const { user } = useAuth();
  const { data: orders, isPending: isLoading, error } = useGetRecievedSupplierOrders();
  const { mutate: updateOrderStatus } = useUpdateSupplierOrderStatus();

  const statusFilters = [
    { key: 'all' as const, label: 'All Orders' },
    { key: 'pending' as const, label: 'Pending' },
    { key: 'processing' as const, label: 'Processing' },
    { key: 'delivered' as const, label: 'Delivered' },
  ];

  const filteredOrders = selectedStatus === 'all' 
    ? orders || []
    : (orders || []).filter((order: SupplierOrder) => order.status === selectedStatus);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'processing': return '#3B82F6';
      case 'delivered': return '#10B981';
      case 'cancelled': return '#EF4444';
      default: return '#64748B';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return Clock;
      case 'processing': return Package;
      case 'delivered': return CheckCircle;
      case 'cancelled': return X;
      default: return Clock;
    }
  };

  const getNextStatus = (currentStatus: OrderStatus): UpdateOrderStatusRequest['status'] | null => {
    switch (currentStatus) {
      case 'pending': return 'processing';
      case 'processing': return 'delivered';
      default: return null;
    }
  };

  const getNextStatusLabel = (currentStatus: OrderStatus) => {
    switch (currentStatus) {
      case 'pending': return 'Accept Order';
      case 'processing': return 'Mark Delivered';
      default: return null;
    }
  };

  const handleStatusUpdate = (orderId: number, currentStatus: OrderStatus, newStatus: UpdateOrderStatusRequest['status']) => {
    dialogService.confirm({
      title: 'Update Order Status',
      message: `Are you sure you want to mark this order as ${newStatus}?`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            updateOrderStatus(
              { orderId, status: { status: newStatus } },
              {
                onSuccess: () => {
                  toastAlert.success(`Order status updated to ${newStatus}`);
                },
                onError: (error) => {
                  toastAlert.error('Failed to update order status: ' + error.message);
                }
              }
            );
          },
        },
      ]
    });
  };

  const handleRefuseOrder = (orderId: number) => {
    dialogService.confirm({
      title: 'Refuse Order',
      message: 'Are you sure you want to refuse this order? This action cannot be undone.',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Refuse',
          style: 'destructive',
          onPress: () => {
            updateOrderStatus(
              { orderId, status: { status: 'cancelled' } },
              {
                onSuccess: () => {
                  toastAlert.success('Order refused successfully');
                },
                onError: (error) => {
                  toastAlert.error('Failed to refuse order: ' + error.message);
                }
              }
            );
          },
        },
      ]
    });
  };

  const handleContactBuyer = (phone: string) => {
    dialogService.confirm({
      title: 'Contact Buyer',
      message: `Call ${phone}?`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => dialogService.confirm({
          title: 'Calling',
          message: `Calling ${phone}...`,
          buttons: [{ text: 'OK' }]
        }) },
      ]
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load orders</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => router.reload()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
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
          <Text style={styles.title}>All Orders Received</Text>
          <Text style={styles.subtitle}>Manage your service orders</Text>
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

      <ScrollView style={styles.ordersContainer} showsVerticalScrollIndicator={false}>
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order: SupplierOrder) => {
            const StatusIcon = getStatusIcon(order.status);
            const nextStatus = getNextStatus(order.status);
            const nextStatusLabel = getNextStatusLabel(order.status);
            
            return (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderHeaderLeft}>
                    <Text style={styles.orderId}>Order #{order.id}</Text>
                    <View style={styles.storeTag}>
                      <Text style={styles.storeTagText}>{order.full_name}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(order.status)}15` }]}>
                    <StatusIcon size={12} color={getStatusColor(order.status)} />
                    <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderContent}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {order.order_products.map(p => p.quantity + 'x ').join(', ')}
                    </Text>
                    <Text style={styles.quantity}>Address: {order.address || 'No address provided'}</Text>
                    <Text style={styles.deliveryAddress}>Phone: {order.phone_number}</Text>
                  </View>
                  <View style={styles.priceContainer}>
                    <Text style={styles.totalPrice}>DA {order.order_products.reduce((sum, p) => sum + (p.quantity * p.unit_price), 0)}</Text>
                  </View>
                </View>

                <View style={styles.buyerInfo}>
                  <View style={styles.buyerDetails}>
                    <View style={styles.buyerRow}>
                      <User size={16} color="#64748B" />
                      <Text style={styles.buyerText}>{order.full_name}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.orderFooter}>
                  <Text style={styles.orderDate}>
                    Ordered on {new Date(order.created_at).toLocaleDateString()}
                  </Text>
                  
                  {order.status === 'pending' && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity 
                        style={styles.refuseButton}
                        onPress={() => handleRefuseOrder(order.id)}
                      >
                        <X size={16} color="#EF4444" />
                        <Text style={styles.refuseButtonText}>Refuse</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.acceptButton}
                        onPress={() => handleStatusUpdate(order.id, order.status, 'processing')}
                      >
                        <CheckCircle size={16} color="#FFFFFF" />
                        <Text style={styles.acceptButtonText}>Accept</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {nextStatusLabel && order.status !== 'pending' && (
                    <TouchableOpacity 
                      style={styles.statusButton}
                      onPress={() => handleStatusUpdate(order.id, order.status, nextStatus!)}
                    >
                      <Text style={styles.statusButtonText}>{nextStatusLabel}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Package size={48} color="#94A3B8" />
            </View>
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
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  storeTag: {
    backgroundColor: '#EDE9FE',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  storeTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8B5CF6',
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
    color: '#1E293B',
    marginBottom: 4,
  },
  quantity: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  deliveryAddress: {
    fontSize: 12,
    color: '#64748B',
  },
  priceContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },
  buyerInfo: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  buyerDetails: {
    gap: 8,
  },
  buyerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buyerText: {
    fontSize: 14,
    color: '#475569',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  orderDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  refuseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  refuseButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#EF4444',
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  acceptButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  statusButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
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
});