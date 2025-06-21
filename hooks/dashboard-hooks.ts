import { useMutation, useQuery } from '@tanstack/react-query';
import dashboardService from '../services/dashboardService';
import { toastAlert } from '@/lib/toastAlert';

// Query keys
export const dashboardKeys = {
    all: ['dashboard'] as const,
    stats: () => [...dashboardKeys.all, 'stats'] as const,
};

// Hook to get dashboard stats
export const useDashboard = () => {
    const { 
        data: stats, 
        isPending: isLoading, 
        error, 
        mutate: refetch 
    } = useMutation({
        mutationFn: dashboardService.getStats,
        
        onError: (error) => {
            toastAlert.error('Failed to load dashboard stats: ' + error.message);
        },
        // Set initial data to avoid errors on first render
        
    });

    return { stats, isLoading, error, refetch };
};
