import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import suppliersService from '../services/suppliers';
import { CreateSupplierRequest, UpdateSupplierRequest } from '../services/types';
import { alertService } from '@/lib/alert';
import { router } from 'expo-router';
import { toastAlert } from '@/lib/toastAlert';

// Query keys
export const supplierKeys = {
    all: ['suppliers'] as const,
    lists: () => [...supplierKeys.all, 'list'] as const,
    list: (filters: string) => [...supplierKeys.lists(), { filters }] as const,
    details: () => [...supplierKeys.all, 'detail'] as const,
    detail: (id: number) => [...supplierKeys.details(), id] as const,
    userSuppliers: (userId: number) => [...supplierKeys.all, 'user', userId] as const,
    products: (id: number) => [...supplierKeys.detail(id), 'products'] as const,
};

// Get all suppliers
export const useSuppliers = () => {
    return useQuery({
        queryKey: supplierKeys.lists(),
        queryFn: suppliersService.getAllSuppliers,
    });
};

// Get supplier by ID
export const useSupplier = (id: number) => {
    return useQuery({
        queryKey: supplierKeys.detail(id),
        queryFn: () => suppliersService.getSupplierById(id),
        enabled: !!id,
    });
};

// Get suppliers by user ID
export const useUserSuppliers = () => {
    return useMutation({
        mutationFn: suppliersService.getSuppliersByUserId,
        onSuccess: (data) => {
            return data;
        },
        onError: (error) => {
            toastAlert.error('Failed to fetch user suppliers: ' + error.message);
        }
    });
};

// Get supplier products
export const useSupplierProducts = (id: number) => {
    return useQuery({
        queryKey: supplierKeys.products(id),
        queryFn: () => suppliersService.getSupplierProducts(id),
        enabled: !!id,
    });
};

// Create supplier
export const useCreateSupplier = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateSupplierRequest) => suppliersService.createSupplier(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
            toastAlert.success('Supplier created successfully!');
            router.push('/stores');
        },
        onError: (error) => {
            toastAlert.error('Failed to create supplier: ' + error.message);
        }
    });
};

// Update supplier
export const useUpdateSupplier = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateSupplierRequest }) =>
            suppliersService.updateSupplier(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: supplierKeys.detail(data.id) });
            queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
            toastAlert.success('Supplier updated successfully');
        },
        onError: (error) => {
            toastAlert.error('Failed to update supplier: ' + error.message);
        }
    });
};

// Delete supplier
export const useDeleteSupplier = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => suppliersService.deleteSupplier(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: supplierKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
            toastAlert.success('Supplier deleted successfully');
        },
        onError: (error) => {
            toastAlert.error('Failed to delete supplier: ' + error.message);
        }
    });
}; 