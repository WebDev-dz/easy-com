import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  Filter,
  Star,
  Package,
  Users,
} from 'lucide-react-native';
import { useGetProducts } from '@/hooks/product-hooks';
import { useSuppliers } from '@/hooks/supplier-hooks';
import { alertService } from '@/lib/alert';
import { Product, Supplier } from '@/services/types';
import { useCategories } from '@/hooks/category-hooks';
import ProductsGrid from '@/components/products-grid';
import SuppliersGrid from '@/components/supplier-grid';
import Tabs, { TabConfig } from '@/components/ui/tabs';
import { useFilters } from '@/hooks/filters-hook';
import { FiltersModal } from '@/components/filters-modal';

// Enhanced Types

export default function ProductsScreen() {
  const [selectedTab, setSelectedTab] = useState<'products' | 'suppliers'>('products');
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const {
    data: products = [],
    isPending,
    error,
    refetch: getProducts,
  } = useGetProducts();
  const {
    data: suppliers = [],
    isPending: isSuppliersPending,
    error: supplierError,
  } = useSuppliers();
  const {
    data: categories,
    isPending: isCategoriesPending,
    error: categoryError,
  } = useCategories();

  // Use the filters hook
  const filters = useFilters();

  const tabs: TabConfig[] = [
    {
      key: 'products',
      label: 'Products',
      icon: ({ size, color }) => <Package size={size} color={color} />,
    },
    {
      key: 'suppliers',
      label: 'Suppliers',
      icon: ({ size, color }) => <Users size={size} color={color} />,
    },
  ];

  // Apply filters and sorting
  const filteredAndSortedProducts = filters.sortedProducts(
    filters.filteredProducts(products)
  );

  const filteredAndSortedSuppliers = filters.sortedSuppliers(
    filters.filteredSuppliers(suppliers)
  );

  useEffect(() => {
    // loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await getProducts();
    setRefreshing(false);
  };

  const handleSupplierPress = (supplier: Supplier) => {
    // router.push({
    //   href: '/supplier/profile',
    //   params: {
    //     supplierId: supplier.id,
    //     supplierName: supplier.business_name,
    //     supplierType: supplier.type,
    //     supplierRating: (supplier.rating || 0).toString(),
    //     supplierReviews: (supplier.reviewCount || 0).toString()
    //   },
    // });
  };

  const isProduct = (item: Product | Supplier): item is Product => {
    return (item as Product)?.name !== undefined;
  };

  const handleShare = (item: Product | Supplier) => {
    // Implement share functionality
    alertService(
      'Share',
      `Share ${isProduct(item) ? item?.name : item.business_name}?`
    );
  };

  

  const getSupplierTypeColor = (type: string) => {
    switch (type) {
      case 'workshop':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'items':
        return { bg: '#DBEAFE', text: '#2563EB' };
      case 'products':
        return { bg: '#D1FAE5', text: '#059669' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Marketplace</Text>
        <View style={styles.headerStats}>
          <Text style={styles.statsText}>
            {selectedTab === 'products'
              ? `${filteredAndSortedProducts.length} products`
              : `${filteredAndSortedSuppliers.length} suppliers`}
          </Text>
        </View>
      </View>

      {/* Tab Selection */}
      <Tabs
        tabs={tabs}
        selectedTab={selectedTab}
        setSelectedTab={(tab: string) => setSelectedTab(tab as 'products' | 'suppliers')}
        styles={styles}
      />

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${selectedTab}...`}
            value={filters.filterState.searchQuery}
            onChangeText={filters.setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => filters.setShowFilterModal(true)}
        >
          <Filter size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 0 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {selectedTab === 'products' ? (
          <ProductsGrid
            isPending={isPending}
            error={error}
            sortedProducts={filteredAndSortedProducts}
            favorites={favorites}
            setFavorites={setFavorites}
          />
        ) : (
          <SuppliersGrid
            isPending={isSuppliersPending}
            error={supplierError}
            sortedSuppliers={filteredAndSortedSuppliers}
            handleSupplierPress={handleSupplierPress}
            handleShare={handleShare}
            getSupplierTypeColor={getSupplierTypeColor}
          />
        )}
      </ScrollView>

      {/* Use the reusable FiltersModal component */}
      <FiltersModal
        {...filters}
        categories={categories?.data}
        selectedTab={selectedTab}
      />
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
    backgroundColor: '#FFFFFF',
    padding: 24,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  headerStats: {
    alignItems: 'flex-end',
  },
  statsText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: 8,
  },
  activeTab: {
    borderBottomColor: '#8B5CF6',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    height: 65,
    flexGrow: 0,
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  filterButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
  },
  productsGrid: {
    flexDirection: 'row',
    marginVertical: 8,
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 0,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    right: 40,
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  suppliersContainer: {
    marginVertical: 8,
    gap: 16,
  },
  supplierCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  supplierHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  supplierImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  supplierImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  supplierInfo: {
    flex: 1,
  },
  supplierTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  supplierName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  supplierTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  supplierTypeBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  supplierTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  domainText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  supplierDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  shareButton: {
    padding: 8,
  },
  supplierDetails: {
    gap: 12,
  },
  supplierMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricItem: {
    alignItems: 'flex-start',
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    fontSize: 12,
    color: '#6B7280',
  },
  metricLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  supplierRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  supplierActions: {
    flexDirection: 'row',
    gap: 8,
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  ordersButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  ordersButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  viewProductsButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    paddingVertical: 10,
    gap: 6,
  },
  viewProductsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    width: '100%',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
  },
});
