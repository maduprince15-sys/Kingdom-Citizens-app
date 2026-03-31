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
import { verseApi } from '../src/services/api';

export default function ShareVerseScreen() {
  const router = useRouter();
  const currentUser = useUserStore((state) => state.currentUser);
  const [verseReference, setVerseReference] = useState('');
  const [verseText, setVerseText] = useState('');
  const [reflection, setReflection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleShare = async () => {
    if (!verseReference.trim() || !verseText.trim()) {
      Alert.alert('Missing Information', 'Please fill in the verse reference and text.');
      return;
    }

    if (!currentUser) {
      Alert.alert('Error', 'Please login first');
      return;
    }

    setIsSubmitting(true);
    try {
      await verseApi.create({
        verse_reference: verseReference.trim(),
        verse_text: verseText.trim(),
        reflection: reflection.trim() || undefined,
        shared_by_id: currentUser.id,
        shared_by_name: currentUser.name,
      });
      Alert.alert('Success', 'Verse shared with the community!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to share verse');
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
          <Text style={styles.headerTitle}>Share a Verse</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.infoCard}>
            <Ionicons name="book" size={24} color={colors.primary} />
            <Text style={styles.infoText}>
              Share scripture that has impacted you and invite others to discuss.
            </Text>
          </View>

          <Input
            value={verseReference}
            onChangeText={setVerseReference}
            placeholder="e.g., John 3:16"
            label="Verse Reference *"
            icon="bookmark-outline"
          />

          <Input
            value={verseText}
            onChangeText={setVerseText}
            placeholder="Type or paste the verse text..."
            label="Verse Text *"
            multiline
          />

          <Input
            value={reflection}
            onChangeText={setReflection}
            placeholder="Share your thoughts on this verse..."
            label="Your Reflection"
            multiline
          />

          <Button
            title="Share Verse"
            onPress={handleShare}
            loading={isSubmitting}
            icon="share"
            style={styles.shareButton}
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
  shareButton: {
    marginTop: 16,
  },
});
