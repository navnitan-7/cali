import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  useRegistration,
  useRegistrationAttempts,
  useCreateAttempt,
  useUploadVideo,
  useDeleteVideo,
} from '@/lib/queries';
import { Timer } from '@/components/Timer';
import { AttemptForm } from '@/components/AttemptForm';
import { AttemptList } from '@/components/AttemptList';
import { VideoRecorder } from '@/components/VideoRecorder';
import { VideoUploader } from '@/components/VideoUploader';
import { VideoList } from '@/components/VideoList';
import { theme } from '@/styles/theme';
import type { CreateAttemptInput, Attempt } from '@/types/api';

export default function RegistrationScreen() {
  const { registrationId } = useLocalSearchParams<{ registrationId: string }>();
  const id = parseInt(registrationId || '0', 10);

  const [showAttemptForm, setShowAttemptForm] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState<Attempt | null>(null);
  const [timerDuration, setTimerDuration] = useState<number | undefined>(undefined);

  const { data: registration, isLoading: loadingRegistration } = useRegistration(id);
  // For now, we'll need event_id and participant_id from the registration
  // In a real app, these would come from the route params or registration data
  const eventId = registration?.event_id || 0;
  const participantId = registration?.participant_id || 0;
  const { data: attempts, isLoading: loadingAttempts } = useRegistrationAttempts(id, eventId, participantId);
  const createAttemptMutation = useCreateAttempt();
  const uploadVideoMutation = useUploadVideo();
  const deleteVideoMutation = useDeleteVideo();

  if (loadingRegistration || loadingAttempts) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  if (!registration) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Registration not found</Text>
      </View>
    );
  }

  const handleTimerSave = (durationMs: number) => {
    setTimerDuration(durationMs);
    setShowAttemptForm(true);
  };

  const handleAttemptSubmit = async (input: CreateAttemptInput) => {
    try {
      // Add event_id and participant_id from registration
      const fullInput = {
        ...input,
        event_id: eventId,
        participant_id: participantId,
      };
      await createAttemptMutation.mutateAsync(fullInput);
      setShowAttemptForm(false);
      setTimerDuration(undefined);
      Alert.alert('Success', 'Attempt saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save attempt');
      console.error('Save attempt error:', error);
    }
  };

  const handleAttemptPress = (attempt: Attempt) => {
    setSelectedAttempt(selectedAttempt?.id === attempt.id ? null : attempt);
  };

  const handleVideoRecorded = async (uri: string) => {
    Alert.alert('Info', 'Video upload is not yet supported by the backend');
  };

  const handleVideoUpload = async (attemptId: number, file: FormData) => {
    Alert.alert('Info', 'Video upload is not yet supported by the backend');
  };

  const handleDeleteVideo = async (videoId: number) => {
    Alert.alert('Info', 'Video deletion is not yet supported by the backend');
  };

  const latestAttempt = attempts && attempts.length > 0 ? attempts[attempts.length - 1] : null;

  return (
    <ScrollView style={styles.container}>
      {/* Registration Info Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.bibNumber}>#{registration.bib_number}</Text>
          <Text style={styles.division}>{registration.division}</Text>
        </View>
        
        {registration.participant && (
          <>
            <Text style={styles.participantName}>{registration.participant.name}</Text>
            <Text style={styles.participantCategory}>{registration.participant.gender}, {registration.participant.age} years</Text>
          </>
        )}
        
        {registration.event && (
          <>
            <Text style={styles.eventName}>{registration.event.name}</Text>
            <Text style={styles.eventType}>Event Type: {registration.event.event_type}</Text>
          </>
        )}
      </View>

      {/* Timer Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Timer</Text>
        <Timer onSave={handleTimerSave} />
      </View>

      {/* Manual Attempt Entry */}
      {showAttemptForm ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Record Attempt</Text>
          <AttemptForm
            registrationId={id}
            initialDurationMs={timerDuration}
            onSubmit={handleAttemptSubmit}
            onCancel={() => {
              setShowAttemptForm(false);
              setTimerDuration(undefined);
            }}
          />
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manual Entry</Text>
          <AttemptForm
            registrationId={id}
            onSubmit={handleAttemptSubmit}
          />
        </View>
      )}

      {/* Video Recording - Disabled until backend supports it */}
      {/* <View style={styles.section}>
        <Text style={styles.sectionTitle}>Record Video</Text>
        <Text style={styles.infoText}>Video recording will be available when backend support is added</Text>
      </View> */}

      {/* Attempt History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Attempt History</Text>
        <AttemptList
          attempts={attempts || []}
          onAttemptPress={handleAttemptPress}
        />
      </View>

      {/* Selected Attempt Videos - Disabled until backend supports it */}
      {/* {selectedAttempt && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Videos for Attempt #{selectedAttempt.id}
          </Text>
          <Text style={styles.infoText}>Video features will be available when backend support is added</Text>
        </View>
      )} */}
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
    backgroundColor: theme.colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primaryDark,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  bibNumber: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.surface,
  },
  division: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.surface,
    backgroundColor: theme.colors.primaryDark,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  participantName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.surface,
    marginTop: theme.spacing.sm,
  },
  participantCategory: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.surface,
    marginTop: theme.spacing.xs,
    opacity: 0.9,
  },
  eventName: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.surface,
    marginTop: theme.spacing.md,
  },
  eventType: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.surface,
    marginTop: theme.spacing.xs,
    opacity: 0.8,
  },
  section: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  errorText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.failure,
    fontWeight: theme.fontWeight.medium,
  },
  infoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    padding: theme.spacing.lg,
    textAlign: 'center',
    backgroundColor: theme.colors.infoLight,
    borderRadius: theme.borderRadius.md,
    margin: theme.spacing.md,
  },
});

