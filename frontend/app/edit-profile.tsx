import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUserStore } from '../src/store/userStore';
import { Button, Input, colors } from '../src/components/ThemedComponents';

export default function EditProfileScreen() {
  const router = useRouter();
  const { currentUser, updateProfile, isLoading } = useUserStore();
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [bio, setBio] = useState(currentUser?.bio || '');

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Information', 'Please enter your name.');
      return;
    }

    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim() || undefined,
        bio: bio.trim() || undefined,
      });
      Alert.alert('Success', 'Profile updated!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {name.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
          </View>

          <Input
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            label="Name *"
            icon="person-outline"
          />

          <View style={styles.emailContainer}>
            <Text style={styles.emailLabel}>Email</Text>
            <View style={styles.emailBox}>
              <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.emailText}>{currentUser?.email}</Text>
            </View>
          </View>

          <Input
            value={phone}
            onChangeText={setPhone}
            placeholder="Your phone number"
            label="Phone"
            icon="call-outline"
            keyboardType="numeric"
          />

          <Input
            value={bio}
            onChangeText={setBio}
            placeholder="Tell others about yourself..."
            label="Bio"
            multiline
          />

          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={isLoading}
            icon="checkmark"
            style={styles.saveButton}
          />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  placeholder: {
    width: 32,
  },
  scrollContent: {
    padding: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#000',
  },
  emailContainer: {
    marginBottom: 16,
  },
  emailLabel: {
    color: colors.text,
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  emailBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emailText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginLeft: 10,
  },
  saveButton: {
    marginTop: 24,
  },
});
