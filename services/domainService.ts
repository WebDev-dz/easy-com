import axios from 'axios';
import { DomainsResponse } from './types';
import { useAuth } from '@/hooks/useAuth';
import { api, getAuthHeaders } from './api';


export const domainService = {
    getDomains: async (): Promise<DomainsResponse> => {
        const response = await api.get<DomainsResponse>('/domains', {
            headers: await getAuthHeaders()
        });
        return response.data;
    },
}; 