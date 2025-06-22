import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { 
  ArrowLeft, 
  Trash2, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Heart,
  Share2,
  Tag,
  Truck,
  Shield
} from 'lucide-react-native';
import { useGetCart, useUpdateCart, useRemoveFromCart, useClearCart } from '@/hooks/cart-hooks';
import { dialogService } from '@/components/dialog';
import { useEffect, useState, useRef } from 'react';
import { API_URL } from '@/services/api';

export interface Cart {
  id: number
  user_id: number
  supplier_id: number
  wilaya_id: any
  commune_id: any
  full_name: any
  phone_number: any
  status: string
  order_date: string
  is_validated: boolean
  address: any
  created_at: string
  updated_at: string
  order_products: OrderProduct[]
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

export default function CartScreen() {
  const { data: cart, isLoading, refetch } = useGetCart();
  const [cartItems, setCartItems] = useState<OrderProduct[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [savedItems, setSavedItems] = useState<number[]>([]);
  const updateCartMutation = useUpdateCart();
  const removeFromCartMutation = useRemoveFromCart();
  const clearCartMutation = useClearCart();
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (cart) {
      setCartItems(cart?.data?.flatMap(order => order.order_products) || []);
      // Animate items in
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [cart]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const updateQuantity = (productId: number, newQuantity: number, orderId: number) => {
    if (newQuantity <= 0) {
      removeItem(productId, orderId);
      return;
    }

    // Optimistic update
    setCartItems(prev => 
      prev.map(item => 
        item.product_id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );

    updateCartMutation.mutate({
      product_id: productId,
      quantity: newQuantity,
      order_id: orderId,
    }, {
      onError: () => {
        // Revert on error
        refetch();
      }
    });
  };

  const removeItem = (productId: number, orderId: number) => {
    dialogService.confirmRemove(() => {
      // Optimistic removal with animation
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        removeFromCartMutation.mutateAsync({ productId , data : { order_id: orderId } }).then(() => router.push('/cart'));
      });
    });
  };

  const clearCart = () => {
    dialogService.confirmClearCart(async() => {
      await clearCartMutation.mutateAsync();
      router.push('/cart');
    });
  };

  const saveForLater = (productId: number) => {
    setSavedItems(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
    Alert.alert(
      "Saved for Later", 
      savedItems.includes(productId) 
        ? "Item removed from saved items" 
        : "Item saved for later shopping"
    );
  };

  const shareCart = () => {
    Alert.alert("Share Cart", "Cart sharing functionality would be implemented here");
  };



  const handleCheckout = () => {
    if (!cart?.data.length) {
      dialogService.confirmEmptyCart();
      return;
    }
    router.push({
      pathname: '/checkout',
      params: { 
        discount: discount.toString(),
        couponCode: couponCode 
      }
    });
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.unit_price) * item.quantity,
    0
  );
  const discountAmount = subtotal * discount;
  const deliveryFee = cartItems.length > 0 ? 500 : 0; // 500 DZD delivery fee
  const total = subtotal - discountAmount + deliveryFee;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Shopping Cart</Text>
          <Text style={styles.itemCount}>
            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={styles.headerActions}>
          {cartItems?.length > 0 && (
            <View>
              <TouchableOpacity onPress={shareCart} style={styles.headerButton}>
                <Share2 size={20} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity onPress={clearCart} style={styles.headerButton}>
                <Trash2 size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading your cart...</Text>
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
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Shopping Cart</Text>
          <Text style={styles.itemCount}>
            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={styles.headerActions}>
          {cartItems?.length > 0 && (
            <View>
              <TouchableOpacity onPress={shareCart} style={styles.headerButton}>
                <Share2 size={20} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity onPress={clearCart} style={styles.headerButton}>
                <Trash2 size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {!cartItems.length ? (
          <View style={styles.emptyContainer}>
            <ShoppingBag size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>
              Discover amazing products and add them to your cart
            </Text>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => router.push({
                pathname: '/(tabs)/products',
              })}
            >
              <Text style={styles.shopButtonText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Animated.View style={{ opacity: slideAnim }}>
           

            {/* Cart Items */}
            {cartItems.map((item, index) => (
              <View key={item.id} style={styles.cartItem}>
                <Image
                  source={{ 
                    uri: `${API_URL.replace('/api', '')}/storage/${item.product.pictures?.[0]?.picture}` ||
                         'https://via.placeholder.com/80x80?text=No+Image' 
                  }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.product.name}
                  </Text>
                  <Text style={styles.itemDescription} numberOfLines={1}>
                    {item.product.description}
                  </Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.itemPrice}>
                      {parseFloat(item.unit_price).toLocaleString('fr-DZ', {
                        style: 'currency',
                        currency: 'DZD',
                      })}
                    </Text>
                    {item.product.quantity < 10 && (
                      <View style={styles.lowStockBadge}>
                        <Text style={styles.lowStockText}>Low stock</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.itemActions}>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.product_id, item.quantity - 1, item.order_id)}
                      style={[styles.quantityButton, item.quantity <= 1 && styles.quantityButtonDisabled]}
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={16} color={item.quantity <= 1 ? "#9CA3AF" : "#374151"} />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.product_id, item.quantity + 1, item.order_id)}
                      style={[
                        styles.quantityButton,
                        item.quantity >= item.product.quantity && styles.quantityButtonDisabled
                      ]}
                      disabled={item.quantity >= item.product.quantity}
                    >
                      <Plus size={16} color={item.quantity >= item.product.quantity ? "#9CA3AF" : "#374151"} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      onPress={() => saveForLater(item.product_id)}
                      style={styles.actionButton}
                    >
                      <Heart 
                        size={18} 
                        color={savedItems.includes(item.product_id) ? "#EF4444" : "#6B7280"}
                        fill={savedItems.includes(item.product_id) ? "#EF4444" : "none"}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => removeItem(item.product_id, item.order_id)}
                      style={styles.actionButton}
                    >
                      <Trash2 size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

           
          </Animated.View>
        )}
      </ScrollView>

      {cartItems.length > 0 && (
        <View style={styles.footer}>
          {/* Order Summary */}
          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                {subtotal.toLocaleString('fr-DZ', {
                  style: 'currency',
                  currency: 'DZD',
                })}
              </Text>
            </View>
            {discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: '#059669' }]}>
                  Discount ({couponCode})
                </Text>
                <Text style={[styles.summaryValue, { color: '#059669' }]}>
                  -{discountAmount.toLocaleString('fr-DZ', {
                    style: 'currency',
                    currency: 'DZD',
                  })}
                </Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery</Text>
              <Text style={styles.summaryValue}>
                {deliveryFee === 0 ? 'Free' : deliveryFee.toLocaleString('fr-DZ', {
                  style: 'currency',
                  currency: 'DZD',
                })}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>
                {total.toLocaleString('fr-DZ', {
                  style: 'currency',
                  currency: 'DZD',
                })}
              </Text>
            </View>
          </View>

          {/* Secure Checkout Info */}
          <View style={styles.secureInfo}>
            <Shield size={16} color="#059669" />
            <Text style={styles.secureText}>Secure checkout with SSL encryption</Text>
          </View>

          <TouchableOpacity 
            style={styles.checkoutButton} 
            onPress={handleCheckout}
            disabled={updateCartMutation.isPending}
          >
            <Text style={styles.checkoutButtonText}>
              {updateCartMutation.isPending ? 'Updating...' : 'Proceed to Checkout'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  itemCount: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    gap: 12,
  },
  deliveryText: {
    flex: 1,
  },
  deliveryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  deliverySubtitle: {
    fontSize: 12,
    color: '#065F46',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  shopButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
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
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  lowStockBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lowStockText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
  },
  itemActions: {
    alignItems: 'flex-end',
    gap: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    gap: 4,
  },
  quantityButton: {
    padding: 8,
    borderRadius: 6,
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    minWidth: 30,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  couponSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
  },
  couponHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  couponTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  couponInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  couponCode: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
  },
  applyCouponButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  applyCouponText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  couponSuccess: {
    fontSize: 14,
    color: '#059669',
    marginTop: 8,
    fontWeight: '500',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 20,
  },
  summarySection: {
    marginBottom: 16,
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
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  secureInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
  },
  secureText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  checkoutButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});