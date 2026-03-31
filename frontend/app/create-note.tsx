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
  Switch,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUserStore } from '../src/store/userStore';
import { Button, Input, colors } from '../src/components/ThemedComponents';
import { noteApi } from '../src/services/api';

export default function CreateNoteScreen() {
  const router = useRouter();
  const currentUser = useUserStore((state) => state.currentUser);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [scriptureReference, setScriptureReference] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Missing Information', 'Please fill in both title and content.');
      return;
    }

    if (!currentUser) {
      Alert.alert('Error', 'Please login first');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    setIsSubmitting(true);
    try {
      await noteApi.create({
        title: title.trim(),
        content: content.trim(),
        member_id: currentUser.id,
        scripture_reference: scriptureReference.trim() || undefined,
        tags,
        is_private: isPrivate,
      });
      Alert.alert('Success', 'Note saved!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save note');
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
          <Text style={styles.headerTitle}>New Note</Text>
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
            placeholder="Note title"
            label="Title *"
            icon="document-text-outline"
          />

          <Input
            value={scriptureReference}
            onChangeText={setScriptureReference}
            placeholder="e.g., John 3:16"
            label="Scripture Reference"
            icon="book-outline"
          />

          <Input
            value={content}
            onChangeText={setContent}
            placeholder="Write your study notes..."
            label="Content *"
            multiline
            inputStyle={{ height: 200 }}
          />

          <Input
            value={tagsInput}
            onChangeText={setTagsInput}
            placeholder="faith, love, grace (comma separated)"
            label="Tags"
            icon="pricetag-outline"
          />

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Private Note</Text>
              <Text style={styles.switchDescription}>
                Private notes are only visible to you
              </Text>
            </View>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{ false: colors.surface, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>

          <Button
            title="Save Note"
            onPress={handleCreate}
            loading={isSubmitting}
            icon="save"
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  switchInfo: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  switchDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  createButton: {
    marginTop: 8,
  },
});
