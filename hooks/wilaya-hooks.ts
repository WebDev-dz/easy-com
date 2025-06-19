import { useMutation, useQuery } from '@tanstack/react-query';
import { wilayaService } from '../services/wilayaService';

// Query keys
export const wilayaKeys = {
    all: ['wilayas'] as const,
    lists: () => [...wilayaKeys.all, 'list'] as const,
    list: (filters: string) => [...wilayaKeys.lists(), { filters }] as const,
    details: () => [...wilayaKeys.all, 'detail'] as const,
    detail: (id: number) => [...wilayaKeys.details(), id] as const,
};

// Get all wilayas
export const useWilayas = () => {
    return useQuery({
        queryKey: wilayaKeys.lists(),
        queryFn: wilayaService.getWilayas,
    });
};

// Get wilaya by ID (if needed in the future)
export const useWilayaCommunes = () => {
    return useMutation({
        mutationFn: wilayaService.getWilayaCommunes,
        
    });
}; 