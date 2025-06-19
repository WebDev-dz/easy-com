import { User, UserResponse, UpdateUserRequest, UpdatePasswordRequest, UpdatePasswordResponse } from './types';
import { useAuth } from '@/hooks/useAuth';


import  {api, getAuthHeaders } from './api';

const userService = {
    // Get authenticated user's details
    getCurrentUser: async (): Promise<User> => {
        const response = await api.get<UserResponse>(`/user`, {
            headers: await getAuthHeaders()
        });
        return response.data.user;
    },

    // Update user profile
    updateProfile: async (data: UpdateUserRequest): Promise<User> => {
        const formData = new FormData();

        // Append fields if they exist
        if (data.full_name) formData.append('full_name', data.full_name);
        if (data.email) formData.append('email', data.email);
        if (data.phone_number) formData.append('phone_number', data.phone_number);
        if (data.picture) formData.append('picture', data.picture);
        if (data.address) formData.append('address', data.address);
        if (data.city) formData.append('city', data.city);

        const response = await api.post<UserResponse>(`/user/update`, formData, {
            headers: {
                ... (await getAuthHeaders()),
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.user;
    },

    // Update user password
    updatePassword: async (data: UpdatePasswordRequest): Promise<UpdatePasswordResponse> => {
        const response = await api.put<UpdatePasswordResponse>(`/user/update-password`, data,{
            headers: await getAuthHeaders()
        });
        return response.data;
    },

    // Verify email
    verifyEmail: async (id: number, hash: string, expires: number, signature: string): Promise<{ message: string }> => {
        const response = await api.get<{ message: string }>(
            `/email/verify/${id}/${hash}?expires=${expires}&signature=${signature}`,
            {
                headers: await getAuthHeaders()
            }
        );
        return response.data;
    }
};

export default userService; 