import React from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Package, AlertCircle, RefreshCcw } from 'lucide-react-native';
import { SupplierOrderCard } from './supplier-order'; // Adjust path as needed
import { SupplierOrder } from '@/services/types';
import RenderList from './ui/list';

type Props = {
  isPending: boolean;
  error: Error | null;
  orders: SupplierOrder[];
  onStatusUpdate: (supplierId: number) => void;
  onRetry?: () => void; // Optional retry callback for error state
};

export const OrdersGrid = ({
  isPending,
  error,
  orders,
  onStatusUpdate,
  onRetry,
}: Props) => {
  // Animation for empty and error states
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (!isPending && (error || orders.length === 0)) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [isPending, error, orders, fadeAnim]);

  return (
    <View style={styles.ordersGrid}>
      {isPending ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : error ? (
        <Animated.View style={[styles.errorState, { opacity: fadeAnim }]}>
          <AlertCircle size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error.message || 'An error occurred'}</Text>
          <Text style={styles.errorSubtext}>
            Something went wrong while fetching orders. Please try again.
          </Text>
          {onRetry && (
            <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
              <RefreshCcw size={20} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      ) : orders.length === 0 ? (
        <Animated.View style={[styles.emptyState, { opacity: fadeAnim }]}>
          <Package size={48} color="#D1D5DB" />
          <Text style={styles.emptyStateText}>No Orders Found</Text>
          <Text style={styles.emptyStateSubtext}>
            Try adjusting your filters to find orders.
          </Text>
          <TouchableOpacity style={styles.clearFiltersButton}>
            <Text style={styles.clearFiltersButtonText}>Clear Filters</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <RenderList
          data={orders}
          renderItem={({ item }) => (
            <SupplierOrderCard
              order={item}
              onStatusUpdate={onStatusUpdate}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  ordersGrid: {
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
  },
});

export default OrdersGrid;