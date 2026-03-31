import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../src/store/userStore';
import { Card, Button, colors, EmptyState } from '../../src/components/ThemedComponents';
import { sessionApi, announcementApi, verseApi } from '../../src/services/api';
import { StudySession, Announcement, VerseDiscussion } from '../../src/types';
import { format, parseISO } from 'date-fns';

export default function HomeScreen() {
  const router = useRouter();
  const currentUser = useUserStore((state) => state.currentUser);
  const [upcomingSessions, setUpcomingSessions] = useState<StudySession[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [recentVerses, setRecentVerses] = useState<VerseDiscussion[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [sessionsRes, announcementsRes, versesRes] = await Promise.all([
        sessionApi.getUpcoming(),
        announcementApi.getAll(),
        verseApi.getAll(),
      ]);
      setUpcomingSessions(sessionsRes.data.slice(0, 3));
      setAnnouncements(announcementsRes.data.slice(0, 3));
      setRecentVerses(versesRes.data.slice(0, 3));
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM dd, yyyy');
    } catch {
      return dateStr;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Image
              source={require('../../assets/images/logo.jpg')}
              style={styles.headerLogo}
            />
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.userName}>{currentUser?.name || 'Friend'}</Text>
            </View>
          </View>
        </View>

        {/* Announcements Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Announcements</Text>
            <TouchableOpacity onPress={() => router.push('/announcements')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {announcements.length > 0 ? (
            announcements.map((announcement) => (
              <Card key={announcement.id} onPress={() => router.push(`/announcement/${announcement.id}`)}>
                <View style={styles.announcementHeader}>
                  {announcement.is_pinned && (
                    <Ionicons name="pin" size={16} color={colors.primary} />
                  )}
                  <Text style={[styles.announcementTitle, announcement.is_pinned && { marginLeft: 8 }]}>
                    {announcement.title}
                  </Text>
                </View>
                <Text style={styles.announcementContent} numberOfLines={2}>
                  {announcement.content}
                </Text>
                <Text style={styles.announcementMeta}>
                  By {announcement.author_name}
                </Text>
              </Card>
            ))
          ) : (
            <Card>
              <Text style={styles.emptyText}>No announcements yet</Text>
            </Card>
          )}
        </View>

        {/* Upcoming Sessions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/sessions')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {upcomingSessions.length > 0 ? (
            upcomingSessions.map((session) => (
              <Card key={session.id} onPress={() => router.push(`/session/${session.id}`)}>
                <View style={styles.sessionRow}>
                  <View style={styles.dateBox}>
                    <Text style={styles.dateDay}>
                      {format(parseISO(session.date), 'dd')}
                    </Text>
                    <Text style={styles.dateMonth}>
                      {format(parseISO(session.date), 'MMM')}
                    </Text>
                  </View>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionTitle}>{session.title}</Text>
                    <View style={styles.sessionMeta}>
                      <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                      <Text style={styles.sessionMetaText}>{session.time}</Text>
                    </View>
                    {session.location && (
                      <View style={styles.sessionMeta}>
                        <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                        <Text style={styles.sessionMetaText}>{session.location}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </Card>
            ))
          ) : (
            <Card>
              <Text style={styles.emptyText}>No upcoming sessions</Text>
              <Button
                title="Schedule a Session"
                onPress={() => router.push('/create-session')}
                variant="outline"
                style={{ marginTop: 12 }}
              />
            </Card>
          )}
        </View>

        {/* Recent Verses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Verses</Text>
            <TouchableOpacity onPress={() => router.push('/verses')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentVerses.length > 0 ? (
            recentVerses.map((verse) => (
              <Card key={verse.id} onPress={() => router.push(`/verse/${verse.id}`)}>
                <Text style={styles.verseReference}>{verse.verse_reference}</Text>
                <Text style={styles.verseText} numberOfLines={2}>
                  "{verse.verse_text}"
                </Text>
                <View style={styles.verseFooter}>
                  <Text style={styles.sharedBy}>Shared by {verse.shared_by_name}</Text>
                  <View style={styles.verseStats}>
                    <Ionicons name="heart" size={14} color={colors.primary} />
                    <Text style={styles.statText}>{verse.likes.length}</Text>
                    <Ionicons name="chatbubble" size={14} color={colors.textSecondary} style={{ marginLeft: 12 }} />
                    <Text style={styles.statText}>{verse.comments.length}</Text>
                  </View>
                </View>
              </Card>
            ))
          ) : (
            <Card>
              <Text style={styles.emptyText}>No verses shared yet</Text>
              <Button
                title="Share a Verse"
                onPress={() => router.push('/share-verse')}
                variant="outline"
                style={{ marginTop: 12 }}
              />
            </Card>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/share-verse')}>
            <Ionicons name="book" size={24} color={colors.primary} />
            <Text style={styles.actionText}>Share Verse</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/create-session')}>
            <Ionicons name="calendar" size={24} color={colors.primary} />
            <Text style={styles.actionText}>New Session</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/create-prayer')}>
            <Ionicons name="heart" size={24} color={colors.primary} />
            <Text style={styles.actionText}>Prayer Request</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/notes')}>
            <Ionicons name="document-text" size={24} color={colors.primary} />
            <Text style={styles.actionText}>My Notes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  greeting: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  seeAll: {
    fontSize: 14,
    color: colors.primary,
  },
  announcementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  announcementContent: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  announcementMeta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  sessionRow: {
    flexDirection: 'row',
  },
  dateBox: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },
  dateDay: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  dateMonth: {
    fontSize: 12,
    color: '#000',
    textTransform: 'uppercase',
  },
  sessionInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  sessionMetaText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  verseReference: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 6,
  },
  verseText: {
    fontSize: 14,
    color: colors.text,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  verseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sharedBy: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  verseStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: {
    fontSize: 13,
    color: colors.text,
    marginTop: 8,
    fontWeight: '500',
  },
});
