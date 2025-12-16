import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '../../../../../stores/themeStore';
import { useColors } from '../../../../../utils/colors';
import { getFontFamily } from '../../../../../utils/fonts';
import { useTournamentStore } from '../../../../../stores/tournamentStore';
import { useTournamentTheme } from '../../../../../hooks/useTournamentTheme';
import { divisionOptions } from '../../../../../schemas/eventModal';
import Button from '../../../../../components/ui/Button';

export default function CreateParticipantScreen() {
  const { id: tournamentId } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const isDark = theme === 'dark';
  const colors = useColors(isDark);
  const insets = useSafeAreaInsets();
  const { getTournament, addParticipant } = useTournamentStore();

  const tournament = tournamentId ? getTournament(tournamentId) : undefined;
  const { accent, getAccentWithOpacity } = useTournamentTheme(tournament);

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [weight, setWeight] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!tournament) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors['bg-surface'] }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors['text-primary'] }}>Tournament not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    if (selectedEvents.length === 0) {
      Alert.alert('Error', 'Please select at least one event');
      return;
    }

    try {
      setIsSaving(true);
      await addParticipant(tournamentId!, {
        name: name.trim(),
        age: age ? parseInt(age) : 0,
        gender: gender || 'Open',
        weight: weight ? parseFloat(weight) : 0,
        phone: phone.trim(),
        country: country.trim(),
        state: state.trim(),
      }, selectedEvents);
      router.back();
    } catch (error) {
      console.error('Error creating participant:', error);
      Alert.alert('Error', 'Failed to create participant. Please try again.');
      setIsSaving(false);
    }
  };

  const canSave = name.trim().length > 0 && selectedEvents.length > 0;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors['bg-surface'] }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={{ flex: 1 }}>
            {/* Top Navigation Bar with Save/Cancel */}
            <View style={{
              position: 'relative',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingTop: 8,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors['border-default'],
              overflow: 'hidden',
            }}>
              {/* Subtle accent background */}
              {accent && (
                <View style={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: getAccentWithOpacity(0.06),
                }} />
              )}
              
              <TouchableOpacity 
                onPress={() => router.back()}
                style={{
                  width: 32,
                  height: 32,
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <Ionicons name="close" size={24} color={colors['text-primary']} />
              </TouchableOpacity>
              
              <Text style={{
                fontSize: 17,
                fontFamily: getFontFamily('semibold'),
                color: colors['text-primary'],
                position: 'relative',
                zIndex: 1,
              }}>
                Add Participant
              </Text>
              
              <Button
                title="Save"
                onPress={handleSubmit}
                variant="primary"
                size="small"
                disabled={!canSave || isSaving}
                loading={isSaving}
                style={{ minWidth: 60, position: 'relative', zIndex: 1 }}
              />
              
              {/* Accent border */}
              {accent && (
                <View style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  backgroundColor: getAccentWithOpacity(0.3),
                }} />
              )}
            </View>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: Math.max(insets.bottom + 40, 100) }}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={true}
            >
            {/* Name - Required */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontSize: 14,
                fontFamily: getFontFamily('medium'),
                color: accent ? getAccentWithOpacity(0.8) : colors['text-secondary'],
                marginBottom: 8,
              }}>
                Name <Text style={{ color: colors['text-danger'] }}>*</Text>
              </Text>
              <TextInput
                style={{
                  borderWidth: 1.5,
                  borderColor: focusedInput === 'name' && accent
                    ? accent
                    : colors['border-default'],
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  color: colors['text-primary'],
                  fontFamily: getFontFamily('regular'),
                  fontSize: 16,
                  backgroundColor: focusedInput === 'name' && accent
                    ? getAccentWithOpacity(0.05)
                    : colors['bg-card'],
                }}
                value={name}
                onChangeText={setName}
                placeholder="Enter participant name"
                placeholderTextColor={colors['text-secondary']}
                onFocus={() => setFocusedInput('name')}
                onBlur={() => setFocusedInput(null)}
                autoFocus
              />
            </View>

            {/* Age */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontSize: 14,
                fontFamily: getFontFamily('medium'),
                color: accent ? getAccentWithOpacity(0.8) : colors['text-secondary'],
                marginBottom: 8,
              }}>
                Age
              </Text>
              <TextInput
                style={{
                  borderWidth: 1.5,
                  borderColor: focusedInput === 'age' && accent
                    ? accent
                    : colors['border-default'],
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  color: colors['text-primary'],
                  fontFamily: getFontFamily('regular'),
                  fontSize: 16,
                  backgroundColor: focusedInput === 'age' && accent
                    ? getAccentWithOpacity(0.05)
                    : colors['bg-card'],
                }}
                value={age}
                onChangeText={setAge}
                placeholder="Enter age"
                placeholderTextColor={colors['text-secondary']}
                keyboardType="numeric"
                onFocus={() => setFocusedInput('age')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            {/* Gender */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontSize: 14,
                fontFamily: getFontFamily('medium'),
                color: accent ? getAccentWithOpacity(0.8) : colors['text-secondary'],
                marginBottom: 8,
              }}>
                Gender
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {divisionOptions.map((div) => {
                  const isSelected = gender === div;
                  const selectedColor = accent || colors['bg-primary'];
                  return (
                    <TouchableOpacity
                      key={div}
                      onPress={() => setGender(isSelected ? '' : div)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 20,
                        borderWidth: 1.5,
                        borderColor: isSelected ? selectedColor : colors['border-default'],
                        backgroundColor: isSelected 
                          ? (accent ? getAccentWithOpacity(0.15) : selectedColor + '20')
                          : colors['bg-card'],
                      }}
                    >
                      <Text style={{
                        fontSize: 14,
                        fontFamily: getFontFamily('medium'),
                        color: isSelected ? selectedColor : colors['text-primary'],
                      }}>
                        {div}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Weight */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontSize: 14,
                fontFamily: getFontFamily('medium'),
                color: accent ? getAccentWithOpacity(0.8) : colors['text-secondary'],
                marginBottom: 8,
              }}>
                Weight (kg)
              </Text>
              <TextInput
                style={{
                  borderWidth: 1.5,
                  borderColor: focusedInput === 'weight' && accent
                    ? accent
                    : colors['border-default'],
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  color: colors['text-primary'],
                  fontFamily: getFontFamily('regular'),
                  fontSize: 16,
                  backgroundColor: focusedInput === 'weight' && accent
                    ? getAccentWithOpacity(0.05)
                    : colors['bg-card'],
                }}
                value={weight}
                onChangeText={setWeight}
                placeholder="Enter weight in kg"
                placeholderTextColor={colors['text-secondary']}
                keyboardType="numeric"
                onFocus={() => setFocusedInput('weight')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            {/* Phone */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontSize: 14,
                fontFamily: getFontFamily('medium'),
                color: accent ? getAccentWithOpacity(0.8) : colors['text-secondary'],
                marginBottom: 8,
              }}>
                Phone
              </Text>
              <TextInput
                style={{
                  borderWidth: 1.5,
                  borderColor: focusedInput === 'phone' && accent
                    ? accent
                    : colors['border-default'],
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  color: colors['text-primary'],
                  fontFamily: getFontFamily('regular'),
                  fontSize: 16,
                  backgroundColor: focusedInput === 'phone' && accent
                    ? getAccentWithOpacity(0.05)
                    : colors['bg-card'],
                }}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter phone number"
                placeholderTextColor={colors['text-secondary']}
                keyboardType="phone-pad"
                onFocus={() => setFocusedInput('phone')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            {/* Country */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontSize: 14,
                fontFamily: getFontFamily('medium'),
                color: accent ? getAccentWithOpacity(0.8) : colors['text-secondary'],
                marginBottom: 8,
              }}>
                Country
              </Text>
              <TextInput
                style={{
                  borderWidth: 1.5,
                  borderColor: focusedInput === 'country' && accent
                    ? accent
                    : colors['border-default'],
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  color: colors['text-primary'],
                  fontFamily: getFontFamily('regular'),
                  fontSize: 16,
                  backgroundColor: focusedInput === 'country' && accent
                    ? getAccentWithOpacity(0.05)
                    : colors['bg-card'],
                }}
                value={country}
                onChangeText={setCountry}
                placeholder="Enter country"
                placeholderTextColor={colors['text-secondary']}
                onFocus={() => setFocusedInput('country')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            {/* State */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontSize: 14,
                fontFamily: getFontFamily('medium'),
                color: accent ? getAccentWithOpacity(0.8) : colors['text-secondary'],
                marginBottom: 8,
              }}>
                State
              </Text>
              <TextInput
                style={{
                  borderWidth: 1.5,
                  borderColor: focusedInput === 'state' && accent
                    ? accent
                    : colors['border-default'],
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  color: colors['text-primary'],
                  fontFamily: getFontFamily('regular'),
                  fontSize: 16,
                  backgroundColor: focusedInput === 'state' && accent
                    ? getAccentWithOpacity(0.05)
                    : colors['bg-card'],
                }}
                value={state}
                onChangeText={setState}
                placeholder="Enter state"
                placeholderTextColor={colors['text-secondary']}
                onFocus={() => setFocusedInput('state')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            {/* Events - Required */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontSize: 14,
                fontFamily: getFontFamily('medium'),
                color: accent ? getAccentWithOpacity(0.8) : colors['text-secondary'],
                marginBottom: 8,
              }}>
                Events <Text style={{ color: colors['text-danger'] }}>*</Text>
              </Text>
              {tournament.events.length === 0 ? (
                <View style={{
                  padding: 16,
                  borderRadius: 10,
                  backgroundColor: colors['bg-card'],
                  borderWidth: 1.5,
                  borderColor: colors['border-default'],
                }}>
                  <Text style={{
                    fontSize: 14,
                    fontFamily: getFontFamily('regular'),
                    color: colors['text-secondary'],
                    fontStyle: 'italic',
                  }}>
                    No events available. Please create events first.
                  </Text>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {tournament.events.map((event) => {
                    const isSelected = selectedEvents.includes(event.id);
                    const selectedColor = accent || colors['bg-primary'];
                    return (
                      <TouchableOpacity
                        key={event.id}
                        onPress={() => {
                          if (isSelected) {
                            setSelectedEvents(selectedEvents.filter(id => id !== event.id));
                          } else {
                            setSelectedEvents([...selectedEvents, event.id]);
                          }
                        }}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          borderRadius: 20,
                          borderWidth: 1.5,
                          borderColor: isSelected ? selectedColor : colors['border-default'],
                          backgroundColor: isSelected 
                            ? (accent ? getAccentWithOpacity(0.15) : selectedColor + '20')
                            : colors['bg-card'],
                        }}
                      >
                        <Text style={{
                          fontSize: 14,
                          fontFamily: getFontFamily('medium'),
                          color: isSelected ? selectedColor : colors['text-primary'],
                        }}>
                          {event.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
  );
}
