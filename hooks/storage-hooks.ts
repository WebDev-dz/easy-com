import { useEffect, useCallback, useReducer } from 'react';

import { User } from '../services/types';
import { getStorageItemAsync, setStorageItemAsync } from '@/services/storage';

export interface AuthStorage {
  user: User;
  token: string;
  isAuthenticated: boolean;
}

type UseStateHook<T> = [[boolean, T | null], (value: T | null) => void];

function useAsyncState<T>(
  initialValue: [boolean, T | null] = [true, null]
): UseStateHook<T> {
  return useReducer(
    (
      state: [boolean, T | null],
      action: T | null = null
    ): [boolean, T | null] => [false, action],
    initialValue
  ) as UseStateHook<T>;
}

export function useAuthStorage(key: string): UseStateHook<AuthStorage> {
  // Public
  const [state, setState] = useAsyncState<AuthStorage>();

  // Get initial state
  useEffect(() => {
    getStorageItemAsync(key).then(setState);
  }, [key]);

 

  // Set
  const setValue = useCallback(
    (value: AuthStorage | null) => {
      setState(value);
      setStorageItemAsync(key, value);
    },
    [key]
  );

  return [state, setValue];
}
