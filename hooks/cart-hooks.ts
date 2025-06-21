import { useMutation, useQuery } from '@tanstack/react-query';
import { cartService } from '../services/cartService';
import {
    AddToCartRequest,
    BuyNowRequest,
    UpdateCartRequest,
    ValidateCartRequest,
    RemoveFromCartRequest
} from '../services/types';
import { alertService } from '@/lib/alert';
import { router } from 'expo-router';
import { toastAlert } from '@/lib/toastAlert';

// Get Cart Hook
export const useGetCart = () => {
    return useQuery({
        queryKey: ['cart'],
        queryFn: cartService.getCart,
    });
};

// Add to Cart Hook
export const useAddToCart = () => {
    return useMutation({
        mutationFn: (data: AddToCartRequest) => cartService.addToCart(data),
        onSuccess: () => {
            toastAlert.success('Product added to cart successfully');
        },
        onError: (error) => {
            toastAlert.error('Failed to add product to cart');
        }
    });
};

// Buy Now Hook
export const useBuyNow = () => {
    return useMutation({
        mutationFn: (data: BuyNowRequest) => cartService.buyNow(data),
        onSuccess: () => {
            alertService(
                'Order Confirmed!',
                'Your order has been placed successfully. You will receive a confirmation shortly.',
                
              );
              router.push('/(tabs)')
        },
        onError: (error) => {
            alertService('Error', error.message);
        }
    });
};

// Update Cart Hook
export const useUpdateCart = () => {
    return useMutation({
        mutationFn: (data: UpdateCartRequest) => cartService.updateCart(data),
        onSuccess: () => {
            toastAlert.success('Cart updated successfully');
        },
        onError: (error) => {
            toastAlert.error('Failed to update cart');
        }
    });
};

// Remove from Cart Hook
export const useRemoveFromCart = () => {
    return useMutation({
        mutationFn: ({ productId, data }: { productId: number; data?: RemoveFromCartRequest }) => 
            cartService.removeFromCart(productId, data),
        onSuccess: () => {
            toastAlert.success('Product removed from cart');
        },
        onError: () => {
            toastAlert.error('Failed to remove product from cart');
        }
    });
};

// Clear Cart Hook
export const useClearCart = () => {
    return useMutation({
        mutationFn: cartService.clearCart,
        onSuccess: () => {
            toastAlert.success('Cart cleared successfully');
        },
        onError: (error) => {
            toastAlert.error('Failed to clear cart:' + error.message);
        }
    });
};

// Validate Cart Hook
export const useValidateCart = () => {
    return useMutation({
        mutationFn: (data: ValidateCartRequest) => cartService.validateCart(data),
        onSuccess: () => {
            toastAlert.success('Cart validated successfully');
        },
        onError: (error) => {
            toastAlert.error('Failed to validate cart');
        }
    });
}; 