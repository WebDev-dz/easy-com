import { useMutation } from "@tanstack/react-query";
import reviewsService from '../services/reviews';
import { toastAlert } from '@/lib/toastAlert';

// Query keys
export const reviewKeys = {
    all: ['reviews'] as const,
    lists: () => [...reviewKeys.all, 'list'] as const,
    list: (supplierId: number) => [...reviewKeys.lists(), supplierId] as const,
};

export const useGetSupplierReviews = () => {
    return useMutation({
        mutationFn: (supplierId: number) => reviewsService.getSupplierReviews(supplierId),
        onSuccess: () => {
        },
        onError: (error) => {
        }
    });
}; 