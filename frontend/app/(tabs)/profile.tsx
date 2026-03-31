import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../src/store/userStore';
import { Card, Button, colors, LoadingScreen } from '../../src/components/ThemedComponents';
import { noteApi, memberApi, groupApi } from '../../src/services/api';
import { StudyNote, Group, Member } from '../../src/types';

export default function ProfileScreen() {
  const router = useRouter();
  const { currentUser, logout, isLoading } = useUserStore();
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    try {
      const [notesRes, groupsRes, membersRes] = await Promise.all([
        noteApi.getAll(currentUser.id),
        groupApi.getAll(),
        memberApi.getAll(),
      ]);
      setNotes(notesRes.data.filter((n: StudyNote) => n.member_id === currentUser.id));
      setGroups(groupsRes.data.filter((g: Group) => g.member_ids.includes(currentUser.id)));
      setMembers(membersRes.data);
    } catch (error) {
      console.error('Failed to load profile data:', error);
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  if (isLoading || !currentUser) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            {currentUser.profile_image ? (
              <Image
                source={{ uri: `data:image/jpeg;base64,${currentUser.profile_image}` }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>
                {currentUser.name.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <Text style={styles.profileName}>{currentUser.name}</Text>
          <Text style={styles.profileEmail}>{currentUser.email}</Text>
          <View style={styles.roleTag}>
            <Text style={styles.roleText}>{currentUser.role}</Text>
          </View>
          {currentUser.bio && (
            <Text style={styles.bio}>{currentUser.bio}</Text>
          )}
          <Button
            title="Edit Profile"
            onPress={() => router.push('/edit-profile')}
            variant="outline"
            icon="pencil"
            style={styles.editButton}
          />
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{notes.length}</Text>
            <Text style={styles.statLabel}>Notes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{groups.length}</Text>
            <Text style={styles.statLabel}>Groups</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{members.length}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/notes')}>
            <View style={styles.menuIcon}>
              <Ionicons name="document-text" size={20} color={colors.primary} />
            </View>
            <Text style={styles.menuText}>My Study Notes</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/groups')}>
            <View style={styles.menuIcon}>
              <Ionicons name="people" size={20} color={colors.primary} />
            </View>
            <Text style={styles.menuText}>My Groups</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/members')}>
            <View style={styles.menuIcon}>
              <Ionicons name="person-add" size={20} color={colors.primary} />
            </View>
            <Text style={styles.menuText}>All Members</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/announcements')}>
            <View style={styles.menuIcon}>
              <Ionicons name="megaphone" size={20} color={colors.primary} />
            </View>
            <Text style={styles.menuText}>Announcements</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/verses')}>
            <View style={styles.menuIcon}>
              <Ionicons name="book" size={20} color={colors.primary} />
            </View>
            <Text style={styles.menuText}>Verse Discussions</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Groups */}
        {groups.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Groups</Text>
            {groups.map((group) => (
              <Card key={group.id} onPress={() => router.push(`/group/${group.id}`)}>
                <View style={styles.groupRow}>
                  <Ionicons name="people-circle" size={32} color={colors.primary} />
                  <View style={styles.groupInfo}>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <Text style={styles.groupMembers}>
                      {group.member_ids.length} members
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Logout */}
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="secondary"
          icon="log-out-outline"
          style={styles.logoutButton}
        />
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
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#000',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  roleTag: {
    backgroundColor: colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  roleText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  bio: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 24,
  },
  editButton: {
    marginTop: 16,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(218, 165, 32, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupInfo: {
    marginLeft: 12,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  groupMembers: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    marginTop: 8,
    marginBottom: 32,
  },
});
