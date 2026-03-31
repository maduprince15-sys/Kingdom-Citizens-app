import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUserStore } from '../src/store/userStore';
import { Card, Button, colors, EmptyState } from '../src/components/ThemedComponents';
import { verseApi } from '../src/services/api';
import { VerseDiscussion } from '../src/types';
import { formatDistanceToNow, parseISO } from 'date-fns';

export default function VersesScreen() {
  const router = useRouter();
  const currentUser = useUserStore((state) => state.currentUser);
  const [verses, setVerses] = useState<VerseDiscussion[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadVerses = useCallback(async () => {
    try {
      const response = await verseApi.getAll();
      setVerses(response.data);
    } catch (error) {
      console.error('Failed to load verses:', error);
    }
  }, []);

  useEffect(() => {
    loadVerses();
  }, [loadVerses]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVerses();
    setRefreshing(false);
  };

  const handleLike = async (verseId: string, isLiked: boolean) => {
    if (!currentUser) return;
    try {
      if (isLiked) {
        await verseApi.unlike(verseId, currentUser.id);
      } else {
        await verseApi.like(verseId, currentUser.id);
      }
      loadVerses();
    } catch (error) {
      console.error('Failed to update like:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verse Discussions</Text>
        <TouchableOpacity onPress={() => router.push('/share-verse')}>
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {verses.length > 0 ? (
          verses.map((verse) => {
            const isLiked = currentUser ? verse.likes.includes(currentUser.id) : false;
            return (
              <Card key={verse.id} onPress={() => router.push(`/verse/${verse.id}`)}>
                <Text style={styles.verseReference}>{verse.verse_reference}</Text>
                <Text style={styles.verseText}>"{verse.verse_text}"</Text>
                
                {verse.reflection && (
                  <View style={styles.reflectionBox}>
                    <Text style={styles.reflectionText}>{verse.reflection}</Text>
                  </View>
                )}

                <View style={styles.verseFooter}>
                  <View>
                    <Text style={styles.sharedBy}>Shared by {verse.shared_by_name}</Text>
                    <Text style={styles.timeAgo}>
                      {formatDistanceToNow(parseISO(verse.created_at), { addSuffix: true })}
                    </Text>
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleLike(verse.id, isLiked)}
                    >
                      <Ionicons
                        name={isLiked ? 'heart' : 'heart-outline'}
                        size={20}
                        color={isLiked ? colors.primary : colors.textSecondary}
                      />
                      <Text style={[styles.actionText, isLiked && { color: colors.primary }]}>
                        {verse.likes.length}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
                      <Text style={styles.actionText}>{verse.comments.length}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            );
          })
        ) : (
          <EmptyState
            icon="book-outline"
            title="No Verses Shared"
            message="Be the first to share a verse with the community"
            actionLabel="Share a Verse"
            onAction={() => router.push('/share-verse')}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  verseReference: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  verseText: {
    fontSize: 15,
    color: colors.text,
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: 12,
  },
  reflectionBox: {
    backgroundColor: colors.surfaceLight,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  reflectionText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  verseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  sharedBy: {
    fontSize: 13,
    color: colors.text,
  },
  timeAgo: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  actionText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 4,
  },
});
