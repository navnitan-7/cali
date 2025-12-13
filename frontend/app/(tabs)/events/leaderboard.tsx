import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEventLeaderboard, useEvent } from '@/lib/queries';
import { theme } from '@/styles/theme';
import type { LeaderboardEntry } from '@/types/api';

export default function LeaderboardScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const id = parseInt(eventId || '0', 10);

  const { data: event, isLoading: loadingEvent } = useEvent(id);
  const { data: leaderboard, isLoading: loadingLeaderboard } = useEventLeaderboard(id);

  if (loadingEvent || loadingLeaderboard) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Event not found</Text>
      </View>
    );
  }

  const formatTime = (ms?: number): string => {
    if (!ms) return 'N/A';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  const renderEntry = ({ item }: { item: LeaderboardEntry }) => {
    const isTopThree = item.rank <= 3;
    
    return (
      <View style={[styles.entryCard, isTopThree && styles.topThreeCard]}>
        <View style={styles.entryHeader}>
          <View style={[styles.rankBadge, isTopThree && styles.topThreeBadge]}>
            <Text style={[styles.rankText, isTopThree && styles.topThreeRankText]}>
              #{item.rank}
            </Text>
          </View>
          <Text style={styles.bibNumber}>Bib: {item.bib_number}</Text>
        </View>

        <Text style={styles.participantName}>{item.participant_name}</Text>
        <Text style={styles.division}>{item.division}</Text>

        <View style={styles.statsContainer}>
          {item.best_time !== undefined && (
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Best Time:</Text>
              <Text style={styles.statValue}>{formatTime(item.best_time)}</Text>
            </View>
          )}
          
          {item.best_reps !== undefined && (
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Best Reps:</Text>
              <Text style={styles.statValue}>{item.best_reps}</Text>
            </View>
          )}
          
          {item.best_weight !== undefined && (
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Best Weight:</Text>
              <Text style={styles.statValue}>{item.best_weight} kg</Text>
            </View>
          )}
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Attempts:</Text>
            <Text style={styles.statValue}>{item.total_attempts}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <Text style={styles.eventName}>{event.name}</Text>
      </View>

      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Leaderboard will be available when backend support is added.
          You can add this endpoint to the backend to calculate rankings.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  eventName: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  listContainer: {
    padding: theme.spacing.md,
  },
  entryCard: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  topThreeCard: {
    backgroundColor: theme.colors.backgroundAlt,
    borderWidth: 2,
    borderColor: theme.colors.accent,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  rankBadge: {
    backgroundColor: theme.colors.backgroundAlt,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  topThreeBadge: {
    backgroundColor: theme.colors.accent,
  },
  rankText: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  topThreeRankText: {
    color: theme.colors.background,
  },
  bibNumber: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
  },
  participantName: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
  },
  division: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  statsContainer: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
  },
  statValue: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
  },
  errorText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.failure,
  },
});

