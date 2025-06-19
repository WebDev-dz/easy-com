import { useQuery } from '@tanstack/react-query';
import { domainService } from '../services/domainService';

// Query keys
export const domainKeys = {
    all: ['categories'] as const,
    lists: () => [...domainKeys.all, 'list'] as const,
    list: (filters: string) => [...domainKeys.lists(), { filters }] as const,
    details: () => [...domainKeys.all, 'detail'] as const,
    detail: (id: number) => [...domainKeys.details(), id] as const,
};

// Get all categories
export const useDomains = () => {
    return useQuery({
        queryKey: domainKeys.lists(),
        queryFn: domainService.getDomains,
        refetchInterval: 20000
    });
};
