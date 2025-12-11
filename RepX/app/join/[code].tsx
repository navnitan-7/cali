import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '../../stores/themeStore';
import { useColors } from '../../utils/colors';
import { getFontFamily } from '../../utils/fonts';
import { useEventStore } from '../../stores/eventStore';
import Button from '../../components/ui/Button';

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

export default function JoinParticipantScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const theme = useTheme();
  const isDark = theme === 'dark';
  const colors = useColors(isDark);
  const insets = useSafeAreaInsets();
  const { getEventByJoinCode, addParticipant } = useEventStore();

  const joinCode = Array.isArray(code) ? code[0] : code;
  const event = joinCode ? getEventByJoinCode(joinCode) : undefined;

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
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
          <Ionicons name="alert-circle-outline" size={64} color={colors['text-danger']} />
          <Text style={{
            fontSize: 20,
            fontFamily: getFontFamily('bold'),
            color: colors['text-primary'],
            marginTop: 20,
            textAlign: 'center',
          }}>
            Event Not Found
          </Text>
          <Text style={{
            fontSize: 14,
            fontFamily: getFontFamily('regular'),
            color: colors['text-secondary'],
            marginTop: 8,
            textAlign: 'center',
          }}>
            The join link is invalid or the event no longer exists.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    if (!event.id) {
      Alert.alert('Error', 'Invalid event');
      return;
    }

    addParticipant(event.id, {
      name: name.trim(),
      weight: weight ? parseFloat(weight) : undefined,
      division: division || undefined,
      reps: reps ? parseInt(reps, 10) : undefined,
      time: time || undefined,
    });

    Alert.alert(
      'Success!',
      'You have been added as a participant to this event.',
      [
        {
          text: 'OK',
          onPress: () => {
            // Navigate to home or close
            router.replace('/(tabs)/events');
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    eventCard: {
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors['border-default'],
      backgroundColor: colors['bg-card'] + 'E6',
    },
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
          justifyContent: 'center',
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 12,
        }}>
          <Text style={{
            fontSize: 18,
            fontFamily: getFontFamily('bold'),
            color: colors['text-primary'],
          }}>
            Join Event
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 100 }}
        >
          {/* Event Details Card */}
          <View style={styles.eventCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: colors['bg-primary'] + '30',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}>
                <Ionicons name="trophy" size={24} color={colors['bg-primary']} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 20,
                  fontFamily: getFontFamily('bold'),
                  color: colors['text-primary'],
                  marginBottom: 4,
                }}>
                  {event.name}
                </Text>
                <Text style={{
                  fontSize: 13,
                  fontFamily: getFontFamily('regular'),
                  color: colors['text-secondary'],
                }}>
                  {event.category}
                </Text>
              </View>
            </View>

            <View style={{
              paddingTop: 16,
              borderTopWidth: 1,
              borderTopColor: colors['border-default'],
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Ionicons name="calendar-outline" size={18} color={colors['text-secondary']} />
                <Text style={{
                  fontSize: 14,
                  fontFamily: getFontFamily('medium'),
                  color: colors['text-primary'],
                  marginLeft: 8,
                }}>
                  {formatDate(event.date)}
                </Text>
              </View>

              {event.divisions && event.divisions.length > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Ionicons name="people-outline" size={18} color={colors['text-secondary']} />
                  <Text style={{
                    fontSize: 14,
                    fontFamily: getFontFamily('medium'),
                    color: colors['text-primary'],
                    marginLeft: 8,
                  }}>
                    Divisions: {event.divisions.join(', ')}
                  </Text>
                </View>
              )}

              {event.metrics && event.metrics.length > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="stats-chart-outline" size={18} color={colors['text-secondary']} />
                  <Text style={{
                    fontSize: 14,
                    fontFamily: getFontFamily('medium'),
                    color: colors['text-primary'],
                    marginLeft: 8,
                  }}>
                    Metrics: {event.metrics.map(m => {
                      const labels: Record<string, string> = {
                        time: 'Time',
                        reps: 'Reps',
                        weight: 'Weight',
                      };
                      return labels[m] || m;
                    }).join(', ')}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Form Section */}
          <Text style={{
            fontSize: 18,
            fontFamily: getFontFamily('bold'),
            color: colors['text-primary'],
            marginBottom: 8,
          }}>
            Your Details
          </Text>
          <Text style={{
            fontSize: 13,
            fontFamily: getFontFamily('regular'),
            color: colors['text-secondary'],
            marginBottom: 24,
          }}>
            Fill in your information to join this event
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
              placeholder="Enter your name"
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
              placeholder="Enter your weight in kg"
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
              placeholder="Enter number of reps (optional)"
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
              placeholder="e.g., 2:34 or 1:23:45 (optional)"
              placeholderTextColor={colors['text-secondary']}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
          </View>

          <Button
            title="Join Event"
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

