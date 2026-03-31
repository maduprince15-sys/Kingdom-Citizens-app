import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../src/store/userStore';
import { Card, colors, EmptyState } from '../../src/components/ThemedComponents';
import { messageApi, memberApi } from '../../src/services/api';
import { Message, Member } from '../../src/types';
import { formatDistanceToNow, parseISO } from 'date-fns';

export default function MessagesScreen() {
  const router = useRouter();
  const currentUser = useUserStore((state) => state.currentUser);
  const [conversations, setConversations] = useState<any[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    try {
      const [convRes, membersRes] = await Promise.all([
        messageApi.getConversations(currentUser.id),
        memberApi.getAll(),
      ]);
      setConversations(convRes.data);
      setMembers(membersRes.data.filter((m: Member) => m.id !== currentUser.id));
    } catch (error) {
      console.error('Failed to load messages:', error);
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

  const getMemberName = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    return member?.name || 'Unknown';
  };

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openConversation = (memberId: string) => {
    router.push(`/conversation/${memberId}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowNewMessage(!showNewMessage)}
        >
          <Ionicons name={showNewMessage ? 'close' : 'create'} size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {showNewMessage && (
        <View style={styles.newMessageContainer}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search members..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <ScrollView style={styles.memberList} showsVerticalScrollIndicator={false}>
            {filteredMembers.map((member) => (
              <TouchableOpacity
                key={member.id}
                style={styles.memberItem}
                onPress={() => {
                  setShowNewMessage(false);
                  setSearchQuery('');
                  openConversation(member.id);
                }}
              >
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberInitial}>
                    {member.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberRole}>{member.role}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {conversations.length > 0 ? (
          conversations.map((conv, index) => {
            const partnerId = conv.sender_id === currentUser?.id ? conv.recipient_id : conv.sender_id;
            const partnerName = conv.sender_id === currentUser?.id ? getMemberName(conv.recipient_id) : conv.sender_name;

            return (
              <TouchableOpacity
                key={index}
                style={styles.conversationItem}
                onPress={() => openConversation(partnerId)}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {partnerName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.conversationInfo}>
                  <View style={styles.conversationHeader}>
                    <Text style={styles.conversationName}>{partnerName}</Text>
                    <Text style={styles.conversationTime}>
                      {formatDistanceToNow(parseISO(conv.created_at), { addSuffix: true })}
                    </Text>
                  </View>
                  <Text style={styles.lastMessage} numberOfLines={1}>
                    {conv.sender_id === currentUser?.id ? 'You: ' : ''}
                    {conv.content}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <EmptyState
            icon="chatbubbles-outline"
            title="No Messages Yet"
            message="Start a conversation with a fellow member"
            actionLabel="New Message"
            onAction={() => setShowNewMessage(true)}
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
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  newMessageContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    maxHeight: 300,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    color: colors.text,
    fontSize: 16,
  },
  memberList: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    marginLeft: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  memberRole: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: colors.surface,
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
  conversationInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  conversationTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  lastMessage: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
