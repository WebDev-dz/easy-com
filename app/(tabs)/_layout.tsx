import { Tabs, useRouter, useSegments } from 'expo-router';
import { Chrome as Home, ShoppingBag, User, Store, ShoppingCart } from 'lucide-react-native';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function TabLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to login if user is not logged in
      router.replace('/(auth)/login');
    }
  }, [user, isLoading, segments]);

  // Show nothing while checking auth status
  if (isLoading) {
    return null;
  }

  // Only show tabs if user is logged in
  if (user) {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E2E8F0',
            paddingVertical: 12,
            marginTop: -50,
            height: 90,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
          },
          tabBarActiveTintColor: '#8B5CF6',
          tabBarInactiveTintColor: '#64748B',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="products"
          options={{
            title: 'Products',
            tabBarIcon: ({ size, color }) => <ShoppingBag size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="stores"
          options={{
            title: 'My Stores',
            tabBarIcon: ({ size, color }) => <Store size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
          }}
        />
      </Tabs>
    );
  }

  return null;
}