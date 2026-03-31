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
import { sessionApi } from '../src/services/api';

export default function CreateSessionScreen() {
  const router = useRouter();
  const currentUser = useUserStore((state) => state.currentUser);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [scriptureReference, setScriptureReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || !date.trim() || !time.trim()) {
      Alert.alert('Missing Information', 'Please fill in title, date, and time.');
      return;
    }

    if (!currentUser) {
      Alert.alert('Error', 'Please login first');
      return;
    }

    setIsSubmitting(true);
    try {
      await sessionApi.create({
        title: title.trim(),
        description: description.trim() || undefined,
        date: date.trim(),
        time: time.trim(),
        location: location.trim() || undefined,
        scripture_reference: scriptureReference.trim() || undefined,
        host_id: currentUser.id,
      });
      Alert.alert('Success', 'Session created successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create session');
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
          <Text style={styles.headerTitle}>New Session</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Input
            value={title}
            onChangeText={setTitle}
            placeholder="Session Title"
            label="Title *"
            icon="text-outline"
          />

          <Input
            value={description}
            onChangeText={setDescription}
            placeholder="What will you study?"
            label="Description"
            multiline
          />

          <Input
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            label="Date *"
            icon="calendar-outline"
          />

          <Input
            value={time}
            onChangeText={setTime}
            placeholder="e.g., 7:00 PM"
            label="Time *"
            icon="time-outline"
          />

          <Input
            value={location}
            onChangeText={setLocation}
            placeholder="Where will you meet?"
            label="Location"
            icon="location-outline"
          />

          <Input
            value={scriptureReference}
            onChangeText={setScriptureReference}
            placeholder="e.g., John 3:16-21"
            label="Scripture Reference"
            icon="book-outline"
          />

          <Button
            title="Create Session"
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
  createButton: {
    marginTop: 16,
  },
});
