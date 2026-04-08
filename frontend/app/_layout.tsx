import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';

function AuthGuard() {
  const { member, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === '(tabs)';
    if (!member && inAuthGroup) {
      router.replace('/');
    } else if (member && !inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [member, isLoading, segments]);

  return null;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGuard />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="admin" options={{ headerShown: true, title: 'Admin Panel', headerStyle: { backgroundColor: '#0f172a' }, headerTintColor: '#fff' }} />
        <Stack.Screen name="announcements" options={{ headerShown: true, title: 'Announcements', headerStyle: { backgroundColor: '#0f172a' }, headerTintColor: '#fff' }} />
        <Stack.Screen name="create-announcement" options={{ headerShown: true, title: 'New Announcement', headerStyle: { backgroundColor: '#0f172a' }, headerTintColor: '#fff' }} />
        <Stack.Screen name="create-session" options={{ headerShown: true, title: 'New Session', headerStyle: { backgroundColor: '#0f172a' }, headerTintColor: '#fff' }} />
        <Stack.Screen name="create-prayer" options={{ headerShown: true, title: 'Prayer Request', headerStyle: { backgroundColor: '#0f172a' }, headerTintColor: '#fff' }} />
        <Stack.Screen name="create-note" options={{ headerShown: true, title: 'New Note', headerStyle: { backgroundColor: '#0f172a' }, headerTintColor: '#fff' }} />
        <Stack.Screen name="create-group" options={{ headerShown: true, title: 'New Group', headerStyle: { backgroundColor: '#0f172a' }, headerTintColor: '#fff' }} />
        <Stack.Screen name="edit-profile" options={{ headerShown: true, title: 'Edit Profile', headerStyle: { backgroundColor: '#0f172a' }, headerTintColor: '#fff' }} />
        <Stack.Screen name="members" options={{ headerShown: true, title: 'Members', headerStyle: { backgroundColor: '#0f172a' }, headerTintColor: '#fff' }} />
        <Stack.Screen name="conversation/[id]" options={{ headerShown: true, title: 'Chat', headerStyle: { backgroundColor: '#0f172a' }, headerTintColor: '#fff' }} />
      </Stack>
    </AuthProvider>
  );
}
