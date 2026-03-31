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
import { memberApi } from '../src/services/api';
import { Member } from '../src/types';

export default function MembersScreen() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadMembers = useCallback(async () => {
    try {
      const response = await memberApi.getAll();
      setMembers(response.data);
    } catch (error) {
      console.error('Failed to load members:', error);
    }
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMembers();
    setRefreshing(false);
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'admin':
        return { backgroundColor: colors.primary };
      case 'leader':
        return { backgroundColor: colors.success };
      default:
        return { backgroundColor: colors.surfaceLight };
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Members</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.memberCount}>{members.length} members</Text>
        
        {members.length > 0 ? (
          members.map((member) => (
            <TouchableOpacity
              key={member.id}
              style={styles.memberCard}
              onPress={() => router.push(`/conversation/${member.id}`)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {member.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberEmail}>{member.email}</Text>
                {member.bio && (
                  <Text style={styles.memberBio} numberOfLines={1}>
                    {member.bio}
                  </Text>
                )}
              </View>
              <View style={[styles.roleBadge, getRoleBadgeStyle(member.role)]}>
                <Text style={[
                  styles.roleText,
                  member.role === 'member' && { color: colors.textSecondary }
                ]}>
                  {member.role}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <EmptyState
            icon="people-outline"
            title="No Members"
            message="Members will appear here"
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
  placeholder: {
    width: 32,
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  memberCount: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  memberEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  memberBio: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  roleBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000',
    textTransform: 'capitalize',
  },
});
