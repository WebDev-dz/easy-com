// services/api.ts
import axios from 'axios';
import { getStorageItemAsync, removeStorageItem } from './storage';
import { router } from 'expo-router';

// Use appropriate environment variable based on your setup
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.14.2:8000/api';

console.log('API Configuration:', {
    API_URL,
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
    NODE_ENV: process.env.NODE_ENV
});

// Create axios instance with default config
export const api = axios.create({
    baseURL: API_URL,
    timeout: 30000, // 30 seconds timeout
    
});

// Request interceptor - should return the config or a promise that resolves to config
api.interceptors.request.use(
    (config) => {
        console.log('Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            fullURL: `${config.baseURL}${config.url}`,
            headers: config.headers
        });
        return config;
    },
    (error) => {
        console.log('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor - should return the response or a promise that resolves to response
api.interceptors.response.use(
    (response) => {
        console.log('Response success:', {
            status: response.status,
            url: response.config.url,
            method: response.config.method
        });
        return response;
    },
    (error) => {
        console.error('Response error details:', {
            ...error
        });

        // Handle specific error cases
        if (error.response?.status === 401) {
            console.log('Unauthorized - redirecting to login');
            removeStorageItem('auth-storage');
            router.push('/(auth)/login');
        } else if (error.code === 'ERR_NETWORK') {
            console.log('Network error detected. Possible causes:');
            console.log('1. API server is down or unreachable');
            console.log('2. Incorrect API URL:', API_URL);
            console.log('3. Network connectivity issues');
            console.log('4. CORS issues (if testing in browser)');
            console.log('5. Firewall blocking the request');
        } else if (error.code === 'ECONNABORTED') {
            console.log('Request timeout - server took too long to respond');
        } else if (error.code === 'ERR_BAD_REQUEST') {
            console.log('Bad request - check request format and data');
        }

        return Promise.reject(error);
    }
);

export const getAuthHeaders = async (token?: string) => {
    try {
        const storage = await getStorageItemAsync('auth-storage');
        const finalToken = token || storage?.token;
        
        if (!finalToken) {
            console.log('No auth token found');
            router.push('/(auth)/login');
            return {};
        }
        
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${finalToken}`,
        };
    } catch (error) {
        console.log('Error getting auth headers:', error);
        return {};
    }
};