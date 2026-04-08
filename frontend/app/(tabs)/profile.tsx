import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function ProfileTab() {
  const { member, logout, isAdmin } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive', onPress: async () => {
          await logout();
          router.replace('/');
        }
      }
    ]);
  }

  if (!member) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{member.name?.[0]?.toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{member.name}</Text>
        <Text style={styles.email}>{member.email}</Text>
        <View style={[styles.badge, isAdmin ? styles.adminBadge : styles.memberBadge]}>
          <Text style={styles.badgeText}>{member.role.charAt(0).toUpperCase() + member.role.slice(1)}</Text>
        </View>
      </View>

      {member.bio ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{member.bio}</Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/edit-profile')}>
          <Text style={styles.menuIcon}>✏️</Text>
          <Text style={styles.menuText}>Edit Profile</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/members')}>
          <Text style={styles.menuIcon}>👥</Text>
          <Text style={styles.menuText}>View All Members</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        {isAdmin && (
          <TouchableOpacity style={[styles.menuItem, styles.adminItem]} onPress={() => router.push('/admin')}>
            <Text style={styles.menuIcon}>🛡️</Text>
            <Text style={[styles.menuText, styles.adminText]}>Admin Panel</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#7c3aed', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  name: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  email: { color: '#94a3b8', fontSize: 14, marginBottom: 8 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  adminBadge: { backgroundColor: '#7c3aed33' },
  memberBadge: { backgroundColor: '#1e293b' },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  section: { marginHorizontal: 16, marginBottom: 16, backgroundColor: '#1e293b', borderRadius: 16, overflow: 'hidden' },
  sectionTitle: { color: '#94a3b8', fontSize: 12, fontWeight: '600', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  bioText: { color: '#fff', fontSize: 14, lineHeight: 20, padding: 16, paddingTop: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#0f172a' },
  adminItem: { backgroundColor: '#7c3aed11' },
  menuIcon: { fontSize: 20, marginRight: 12 },
  menuText: { flex: 1, color: '#fff', fontSize: 15 },
  adminText: { color: '#a78bfa' },
  menuArrow: { color: '#64748b', fontSize: 20 },
  logoutBtn: { margin: 16, backgroundColor: '#ef444422', borderRadius: 12, padding: 16, alignItems: 'center' },
  logoutText: { color: '#ef4444', fontWeight: 'bold', fontSize: 15 },
});
