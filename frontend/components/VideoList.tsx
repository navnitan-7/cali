import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { theme } from '@/styles/theme';
import type { Video } from '@/types/api';

interface VideoListProps {
  videos: Video[];
  onDeleteVideo?: (videoId: number) => void;
}

export const VideoList: React.FC<VideoListProps> = ({ videos, onDeleteVideo }) => {
  const handleVideoPress = (url: string) => {
    Linking.openURL(url);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const renderVideo = ({ item }: { item: Video }) => (
    <View style={styles.videoCard}>
      <TouchableOpacity
        style={styles.videoInfo}
        onPress={() => handleVideoPress(item.file_url)}
      >
        <Text style={styles.videoLabel}>Video #{item.id}</Text>
        <Text style={styles.videoDate}>{formatDate(item.created_at)}</Text>
        <Text style={styles.videoLink}>Tap to view</Text>
      </TouchableOpacity>
      
      {onDeleteVideo && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDeleteVideo(item.id)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (videos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No videos yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={videos}
      renderItem={renderVideo}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
      scrollEnabled={false}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    gap: theme.spacing.sm,
  },
  videoCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.backgroundAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  videoInfo: {
    flex: 1,
  },
  videoLabel: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    fontWeight: '600',
  },
  videoDate: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  videoLink: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.accent,
    marginTop: theme.spacing.xs,
  },
  deleteButton: {
    backgroundColor: theme.colors.failure,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  deleteButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
  },
});

