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
import { mediaApi } from '../src/services/api';

export default function AddMediaScreen() {
  const router = useRouter();
  const currentUser = useUserStore((state) => state.currentUser);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [mediaType, setMediaType] = useState<'youtube' | 'spotify'>('youtube');
  const [category, setCategory] = useState<'sermon' | 'worship' | 'playlist' | 'recommendation'>('recommendation');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'leader';

  const validateUrl = (url: string): boolean => {
    if (mediaType === 'youtube') {
      return url.includes('youtube.com') || url.includes('youtu.be');
    } else {
      return url.includes('spotify.com') || url.includes('open.spotify');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !url.trim()) {
      Alert.alert('Missing Information', 'Please fill in title and URL.');
      return;
    }

    if (!validateUrl(url)) {
      Alert.alert(
        'Invalid URL',
        `Please enter a valid ${mediaType === 'youtube' ? 'YouTube' : 'Spotify'} URL.`
      );
      return;
    }

    if (!currentUser) {
      Alert.alert('Error', 'Please login first');
      return;
    }

    setIsSubmitting(true);
    try {
      await mediaApi.create({
        title: title.trim(),
        description: description.trim() || undefined,
        url: url.trim(),
        media_type: mediaType,
        category: isAdmin ? category : 'recommendation',
        author_id: currentUser.id,
        author_name: currentUser.name,
        is_official: isAdmin && category !== 'recommendation',
      });
      Alert.alert('Success', 'Media shared with the community!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to share media');
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
          <Text style={styles.headerTitle}>Add Media</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Media Type Selection */}
          <Text style={styles.sectionLabel}>Media Platform</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[styles.typeButton, mediaType === 'youtube' && styles.typeButtonActiveYT]}
              onPress={() => setMediaType('youtube')}
            >
              <Ionicons
                name="logo-youtube"
                size={24}
                color={mediaType === 'youtube' ? '#fff' : '#FF0000'}
              />
              <Text style={[styles.typeText, mediaType === 'youtube' && styles.typeTextActive]}>
                YouTube
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, mediaType === 'spotify' && styles.typeButtonActiveSpotify]}
              onPress={() => setMediaType('spotify')}
            >
              <Ionicons
                name="logo-spotify"
                size={24}
                color={mediaType === 'spotify' ? '#fff' : '#1DB954'}
              />
              <Text style={[styles.typeText, mediaType === 'spotify' && styles.typeTextActive]}>
                Spotify
              </Text>
            </TouchableOpacity>
          </View>

          {/* Category Selection (for admins) */}
          {isAdmin && (
            <>
              <Text style={styles.sectionLabel}>Category</Text>
              <View style={styles.categoryGrid}>
                {mediaType === 'youtube' ? (
                  <>
                    <TouchableOpacity
                      style={[styles.categoryButton, category === 'sermon' && styles.categoryActive]}
                      onPress={() => setCategory('sermon')}
                    >
                      <Ionicons name="book" size={20} color={category === 'sermon' ? '#000' : colors.primary} />
                      <Text style={[styles.categoryText, category === 'sermon' && styles.categoryTextActive]}>
                        Bible Study
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.categoryButton, category === 'worship' && styles.categoryActive]}
                      onPress={() => setCategory('worship')}
                    >
                      <Ionicons name="musical-notes" size={20} color={category === 'worship' ? '#000' : colors.primary} />
                      <Text style={[styles.categoryText, category === 'worship' && styles.categoryTextActive]}>
                        Worship
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    style={[styles.categoryButton, category === 'playlist' && styles.categoryActive]}
                    onPress={() => setCategory('playlist')}
                  >
                    <Ionicons name="list" size={20} color={category === 'playlist' ? '#000' : colors.primary} />
                    <Text style={[styles.categoryText, category === 'playlist' && styles.categoryTextActive]}>
                      Playlist
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.categoryButton, category === 'recommendation' && styles.categoryActive]}
                  onPress={() => setCategory('recommendation')}
                >
                  <Ionicons name="star" size={20} color={category === 'recommendation' ? '#000' : colors.primary} />
                  <Text style={[styles.categoryText, category === 'recommendation' && styles.categoryTextActive]}>
                    Recommendation
                  </Text>
                </TouchableOpacity>
              </View>
              {category !== 'recommendation' && (
                <View style={styles.officialNote}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                  <Text style={styles.officialNoteText}>This will be marked as Official content</Text>
                </View>
              )}
            </>
          )}

          <Input
            value={title}
            onChangeText={setTitle}
            placeholder={mediaType === 'youtube' ? 'Video title' : 'Playlist/Album name'}
            label="Title *"
            icon="text-outline"
          />

          <Input
            value={url}
            onChangeText={setUrl}
            placeholder={
              mediaType === 'youtube'
                ? 'https://youtube.com/watch?v=...'
                : 'https://open.spotify.com/playlist/...'
            }
            label="URL *"
            icon="link-outline"
          />

          <Input
            value={description}
            onChangeText={setDescription}
            placeholder="Brief description (optional)"
            label="Description"
            multiline
          />

          <Button
            title={isAdmin && category !== 'recommendation' ? 'Post Official Content' : 'Share Recommendation'}
            onPress={handleSubmit}
            loading={isSubmitting}
            icon={mediaType === 'youtube' ? 'logo-youtube' : 'logo-spotify'}
            style={styles.submitButton}
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
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 12,
  },
  typeRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.surface,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeButtonActiveYT: {
    backgroundColor: '#FF0000',
    borderColor: '#FF0000',
  },
  typeButtonActiveSpotify: {
    backgroundColor: '#1DB954',
    borderColor: '#1DB954',
  },
  typeText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  typeTextActive: {
    color: '#fff',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 14,
    color: colors.text,
  },
  categoryTextActive: {
    color: '#000',
  },
  officialNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  officialNoteText: {
    marginLeft: 6,
    fontSize: 12,
    color: colors.primary,
  },
  submitButton: {
    marginTop: 16,
  },
});
