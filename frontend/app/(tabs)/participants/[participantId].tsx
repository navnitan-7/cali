import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useParticipant, useParticipantRegistrations } from '@/lib/queries';
import { theme } from '@/styles/theme';

export default function ParticipantDetailScreen() {
  const router = useRouter();
  const { participantId } = useLocalSearchParams<{ participantId: string }>();
  const id = parseInt(participantId || '0', 10);

  const { data: participant, isLoading: loadingParticipant } = useParticipant(id);
  const { data: registrations, isLoading: loadingRegistrations } = useParticipantRegistrations(id);

  if (loadingParticipant || loadingRegistrations) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  if (!participant) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Participant not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{participant.name}</Text>
        <Text style={styles.subtitle}>{participant.gender}, {participant.age} years old</Text>
        <Text style={styles.email}>{participant.phone}</Text>
        <Text style={styles.email}>{participant.country}, {participant.state}</Text>
        <Text style={styles.email}>Weight: {participant.weight} kg</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Registered Events</Text>
        
        {!registrations || registrations.length === 0 ? (
          <Text style={styles.emptyText}>No event registrations</Text>
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
              {registration.event && (
                <>
                  <Text style={styles.eventName}>{registration.event.name}</Text>
                  <Text style={styles.eventType}>Type: {registration.event.event_type}</Text>
                  {registration.event.description && (
                    <Text style={styles.eventDescription}>{registration.event.description}</Text>
                  )}
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
  email: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
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
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadow.sm,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.info,
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
  eventName: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
  },
  eventType: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
    fontWeight: theme.fontWeight.medium,
  },
  eventDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    lineHeight: 18,
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
  },
});

