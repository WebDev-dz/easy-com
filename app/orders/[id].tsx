import { router, useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useGetUserOrder } from '../../hooks/supplier-order-hooks';
import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react-native';

export interface Supplier {
  id: number
  user_id: number
  business_name: string
  address: string
  description: string
  picture?: string
  domain_id: number
  created_at: string
  updated_at: string
}

export interface Wilaya {
  id: number
  name: string
  code: string
  created_at: any
  updated_at: any
}

export interface Commune {
  id: number
  name: string
  wilaya_id: number
  created_at: any
  updated_at: any
}

export interface OrderProduct {
  id: number
  order_id: number
  product_id: number
  quantity: number
  unit_price: string
  product: Product
}

export interface Product {
  id: number
  supplier_id: number
  category_id: number
  name: string
  price: string
  description: string
  visibility: string
  quantity: number
  minimum_quantity: number
  created_at: string
  updated_at: string
  pictures: Picture[]
}

export interface Picture {
  id: number
  product_id: number
  picture: string
  created_at: string
  updated_at: string
}

export interface Order {
  id: number
  user_id: number
  supplier_id: number
  wilaya_id: number
  commune_id: number
  full_name: string
  phone_number: string
  status: string
  order_date: string
  is_validated: boolean
  address: any
  created_at: string
  updated_at: string
  user: User
  supplier: Supplier
  wilaya: Wilaya
  commune: Commune
  order_products: OrderProduct[]
}

export interface User {
  id: number
  full_name: string
  email: string
  phone_number: string
  role: string
  picture: string
  address: string
  city: any
  email_verified_at: string
  created_at: string
  updated_at: string
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTotal = () => {
    if (!order?.order_products) return 0;
    return order?.order_products?.reduce((total, product) => {
      return total + (parseFloat(product.unit_price) * product.quantity);
    }, 0);
  };

  // const handleContactSupplier = () => {
  //   if (order?.supplier?.phone_number) {
  //     // You can implement phone call or messaging functionality here
  //     Alert.alert(
  //       'Contact Supplier',
  //       `Call ${order.supplier.business_name}?`,
  //       [
  //         { text: 'Cancel', style: 'cancel' },
  //         { text: 'Call', onPress: () => console.log('Calling supplier...') }
  //       ]
  //     );
  //   }
  // };

  const handleTrackOrder = () => {
    Alert.alert('Track Order', 'Order tracking feature coming soon!');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>❌</Text>
        <Text style={styles.errorTitle}>Order Not Found</Text>
        <Text style={styles.errorText}>The order you're looking for doesn't exist or has been removed.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>My Orders</Text>
        {/* <View style={styles.placeholder} /> */}
      </View>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.orderTitleSection}>
          <Text style={styles.orderTitle}>Order #{order.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
            <Text style={styles.statusIcon}>{getStatusIcon(order.status)}</Text>
            <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.orderDate}>Placed on {formatDate(order.created_at)}</Text>
        {order.is_validated && (
          <View style={styles.validatedBadge}>
            <Text style={styles.validatedText}>✓ Validated</Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleTrackOrder}>
          <Text style={styles.actionIcon}>🚚</Text>
          <Text style={styles.actionText}>Track Order</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.actionButton} onPress={handleContactSupplier}>
          <Text style={styles.actionIcon}>📞</Text>
          <Text style={styles.actionText}>Contact Supplier</Text>
        </TouchableOpacity> */}
      </View>

      {/* Supplier Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏪 Supplier Information</Text>
        <View style={styles.supplierCard}>
          {order.supplier.picture && (
            <Image source={{ uri: order.supplier.picture }} style={styles.supplierImage} />
          )}
          <View style={styles.supplierInfo}>
            <Text style={styles.supplierName}>{order.supplier.business_name}</Text>
            <Text style={styles.supplierDescription}>{order.supplier.description}</Text>
            <Text style={styles.supplierAddress}>📍 {order.supplier.address}</Text>
          </View>
        </View>
      </View>

      {/* Customer Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 Customer Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{order.user.full_name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{order.user.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{order.user.phone_number}</Text>
          </View>
        </View>
      </View>

      {/* Delivery Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚚 Delivery Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Recipient:</Text>
            <Text style={styles.infoValue}>{order.full_name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{order.phone_number}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Location:</Text>
            <Text style={styles.infoValue}>{order.commune.name}, {order.wilaya.name}</Text>
          </View>
          {order.address && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address:</Text>
              <Text style={styles.infoValue}>{order.address}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Order Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📦 Order Items ({order.order_products.length})</Text>
        <View style={styles.itemsContainer}>
          {order?.order_products?.map((orderProduct, index) => (
            <View key={orderProduct.id} style={[
              styles.itemCard,
              index === order.order_products.length - 1 && styles.lastItemCard
            ]}>
              {orderProduct.product.pictures && orderProduct.product.pictures.length > 0 && (
                <Image 
                  source={{ uri: orderProduct.product.pictures[0].picture }} 
                  style={styles.productImage} 
                />
              )}
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{orderProduct.product.name}</Text>
                <Text style={styles.itemDescription}>{orderProduct.product.description}</Text>
                <View style={styles.itemPricing}>
                  <Text style={styles.itemPrice}>
                    {parseFloat(orderProduct.unit_price).toLocaleString('fr-DZ')} DA each
                  </Text>
                  <Text style={styles.itemQuantity}>Quantity: {orderProduct.quantity}</Text>
                  <Text style={styles.itemTotal}>
                    Subtotal: {(parseFloat(orderProduct.unit_price) * orderProduct.quantity).toLocaleString('fr-DZ')} DA
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Order Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💰 Order Summary</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items Total:</Text>
            <Text style={styles.summaryValue}>
              {calculateTotal().toLocaleString('fr-DZ')} DA
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee:</Text>
            <Text style={styles.summaryValue}>Free</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Total Amount:</Text>
            <Text style={styles.summaryTotalValue}>
              {calculateTotal().toLocaleString('fr-DZ')} DA
            </Text>
          </View>
        </View>
      </View>

      {/* Order Timeline */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📅 Order Timeline</Text>
        <View style={styles.timelineCard}>
          <View style={styles.timelineItem}>
            <View style={styles.timelineIcon}>
              <Text style={styles.timelineIconText}>📝</Text>
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Order Placed</Text>
              <Text style={styles.timelineDate}>{formatDate(order.created_at)}</Text>
            </View>
          </View>
          
          {order.status !== 'pending' && (
            <View style={styles.timelineItem}>
              <View style={styles.timelineIcon}>
                <Text style={styles.timelineIconText}>✅</Text>
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Order Confirmed</Text>
                <Text style={styles.timelineDate}>{formatDate(order.updated_at)}</Text>
              </View>
            </View>
          )}
          
          {order.status === 'delivered' && (
            <View style={styles.timelineItem}>
              <View style={styles.timelineIcon}>
                <Text style={styles.timelineIconText}>🚚</Text>
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Order Delivered</Text>
                <Text style={styles.timelineDate}>{formatDate(order.updated_at)}</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
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
    backgroundColor: '#F9FAFB',
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
  header: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
   
  },
  orderTitleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
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
  orderDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
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
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  supplierCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  supplierImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
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
  supplierDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  supplierAddress: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  itemsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  itemCard: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  lastItemCard: {
    borderBottomWidth: 0,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  itemPricing: {
    gap: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#6B7280',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
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
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  timelineIconText: {
    fontSize: 16,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  timelineDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  bottomSpacing: {
    height: 20,
  },
});