import { Slot, Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function AuthLayout() {
  const { user, isLoading, getUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
     getUser().then((user) => {
      if (user) {
        router.push("/(tabs)/products");
      } 
    });
  }, []);

  

  // Only show auth screens if user is not logged in
  if (!user) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
      </Stack>
    );
  }

  return <Slot />;
}