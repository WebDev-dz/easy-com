import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Award, Share, MapPin, Store, Package } from 'lucide-react-native';
import { Supplier } from '@/services/types'; // Adjust path as needed
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { API_URL } from '@/services/api';

type Props = {
  supplier: Supplier;
  handleSupplierPress: (supplier: Supplier) => void;
  handleShare: (supplier: Supplier) => void;
  getSupplierTypeColor: (type: string) => { bg: string; text: string };
};

const styles = StyleSheet.create({
  supplierCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  supplierHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  supplierImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    marginRight: 12,
  },
  supplierImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  supplierInfo: {
    flex: 1,
  },
  supplierTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  supplierName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginRight: 8,
  },
  supplierTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  supplierTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  supplierTypeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  domainText: {
    fontSize: 12,
    color: '#6B7280',
  },
  supplierDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  shareButton: {
    padding: 8,
  },
  supplierDetails: {
    marginTop: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
    flex: 1,
  },
  supplierActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  ordersButton: {
    flex: 1,
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  ordersButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
  },
  contactButtonText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '600',
  },
  viewProductsButton: {
    flex: 1,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  viewProductsButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export const SupplierCard = ({
  supplier,
  handleShare,
  getSupplierTypeColor,
}: Props) => {
  const { user } = useAuth();
  const isCurrentUser = user?.id === supplier.user_id;
  const typeColors = getSupplierTypeColor(supplier.type);

  const handleViewProducts = () => {
    router.push({
      pathname: '/store/products',
      params: { 
        supplierId: supplier.id, 
        supplierName: supplier.business_name, 
        supplierType: supplier.type 
      },
    });
  };

  const handleViewOrders = () => {
    router.push({
      pathname: '/orders/store-orders',
      params: { storeId: supplier.id },
    });
  };

  return (
    <TouchableOpacity
      style={styles.supplierCard}
      onPress={() => handleViewProducts()}
    >
      <View style={styles.supplierHeader}>
        <View style={styles.supplierImageContainer}>
          <Image
            source={{
              uri:`${API_URL.replace('/api', '')}/storage/${supplier.picture}`
                   ||
                'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
            }}
            style={styles.supplierImage}
          />
        </View>
        <View style={styles.supplierInfo}>
          <View style={styles.supplierTopRow}>
            <Text style={styles.supplierName} numberOfLines={1}>
              {supplier.business_name}
            </Text>
            {supplier && <Award size={16} color="#059669" />}
          </View>
          <View style={styles.supplierTypeContainer}>
            <View
              style={[
                styles.supplierTypeBadge,
                { backgroundColor: typeColors.bg },
              ]}
            >
              <Text
                style={[styles.supplierTypeText, { color: typeColors.text }]}
              >
                {supplier?.type ?? "Merchant"}
              </Text>
            </View>
            <Text style={styles.domainText}>{supplier.domain?.name}</Text>
          </View>
          <Text style={styles.supplierDescription} numberOfLines={2}>
            {supplier.description}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => handleShare(supplier)}
        >
          <Share size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.supplierDetails}>
        {supplier.address && (
          <View style={styles.locationContainer}>
            <MapPin size={14} color="#6B7280" />
            <Text style={styles.locationText} numberOfLines={1}>
              {supplier.address}
            </Text>
          </View>
        )}

        <View style={styles.supplierActions}>
          {isCurrentUser ? (
            <TouchableOpacity 
              style={styles.ordersButton}
              onPress={handleViewOrders}
            >
              <Package size={16} color="#FFFFFF" />
              <Text style={styles.ordersButtonText}>Orders</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.contactButton}>
              <Text style={styles.contactButtonText}>Contact</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.viewProductsButton} onPress={handleViewProducts}>
            <Store size={16} color="#FFFFFF" />
            <Text style={styles.viewProductsButtonText}>View Products</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SupplierCard;