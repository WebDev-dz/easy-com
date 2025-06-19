import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/hooks/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DialogProvider } from '@/components/dialog';
import Toast from 'react-native-toast-message';

import { type ErrorBoundaryProps } from 'expo-router';
import { View, Text } from 'react-native';

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={{ flex: 1, backgroundColor: "red" }}>
      <Text>{error.message}</Text>
      <Text onPress={retry}>Try Again?</Text>
    </View>
  );
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

export default function RootLayout() {
  useFrameworkReady();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DialogProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="store/add" options={{ headerShown: false }} />
            <Stack.Screen name="store/edit" options={{ headerShown: false }} />
            <Stack.Screen name="store/products" options={{ headerShown: false }} />
            <Stack.Screen name="product/add" options={{ headerShown: false }} />
            <Stack.Screen name="product/edit" options={{ headerShown: false }} />
            <Stack.Screen name="product/details" options={{ headerShown: false }} />
            <Stack.Screen name="checkout" options={{ headerShown: false }} />
            <Stack.Screen name="cart" options={{ headerShown: false }} />
            <Stack.Screen name="profile/edit" options={{ headerShown: false }} />
            <Stack.Screen name="orders/my-orders" options={{ headerShown: false }} />
            <Stack.Screen name="orders/store-orders" options={{ headerShown: false }} />
            <Stack.Screen name="orders/all-received" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
          <Toast swipeable  position='top' />
        </DialogProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}