import React, { createContext, useContext, useCallback, ReactNode, useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { User, LoginRequest, RegisterRequest, UpdateProfileRequest, UpdatePasswordRequest } from '../services/types';
import { useAuthStorage, AuthStorage } from './storage-hooks';
import { router } from 'expo-router';
import { getStorageItemAsync } from '@/services/storage';

// Types
interface AuthState {
  user: User | null;
  getUser: () => Promise<User | undefined>;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  updatePassword: (data: UpdatePasswordRequest) => Promise<void>;
  clearError: () => void;
  getToken: () => string | null;
  handleSessionExpiry: () => Promise<void>;
  checkSession: () => Promise<boolean>;
}

// Storage utilities
const STORAGE_KEY = 'auth-storage';

// Utility function to check if error is unauthorized
const isUnauthorizedError = (error: any): boolean => {
  return error?.response?.status === 401 || 
         error?.status === 401 || 
         error?.response?.data?.error === 'Unauthorized' ||
         error?.response?.data?.message?.toLowerCase().includes('unauthorized') ||
         error?.response?.data?.message?.toLowerCase().includes('unauthenticated') ||
         error?.response?.data?.message?.toLowerCase().includes('token');
};

// Utility function to redirect to login
const redirectToLogin = () => {
  // Clear any existing route state
  if (typeof window !== 'undefined') {
    // Store current location for redirect after login (optional)
    const currentPath = window.location.pathname + window.location.search;
    if (currentPath !== '/login' && currentPath !== '/register') {
      sessionStorage.setItem('redirectAfterLogin', currentPath);
    }
    
    // Redirect to login page
    window.location.href = '/login';
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [[isLoading, authData], setAuthData] = useAuthStorage(STORAGE_KEY);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Use ref to prevent multiple simultaneous session expiry handlers
  const isHandlingSessionExpiry = useRef(false);

  // Session expiry handler - simplified and protected against multiple calls
  const handleSessionExpiry = useCallback(async (): Promise<void> => {
    if (isHandlingSessionExpiry.current) {
      return; // Prevent multiple simultaneous calls
    }
    
    isHandlingSessionExpiry.current = true;
    
    try {
      // Clear auth data first
      setAuthData(null);
      setError('Your session has expired. Please log in again.');
      queryClient.clear();
      
      // Navigate after a brief delay to ensure state is cleared
      setTimeout(() => {
        try {
          router.replace('/(auth)/login');
        } catch (navError) {
          console.error('Navigation error in session expiry:', navError);
          redirectToLogin();
        }
        isHandlingSessionExpiry.current = false;
      }, 100);
      
    } catch (error) {
      console.error('Error handling session expiry:', error);
      isHandlingSessionExpiry.current = false;
      setTimeout(() => {
        redirectToLogin();
      }, 100);
    }
  }, [queryClient, setAuthData]);

  // Check session validity
  const checkSession = useCallback(async (): Promise<boolean> => {
    const currentAuthData = authData;
    
    if (!currentAuthData?.token || !currentAuthData?.isAuthenticated) {
      return false;
    }

    try {
      await authService.getCurrentUser();
      return true;
    } catch (error) {
      if (isUnauthorizedError(error)) {
        await handleSessionExpiry();
        return false;
      }
      return true;
    }
  }, [authData?.token, authData?.isAuthenticated, handleSessionExpiry]);

  // React Query mutations
  const loginMutation = useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await authService.login(data);
      return response;
    },
    onMutate: () => {
      setError(null);
    },
    onSuccess: async (response) => {
      setError(null);
      try {
        const userResponse = await authService.getCurrentUser(response.access_token);
        setAuthData({
          user: userResponse.user,
          token: response.access_token,
          isAuthenticated: true
        });
      } catch (error) {
        console.error('Error getting user after login:', error);
        setError('Login successful but failed to get user data');
      }
    },
    onError: (error: any) => {
      setError(error.response?.data?.error || 'Login failed');
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await authService.register(data);
      return response;
    },
    onMutate: () => {
      setError(null);
    },
    onSuccess: (response) => {
      setAuthData({
        user: response.user,
        token: response.token,
        isAuthenticated: true
      });
      setError(null);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Registration failed');
    },
  });

  const getUser = async () => {
    return(await getStorageItemAsync(STORAGE_KEY))?.user;
  }

  // Fixed logout mutation - handle 401 errors properly
  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (isLoggingOut) {
        return { success: true, alreadyLoggingOut: true };
      }
      
      setIsLoggingOut(true);
      
      try {
        await authService.logout();
        return { success: true };
      } catch (apiError: any) {
        // If token is already invalid (401), that's fine - we want to logout anyway
        if (isUnauthorizedError(apiError)) {
          console.log('Token already invalid during logout, proceeding with local logout');
          return { success: true, tokenInvalid: true };
        }
        console.warn('Logout API call failed, continuing with local logout:', apiError);
        return { success: true, apiError: true };
      }
    },
    onMutate: () => {
      setError(null);
    },
    onSuccess: (result) => {
      // Always clear local state regardless of API response
      setAuthData(null);
      setError(null);
      queryClient.clear();
      
      // Navigate to login
      setTimeout(() => {
        try {
          router.replace('/(auth)/login');
        } catch (navError) {
          console.error('Navigation error during logout:', navError);
          router.push('/(auth)/login');
        }
      }, 50);
    },
    onError: (error: any) => {
      // This should rarely happen now, but handle it gracefully
      console.error('Unexpected error during logout:', error);
      
      // Still clear local state even if there's an error
      setAuthData(null);
      setError(null);
      queryClient.clear();
      
      setTimeout(() => {
        try {
          router.replace('/(auth)/login');
        } catch (navError) {
          router.push('/(auth)/login');
        }
      }, 50);
    },
    onSettled: () => {
      setIsLoggingOut(false);
    },
  });

  const getCurrentUserMutation = useMutation({
    mutationFn: async (token?: string) => {
      const response = await authService.getCurrentUser(token);
      return response;
    },
    onMutate: () => {
      setError(null);
    },
    onSuccess: (response) => {
      if (authData) {
        setAuthData({
          user: response.user,
          token: authData.token,
          isAuthenticated: true
        });
      }
    },
    onError: async (error: any) => {
      if (isUnauthorizedError(error)) {
        await handleSessionExpiry();
        return;
      }
      
      setError(error.response?.data?.message || 'Failed to get user data');
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfileRequest) => {
      const response = await authService.updateProfile(data);
      return response;
    },
    onMutate: () => {
      setError(null);
    },
    onSuccess: (response) => {
      if (authData) {
        setAuthData({
          ...authData,
          user: response.user
        });
      }
    },
    onError: async (error: any) => {
      if (isUnauthorizedError(error)) {
        await handleSessionExpiry();
        return;
      }
      
      setError(error.response?.data?.message || 'Profile update failed');
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: UpdatePasswordRequest) => {
      await authService.updatePassword(data);
    },
    onMutate: () => {
      setError(null);
    },
    onSuccess: () => {
      // No state updates needed for password change
    },
    onError: async (error: any) => {
      if (isUnauthorizedError(error)) {
        await handleSessionExpiry();
        return;
      }
      
      setError(error.response?.data?.message || 'Password update failed');
    },
  });

  // Wrapper functions
  const login = useCallback(async (data: LoginRequest): Promise<void> => {
    try {
      await loginMutation.mutateAsync(data);
    } catch (error) {
      throw error;
    }
  }, [loginMutation]);

  const register = useCallback(async (data: RegisterRequest): Promise<void> => {
    try {
      await registerMutation.mutateAsync(data);
    } catch (error) {
      throw error;
    }
  }, [registerMutation]);

  const logout = useCallback(async (): Promise<void> => {
    if (isLoggingOut || logoutMutation.isPending) {
      console.log('Logout already in progress, skipping...');
      return;
    }

    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error('Logout error (handled):', error);
      // Don't re-throw - logout should always succeed locally
    }
  }, [logoutMutation, isLoggingOut]);

  const getCurrentUser = useCallback(async (): Promise<void> => {
    try {
      await getCurrentUserMutation.mutateAsync(authData?.token);
    } catch (error) {
      if (!isUnauthorizedError(error)) {
        throw error;
      }
    }
  }, [getCurrentUserMutation, authData?.token]);

  const updateProfile = useCallback(async (data: UpdateProfileRequest): Promise<void> => {
    try {
      await updateProfileMutation.mutateAsync(data);
    } catch (error) {
      if (!isUnauthorizedError(error)) {
        throw error;
      }
    }
  }, [updateProfileMutation]);

  const updatePassword = useCallback(async (data: UpdatePasswordRequest): Promise<void> => {
    try {
      await updatePasswordMutation.mutateAsync(data);
    } catch (error) {
      if (!isUnauthorizedError(error)) {
        throw error;
      }
    }
  }, [updatePasswordMutation]);

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  const getToken = useCallback((): string | null => {
    return authData?.token || null;
  }, [authData?.token]);

  // Combine loading states
  const combinedIsLoading = isLoading || 
    isLoggingOut ||
    loginMutation.isPending || 
    registerMutation.isPending || 
    logoutMutation.isPending || 
    getCurrentUserMutation.isPending || 
    updateProfileMutation.isPending || 
    updatePasswordMutation.isPending;

  const value: AuthContextType = {
    user: authData?.user || null,
    token: authData?.token || null,
    isLoading: combinedIsLoading,
    getUser,
    error,
    isAuthenticated: authData?.isAuthenticated || false,
    isInitialized: !isLoading,
    login,
    register,
    logout,
    getCurrentUser,
    updateProfile,
    updatePassword,
    clearError,
    getToken,
    handleSessionExpiry,
    checkSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export the context for advanced use cases
export { AuthContext };