import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../src/store/userStore';
import { Card, Button, colors, EmptyState } from '../../src/components/ThemedComponents';
import { prayerApi } from '../../src/services/api';
import { PrayerRequest } from '../../src/types';
import { formatDistanceToNow, parseISO } from 'date-fns';

export default function PrayersScreen() {
  const router = useRouter();
  const currentUser = useUserStore((state) => state.currentUser);
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'active' | 'answered'>('active');

  const loadPrayers = useCallback(async () => {
    try {
      const response = await prayerApi.getAll(undefined, filter === 'answered');
      setPrayers(response.data);
    } catch (error) {
      console.error('Failed to load prayers:', error);
    }
  }, [filter]);

  useEffect(() => {
    loadPrayers();
  }, [loadPrayers]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPrayers();
    setRefreshing(false);
  };

  const handlePray = async (prayerId: string) => {
    if (!currentUser) return;
    try {
      await prayerApi.pray(prayerId, currentUser.id);
      loadPrayers();
    } catch (error) {
      console.error('Failed to pray:', error);
    }
  };

  const handleMarkAnswered = async (prayerId: string) => {
    try {
      await prayerApi.update(prayerId, { is_answered: true });
      Alert.alert('Praise God!', 'Prayer marked as answered!');
      loadPrayers();
    } catch (error) {
      Alert.alert('Error', 'Failed to update prayer');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Prayer Requests</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/create-prayer')}
        >
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'active' && styles.filterActive]}
          onPress={() => setFilter('active')}
        >
          <Text style={[styles.filterText, filter === 'active' && styles.filterTextActive]}>
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'answered' && styles.filterActive]}
          onPress={() => setFilter('answered')}
        >
          <Text style={[styles.filterText, filter === 'answered' && styles.filterTextActive]}>
            Answered
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
        {prayers.length > 0 ? (
          prayers.map((prayer) => {
            const hasPrayed = currentUser ? prayer.praying_members.includes(currentUser.id) : false;
            const isOwner = currentUser?.id === prayer.requested_by_id;

            return (
              <Card key={prayer.id}>
                <View style={styles.prayerHeader}>
                  <View style={styles.prayerTitleRow}>
                    {prayer.is_answered && (
                      <Ionicons name="checkmark-circle" size={18} color={colors.success} style={{ marginRight: 6 }} />
                    )}
                    <Text style={styles.prayerTitle}>{prayer.title}</Text>
                  </View>
                  <Text style={styles.prayerTime}>
                    {formatDistanceToNow(parseISO(prayer.created_at), { addSuffix: true })}
                  </Text>
                </View>

                <Text style={styles.prayerDescription}>{prayer.description}</Text>

                <View style={styles.prayerFooter}>
                  <Text style={styles.requestedBy}>
                    {prayer.is_anonymous ? 'Anonymous' : `By ${prayer.requested_by_name}`}
                  </Text>
                  <View style={styles.prayingCount}>
                    <Ionicons name="heart" size={14} color={colors.primary} />
                    <Text style={styles.prayingText}>
                      {prayer.praying_members.length} praying
                    </Text>
                  </View>
                </View>

                {!prayer.is_answered && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.prayButton, hasPrayed && styles.prayedButton]}
                      onPress={() => handlePray(prayer.id)}
                    >
                      <Ionicons
                        name={hasPrayed ? 'heart' : 'heart-outline'}
                        size={18}
                        color={hasPrayed ? colors.primary : colors.text}
                      />
                      <Text style={[styles.prayButtonText, hasPrayed && { color: colors.primary }]}>
                        {hasPrayed ? 'Praying' : 'Pray'}
                      </Text>
                    </TouchableOpacity>

                    {isOwner && (
                      <TouchableOpacity
                        style={styles.answeredButton}
                        onPress={() => handleMarkAnswered(prayer.id)}
                      >
                        <Ionicons name="checkmark" size={18} color={colors.success} />
                        <Text style={styles.answeredButtonText}>Mark Answered</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </Card>
            );
          })
        ) : (
          <EmptyState
            icon="heart-outline"
            title={filter === 'active' ? 'No Active Prayers' : 'No Answered Prayers'}
            message={filter === 'active' ? 'Share your prayer needs with the community' : 'Answered prayers will appear here'}
            actionLabel="Add Prayer Request"
            onAction={() => router.push('/create-prayer')}
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
  prayerHeader: {
    marginBottom: 8,
  },
  prayerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  prayerTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  prayerDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  prayerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestedBy: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  prayingCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayingText: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 4,
  },
  actionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  prayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    marginRight: 12,
  },
  prayedButton: {
    backgroundColor: 'rgba(218, 165, 32, 0.1)',
  },
  prayButtonText: {
    marginLeft: 6,
    fontWeight: '500',
    color: colors.text,
  },
  answeredButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  answeredButtonText: {
    marginLeft: 6,
    fontWeight: '500',
    color: colors.success,
  },
});
