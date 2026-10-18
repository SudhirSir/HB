import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '@/context/AuthContext';

/**
 * Route Guard Component:
 * Automatically protects private routes and redirects unauthorized access
 */
function RouteGuard() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const currentRoute = segments[0] || '';
    const inProtectedGroup = currentRoute === 'dashboard' || currentRoute === 'admin';
    const inAdminRoute = currentRoute === 'admin';

    // 1. If not authenticated and trying to access protected routes -> redirect to /login
    if (!user && inProtectedGroup) {
      router.replace('/login');
      return;
    }

    // 2. If authenticated and on /login or root -> redirect to /dashboard
    if (user && (currentRoute === 'login' || currentRoute === '')) {
      router.replace('/dashboard');
      return;
    }

    // 3. RBAC Protection: Non-admins cannot access /admin
    if (user && inAdminRoute && user.role !== 'admin') {
      router.replace('/dashboard');
      return;
    }
  }, [user, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RouteGuard />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
});
