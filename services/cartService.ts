import axios from 'axios';
import {
    BuyNowRequest,
    AddToCartRequest,
    ValidateCartRequest,
    UpdateCartRequest,
    RemoveFromCartRequest,
    OrderResponse,
    ValidateCartResponse,
    UpdateCartResponse,
    RemoveFromCartResponse,
    ClearCartResponse,
    CartResponse
} from './types';
// @ts-ignore
import { AxiosRequestConfig } from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { api, getAuthHeaders } from './api';

export const cartService = {
    // Buy Now
    buyNow: async (data: BuyNowRequest): Promise<OrderResponse> => {
        const response = await api.post<OrderResponse>('/orders/buy-now', data,
            {
                headers: await getAuthHeaders()
            }
        );
        return response.data;
    },

    // Add to Cart
    addToCart: async (data: AddToCartRequest): Promise<OrderResponse> => {
        const response = await api.post<OrderResponse>('/orders/add-to-cart', data,
            {
               headers: await getAuthHeaders()
            })
        ;
        return response.data;
    },

    // Validate Cart
    validateCart: async (data: ValidateCartRequest): Promise<ValidateCartResponse> => {
        const response = await api.put<ValidateCartResponse>('/orders/validate-cart', data,
            {
               headers: await getAuthHeaders()
            })
        ;
        return response.data;
    },

    // Get Cart
    getCart: async (): Promise<CartResponse> => {
        const response = await api.get<CartResponse>('/orders/cart',
            {
                headers: await getAuthHeaders()
        });
        return response.data;
    },

    // Update Cart
    updateCart: async (data: UpdateCartRequest): Promise<UpdateCartResponse> => {
        const response = await api.put<UpdateCartResponse>('/orders/cart/update', data,
            {
               headers: await getAuthHeaders()
            })
        ;
        return response.data;
    },

    // Remove from Cart
    removeFromCart: async (productId: number, data?: RemoveFromCartRequest): Promise<RemoveFromCartResponse> => {
        const config: AxiosRequestConfig = {
            data,
        };
        const response = await api.delete<RemoveFromCartResponse>(`/cart/remove/${productId}`, config);
        return response.data;
    },

    // Clear Cart
    clearCart: async (): Promise<ClearCartResponse> => {
        const response = await api.delete<ClearCartResponse>('/orders/cart/clear');
        return response.data;
    },
}; 