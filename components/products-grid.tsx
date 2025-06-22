import React from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Package, AlertCircle, RefreshCcw } from 'lucide-react-native';
import { ProductCard } from './product-card'; // Adjust path as needed
import { Product, Supplier } from '@/services/types'; // Adjust path as needed
import { useAddToCart } from '@/hooks/cart-hooks'; // Adjust path as needed
import { alertService } from '@/lib/alert'; // Adjust path as needed
import { router } from 'expo-router';
import RenderList from './ui/list';

type Props = {
  isPending: boolean;
  error: Error | null;
  sortedProducts: Product[];
  favorites: Set<number>;
  setFavorites: (favorites: Set<number>) => void;
  onRetry?: () => void; // Optional retry callback for error state
  supplier?: Supplier
};

const ProductsGrid = ({
  isPending,
  error,
  sortedProducts,
  supplier,
  favorites,
  setFavorites,
  onRetry,
}: Props) => {

  // Animation for empty and error states
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (!isPending && (error || sortedProducts.length === 0)) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [isPending, error, sortedProducts, fadeAnim]);

  return (
    <View style={styles.productsGrid}>
      {isPending ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : error ? (
        <Animated.View style={[styles.errorState, { opacity: fadeAnim }]}>
          <AlertCircle size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error.message || 'An error occurred'}</Text>
          <Text style={styles.errorSubtext}>
            Something went wrong while fetching products. Please try again.
          </Text>
          {onRetry && (
            <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
              <RefreshCcw size={20} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      ) : sortedProducts.length === 0 ? (
        <Animated.View style={[styles.emptyState, { opacity: fadeAnim }]}>
          <Package size={48} color="#D1D5DB" />
          <Text style={styles.emptyStateText}>No Products Found</Text>
          <Text style={styles.emptyStateSubtext}>
            Try adjusting your search or filters to find products.
          </Text>
          <TouchableOpacity style={styles.clearFiltersButton}>
            <Text style={styles.clearFiltersButtonText}>Clear Filters</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <FlatList
          data={sortedProducts}
          
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              favorites={favorites}
              setFavorites={setFavorites}
              isCurrentUser={supplier?.id === item.supplier_id}
            />
          )}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  productsGrid: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    marginVertical: 16,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    textAlign: 'center',
  },
  errorSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  retryButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginVertical: 16,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  emptyStateSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  clearFiltersButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  clearFiltersButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  flatListContent: {
    paddingBottom: 24,
    gap: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
});

export default ProductsGrid;