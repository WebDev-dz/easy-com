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
import { ArrowLeft, Trash2, ShoppingBag } from 'lucide-react-native';
import { useGetCart, useUpdateCart, useRemoveFromCart, useClearCart } from '@/hooks/cart-hooks';
import { dialogService } from '@/components/dialog';
import { useEffect, useState } from 'react';
import { OrderProduct } from '@/services/types';

export default function CartScreen() {
  const { data: cart, isLoading } = useGetCart();
  const [cartItems, setCartItems] = useState<OrderProduct[]>([]);
  const updateCartMutation = useUpdateCart();
  const removeFromCartMutation = useRemoveFromCart();
  const clearCartMutation = useClearCart();

  

  useEffect(() => {
    if (cart) {
      setCartItems(cart?.data?.flatMap(order => order.order_products) || []);
    }
  }, [cart]);

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }

    updateCartMutation.mutate({
      product_id: productId,
      quantity: newQuantity,
    });
  };

  const removeItem = (productId: number) => {
    dialogService.confirmRemove(() => {
      removeFromCartMutation.mutate({ productId });
    });
  };

  const clearCart = () => {
    dialogService.confirmClearCart(() => {
      clearCartMutation.mutate();
    });
  };

  const handleCheckout = () => {
    if (!cart?.data.length) {
      dialogService.confirmEmptyCart();
      return;
    }
    router.push({
      pathname: '/checkout',
    });
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.unit_price) * item.quantity,
    0
  );
  const deliveryFee = cartItems.length > 0 ? 5.00 : 0;
  const total = subtotal + deliveryFee;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading cart...</Text>
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
        <Text style={styles.title}>Shopping Cart</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity onPress={clearCart} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        {!cartItems.length ? (
          <View style={styles.emptyContainer}>
            <ShoppingBag size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>Your cart is empty</Text>
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
          <View>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.product.name}</Text>
                  <Text style={styles.itemPrice}>
                    {parseFloat(item.unit_price).toLocaleString('fr-DZ', {
                      style: 'currency',
                      currency: 'DZD',
                    })}
                  </Text>
                </View>
                <View style={styles.itemActions}>
                  <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                  <TouchableOpacity
                    onPress={() => removeItem(item.product_id)}
                    style={styles.removeButton}
                  >
                    <Trash2 size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {cartItems.length ? (
        <View style={styles.footer}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>
              {total.toLocaleString('fr-DZ', {
                style: 'currency',
                currency: 'DZD',
              })}
            </Text>
          </View>
          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </View>
      ) : null}
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
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
  },
  shopButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#6B7280',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  itemQuantity: {
    fontSize: 16,
    color: '#4B5563',
  },
  removeButton: {
    padding: 8,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  checkoutButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});