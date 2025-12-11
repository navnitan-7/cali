import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '../../../stores/themeStore';
import { useColors } from '../../../utils/colors';
import { getFontFamily } from '../../../utils/fonts';
import { useEventStore } from '../../../stores/eventStore';
import Button from '../../../components/ui/Button';
import { FormTextInput } from '../../../components/commonInputComponents/FormTextInput';

export default function AddParticipantScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const theme = useTheme();
  const isDark = theme === 'dark';
  const colors = useColors(isDark);
  const insets = useSafeAreaInsets();
  const { getEvent, addParticipant } = useEventStore();

  const event = eventId ? getEvent(eventId) : undefined;

  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [division, setDivision] = useState('');
  const [reps, setReps] = useState('');
  const [time, setTime] = useState('');

  // Refs for keyboard navigation
  const weightRef = useRef<TextInput>(null);
  const divisionRef = useRef<TextInput>(null);
  const repsRef = useRef<TextInput>(null);
  const timeRef = useRef<TextInput>(null);

  if (!event) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors['bg-surface'] }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors['text-primary'] }}>Event not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    addParticipant(eventId!, {
      name: name.trim(),
      weight: weight ? parseFloat(weight) : undefined,
      division: division || undefined,
      reps: reps ? parseInt(reps, 10) : undefined,
      time: time || undefined,
    });

    router.back();
  };

  const styles = StyleSheet.create({
    input: {
      borderBottomWidth: 1,
      borderBottomColor: colors['border-default'],
      paddingVertical: 12,
      color: colors['text-primary'],
      fontFamily: getFontFamily('regular'),
      fontSize: 16,
      backgroundColor: 'transparent',
    },
    label: {
      fontSize: 14,
      fontFamily: getFontFamily('medium'),
      color: colors['text-secondary'],
      marginBottom: 8,
    },
    required: {
      color: colors['text-danger'],
    },
  });

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors['bg-surface'] }}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 12,
        }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors['icon-primary']} />
          </TouchableOpacity>
          <Text style={{
            fontSize: 18,
            fontFamily: getFontFamily('bold'),
            color: colors['text-primary'],
          }}>
            Add Participant
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 100 }}
        >
          <Text style={{
            fontSize: 13,
            fontFamily: getFontFamily('regular'),
            color: colors['text-secondary'],
            marginBottom: 24,
          }}>
            Add a new participant to {event.name}
          </Text>

          {/* Name - Required */}
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.label}>
              Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter participant name"
              placeholderTextColor={colors['text-secondary']}
              autoFocus
              returnKeyType="next"
              onSubmitEditing={() => weightRef.current?.focus()}
            />
          </View>

          {/* Weight */}
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              ref={weightRef}
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              placeholder="Enter weight in kg"
              placeholderTextColor={colors['text-secondary']}
              keyboardType="numeric"
              returnKeyType="next"
              onSubmitEditing={() => divisionRef.current?.focus()}
            />
          </View>

          {/* Division */}
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.label}>Division</Text>
            <TextInput
              ref={divisionRef}
              style={styles.input}
              value={division}
              onChangeText={setDivision}
              placeholder="e.g., Men, Women, Open"
              placeholderTextColor={colors['text-secondary']}
              returnKeyType="next"
              onSubmitEditing={() => repsRef.current?.focus()}
            />
          </View>

          {/* Reps */}
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.label}>Reps</Text>
            <TextInput
              ref={repsRef}
              style={styles.input}
              value={reps}
              onChangeText={setReps}
              placeholder="Enter number of reps"
              placeholderTextColor={colors['text-secondary']}
              keyboardType="numeric"
              returnKeyType="next"
              onSubmitEditing={() => timeRef.current?.focus()}
            />
          </View>

          {/* Time */}
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.label}>Time (MM:SS or HH:MM:SS)</Text>
            <TextInput
              ref={timeRef}
              style={styles.input}
              value={time}
              onChangeText={setTime}
              placeholder="e.g., 2:34 or 1:23:45"
              placeholderTextColor={colors['text-secondary']}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
          </View>

          <Button
            title="Add Participant"
            onPress={handleSubmit}
            variant="primary"
            fullWidth
            style={{ marginTop: 12, marginBottom: 20 }}
            disabled={!name.trim()}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
