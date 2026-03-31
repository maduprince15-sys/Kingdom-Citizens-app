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
import { Card, colors, EmptyState } from '../src/components/ThemedComponents';
import { announcementApi } from '../src/services/api';
import { Announcement } from '../src/types';
import { formatDistanceToNow, parseISO } from 'date-fns';

export default function AnnouncementsScreen() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadAnnouncements = useCallback(async () => {
    try {
      const response = await announcementApi.getAll();
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Failed to load announcements:', error);
    }
  }, []);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnnouncements();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Announcements</Text>
        <TouchableOpacity onPress={() => router.push('/create-announcement')}>
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
        {announcements.length > 0 ? (
          announcements.map((announcement) => (
            <Card key={announcement.id}>
              <View style={styles.announcementHeader}>
                {announcement.is_pinned && (
                  <View style={styles.pinnedTag}>
                    <Ionicons name="pin" size={12} color="#000" />
                    <Text style={styles.pinnedText}>Pinned</Text>
                  </View>
                )}
              </View>
              <Text style={styles.announcementTitle}>{announcement.title}</Text>
              <Text style={styles.announcementContent}>{announcement.content}</Text>
              <View style={styles.announcementFooter}>
                <Text style={styles.authorText}>By {announcement.author_name}</Text>
                <Text style={styles.timeText}>
                  {formatDistanceToNow(parseISO(announcement.created_at), { addSuffix: true })}
                </Text>
              </View>
            </Card>
          ))
        ) : (
          <EmptyState
            icon="megaphone-outline"
            title="No Announcements"
            message="Important updates will appear here"
            actionLabel="Create Announcement"
            onAction={() => router.push('/create-announcement')}
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
  announcementHeader: {
    marginBottom: 8,
  },
  pinnedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  pinnedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000',
    marginLeft: 4,
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  announcementContent: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  announcementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  authorText: {
    fontSize: 13,
    color: colors.text,
  },
  timeText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
