import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { useUserStore } from '../src/store/userStore';
import { colors } from '../src/components/ThemedComponents';
import { notificationService } from '../src/services/notifications';

export default function RootLayout() {
  const loadStoredUser = useUserStore((state) => state.loadStoredUser);

  useEffect(() => {
    loadStoredUser();
    
    // Initialize push notifications
    if (Platform.OS !== 'web') {
      notificationService.registerForPushNotifications();
    }
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      />
    </>
  );
}
