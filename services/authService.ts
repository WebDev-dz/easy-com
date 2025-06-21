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
import { Image, Platform } from 'react-native';
import { ImagePickerAsset } from 'expo-image-picker';

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
        console.log('Updating profile with data:', data);
        const formData = new FormData();
        
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (key === 'picture') {
                    if (Platform.OS === 'web' && value instanceof File) {
                        formData.append(key, value);
                    } else if (Platform.OS !== 'web') {
                        const imagePickerAsset = value as ImagePickerAsset;
                        
                        // Create the proper file object structure for React Native
                        const fileObject = {
                            uri: imagePickerAsset.uri,
                            type: imagePickerAsset.mimeType || 'image/jpeg',
                            name: imagePickerAsset.fileName || `profile_${Date.now()}.jpg`,
                        } as any;

                        formData.append(key, fileObject);
                    }
                } else {
                    formData.append(key, value.toString());
                }
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