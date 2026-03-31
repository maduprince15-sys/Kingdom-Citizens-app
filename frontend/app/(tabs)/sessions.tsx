import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../src/store/userStore';
import { Card, Button, colors, EmptyState } from '../../src/components/ThemedComponents';
import { sessionApi } from '../../src/services/api';
import { StudySession } from '../../src/types';
import { format, parseISO } from 'date-fns';
import { calendarService } from '../../src/services/calendar';
import { notificationService } from '../../src/services/notifications';

export default function SessionsScreen() {
  const router = useRouter();
  const currentUser = useUserStore((state) => state.currentUser);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');

  const loadSessions = useCallback(async () => {
    try {
      const response = await sessionApi.getAll();
      const today = new Date().toISOString().split('T')[0];
      const filtered = response.data.filter((session) => {
        if (filter === 'upcoming') {
          return session.date >= today;
        } else {
          return session.date < today;
        }
      });
      setSessions(filtered.sort((a, b) => {
        if (filter === 'upcoming') {
          return a.date.localeCompare(b.date);
        }
        return b.date.localeCompare(a.date);
      }));
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  }, [filter]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  };

  const handleAttend = async (sessionId: string, isAttending: boolean) => {
    if (!currentUser) return;
    try {
      if (isAttending) {
        await sessionApi.cancelAttendance(sessionId, currentUser.id);
        // Cancel notification reminder
        if (Platform.OS !== 'web') {
          await notificationService.cancelSessionReminder(sessionId);
        }
      } else {
        await sessionApi.attend(sessionId, currentUser.id);
        // Schedule notification reminder
        const session = sessions.find(s => s.id === sessionId);
        if (session && Platform.OS !== 'web') {
          await notificationService.scheduleSessionReminder(
            sessionId,
            session.title,
            session.date,
            session.time,
            60 // 60 minutes before
          );
        }
      }
      loadSessions();
    } catch (error) {
      Alert.alert('Error', 'Failed to update attendance');
    }
  };

  const handleAddToCalendar = async (session: StudySession) => {
    await calendarService.addSessionToCalendar(
      session.title,
      session.description,
      session.date,
      session.time,
      session.location,
      session.scripture_reference
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Study Sessions</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/create-session')}
        >
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'upcoming' && styles.filterActive]}
          onPress={() => setFilter('upcoming')}
        >
          <Text style={[styles.filterText, filter === 'upcoming' && styles.filterTextActive]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'past' && styles.filterActive]}
          onPress={() => setFilter('past')}
        >
          <Text style={[styles.filterText, filter === 'past' && styles.filterTextActive]}>
            Past
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {sessions.length > 0 ? (
          sessions.map((session) => {
            const isAttending = currentUser ? session.attendee_ids.includes(currentUser.id) : false;
            return (
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
                    {session.scripture_reference && (
                      <View style={styles.sessionMeta}>
                        <Ionicons name="book-outline" size={14} color={colors.textSecondary} />
                        <Text style={styles.sessionMetaText}>{session.scripture_reference}</Text>
                      </View>
                    )}
                    <View style={styles.attendeesRow}>
                      <Ionicons name="people" size={14} color={colors.primary} />
                      <Text style={styles.attendeesText}>
                        {session.attendee_ids.length} attending
                      </Text>
                    </View>
                  </View>
                </View>
                {filter === 'upcoming' && (
                  <View style={styles.actionButtonsRow}>
                    <TouchableOpacity
                      style={[styles.attendButton, isAttending && styles.attendingButton]}
                      onPress={() => handleAttend(session.id, isAttending)}
                    >
                      <Ionicons
                        name={isAttending ? 'checkmark-circle' : 'add-circle-outline'}
                        size={18}
                        color={isAttending ? colors.success : colors.primary}
                      />
                      <Text style={[styles.attendText, isAttending && { color: colors.success }]}>
                        {isAttending ? 'Attending' : 'Join'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.calendarButton}
                      onPress={() => handleAddToCalendar(session)}
                    >
                      <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                      <Text style={styles.calendarText}>Add to Calendar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </Card>
            );
          })
        ) : (
          <EmptyState
            icon="calendar-outline"
            title="No Sessions"
            message={filter === 'upcoming' ? 'No upcoming sessions scheduled' : 'No past sessions'}
            actionLabel="Create Session"
            onAction={() => router.push('/create-session')}
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  addButton: {
    padding: 8,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: colors.surface,
  },
  filterActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#000',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
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
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
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
  attendeesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  attendeesText: {
    fontSize: 13,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  attendButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
  },
  attendingButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  attendText: {
    marginLeft: 6,
    color: colors.primary,
    fontWeight: '600',
  },
  calendarButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(218, 165, 32, 0.1)',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  calendarText: {
    marginLeft: 6,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
});
