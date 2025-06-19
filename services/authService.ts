import {
    RegisterRequest,
    RegisterResponse,
    LoginRequest,
    LoginResponse,
    UpdateProfileRequest,
    UpdateProfileResponse,
    UpdatePasswordRequest,
    UpdatePasswordResponse,
    User,
} from './types';
import { api, getAuthHeaders } from './api';

// Base URL for API requests (adjust according to your environment)

export const authService = {
    // Register new user
    register: async (data: RegisterRequest): Promise<RegisterResponse> => {
        const response = await api.post<RegisterResponse>('/register', data);
        return response.data;
    },

    // Login user
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>('/login', data);
        return response.data;
    },

    // Logout user
    logout: async (): Promise<{ message: string }> => {
        const response = await api.post<{ message: string }>('/logout',{
            headers: await getAuthHeaders()
        });
        return response.data;
    },

    // Get current user
    getCurrentUser: async (token?: string): Promise<{ user: User; message: string }> => {
        const response = await api.get<{ user: User; message: string }>('/user',{
            headers: await getAuthHeaders(token)
        });
        return response.data;
    },

    // Update user profile
    updateProfile: async (data: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined) {
                formData.append(key, value);
            }
        });

        const response = await api.post<UpdateProfileResponse>('/user/update', formData, {
            headers: {
                ...await getAuthHeaders(),
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Update password
    updatePassword: async (data: UpdatePasswordRequest): Promise<UpdatePasswordResponse> => {
        const response = await api.put<UpdatePasswordResponse>('/user/update-password', data,{
            headers: await getAuthHeaders()
        });
        return response.data;
    },

    // Verify email
    verifyEmail: async (id: number, hash: string, expires: number, signature: string): Promise<{ message: string }> => {
        const params = new URLSearchParams({ expires: expires.toString(), signature });
        const response = await api.get<{ message: string }>(`/email/verify/${id}/${hash}?${params}`,{
            headers: await getAuthHeaders()
        });
        return response.data;
    },
};