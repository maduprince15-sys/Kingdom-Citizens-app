import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUserStore } from '../src/store/userStore';
import { Card, colors, EmptyState } from '../src/components/ThemedComponents';
import { noteApi } from '../src/services/api';
import { StudyNote } from '../src/types';
import { formatDistanceToNow, parseISO } from 'date-fns';

export default function NotesScreen() {
  const router = useRouter();
  const currentUser = useUserStore((state) => state.currentUser);
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotes = useCallback(async () => {
    if (!currentUser) return;
    try {
      const response = await noteApi.getAll(currentUser.id);
      setNotes(response.data);
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  }, [currentUser]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotes();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Study Notes</Text>
        <TouchableOpacity onPress={() => router.push('/create-note')}>
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
        {notes.length > 0 ? (
          notes.map((note) => (
            <Card key={note.id} onPress={() => router.push(`/note/${note.id}`)}>
              <View style={styles.noteHeader}>
                <Text style={styles.noteTitle}>{note.title}</Text>
                {note.is_private ? (
                  <Ionicons name="lock-closed" size={16} color={colors.textSecondary} />
                ) : (
                  <Ionicons name="globe" size={16} color={colors.primary} />
                )}
              </View>
              
              {note.scripture_reference && (
                <View style={styles.scriptureTag}>
                  <Ionicons name="book" size={12} color={colors.primary} />
                  <Text style={styles.scriptureText}>{note.scripture_reference}</Text>
                </View>
              )}
              
              <Text style={styles.noteContent} numberOfLines={3}>
                {note.content}
              </Text>
              
              {note.tags.length > 0 && (
                <View style={styles.tagsRow}>
                  {note.tags.slice(0, 3).map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              <Text style={styles.noteTime}>
                {formatDistanceToNow(parseISO(note.updated_at), { addSuffix: true })}
              </Text>
            </Card>
          ))
        ) : (
          <EmptyState
            icon="document-text-outline"
            title="No Notes Yet"
            message="Start journaling your Bible study insights"
            actionLabel="Create Note"
            onAction={() => router.push('/create-note')}
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
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  scriptureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scriptureText: {
    fontSize: 13,
    color: colors.primary,
    marginLeft: 4,
  },
  noteContent: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: colors.surfaceLight,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  noteTime: {
    fontSize: 11,
    color: colors.textSecondary,
  },
});
