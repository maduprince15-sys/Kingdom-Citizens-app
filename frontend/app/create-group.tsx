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
import { groupApi } from '../src/services/api';

export default function CreateGroupScreen() {
  const router = useRouter();
  const currentUser = useUserStore((state) => state.currentUser);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [meetingDay, setMeetingDay] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Information', 'Please enter a group name.');
      return;
    }

    if (!currentUser) {
      Alert.alert('Error', 'Please login first');
      return;
    }

    setIsSubmitting(true);
    try {
      const group = await groupApi.create({
        name: name.trim(),
        description: description.trim() || undefined,
        leader_id: currentUser.id,
        meeting_day: meetingDay.trim() || undefined,
        meeting_time: meetingTime.trim() || undefined,
      });
      
      // Add creator as first member
      await groupApi.addMember(group.data.id, currentUser.id);
      
      Alert.alert('Success', 'Group created!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create group');
    } finally {
      setIsSubmitting(false);
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
          <Text style={styles.headerTitle}>Create Group</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.infoCard}>
            <Ionicons name="people" size={24} color={colors.primary} />
            <Text style={styles.infoText}>
              Create a small group for focused Bible study and fellowship.
            </Text>
          </View>

          <Input
            value={name}
            onChangeText={setName}
            placeholder="Group name"
            label="Name *"
            icon="people-outline"
          />

          <Input
            value={description}
            onChangeText={setDescription}
            placeholder="What is this group about?"
            label="Description"
            multiline
          />

          <Input
            value={meetingDay}
            onChangeText={setMeetingDay}
            placeholder="e.g., Every Tuesday"
            label="Meeting Day"
            icon="calendar-outline"
          />

          <Input
            value={meetingTime}
            onChangeText={setMeetingTime}
            placeholder="e.g., 7:00 PM"
            label="Meeting Time"
            icon="time-outline"
          />

          <Button
            title="Create Group"
            onPress={handleCreate}
            loading={isSubmitting}
            icon="add-circle"
            style={styles.createButton}
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
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(218, 165, 32, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  createButton: {
    marginTop: 16,
  },
});
