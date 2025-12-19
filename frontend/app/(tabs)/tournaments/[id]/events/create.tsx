import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from '../../../../../stores/themeStore';
import { useColors } from '../../../../../utils/colors';
import { getFontFamily } from '../../../../../utils/fonts';
import Button from '../../../../../components/ui/Button';
import { eventSchema, eventDefaults } from '../../../../../schemas/eventModal';
import { useTournamentStore } from '../../../../../stores/tournamentStore';
import { useTournamentTheme } from '../../../../../hooks/useTournamentTheme';
import { useEventTypesStore } from '../../../../../stores/eventTypesStore';
import DateSelector from '../../../../../components/ui/DateSelector';

type FormData = typeof eventDefaults;

export default function CreateEventScreen() {
  const { id: tournamentId, eventId } = useLocalSearchParams<{ id: string; eventId?: string }>();
  const theme = useTheme();
  const isDark = theme === 'dark';
  const colors = useColors(isDark);
  const insets = useSafeAreaInsets();
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const isEditMode = !!eventId;
  const { getTournament, getEvent, addEvent, updateEvent } = useTournamentStore();
  const { eventTypes } = useEventTypesStore();
  
  const tournament = tournamentId ? getTournament(tournamentId) : undefined;
  const existingEvent = tournamentId && eventId ? getEvent(tournamentId, eventId) : undefined;
  const { accent, primary, getAccentWithOpacity } = useTournamentTheme(tournament);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: eventDefaults,
  });

  // Event types should already be loaded from app initialization
  // No need to fetch here - just use cached types

  // Pre-fill form when editing
  React.useEffect(() => {
    if (isEditMode && existingEvent) {
      // Format today's date in local timezone
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;
      
      reset({
        name: existingEvent.name,
        date: existingEvent.date || todayStr,
        category: existingEvent.category,
      });
      setSelectedParticipantIds(Array.isArray(existingEvent.participantIds) ? existingEvent.participantIds : []);
    }
  }, [isEditMode, existingEvent, reset]);

  const watchedValues = watch();

  if (!tournament) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors['bg-surface'] }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors['text-primary'] }}>Tournament not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const styles = StyleSheet.create({
    stepIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 32,
      paddingHorizontal: 20,
    },
    stepCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
    },
    stepLine: {
      flex: 1,
      height: 2,
      marginHorizontal: 8,
    },
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1.5,
      marginRight: 8,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    summaryCard: {
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors['border-default'],
      backgroundColor: colors['bg-card'] + 'E6',
    },
  });

  const renderStep1 = () => (
    <View>
      <View style={{ marginBottom: 24 }}>
        <Text style={{
          fontSize: 14,
          fontFamily: getFontFamily('medium'),
          color: accent ? getAccentWithOpacity(0.8) : colors['text-secondary'],
          marginBottom: 8,
        }}>
          Event Name <Text style={{ color: colors['text-danger'] }}>*</Text>
        </Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={{
                borderWidth: 1.5,
                borderColor: errors.name 
                  ? colors['text-danger'] 
                  : (value && accent ? accent : colors['border-default']),
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 12,
                color: colors['text-primary'],
                fontFamily: getFontFamily('regular'),
                fontSize: 16,
                backgroundColor: value && accent
                  ? getAccentWithOpacity(0.05)
                  : colors['bg-card'],
              }}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Enter event name"
              placeholderTextColor={colors['text-secondary']}
            />
          )}
        />
        {errors.name && (
          <Text style={{
            fontSize: 12,
            fontFamily: getFontFamily('regular'),
            color: colors['text-danger'],
            marginTop: 4,
          }}>
            {errors.name.message}
          </Text>
        )}
      </View>

      {/* Date */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{
          fontSize: 14,
          fontFamily: getFontFamily('medium'),
          color: accent ? getAccentWithOpacity(0.8) : colors['text-secondary'],
          marginBottom: 8,
        }}>
          Date <Text style={{ color: colors['text-danger'] }}>*</Text>
        </Text>
        <Controller
          control={control}
          name="date"
          render={({ field: { onChange, value } }) => (
            <>
              <TouchableOpacity
                onPress={() => {
                  setShowDatePicker(true);
                }}
                style={{
                  borderWidth: 1.5,
                  borderColor: errors.date 
                    ? colors['text-danger'] 
                    : (value && accent ? accent : colors['border-default']),
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  backgroundColor: value && accent
                    ? getAccentWithOpacity(0.05)
                    : colors['bg-card'],
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={{
                  color: value ? colors['text-primary'] : colors['text-secondary'],
                  fontFamily: getFontFamily('regular'),
                  fontSize: 16,
                }}>
                  {value ? new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Select date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={colors['text-secondary']} />
              </TouchableOpacity>
              <DateSelector
                visible={showDatePicker}
                date={value ? new Date(value) : new Date()}
                onDateSelect={(dateStr) => {
                  onChange(dateStr);
                  setShowDatePicker(false);
                }}
                onClose={() => setShowDatePicker(false)}
              />
            </>
          )}
        />
        {errors.date && (
          <Text style={{
            fontSize: 12,
            fontFamily: getFontFamily('regular'),
            color: colors['text-danger'],
            marginTop: 4,
          }}>
            {errors.date.message}
          </Text>
        )}
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{
          fontSize: 14,
          fontFamily: getFontFamily('medium'),
          color: accent ? getAccentWithOpacity(0.8) : colors['text-secondary'],
          marginBottom: 8,
        }}>
          Category <Text style={{ color: colors['text-danger'] }}>*</Text>
        </Text>
        <Controller
          control={control}
          name="category"
          render={({ field: { onChange, value } }) => (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {eventTypes.length === 0 ? (
                <Text style={{ color: colors['text-secondary'] }}>Loading categories...</Text>
              ) : (
                eventTypes.map((eventType) => {
                  const isSelected = value === eventType.name;
                  const selectedColor = accent || colors['bg-primary'];
                  return (
                    <TouchableOpacity
                      key={eventType.id}
                      onPress={() => onChange(eventType.name)}
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
                        {eventType.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          )}
        />
        {errors.category && (
          <Text style={{
            fontSize: 12,
            fontFamily: getFontFamily('regular'),
            color: colors['text-danger'],
            marginTop: 4,
          }}>
            {errors.category.message}
          </Text>
        )}
      </View>
    </View>
  );


  const isStepValid = () => {
    return watchedValues.name && watchedValues.date && watchedValues.category;
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSaving(true);
      
      if (isEditMode && eventId && tournamentId) {
        await updateEvent(tournamentId, eventId, {
          ...data,
          participantIds: selectedParticipantIds,
          status: 'active',
        });
      } else if (tournamentId) {
        // Get existing event to preserve divisions and metrics if editing, otherwise use defaults
        const existing = existingEvent;
        await addEvent(tournamentId, {
          name: data.name,
          date: data.date,
          category: data.category,
          divisions: existing?.divisions || ['Open'],
          metrics: existing?.metrics || ['time', 'reps'],
          participantIds: selectedParticipantIds,
          participantData: existing?.participantData || {},
          status: 'active',
        });
      }
      
      // Close the page after successful save
      router.back();
    } catch (error) {
      console.error('Error creating event:', error);
      setIsSaving(false);
      // You might want to show an error message to the user here
    }
  };

  const canSave = isStepValid();

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors['bg-surface'] }}>
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
              {isEditMode ? 'Edit Event' : 'Create Event'}
            </Text>
            
            <Button
              title="Save"
              onPress={handleSubmit(onSubmit)}
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
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: insets.bottom + 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {renderStep1()}
        </ScrollView>

        {/* Loading Overlay */}
        {isSaving && (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors['bg-surface'] + 'E6',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}>
            <View style={{
              backgroundColor: colors['bg-card'],
              borderRadius: 16,
              padding: 24,
              alignItems: 'center',
              minWidth: 120,
            }}>
              <ActivityIndicator 
                size="large" 
                color={accent || colors['bg-primary']} 
                style={{ marginBottom: 12 }}
              />
              <Text style={{
                fontSize: 14,
                fontFamily: getFontFamily('medium'),
                color: colors['text-primary'],
              }}>
                Saving...
              </Text>
            </View>
          </View>
        )}

      </View>
    </SafeAreaView>
  );
}

