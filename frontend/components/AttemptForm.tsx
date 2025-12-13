import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { theme } from '@/styles/theme';
import type { CreateAttemptInput } from '@/types/api';

interface AttemptFormProps {
  registrationId: number;
  initialDurationMs?: number;
  onSubmit: (input: CreateAttemptInput) => void;
  onCancel?: () => void;
}

export const AttemptForm: React.FC<AttemptFormProps> = ({
  registrationId,
  initialDurationMs,
  onSubmit,
  onCancel,
}) => {
  const [durationMs, setDurationMs] = useState(initialDurationMs?.toString() || '');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [success, setSuccess] = useState(true);
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    const input: CreateAttemptInput = {
      registration_id: registrationId,
      duration_ms: durationMs ? parseInt(durationMs, 10) : undefined,
      reps: reps ? parseInt(reps, 10) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      success,
      notes: notes || undefined,
    };

    onSubmit(input);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Time (ms)</Text>
      <TextInput
        style={styles.input}
        value={durationMs}
        onChangeText={setDurationMs}
        keyboardType="numeric"
        placeholder="Duration in milliseconds"
        placeholderTextColor={theme.colors.textSecondary}
      />

      <Text style={styles.label}>Reps</Text>
      <TextInput
        style={styles.input}
        value={reps}
        onChangeText={setReps}
        keyboardType="numeric"
        placeholder="Number of reps"
        placeholderTextColor={theme.colors.textSecondary}
      />

      <Text style={styles.label}>Weight (kg)</Text>
      <TextInput
        style={styles.input}
        value={weight}
        onChangeText={setWeight}
        keyboardType="decimal-pad"
        placeholder="Weight in kg"
        placeholderTextColor={theme.colors.textSecondary}
      />

      <View style={styles.switchRow}>
        <Text style={styles.label}>Success</Text>
        <Switch
          value={success}
          onValueChange={setSuccess}
          trackColor={{ false: theme.colors.border, true: theme.colors.success }}
          thumbColor={theme.colors.background}
        />
      </View>

      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Additional notes"
        placeholderTextColor={theme.colors.textSecondary}
        multiline
        numberOfLines={3}
      />

      <View style={styles.buttonRow}>
        {onCancel && (
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={onCancel}
          >
            <Text style={styles.buttonTextSecondary}>Cancel</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>Save Attempt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    margin: theme.spacing.md,
    ...theme.shadow.sm,
  },
  label: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.semibold,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
    ...theme.shadow.sm,
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
  },
  buttonSecondary: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  buttonText: {
    color: theme.colors.surface,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
  },
  buttonTextSecondary: {
    color: theme.colors.text,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
  },
});

