import React, { useEffect } from 'react';
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
import { Plus, Package, Star } from 'lucide-react-native';
import { useSuppliers, useUserSuppliers, useUpdateSupplier } from '@/hooks/supplier-hooks';
import { Supplier } from '@/services/types';
import { useAuth } from '@/hooks/useAuth';
import { dialogService } from '@/components/dialog';
import { SuppliersGrid } from '@/components/supplier-grid';

export default function StoresScreen() {
  const { data: stores = [], isPending, error, mutate: fetchStores } = useUserSuppliers();
  const { mutate: updateStore } = useUpdateSupplier();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchStores(user.id);
    }
  }, [user]);

  const handleAddStore = () => {
    router.push('/store/add');
  };

  

  const handleViewStore = (store: Supplier) => {
    router.push({
      pathname: '/store/products',
      params: { 
        storeId: store.id,
        storeName: store.business_name,
      },
    });
  };


 

 



  const getSupplierTypeColor = (type: string) => {
    switch (type) {
      case 'retail':
        return { bg: '#FEF3C7', text: '#92400E' };
      case 'wholesale':
        return { bg: '#DBEAFE', text: '#1E40AF' };
      case 'manufacturer':
        return { bg: '#D1FAE5', text: '#065F46' };
      default:
        return { bg: '#F3F4F6', text: '#374151' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>My Stores</Text>
          <Text style={styles.subtitle}>Manage your business</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddStore}>
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.storesContainer}>
        <SuppliersGrid
          isPending={isPending}
          error={error}
          sortedSuppliers={stores}
          handleSupplierPress={handleViewStore}
          handleShare={(store) => {
            // Handle share functionality
          }}
          getSupplierTypeColor={getSupplierTypeColor}
        />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  addButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  storesContainer: {
    flex: 1,
    height: '100%',
    
    // padding: 24,
  },
  // Supplier Grid Styles
  supplierGrid: {
    flex: 1,
    height: '100%',

  },
  supplierCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
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
  supplierHeader: {
    padding: 16,
  },
  supplierImageContainer: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  supplierImage: {
    width: '100%',
    height: '100%',
  },
  supplierInfo: {
    flex: 1,
  },
  supplierTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  supplierName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  supplierTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  supplierTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  supplierTypeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  domainText: {
    fontSize: 12,
    color: '#64748B',
  },
  supplierDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  shareButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  supplierDetails: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#64748B',
    flex: 1,
  },
  supplierActions: {
    flexDirection: 'row',
    gap: 8,
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  viewProductsButton: {
    flex: 2,
    backgroundColor: '#8B5CF6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  viewProductsButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
});