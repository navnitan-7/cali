import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '@/styles/theme';
import type { Attempt } from '@/types/api';

interface AttemptListProps {
  attempts: Attempt[];
  onAttemptPress?: (attempt: Attempt) => void;
}

export const AttemptList: React.FC<AttemptListProps> = ({ attempts, onAttemptPress }) => {
  const formatDuration = (ms?: number): string => {
    if (!ms) return 'N/A';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const renderAttempt = ({ item }: { item: Attempt }) => (
    <TouchableOpacity
      style={styles.attemptCard}
      onPress={() => onAttemptPress?.(item)}
      disabled={!onAttemptPress}
    >
      <View style={styles.attemptHeader}>
        <View style={[styles.statusBadge, item.success ? styles.successBadge : styles.failureBadge]}>
          <Text style={styles.statusText}>{item.success ? 'Success' : 'Failed'}</Text>
        </View>
        <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
      </View>

      <View style={styles.attemptDetails}>
        {item.duration_ms !== undefined && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Time:</Text>
            <Text style={styles.detailValue}>{formatDuration(item.duration_ms)}</Text>
          </View>
        )}
        
        {item.reps !== undefined && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Reps:</Text>
            <Text style={styles.detailValue}>{item.reps}</Text>
          </View>
        )}
        
        {item.weight !== undefined && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Weight:</Text>
            <Text style={styles.detailValue}>{item.weight} kg</Text>
          </View>
        )}
        
        {item.videos && item.videos.length > 0 && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Videos:</Text>
            <Text style={styles.detailValue}>{item.videos.length}</Text>
          </View>
        )}
      </View>

      {item.notes && (
        <Text style={styles.notesText}>{item.notes}</Text>
      )}
    </TouchableOpacity>
  );

  if (attempts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No attempts yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={attempts}
      renderItem={renderAttempt}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: theme.spacing.md,
  },
  attemptCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadow.sm,
  },
  attemptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  successBadge: {
    backgroundColor: theme.colors.successLight,
  },
  failureBadge: {
    backgroundColor: theme.colors.failureLight,
  },
  statusText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  dateText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
  },
  attemptDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  detailLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  detailValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.semibold,
  },
  notesText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  emptyContainer: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textLight,
  },
});

