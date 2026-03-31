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
import { Card, colors, EmptyState, Button } from '../src/components/ThemedComponents';
import { groupApi } from '../src/services/api';
import { Group } from '../src/types';

export default function GroupsScreen() {
  const router = useRouter();
  const currentUser = useUserStore((state) => state.currentUser);
  const [groups, setGroups] = useState<Group[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadGroups = useCallback(async () => {
    try {
      const response = await groupApi.getAll();
      setGroups(response.data);
    } catch (error) {
      console.error('Failed to load groups:', error);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGroups();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Groups</Text>
        <TouchableOpacity onPress={() => router.push('/create-group')}>
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
        {groups.length > 0 ? (
          groups.map((group) => {
            const isMember = currentUser ? group.member_ids.includes(currentUser.id) : false;
            
            return (
              <Card key={group.id} onPress={() => router.push(`/group/${group.id}`)}>
                <View style={styles.groupHeader}>
                  <View style={styles.groupIcon}>
                    <Ionicons name="people" size={24} color={colors.primary} />
                  </View>
                  <View style={styles.groupInfo}>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <Text style={styles.memberCount}>
                      {group.member_ids.length} members
                    </Text>
                  </View>
                  {isMember && (
                    <View style={styles.memberBadge}>
                      <Ionicons name="checkmark" size={12} color={colors.success} />
                      <Text style={styles.memberBadgeText}>Joined</Text>
                    </View>
                  )}
                </View>
                
                {group.description && (
                  <Text style={styles.groupDescription} numberOfLines={2}>
                    {group.description}
                  </Text>
                )}
                
                {(group.meeting_day || group.meeting_time) && (
                  <View style={styles.meetingInfo}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.meetingText}>
                      {group.meeting_day}{group.meeting_day && group.meeting_time && ' at '}{group.meeting_time}
                    </Text>
                  </View>
                )}
              </Card>
            );
          })
        ) : (
          <EmptyState
            icon="people-outline"
            title="No Groups"
            message="Create or join a small group"
            actionLabel="Create Group"
            onAction={() => router.push('/create-group')}
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
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(218, 165, 32, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupInfo: {
    flex: 1,
    marginLeft: 12,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  memberCount: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  memberBadgeText: {
    fontSize: 11,
    color: colors.success,
    marginLeft: 4,
  },
  groupDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
    lineHeight: 20,
  },
  meetingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  meetingText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 6,
  },
});
