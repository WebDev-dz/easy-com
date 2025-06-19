import axios from 'axios';
import { 
    Supplier, 
    CreateSupplierRequest, 
    UpdateSupplierRequest,
    SupplierResponse,
    SuppliersResponse,
    SupplierProductsResponse
} from './types';
import { useAuth } from '@/hooks/useAuth';

import  {api, getAuthHeaders } from './api';


export interface ProductImage {
    uri: string;
    type: "image/jpeg" | "image/png"; // Use string for web compatibility
    name: string;
    size?: number;
    file?: File; // For web only
  }


const suppliersService = {
    // Get all suppliers
    getAllSuppliers: async (): Promise<Supplier[]> => {
        const headers = await getAuthHeaders();
        const response = await api.get<SuppliersResponse>(`/suppliers`,{
            headers
        });
        return response.data.data;
    },

    // Get supplier by ID
    getSupplierById: async (id: number): Promise<Supplier> => {
        const response = await api.get<SupplierResponse>(`/suppliers/${id}`,{
            headers: await getAuthHeaders()
        });
        return response.data.data;
    },

    // Get suppliers by user ID
    getSuppliersByUserId: async (userId: number): Promise<Supplier[]> => {
        const response = await api.get<Supplier[]>(`/suppliers/by-user/${userId}`,{
            headers: await getAuthHeaders()
        });
        return response.data;
    },

    // Get supplier products
    getSupplierProducts: async (id: number): Promise<SupplierProductsResponse> => {
        const response = await api.get<SupplierProductsResponse>(`/suppliers/${id}/products`,{
            headers: await getAuthHeaders()
        });
        return response.data;
    },

    // Create a new supplier
    createSupplier: async (data: CreateSupplierRequest): Promise<Supplier> => {
        const formData = new FormData();
        
        // Append required fields
        formData.append('user_id', data.user_id.toString());
        formData.append('business_name', data.business_name);
        formData.append('description', data.description);
        formData.append('address', data.address);
        formData.append('domain_id', data.domain_id.toString());
        formData.append('type', data.type);
        
        // Append optional picture if it exists
        if (data.picture) {
            // @ts-ignore
            formData.append('picture', data?.picture);
        }


        const response = await api.post<SupplierResponse>(`/suppliers`, formData, {
            headers: {... await getAuthHeaders(), "Content-Type": 'multipart/form-data'}
            
        });
        return response.data.data;
    },

    // Update a supplier
    updateSupplier: async (id: number, data: UpdateSupplierRequest): Promise<Supplier> => {
        const formData = new FormData();

        // Append fields if they exist
        if (data.business_name) formData.append('business_name', data.business_name);
        if (data.description) formData.append('description', data.description);
        if (data.address) formData.append('address', data.address);
        if (data.domain_id) formData.append('domain_id', data.domain_id.toString());
        if (data.type) formData.append('type', data.type);
        if (data.picture) formData.append('picture', data.picture);

        const response = await api.post<SupplierResponse>(`/suppliers/${id}`, formData, {
            headers: await getAuthHeaders()
        });
        return response.data.data;
    },

    // Delete a supplier
    deleteSupplier: async (id: number): Promise<{ message: string }> => {
        const response = await api.delete<{ message: string }>(`/suppliers/${id}`,{
            headers: await getAuthHeaders()
        });
        return response.data;
    }
};

export default suppliersService; 