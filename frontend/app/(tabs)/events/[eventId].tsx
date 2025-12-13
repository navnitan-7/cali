import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEvent, useEventRegistrations } from '@/lib/queries';
import { theme } from '@/styles/theme';

export default function EventDetailScreen() {
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const id = parseInt(eventId || '0', 10);

  const { data: event, isLoading: loadingEvent } = useEvent(id);
  const { data: registrations, isLoading: loadingRegistrations } = useEventRegistrations(id);

  if (loadingEvent || loadingRegistrations) {
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{event.name}</Text>
        <Text style={styles.subtitle}>Event Type: {event.event_type}</Text>
        {event.description && (
          <Text style={styles.description}>{event.description}</Text>
        )}
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.leaderboardButton}
          onPress={() => router.push(`/events/leaderboard?eventId=${id}`)}
        >
          <Text style={styles.leaderboardButtonText}>View Leaderboard</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Registered Participants</Text>
        
        {!registrations || registrations.length === 0 ? (
          <Text style={styles.emptyText}>No participants registered yet</Text>
        ) : (
          registrations.map((registration) => (
            <TouchableOpacity
              key={registration.id}
              style={styles.registrationCard}
              onPress={() => router.push(`/registrations/${registration.id}`)}
            >
              <View style={styles.registrationHeader}>
                <Text style={styles.bibNumber}>#{registration.bib_number}</Text>
                <Text style={styles.division}>{registration.division}</Text>
              </View>
              {registration.participant && (
                <>
                  <Text style={styles.participantName}>{registration.participant.name}</Text>
                  <Text style={styles.participantDetails}>
                    {registration.participant.gender}, {registration.participant.age} years • {registration.participant.weight} kg
                  </Text>
                  <Text style={styles.participantContact}>{registration.participant.phone}</Text>
                </>
              )}
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
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.accent,
    marginTop: theme.spacing.xs,
  },
  description: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  actionsContainer: {
    padding: theme.spacing.md,
  },
  leaderboardButton: {
    backgroundColor: theme.colors.accent,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  leaderboardButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  registrationCard: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  registrationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  bibNumber: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.accent,
  },
  division: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
  },
  participantName: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
  },
  participantCategory: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  participantDetails: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  participantContact: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  emptyText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textLight,
    textAlign: 'center',
    paddingVertical: theme.spacing.xl,
  },
  registrationCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadow.sm,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
  },
  registrationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  errorText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.failure,
  },
});

