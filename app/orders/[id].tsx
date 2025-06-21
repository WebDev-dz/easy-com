import { router, useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useGetUserOrder } from '../../hooks/supplier-order-hooks';
import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react-native';
import { alertService } from '@/lib/alert';

// Interfaces remain unchanged
export interface Supplier {
  id: number;
  user_id: number;
  business_name: string;
  address: string;
  description: string;
  picture?: string;
  domain_id: number;
  created_at: string;
  updated_at: string;
}

export interface Wilaya {
  id: number;
  name: string;
  code: string;
  created_at: any;
  updated_at: any;
}

export interface Commune {
  id: number;
  name: string;
  wilaya_id: number;
  created_at: any;
  updated_at: any;
}

export interface OrderProduct {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: string;
  product: Product;
}

export interface Product {
  id: number;
  supplier_id: number;
  category_id: number;
  name: string;
  price: string;
  description: string;
  visibility: string;
  quantity: number;
  minimum_quantity: number;
  created_at: string;
  updated_at: string;
  pictures: Picture[];
}

export interface Picture {
  id: number;
  product_id: number;
  picture: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  user_id: number;
  supplier_id: number;
  wilaya_id: number;
  commune_id: number;
  full_name: string;
  phone_number: string;
  status: string;
  order_date: string;
  is_validated: boolean;
  address: any;
  created_at: string;
  updated_at: string;
  user: User;
  supplier: Supplier;
  wilaya: Wilaya;
  commune: Commune;
  order_products: OrderProduct[];
}

export interface User {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  role: string;
  picture: string;
  address: string;
  city: any;
  email_verified_at: string;
  created_at: string;
  updated_at: string;
}

export default function OrderDetails() {
  const { id } = useLocalSearchParams();
  const { data: order, isPending: isLoading, mutate: getOrder } = useGetUserOrder();

  useEffect(() => {
    if (id) {
      getOrder(Number(id));
    }
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#F59E0B';
      case 'processing':
        return '#3B82F6';
      case 'delivered':
        return '#10B981';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '⏳';
      case 'processing':
        return '🔄';
      case 'delivered':
        return '✅';
      case 'cancelled':
        return '❌';
      default:
        return '📦';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateTotal = () => {
    if (!order?.order_products) return 0;
    return order?.order_products?.reduce((total, product) => {
      return total + parseFloat(product.unit_price) * product.quantity;
    }, 0);
  };

  const handleTrackOrder = () => {
    alertService('Track Order', 'Order tracking feature coming soon!');
  };

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      ) : !order ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={styles.errorTitle}>Order Not Found</Text>
          <Text style={styles.errorText}>The order you're looking for doesn't exist or has been removed.</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Order Info Section */}
          <View style={styles.orderInfoSection}>
            <View style={styles.orderHeader}>
              <View>
                <Text style={styles.orderTitle}>Order #{order.id}</Text>
                <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                <Text style={styles.statusIcon}>{getStatusIcon(order.status)}</Text>
                <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
              </View>
            </View>

            {order.is_validated && (
              <View style={styles.validatedBadge}>
                <Text style={styles.validatedText}>✓ Validated</Text>
              </View>
            )}
          </View>

        

          {/* Supplier & Delivery Combined */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Supplier & Delivery</Text>
            <View style={styles.card}>
              <View style={styles.supplierRow}>
                {order.supplier.picture && (
                  <Image source={{ uri: order.supplier.picture }} style={styles.supplierImage} />
                )}
                <View style={styles.supplierInfo}>
                  <Text style={styles.supplierName}>{order.supplier.business_name}</Text>
                  <Text style={styles.supplierAddress}>📍 {order.supplier.address}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.deliveryInfo}>
                <Text style={styles.deliveryTitle}>Delivery to:</Text>
                <Text style={styles.deliveryText}>{order.full_name} • {order.phone_number}</Text>
                <Text style={styles.deliveryText}>{order.commune.name}, {order.wilaya.name}</Text>
              </View>
            </View>
          </View>

          {/* Order Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Items ({order.order_products.length})</Text>
            <View style={styles.card}>
              {order?.order_products?.map((orderProduct, index) => (
                <View
                  key={orderProduct.id}
                  style={[styles.itemRow, index === order.order_products.length - 1 && styles.lastItemRow]}
                >
                  {orderProduct.product.pictures && orderProduct.product.pictures.length > 0 && (
                    <Image source={{ uri: orderProduct.product.pictures[0].picture }} style={styles.productImage} />
                  )}
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{orderProduct.product.name}</Text>
                    <Text style={styles.itemQuantity}>Qty: {orderProduct.quantity}</Text>
                    <Text style={styles.itemPrice}>
                      {(parseFloat(orderProduct.unit_price) * orderProduct.quantity).toLocaleString('fr-DZ')} DA
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.card}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Items Total:</Text>
                <Text style={styles.summaryValue}>{calculateTotal().toLocaleString('fr-DZ')} DA</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee:</Text>
                <Text style={styles.summaryValue}>Free</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryTotalLabel}>Total Amount:</Text>
                <Text style={styles.summaryTotalValue}>{calculateTotal().toLocaleString('fr-DZ')} DA</Text>
              </View>
            </View>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginRight: 40, // Compensate for back button width
  },
  headerPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  orderInfoSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  validatedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  validatedText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '600',
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  trackButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  trackButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  supplierRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supplierImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  supplierInfo: {
    flex: 1,
  },
  supplierName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  supplierAddress: {
    fontSize: 14,
    color: '#6B7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  deliveryInfo: {
    gap: 4,
  },
  deliveryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  deliveryText: {
    fontSize: 14,
    color: '#6B7280',
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  lastItemRow: {
    borderBottomWidth: 0,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },
  bottomSpacing: {
    height: 20,
  },
});