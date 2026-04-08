import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, RefreshControl
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';

const API_BASE = 'https://kingdom-citizens.preview.emergentagent.com/api';

export default function AdminScreen() {
  const { member, token, isAdmin } = useAuth();
  const router = useRouter();

  const [members, setMembers] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [prayers, setPrayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'members' | 'announcements' | 'sessions' | 'prayers'>('members');

  useEffect(() => {
    if (!isAdmin) {
      Alert.alert('Access Denied', 'Admin or leader role required');
      router.back();
      return;
    }
    loadData();
  }, []);

  async function api(url: string, method = 'GET') {
    const res = await fetch(url, {
      method,
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Error');
    return data;
  }

  async function loadData() {
    try {
      const [m, a, s, p] = await Promise.all([
        api(`${API_BASE}/members`),
        api(`${API_BASE}/announcements`),
        api(`${API_BASE}/sessions`),
        api(`${API_BASE}/prayers`),
      ]);
      setMembers(m);
      setAnnouncements(a);
      setSessions(s);
      setPrayers(p);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function deleteMember(id: string, name: string) {
    if (id === member?.id) { Alert.alert('Error', 'You cannot delete your own account'); return; }
    Alert.alert('Delete Member', `Remove ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api(`${API_BASE}/members/${id}`, 'DELETE');
          setMembers(prev => prev.filter(m => m.id !== id));
        } catch (e: any) { Alert.alert('Error', e.message); }
      }}
    ]);
  }

  async function deleteAnnouncement(id: string, title: string) {
    Alert.alert('Delete', `Delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api(`${API_BASE}/announcements/${id}`, 'DELETE');
          setAnnouncements(prev => prev.filter(a => a.id !== id));
        } catch (e: any) { Alert.alert('Error', e.message); }
      }}
    ]);
  }

  async function deleteSession(id: string, title: string) {
    Alert.alert('Delete', `Delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api(`${API_BASE}/sessions/${id}`, 'DELETE');
          setSessions(prev => prev.filter(s => s.id !== id));
        } catch (e: any) { Alert.alert('Error', e.message); }
      }}
    ]);
  }

  async function deletePrayer(id: string, title: string) {
    Alert.alert('Delete', `Delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api(`${API_BASE}/prayers/${id}`, 'DELETE');
          setPrayers(prev => prev.filter(p => p.id !== id));
        } catch (e: any) { Alert.alert('Error', e.message); }
      }}
    ]);
  }

  async function changeRole(memberId: string, newRole: string) {
    try {
      await api(`${API_BASE}/members/${memberId}`, 'PUT');
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
    } catch (e: any) { Alert.alert('Error', e.message); }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator color="#7c3aed" size="large" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.stat}><Text style={styles.statNum}>{members.length}</Text><Text style={styles.statLabel}>Members</Text></View>
        <View style={styles.stat}><Text style={styles.statNum}>{announcements.length}</Text><Text style={styles.statLabel}>Posts</Text></View>
        <View style={styles.stat}><Text style={styles.statNum}>{sessions.length}</Text><Text style={styles.statLabel}>Sessions</Text></View>
        <View style={styles.stat}><Text style={styles.statNum}>{prayers.length}</Text><Text style={styles.statLabel}>Prayers</Text></View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabRow}>
        {(['members','announcements','sessions','prayers'] as const).map(t => (
          <TouchableOpacity key={t} style={[styles.tab, activeTab === t && styles.tabActive]} onPress={() => setActiveTab(t)}>
            <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}>

        {activeTab === 'members' && members.map(m => (
          <View key={m.id} style={styles.card}>
            <View style={styles.row}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{m.name?.[0]?.toUpperCase()}</Text></View>
              <View style={styles.info}>
                <Text style={styles.cardTitle}>{m.name}</Text>
                <Text style={styles.cardSub}>{m.email}</Text>
                <Text style={styles.rolePill}>{m.role}</Text>
              </View>
            </View>
            <View style={styles.actions}>
              {m.role !== 'admin' && (
                <TouchableOpacity style={styles.promoteBtn} onPress={() => changeRole(m.id, m.role === 'leader' ? 'member' : 'leader')}>
                  <Text style={styles.promoteTxt}>{m.role === 'leader' ? 'Demote' : 'Make Leader'}</Text>
                </TouchableOpacity>
              )}
              {m.id !== member?.id && (
                <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteMember(m.id, m.name)}>
                  <Text style={styles.deleteTxt}>🗑 Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        {activeTab === 'announcements' && announcements.map(a => (
          <View key={a.id} style={styles.card}>
            <Text style={styles.cardTitle}>{a.is_pinned ? '📌 ' : ''}{a.title}</Text>
            <Text style={styles.cardSub} numberOfLines={2}>{a.content}</Text>
            <Text style={styles.cardMeta}>By {a.author_name}</Text>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteAnnouncement(a.id, a.title)}>
              <Text style={styles.deleteTxt}>🗑 Delete</Text>
            </TouchableOpacity>
          </View>
        ))}

        {activeTab === 'sessions' && sessions.map(s => (
          <View key={s.id} style={styles.card}>
            <Text style={styles.cardTitle}>{s.title}</Text>
            <Text style={styles.cardSub}>{s.date} at {s.time}</Text>
            <Text style={styles.cardMeta}>{s.location || 'No location'}</Text>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteSession(s.id, s.title)}>
              <Text style={styles.deleteTxt}>🗑 Delete</Text>
            </TouchableOpacity>
          </View>
        ))}

        {activeTab === 'prayers' && prayers.map(p => (
          <View key={p.id} style={styles.card}>
            <Text style={styles.cardTitle}>{p.title}</Text>
            <Text style={styles.cardSub} numberOfLines={2}>{p.description}</Text>
            <Text style={styles.cardMeta}>{p.is_answered ? '✅ Answered' : '🙏 Active'}</Text>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => deletePrayer(p.id, p.title)}>
              <Text style={styles.deleteTxt}>🗑 Delete</Text>
            </TouchableOpacity>
          </View>
        ))}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  statsRow: { flexDirection: 'row', padding: 16, gap: 8 },
  stat: { flex: 1, backgroundColor: '#1e293b', borderRadius: 12, padding: 12, alignItems: 'center' },
  statNum: { color: '#7c3aed', fontSize: 22, fontWeight: 'bold' },
  statLabel: { color: '#94a3b8', fontSize: 11, marginTop: 2 },
  tabRow: { paddingHorizontal: 16, marginBottom: 12, flexGrow: 0 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: '#1e293b' },
  tabActive: { backgroundColor: '#7c3aed' },
  tabText: { color: '#94a3b8', fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  list: { flex: 1, paddingHorizontal: 16 },
  card: { backgroundColor: '#1e293b', borderRadius: 12, padding: 14, marginBottom: 10 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#7c3aed', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  info: { flex: 1 },
  cardTitle: { color: '#fff', fontWeight: 'bold', fontSize: 15, marginBottom: 2 },
  cardSub: { color: '#94a3b8', fontSize: 13, marginBottom: 4 },
  cardMeta: { color: '#64748b', fontSize: 12, marginBottom: 8 },
  rolePill: { color: '#a78bfa', fontSize: 11, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  promoteBtn: { backgroundColor: '#0ea5e922', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  promoteTxt: { color: '#0ea5e9', fontSize: 13, fontWeight: '600' },
  deleteBtn: { backgroundColor: '#ef444422', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-end', marginTop: 4 },
  deleteTxt: { color: '#ef4444', fontSize: 13, fontWeight: '600' },
});
