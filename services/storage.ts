import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { User } from './types';
export interface AuthStorage {
  user: User;
  token: string;
  isAuthenticated: boolean;
}
export async function setStorageItemAsync(
  key: string,
  value: AuthStorage | null
) {
  if (Platform.OS === 'web') {
    try {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (e) {
      console.error('Local storage is unavailable:', e);
    }
  } else {
    if (value == null) {
      await SecureStore.deleteItemAsync(key);
    } else {
      await SecureStore.setItemAsync(key, JSON.stringify(value));
    }
  }
}

export async function getStorageItemAsync(
  key: string
): Promise<AuthStorage | null> {
  if (Platform.OS === 'web') {
    try {
      if (typeof localStorage !== 'undefined') {
        const json = localStorage.getItem(key);
        if (json === null) {
          return null;
        }

        return JSON.parse(json) as AuthStorage;
      }
      return null;
    } catch (e) {
      console.error('Local storage is unavailable:', e);
      return null;
    }
  } else {
    const secure = await SecureStore.getItemAsync(key);
    if (secure === null) {
      return null;
    }
    return JSON.parse(secure) as AuthStorage;
  }
}

export const removeStorageItem = async (key: string): Promise<void> => {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Local storage is unavailable:', e);
    }
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};
