import { useMutation, useQuery } from "@tanstack/react-query";
import productsService from '../services/products';
import { CreateProductRequest, UpdateProductRequest } from '../services/types';
import { toastAlert } from '@/lib/toastAlert';

// Query keys
export const productKeys = {
    all: ['products'] as const,
    lists: () => [...productKeys.all, 'list'] as const,
    list: (filters: string) => [...productKeys.lists(), { filters }] as const,
    details: () => [...productKeys.all, 'detail'] as const,
    detail: (id: number) => [...productKeys.details(), id] as const,
    supplierProducts: (supplierId: number) => [...productKeys.all, 'supplier', supplierId] as const,
};

export const useGetProducts = () => {
    return useQuery({
        queryKey: [...productKeys.lists(), ],
        queryFn: () => productsService.getAllProducts(),
    });
};

export const useGetProduct = () => {
    return useMutation({
        mutationFn: productsService.getProductById,
        onSuccess: () => {
        },
        onError: (error) => {
            toastAlert.error('Failed to fetch product: ' + error.message);
        }
    });
};

export const useGetProductWithSupplier = () => {
    return useMutation({
        mutationFn: productsService.getProductWithSupplier,
        onSuccess: () => {
        },
        onError: (error) => {
            toastAlert.error('Failed to fetch product with supplier: ' + error.message);
        }
    });
};

export const useGetSupplierByProduct = () => {
    return useMutation({
        mutationFn: productsService.getSupplierByProduct,
        onSuccess: () => {
        },
        onError: (error) => {
            toastAlert.error('Failed to fetch supplier: ' + error.message);
        }
    });
};

export const useGetProductsByType = () => {
    return useMutation({
        mutationFn: (type: 'workshop' | 'importer' | 'merchant') => 
            productsService.getProductsByType(type),
        onSuccess: () => {
        },
        onError: (error) => {
            toastAlert.error('Failed to fetch products: ' + error.message);
        }
    });
};

export const useCreateProduct = () => {
    return useMutation({
        mutationFn: (data: CreateProductRequest) => 
            productsService.createProduct(data),
        onSuccess: () => {
            toastAlert.success('Product created successfully');
        },
        onError: (error) => {
            console.error('Error creating product:', error);
            toastAlert.error('Failed to create product: ' + error.message);
        }
    });
};

export const useUpdateProduct = () => {
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateProductRequest }) =>
            productsService.updateProduct(id, data),
        onSuccess: () => {
            toastAlert.success('Product updated successfully');
        },
        onError: (error) => {
            toastAlert.error('Failed to update product: ' + error.message);
        }
    });
};

export const useDeleteProduct = () => {
    return useMutation({
        mutationFn: productsService.deleteProduct,
        onSuccess: () => {
            toastAlert.success('Product deleted successfully');
        },
        onError: (error) => {
            toastAlert.error('Failed to delete product: ' + error.message);
        }
    });
};

export const useGetProductsBySupplier = () => {
    return useMutation({
        mutationFn: (supplierId: number) => productsService.getProductsBySupplier(supplierId),
        onSuccess: () => {
        },
        onError: (error) => {
            toastAlert.error('Failed to fetch products: ' + error.message);
        }
    });
}; 