import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useDashboardStats } from '@/lib/queries';
import { theme } from '@/styles/theme';

export default function DashboardScreen() {
  const router = useRouter();
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  if (error || !stats) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load dashboard</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total_participants}</Text>
          <Text style={styles.statLabel}>Total Participants</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total_events}</Text>
          <Text style={styles.statLabel}>Total Events</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Events</Text>
        
        {stats.active_events.length === 0 ? (
          <Text style={styles.emptyText}>No active events</Text>
        ) : (
          stats.active_events.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              onPress={() => router.push(`/events/${event.id}`)}
            >
              <Text style={styles.eventName}>{event.name}</Text>
              <Text style={styles.eventType}>Type: {event.event_type}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
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
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderRadius: theme.borderRadius.lg,
    ...theme.shadow.md,
  },
  statValue: {
    fontSize: theme.fontSize.huge,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
    fontWeight: theme.fontWeight.medium,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  eventCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadow.sm,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  eventName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  eventType: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  emptyText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textLight,
    textAlign: 'center',
    paddingVertical: theme.spacing.xl,
  },
  errorText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.failure,
    fontWeight: theme.fontWeight.medium,
  },
});

