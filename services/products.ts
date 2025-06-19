import axios from 'axios';
import { 
    Product, 
    ProductWithSupplier, 
    CreateProductRequest, 
    UpdateProductRequest,
    ProductResponse,
    ProductsResponse
} from './types';
import { useAuth } from '@/hooks/useAuth';

import  {api, getAuthHeaders } from './api';


const productsService = {
    // Get all products
    getAllProducts: async (): Promise<Product[]> => {
        const url = `/products`;
        
        const response = await api.get<ProductsResponse>(url, {
            headers: await getAuthHeaders()
        });
        return response.data.data;
    },

    // Get product by ID
    getProductById: async (id: number): Promise<Product> => {
        const response = await api.get<ProductResponse>(`/products/${id}`,{
            headers: await getAuthHeaders()
        });
        return response.data.data as Product;
    },

    // Get products by supplier ID
    getProductsBySupplier: async (supplierId: number): Promise<Product[]> => {
        const response = await api.get<ProductsResponse>(`/suppliers/${supplierId}/products`, {
            headers: await getAuthHeaders()
        });
        return response.data.data;
    },

    // Get product with supplier information
    getProductWithSupplier: async (id: number): Promise<ProductWithSupplier> => {
        const response = await api.get<ProductResponse>(`/products/${id}/supplier`,{
            headers: await getAuthHeaders()
        });
        return response.data.data as ProductWithSupplier;
    },

    // Get supplier by product ID
    getSupplierByProduct: async (id: number): Promise<{ id: number; name: string; type: string }> => {
        const response = await api.get<{ data: { id: number; name: string; type: string } }>(
            `/products/${id}/store`,{
                headers: await getAuthHeaders()
            }
        );
        return response.data.data;
    },

    // Get products by supplier type
    getProductsByType: async (type: 'workshop' | 'importer' | 'merchant'): Promise<Product[]> => {
        const response = await api.get<ProductsResponse>(`/products/${type}`,{
            headers: await getAuthHeaders()
        });
        return response.data.data;
    },

    // Create a new product
    createProduct: async (data: CreateProductRequest): Promise<Product> => {
        const formData = new FormData();
        console.log('Creating product with data:', data);
        // Append required fields
        formData.append('supplier_id', data.supplier_id.toString());
        formData.append('name', data.name);
        formData.append('price', data.price.toString());
        formData.append('quantity', data.quantity.toString());
        formData.append('minimum_quantity', data.minimum_quantity.toString());
        formData.append('visibility', data.visibility);
        // Append optional fields if they exist
        if (data.description) formData.append('description', data.description);
        if (data.category_id) formData.append('category_id', data.category_id.toString());
        
        // Append pictures if they exist
        if (data.pictures) {
            data.pictures.forEach((picture, index) => {
                 console.log(`Appending picture ${index}:`, picture);
                // @ts-ignore
                formData.append(`pictures[${index}]`, picture);
            });
        }

        const response = await api.post<ProductResponse>(`/products`, data, {
            headers: {
                ...await getAuthHeaders(),
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data as Product;
    },

    // Update a product
    updateProduct: async (id: number, data: UpdateProductRequest): Promise<Product> => {
        const formData = new FormData();

        // Append fields if they exist
        if (data.supplier_id) formData.append('supplier_id', data.supplier_id.toString());
        if (data.name) formData.append('name', data.name);
        if (data.price) formData.append('price', data.price.toString());
        if (data.quantity) formData.append('quantity', data.quantity.toString());
        if (data.minimum_quantity) formData.append('minimum_quantity', data.minimum_quantity.toString());
        if (data.description) formData.append('description', data.description);
        if (data.category_id) formData.append('category_id', data.category_id.toString());

        // Append pictures if they exist
        if (data.pictures) {
            data.pictures.forEach((picture, index) => {
                formData.append(`pictures[${index}]`, picture);
            });
        }

        // Append images to delete if they exist
        if (data.images_to_delete) {
            data.images_to_delete.forEach((imageId, index) => {
                formData.append(`images_to_delete[${index}]`, imageId.toString());
            });
        }

        const response = await api.post<ProductResponse>(`/products/${id}`, formData, {
            headers: await getAuthHeaders()
        });
        return response.data.data as Product;
    },

    // Delete a product
    deleteProduct: async (id: number): Promise<{ message: string }> => {
        const response = await api.delete<{ message: string }>(`/products/${id}`,{
            headers: await getAuthHeaders()
        });
        return response.data;
    }
};

export default productsService; 