import { useMutation } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useGetUserOrders } from './supplier-order-hooks';
import { useUserSuppliers } from './supplier-hooks';
import { useGetProductsBySupplier } from './product-hooks';

export interface Activity {
  id: string;
  type: 'order' | 'review' | 'product' | 'store';
  description: string;
  createdAt: string;
}

export interface UserStats {
  totalOrders: number;
  totalReviews: number;
  totalProducts: number;
  totalStores: number;
  recentActivity: Activity[];
}

export interface DashboardStats {
  userStats: UserStats;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useStats = (): DashboardStats => {
  const { user } = useAuth();
  const getUserOrdersMutation = useGetUserOrders();
  const getUserSuppliersMutation = useUserSuppliers();
  const getUserProductsMutation = useGetProductsBySupplier();

  const {
    data: ordersData,
    error: ordersError,
    isPending: isOrdersLoading,
    mutateAsync: fetchOrders,
  } = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      return await getUserOrdersMutation.mutateAsync(user.id);
    },
    onError: (error: any) => {
      console.error('Error fetching orders:', error);
    },
  });

  const {
    data: suppliersData,
    error: suppliersError,
    isPending: isSuppliersLoading,
    mutateAsync: fetchSuppliers,
  } = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      return await getUserSuppliersMutation.mutateAsync(user.id);
    },
    onError: (error: any) => {
      console.error('Error fetching suppliers:', error);
    },
  });

  const {
    data: productsData,
    error: productsError,
    isPending: isProductsLoading,
    mutateAsync: fetchProducts,
  } = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      // For now, we'll use the first supplier's products as user products
      const suppliers = await getUserSuppliersMutation.mutateAsync(user.id);
      if (suppliers && suppliers.length > 0) {
        return await getUserProductsMutation.mutateAsync(suppliers[0].id);
      }
      return [];
    },
    onError: (error: any) => {
      console.error('Error fetching products:', error);
    },
  });

  const fetchStats = async () => {
    try {
      await Promise.all([
        fetchOrders(),
        fetchSuppliers(),
        fetchProducts(),
      ]);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const refetch = async (): Promise<void> => {
    try {
      await fetchStats();
    } catch (error) {
      console.error('Error refetching stats:', error);
    }
  };

  const defaultStats: UserStats = {
    totalOrders: 0,
    totalReviews: 0,
    totalProducts: 0,
    totalStores: 0,
    recentActivity: [],
  };

  // Combine data from different services
  const userStats: UserStats = {
    totalOrders: ordersData?.length || 0,
    totalReviews: 0, // No review service available yet
    totalProducts: productsData?.length || 0,
    totalStores: suppliersData?.length || 0,
    recentActivity: [
      // Generate recent activity from orders
      ...(ordersData?.slice(0, 5).map((order: any) => ({
        id: order.id.toString(),
        type: 'order' as const,
        description: `Order #${order.id} - ${order.status}`,
        createdAt: order.created_at,
      })) || []),
      // Generate recent activity from products
      ...(productsData?.slice(0, 3).map((product: any) => ({
        id: product.id.toString(),
        type: 'product' as const,
        description: `Product: ${product.name}`,
        createdAt: product.created_at,
      })) || []),
      // Generate recent activity from stores
      ...(suppliersData?.slice(0, 2).map((supplier: any) => ({
        id: supplier.id.toString(),
        type: 'store' as const,
        description: `Store: ${supplier.name}`,
        createdAt: supplier.created_at,
      })) || []),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10),
  };

  const isLoading = isOrdersLoading || isSuppliersLoading || isProductsLoading;
  const error = ordersError?.message || suppliersError?.message || productsError?.message || null;

  return {
    userStats: userStats,
    isLoading,
    error,
    refetch,
  };
};
