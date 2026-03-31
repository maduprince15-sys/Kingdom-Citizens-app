import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUserStore } from '../src/store/userStore';
import { Card, colors, EmptyState, Button } from '../src/components/ThemedComponents';
import { mediaApi } from '../src/services/api';
import { MediaContent } from '../src/types';
import { formatDistanceToNow, parseISO } from 'date-fns';

export default function MediaScreen() {
  const router = useRouter();
  const currentUser = useUserStore((state) => state.currentUser);
  const [media, setMedia] = useState<MediaContent[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'youtube' | 'spotify'>('all');

  const loadMedia = useCallback(async () => {
    try {
      const mediaType = filter === 'all' ? undefined : filter;
      const response = await mediaApi.getAll(mediaType);
      setMedia(response.data);
    } catch (error) {
      console.error('Failed to load media:', error);
    }
  }, [filter]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMedia();
    setRefreshing(false);
  };

  const handleOpenMedia = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Failed to open URL:', err));
  };

  const handleLike = async (mediaId: string, isLiked: boolean) => {
    if (!currentUser) return;
    try {
      if (isLiked) {
        await mediaApi.unlike(mediaId, currentUser.id);
      } else {
        await mediaApi.like(mediaId, currentUser.id);
      }
      loadMedia();
    } catch (error) {
      console.error('Failed to update like:', error);
    }
  };

  const getMediaIcon = (type: string) => {
    return type === 'youtube' ? 'logo-youtube' : 'logo-spotify';
  };

  const getMediaColor = (type: string) => {
    return type === 'youtube' ? '#FF0000' : '#1DB954';
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'sermon': return 'Bible Study';
      case 'worship': return 'Worship';
      case 'playlist': return 'Playlist';
      case 'recommendation': return 'Recommendation';
      default: return category;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Media</Text>
        <TouchableOpacity onPress={() => router.push('/add-media')}>
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'youtube' && styles.filterActiveYT]}
          onPress={() => setFilter('youtube')}
        >
          <Ionicons name="logo-youtube" size={16} color={filter === 'youtube' ? '#fff' : '#FF0000'} />
          <Text style={[styles.filterText, filter === 'youtube' && styles.filterTextActive, { marginLeft: 4 }]}>
            YouTube
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'spotify' && styles.filterActiveSpotify]}
          onPress={() => setFilter('spotify')}
        >
          <Ionicons name="logo-spotify" size={16} color={filter === 'spotify' ? '#fff' : '#1DB954'} />
          <Text style={[styles.filterText, filter === 'spotify' && styles.filterTextActive, { marginLeft: 4 }]}>
            Spotify
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
        {media.length > 0 ? (
          media.map((item) => {
            const isLiked = currentUser ? item.likes.includes(currentUser.id) : false;
            return (
              <Card key={item.id} onPress={() => handleOpenMedia(item.url)}>
                <View style={styles.mediaHeader}>
                  <View style={[styles.mediaBadge, { backgroundColor: getMediaColor(item.media_type) }]}>
                    <Ionicons name={getMediaIcon(item.media_type)} size={14} color="#fff" />
                    <Text style={styles.mediaBadgeText}>{item.media_type === 'youtube' ? 'YouTube' : 'Spotify'}</Text>
                  </View>
                  {item.is_official && (
                    <View style={styles.officialBadge}>
                      <Ionicons name="checkmark-circle" size={12} color={colors.primary} />
                      <Text style={styles.officialText}>Official</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.mediaTitle}>{item.title}</Text>
                
                {item.description && (
                  <Text style={styles.mediaDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}

                <View style={styles.categoryRow}>
                  <View style={styles.categoryTag}>
                    <Text style={styles.categoryText}>{getCategoryLabel(item.category)}</Text>
                  </View>
                </View>

                <View style={styles.mediaFooter}>
                  <View>
                    <Text style={styles.sharedBy}>
                      {item.is_official ? 'Kingdom Citizens' : `Shared by ${item.author_name}`}
                    </Text>
                    <Text style={styles.timeAgo}>
                      {formatDistanceToNow(parseISO(item.created_at), { addSuffix: true })}
                    </Text>
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleLike(item.id, isLiked);
                      }}
                    >
                      <Ionicons
                        name={isLiked ? 'heart' : 'heart-outline'}
                        size={20}
                        color={isLiked ? colors.primary : colors.textSecondary}
                      />
                      <Text style={[styles.actionText, isLiked && { color: colors.primary }]}>
                        {item.likes.length}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.playButton} onPress={() => handleOpenMedia(item.url)}>
                      <Ionicons name="play" size={18} color="#fff" />
                      <Text style={styles.playText}>Open</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            );
          })
        ) : (
          <EmptyState
            icon="musical-notes-outline"
            title="No Media Yet"
            message="Share YouTube videos and Spotify playlists with your community"
            actionLabel="Add Media"
            onAction={() => router.push('/add-media')}
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: colors.surface,
  },
  filterActive: {
    backgroundColor: colors.primary,
  },
  filterActiveYT: {
    backgroundColor: '#FF0000',
  },
  filterActiveSpotify: {
    backgroundColor: '#1DB954',
  },
  filterText: {
    color: colors.textSecondary,
    fontWeight: '500',
    fontSize: 13,
  },
  filterTextActive: {
    color: '#fff',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
    flexGrow: 1,
  },
  mediaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  mediaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  mediaBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  officialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  officialText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 2,
  },
  mediaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  mediaDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  categoryRow: {
    marginBottom: 12,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceLight,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  mediaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  sharedBy: {
    fontSize: 13,
    color: colors.text,
  },
  timeAgo: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  actionText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  playText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
});
