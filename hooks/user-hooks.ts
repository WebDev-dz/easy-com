import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import userService from '../services/user';
import { UpdateUserRequest, UpdatePasswordRequest } from '../services/types';
import { toastAlert } from '@/lib/toastAlert';

// Query keys
export const userKeys = {
    all: ['user'] as const,
    current: () => [...userKeys.all, 'current'] as const,
};

// Get current user
export const useCurrentUser = () => {
    return useQuery({
        queryKey: userKeys.current(),
        queryFn: userService.getCurrentUser,
    });
};

// Update user profile
export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateUserRequest) => userService.updateProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.current() });
            toastAlert.success('Profile updated successfully');
        },
        onError: (error) => {
            toastAlert.error('Failed to update profile: ' + error.message);
        }
    });
};

// Update user password
export const useUpdatePassword = () => {
    return useMutation({
        mutationFn: (data: UpdatePasswordRequest) => userService.updatePassword(data),
        onSuccess: () => {
            toastAlert.success('Password updated successfully');
        },
        onError: (error) => {
            toastAlert.error('Failed to update password: ' + error.message);
        }
    });
};

// Verify email
export const useVerifyEmail = () => {
    return useMutation({
        mutationFn: ({ id, hash, expires, signature }: { 
            id: number; 
            hash: string; 
            expires: number; 
            signature: string; 
        }) => userService.verifyEmail(id, hash, expires, signature),
        onSuccess: () => {
            toastAlert.success('Email verified successfully');
        },
        onError: (error) => {
            toastAlert.error('Failed to verify email: ' + error.message);
        }
    });
}; 