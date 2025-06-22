import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MapPin, User, Phone, Package, ChevronDown, X, Search } from 'lucide-react-native';
import { useCurrentUser } from '@/hooks/user-hooks';
import { useWilayas, useWilayaCommunes } from '@/hooks/wilaya-hooks';
import { alertService } from '@/lib/alert';
import { Wilaya, Commune } from '@/services/types';
import { useAuth } from '@/hooks/useAuth';
import { useClearCart, useGetCart, useValidateCart } from '@/hooks/cart-hooks';
import { OrderProduct } from '@/services/types';
import { API_URL } from '@/services/api';
import { toastAlert } from '@/lib/toastAlert';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function CheckoutScreen() {
  const { orderId } = useLocalSearchParams();
  const [selectedWilaya, setSelectedWilaya] = useState<Wilaya>();
  const [selectedCommune, setSelectedCommune] = useState<Commune>();
  const [wilayaModalVisible, setWilayaModalVisible] = useState(false);
  const [communeModalVisible, setCommuneModalVisible] = useState(false);
  const [wilayaSearchText, setWilayaSearchText] = useState('');
  const [communeSearchText, setCommuneSearchText] = useState('');
  
  // Get cart data
  const { data: cartData, isLoading: isLoadingCart, error: cartError } = useGetCart();
  const { mutate: validateCartMutation, isPending: isValidating } = useValidateCart();
  const { mutate: clearCartMutation } = useClearCart();

  // Get user data
  const { user, isLoading: isLoadingUser } = useAuth();

  // Get wilayas data
  const { data: wilayasData, isLoading: isLoadingWilayas } = useWilayas();
  const getCommunes = useWilayaCommunes();

  useEffect(() => { 
    if (wilayasData) {
      console.log({wilayasData});
    }
  }, [wilayasData]);

  useEffect(() => {
    if (selectedWilaya) {
      getCommunes.mutate(Number(selectedWilaya.id));
    }
  }, [selectedWilaya]);

  const getCartItems = (): OrderProduct[] => {
    if (!cartData?.data) return [];
    return Array.isArray(cartData.data) 
      ? cartData.data.flatMap(order => order.order_products || [])
      : [];
  };

  const cartProducts = getCartItems();
  const subtotal = cartProducts.reduce((sum, item) => sum + (parseFloat(item.unit_price) * item.quantity), 0);
  const deliveryFee = cartProducts.length > 0 ? 5.00 : 0;
  const total = subtotal + deliveryFee;

  // Filter wilayas based on search text
  const filteredWilayas = Array.isArray(wilayasData) 
    ? wilayasData.filter(wilaya => 
        wilaya.name.toLowerCase().includes(wilayaSearchText.toLowerCase())
      )
    : [];

  // Filter communes based on search text
  const filteredCommunes = Array.isArray(getCommunes.data)
    ? getCommunes.data.filter(commune => 
        commune.name.toLowerCase().includes(communeSearchText.toLowerCase())
      )
    : [];

  const handleWilayaSelect = (wilaya: Wilaya) => {
    setSelectedWilaya(wilaya);
    setSelectedCommune(undefined); // Reset commune when wilaya changes
    setWilayaModalVisible(false);
    setWilayaSearchText('');
  };

  const handleCommuneSelect = (commune: Commune) => {
    setSelectedCommune(commune);
    setCommuneModalVisible(false);
    setCommuneSearchText('');
  };

  const handleConfirmOrder = async () => {
    if (!selectedWilaya || !selectedCommune) {
      alertService('Error', 'Please select both Wilaya and Commune');
      return;
    }

    if (!user) {
      router.push("/(auth)/login");
      return;
    }

    if (cartProducts.length === 0) {
      alertService('Error', 'Your cart is empty');
      return;
    }

    try {
      await validateCartMutation({
        full_name: user.full_name,
        phone_number: user.phone_number || "",
        wilaya_id: selectedWilaya.id,
        commune_id: selectedCommune.id
      }, {
        onSuccess: () => {
          toastAlert.success(
            'Order Confirmed!',
          );
          clearCartMutation();
          router.push('/products');
        },
        onError: (error) => {
          toastAlert.error('Failed to place order' + error.message);
        }
      });
    } catch (error) {
      alertService('Error', 'Failed to place order');
    }
  };

  const renderWilayaItem = ({ item }: { item: Wilaya }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => handleWilayaSelect(item)}
    >
      <Text style={styles.modalItemText}>{item.name}</Text>
      {selectedWilaya?.id === item.id && (
        <View style={styles.selectedIndicator} />
      )}
    </TouchableOpacity>
  );

  const renderCommuneItem = ({ item }: { item: Commune }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => handleCommuneSelect(item)}
    >
      <Text style={styles.modalItemText}>{item.name}</Text>
      {selectedCommune?.id === item.id && (
        <View style={styles.selectedIndicator} />
      )}
    </TouchableOpacity>
  );

  if (isLoadingCart || isLoadingUser || isLoadingWilayas) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (cartError || !user || !wilayasData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.errorContainer, styles.centerContent]}>
          <Text style={styles.errorText}>Failed to load required data</Text>
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
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Summary */}
        <View style={styles.productSummary}>
          {cartProducts.map((item) => (
            <View key={item.id} style={styles.productItem}>
              <Image 
                source={{ uri: `${API_URL.replace('/api', '')}/storage/${item.product.pictures[0]?.picture}` || 'https://via.placeholder.com/200' }} 
                style={styles.productImage} 
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.product.name}</Text>
                <Text style={styles.storeName}>Store #{item.product.supplier_id}</Text>
                <Text style={styles.productPrice}>DA {parseFloat(item.unit_price).toFixed(2)} x {item.quantity}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Delivery Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Information</Text>
          
          <View style={styles.userInfo}>
            <View style={styles.userInfoRow}>
              <User size={20} color="#6B7280" />
              <Text style={styles.userInfoText}>{user.full_name}</Text>
            </View>
            <View style={styles.userInfoRow}>
              <Phone size={20} color="#6B7280" />
              <Text style={styles.userInfoText}>{user.phone_number}</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Wilaya *</Text>
            <TouchableOpacity
              style={styles.selectorButton}
              onPress={() => setWilayaModalVisible(true)}
            >
              <Text style={[styles.selectorText, !selectedWilaya && styles.placeholderText]}>
                {selectedWilaya ? selectedWilaya.name : 'Select a Wilaya'}
              </Text>
              <ChevronDown size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {selectedWilaya && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Commune *</Text>
              <TouchableOpacity
                style={styles.selectorButton}
                onPress={() => setCommuneModalVisible(true)}
              >
                <Text style={[styles.selectorText, !selectedCommune && styles.placeholderText]}>
                  {selectedCommune ? selectedCommune.name : 'Select a Commune'}
                </Text>
                <ChevronDown size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal ({cartProducts.reduce((sum, item) => sum + item.quantity, 0)} items)</Text>
            <Text style={styles.summaryValue}>DA {subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>DA {deliveryFee.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>DA {total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmButton, isValidating && styles.confirmButtonDisabled]}
          onPress={handleConfirmOrder}
          disabled={isValidating}
        >
          <Package size={20} color="#FFFFFF" />
          <Text style={styles.confirmButtonText}>
            {isValidating ? 'Placing Order...' : 'Confirm Order'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Wilaya Selection Modal */}
      <Modal
        visible={wilayaModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setWilayaModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Wilaya</Text>
              <TouchableOpacity
                onPress={() => setWilayaModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <Search size={20} color="#6B7280" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search wilaya..."
                value={wilayaSearchText}
                onChangeText={setWilayaSearchText}
              />
            </View>

            <FlatList
              data={filteredWilayas}
              renderItem={renderWilayaItem}
              keyExtractor={(item) => item.id.toString()}
              style={styles.modalList}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.modalListContent}
            />
          </View>
        </View>
      </Modal>

      {/* Commune Selection Modal */}
      <Modal
        visible={communeModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCommuneModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Commune</Text>
              <TouchableOpacity
                onPress={() => setCommuneModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <Search size={20} color="#6B7280" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search commune..."
                value={communeSearchText}
                onChangeText={setCommuneSearchText}
              />
            </View>

            <FlatList
              data={filteredCommunes}
              renderItem={renderCommuneItem}
              keyExtractor={(item) => item.id.toString()}
              style={styles.modalList}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.modalListContent}
            />
          </View>
        </View>
      </Modal>
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
  content: {
    flex: 1,
  },
  productSummary: {
    padding: 24,
    backgroundColor: '#F9FAFB',
    marginBottom: 8,
  },
  productItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  storeName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },
  section: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  userInfo: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userInfoText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  selectorText: {
    fontSize: 16,
    color: '#111827',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  confirmButtonDisabled: {
    opacity: 0.7,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 16,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles - Updated for better mobile support
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: screenHeight * 0.8, // 80% of screen height
    minHeight: screenHeight * 0.5, // Minimum 50% of screen height
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#111827',
  },
  modalList: {
    flex: 1,
    marginBottom: 16,
  },
  modalListContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    minHeight: 56, // Ensure minimum touch target
  },
  modalItemText: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2563EB',
  },
});