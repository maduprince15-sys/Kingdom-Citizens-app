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
import { useUserStore } from '../src/store/userStore';
import { Card, colors, Button } from '../src/components/ThemedComponents';
import { memberApi } from '../src/services/api';
import { Member } from '../src/types';

export default function AdminScreen() {
  const router = useRouter();
  const currentUser = useUserStore((state) => state.currentUser);
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

  const handleChangeRole = async (member: Member, newRole: string) => {
    try {
      await memberApi.update(member.id, { role: newRole });
      Alert.alert('Success', `${member.name} is now a ${newRole}`);
      loadMembers();
    } catch (error) {
      Alert.alert('Error', 'Failed to update role');
    }
  };

  const showRoleOptions = (member: Member) => {
    if (member.id === currentUser?.id) {
      Alert.alert('Cannot Change', 'You cannot change your own role');
      return;
    }

    Alert.alert(
      `Change Role for ${member.name}`,
      `Current role: ${member.role}`,
      [
        {
          text: 'Member',
          onPress: () => handleChangeRole(member, 'member'),
        },
        {
          text: 'Leader',
          onPress: () => handleChangeRole(member, 'leader'),
        },
        {
          text: 'Admin',
          onPress: () => handleChangeRole(member, 'admin'),
          style: 'destructive',
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'admin':
        return { backgroundColor: '#FF6B6B' };
      case 'leader':
        return { backgroundColor: colors.primary };
      default:
        return { backgroundColor: colors.surfaceLight };
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return 'shield';
      case 'leader':
        return 'star';
      default:
        return 'person';
    }
  };

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'admin';

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Admin Panel</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.accessDenied}>
          <Ionicons name="lock-closed" size={64} color={colors.textSecondary} />
          <Text style={styles.accessDeniedTitle}>Access Restricted</Text>
          <Text style={styles.accessDeniedText}>
            Only administrators can access this panel.
          </Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            variant="outline"
            style={{ marginTop: 24 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
          <Text style={styles.infoText}>
            Tap on any member to change their role. Leaders can post official content.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Manage Members ({members.length})</Text>

        {members.map((member) => (
          <TouchableOpacity
            key={member.id}
            style={styles.memberCard}
            onPress={() => showRoleOptions(member)}
          >
            <View style={styles.memberAvatar}>
              <Text style={styles.memberInitial}>
                {member.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.memberInfo}>
              <View style={styles.memberNameRow}>
                <Text style={styles.memberName}>{member.name}</Text>
                {member.id === currentUser?.id && (
                  <Text style={styles.youTag}>(You)</Text>
                )}
              </View>
              <Text style={styles.memberEmail}>{member.email}</Text>
            </View>
            <View style={[styles.roleBadge, getRoleBadgeStyle(member.role)]}>
              <Ionicons 
                name={getRoleIcon(member.role)} 
                size={12} 
                color={member.role === 'member' ? colors.textSecondary : '#fff'} 
              />
              <Text style={[
                styles.roleText,
                member.role === 'member' && { color: colors.textSecondary }
              ]}>
                {member.role}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>Role Permissions</Text>
          <View style={styles.legendItem}>
            <Ionicons name="person" size={16} color={colors.textSecondary} />
            <Text style={styles.legendText}>
              <Text style={styles.legendRole}>Member:</Text> Basic access, share recommendations
            </Text>
          </View>
          <View style={styles.legendItem}>
            <Ionicons name="star" size={16} color={colors.primary} />
            <Text style={styles.legendText}>
              <Text style={styles.legendRole}>Leader:</Text> Post official media, manage groups
            </Text>
          </View>
          <View style={styles.legendItem}>
            <Ionicons name="shield" size={16} color="#FF6B6B" />
            <Text style={styles.legendText}>
              <Text style={styles.legendRole}>Admin:</Text> Full control, manage all users
            </Text>
          </View>
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
  accessDenied: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  accessDeniedTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  accessDeniedText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(218, 165, 32, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  youTag: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 6,
  },
  memberEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  legendCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  legendRole: {
    fontWeight: '600',
    color: colors.text,
  },
});
