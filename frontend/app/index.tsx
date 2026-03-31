import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUserStore } from '../src/store/userStore';
import { Button, Input, colors, LoadingScreen } from '../src/components/ThemedComponents';

export default function WelcomeScreen() {
  const router = useRouter();
  const { currentUser, isLoading, login, loadStoredUser } = useUserStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadStoredUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      router.replace('/(tabs)');
    }
  }, [currentUser]);

  const handleJoin = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Missing Information', 'Please enter your name and email.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.toLowerCase().trim(), name.trim());
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to join. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/logo.jpg')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Welcome to</Text>
            <Text style={styles.appName}>Kingdom Citizens</Text>
            <Text style={styles.subtitle}>Bible Studies Team</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Join Our Community</Text>

            <Input
              value={name}
              onChangeText={setName}
              placeholder="Your Name"
              icon="person-outline"
              label="Name"
            />

            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="your.email@example.com"
              keyboardType="email-address"
              icon="mail-outline"
              label="Email"
            />

            <Button
              title="Join Community"
              onPress={handleJoin}
              loading={isSubmitting}
              icon="enter-outline"
              style={styles.joinButton}
            />
          </View>

          <Text style={styles.footerText}>
            "For where two or three gather in my name, there am I with them."
          </Text>
          <Text style={styles.verseRef}>- Matthew 18:20</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text,
    marginTop: 4,
  },
  formContainer: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  joinButton: {
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  verseRef: {
    fontSize: 12,
    color: colors.primary,
    textAlign: 'center',
    marginTop: 4,
  },
});
