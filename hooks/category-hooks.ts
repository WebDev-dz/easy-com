import { useMutation, useQuery } from '@tanstack/react-query';
import { categoryService } from '../services/categoryService';

// Query keys
export const categoryKeys = {
    all: ['categories'] as const,
    lists: () => [...categoryKeys.all, 'list'] as const,
    list: (filters: string) => [...categoryKeys.lists(), { filters }] as const,
    details: () => [...categoryKeys.all, 'detail'] as const,
    detail: (id: number) => [...categoryKeys.details(), id] as const,
};

// Get all categories
export const useCategories = () => {
    return useQuery({
        queryKey: categoryKeys.lists(),
        queryFn: categoryService.getCategories,
    });
};

// Get category by ID (if needed in the future)
export const useCategory = () => {
    return useMutation({
        mutationFn: (id: number) => categoryService.getCategoryById(id),
    });
}; 