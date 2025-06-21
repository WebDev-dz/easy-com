import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useUpdateSupplierOrderStatus } from '@/hooks/supplier-order-hooks';
// import { SupplierOrder } from '@/services/supplierOrders';
import { formatDate } from '@/lib/utils';
import { dialogService } from '@/components/dialog';
import { SupplierOrder } from '@/services/types';

interface SupplierOrderCardProps {
  order: SupplierOrder;
  onStatusUpdate?: (supplierId: number) => void;
}

export const SupplierOrderCard: React.FC<SupplierOrderCardProps> = ({ order, onStatusUpdate }) => {
  const updateStatusMutation = useUpdateSupplierOrderStatus();

  const handleStatusUpdate = async (newStatus: 'processing' | 'delivered' | 'cancelled') => {
    try {
      await updateStatusMutation.mutateAsync({
        orderId: order.id,
        status: { status: newStatus },
      });
      onStatusUpdate?.(order.supplier_id);
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const showConfirmDialog = (title: string, message: string, confirmText: string, onConfirm: () => void, destructive?: boolean) => {
    dialogService.confirm({
      title,
      message,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: confirmText,
          onPress: onConfirm,
          style: destructive ? 'destructive' : 'default',
        },
      ],
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#F59E0B'; // Yellow
      case 'processing':
        return '#3B82F6'; // Blue
      case 'delivered':
        return '#10B981'; // Green
      case 'cancelled':
        return '#EF4444'; // Red
      default:
        return '#6B7280'; // Gray
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>Order #{order.id}</Text>
          <Text style={styles.date}>{formatDate(order.created_at)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{order.status}</Text>
        </View>
      </View>

      {/* Details */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Customer:</Text>
          <Text style={styles.value}>{order.full_name}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{order.phone_number}</Text>
        </View>
        {order.address ? (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>{order.address}</Text>
          </View>
        ) : null}
      </View>

      {/* Products */}
      <View style={styles.products}>
        <Text style={styles.productsTitle}>Products:</Text>
        {order.order_products.map((product) => (
          <View key={product.id} style={styles.productItem}>
            <Text style={styles.productName}>Product #{product.product_id}</Text>
            <Text style={styles.productQuantity}>x{product.quantity}</Text>
            <Text style={styles.productPrice}>
              {product.unit_price.toLocaleString('fr-DZ', {
                style: 'currency',
                currency: 'DZD',
              })}
            </Text>
          </View>
        ))}
      </View>

      {/* Actions */}
      {order.status === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.refuseButton]}
            onPress={() =>
              showConfirmDialog(
                'Refuse Order',
                'Are you sure you want to refuse this order? This action cannot be undone.',
                'Refuse',
                () => handleStatusUpdate('cancelled'),
                true
              )
            }
            disabled={updateStatusMutation.isPending}
          >
            <Text style={styles.actionButtonText}>Refuse</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() =>
              showConfirmDialog(
                'Accept Order',
                'Are you sure you want to accept this order?',
                'Accept',
                () => handleStatusUpdate('processing')
              )
            }
            disabled={updateStatusMutation.isPending}
          >
            <Text style={styles.actionButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      )}

      {order.status === 'processing' && user.id !== && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.deliverButton]}
            onPress={() =>
              showConfirmDialog(
                'Mark Delivered',
                'Are you sure you want to mark this order as delivered?',
                'Confirm',
                () => handleStatusUpdate('delivered')
              )
            }
            disabled={updateStatusMutation.isPending}
          >
            <Text style={styles.actionButtonText}>Mark as Delivered</Text>
          </TouchableOpacity>
        </View>
      )}

      {order.status === 'delivered' && (
        <View style={styles.finalContainer}>
          <Text style={styles.deliveredText}>This order has been delivered.</Text>
        </View>
      )}

      {updateStatusMutation.isPending && (
        <ActivityIndicator style={{ marginTop: 10 }} size="small" color="#3B82F6" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfo: { flex: 1 },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  date: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  details: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    width: 80,
  },
  value: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  products: {
    marginBottom: 16,
  },
  productsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  productName: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  productQuantity: {
    fontSize: 14,
    color: '#6B7280',
    marginHorizontal: 12,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#3B82F6',
  },
  refuseButton: {
    backgroundColor: '#EF4444',
  },
  deliverButton: {
    backgroundColor: '#10B981',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  finalContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  deliveredText: {
    fontSize: 14,
    color: '#10B981',
    fontStyle: 'italic',
  },
});
