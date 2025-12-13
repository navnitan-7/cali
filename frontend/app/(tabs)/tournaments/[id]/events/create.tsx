import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from '../../../../../stores/themeStore';
import { useColors } from '../../../../../utils/colors';
import { getFontFamily } from '../../../../../utils/fonts';
import Button from '../../../../../components/ui/Button';
import { eventSchema, eventDefaults, eventCategories } from '../../../../../schemas/eventModal';
import { useTournamentStore } from '../../../../../stores/tournamentStore';
import DateSelector from '../../../../../components/ui/DateSelector';
import { useTournamentTheme } from '../../../../../hooks/useTournamentTheme';

type FormData = typeof eventDefaults;

const STEPS = [
  { id: 1, title: 'Event Details' },
  { id: 2, title: 'Select Participants' },
  { id: 3, title: 'Review & Create' },
];

export default function CreateEventScreen() {
  const { id: tournamentId, eventId } = useLocalSearchParams<{ id: string; eventId?: string }>();
  const theme = useTheme();
  const isDark = theme === 'dark';
  const colors = useColors(isDark);
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);
  const isEditMode = !!eventId;
  const { getTournament, getEvent, addEvent, updateEvent } = useTournamentStore();
  
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

  // Pre-fill form when editing
  React.useEffect(() => {
    if (isEditMode && existingEvent) {
      reset({
        name: existingEvent.name,
        date: existingEvent.date,
        category: existingEvent.category,
        divisions: [],
        metrics: [],
      });
      setSelectedParticipantIds(Array.isArray(existingEvent.participantIds) ? existingEvent.participantIds : []);
    }
  }, [isEditMode, existingEvent, reset]);

  const watchedValues = watch();

  // Filter participants based on search query
  const filteredParticipants = useMemo(() => {
    if (!tournament) return [];
    if (!searchQuery.trim()) return tournament.participants;
    
    const query = searchQuery.toLowerCase();
    return tournament.participants.filter(p => 
      p.name.toLowerCase().includes(query) ||
      (p.division && p.division.toLowerCase().includes(query))
    );
  }, [tournament, searchQuery]);

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

  const renderStepIndicator = () => {
    const stepsToShow = isEditMode ? STEPS.slice(0, 1) : STEPS;
    const stepColor = accent || colors['bg-primary'];
    
    return (
      <View style={styles.stepIndicator}>
        {stepsToShow.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const isLast = index === stepsToShow.length - 1;

          return (
            <React.Fragment key={step.id}>
              <View style={{ alignItems: 'center' }}>
                <View style={[
                  styles.stepCircle,
                  {
                    backgroundColor: isActive || isCompleted
                      ? (accent ? getAccentWithOpacity(0.2) : stepColor + '30')
                      : 'transparent',
                    borderColor: isActive || isCompleted
                      ? stepColor
                      : colors['border-default'],
                  }
                ]}>
                  {isCompleted ? (
                    <Ionicons name="checkmark" size={20} color={stepColor} />
                  ) : (
                    <Text style={{
                      fontSize: 14,
                      fontFamily: getFontFamily('semibold'),
                      color: isActive ? stepColor : colors['text-secondary'],
                    }}>
                      {step.id}
                    </Text>
                  )}
                </View>
                <Text style={{
                  fontSize: 10,
                  fontFamily: getFontFamily('medium'),
                  color: isActive ? stepColor : colors['text-secondary'],
                  marginTop: 4,
                  textAlign: 'center',
                }} numberOfLines={1}>
                  {step.title}
                </Text>
              </View>
              {!isLast && (
                <View style={[
                  styles.stepLine,
                  {
                    backgroundColor: isCompleted 
                      ? (accent ? getAccentWithOpacity(0.4) : stepColor)
                      : colors['border-default'],
                  }
                ]} />
              )}
            </React.Fragment>
          );
        })}
      </View>
    );
  };

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
              {eventCategories.map((category) => {
                const isSelected = value === category;
                const selectedColor = accent || colors['bg-primary'];
                return (
                  <TouchableOpacity
                    key={category}
                    onPress={() => onChange(category)}
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
                      {category}
                    </Text>
                  </TouchableOpacity>
                );
              })}
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
                  setTempDate(new Date(value || new Date()));
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
                }}>
                  {value ? new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Select date'}
                </Text>
                <Ionicons 
                  name="calendar-outline" 
                  size={20} 
                  color={value && accent ? accent : colors['text-secondary']} 
                />
              </TouchableOpacity>
              <DateSelector
                visible={showDatePicker}
                date={tempDate || new Date(value || new Date())}
                onDateChange={(selectedDate) => {
                  const dateStr = selectedDate.toISOString().split('T')[0];
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
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={{
        fontSize: 16,
        fontFamily: getFontFamily('semibold'),
        color: colors['text-primary'],
        marginBottom: 8,
      }}>
        Select Participants
      </Text>
      <Text style={{
        fontSize: 14,
        fontFamily: getFontFamily('regular'),
        color: colors['text-secondary'],
        marginBottom: 20,
      }}>
        Select participants from the tournament participant list
      </Text>

      {/* Search Input */}
      <View style={{ marginBottom: 16 }}>
        <TextInput
          placeholder="Search participants..."
          placeholderTextColor={colors['text-secondary']}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{
            borderWidth: 1.5,
            borderColor: searchQuery && accent
              ? accent
              : colors['border-default'],
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 10,
            color: colors['text-primary'],
            fontFamily: getFontFamily('regular'),
            backgroundColor: searchQuery && accent
              ? getAccentWithOpacity(0.05)
              : colors['bg-secondary'],
          }}
        />
      </View>

      {/* Participants List */}
      {filteredParticipants.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
          <Ionicons name="people-outline" size={48} color={colors['text-muted']} />
          <Text style={{
            fontSize: 14,
            fontFamily: getFontFamily('regular'),
            color: colors['text-secondary'],
            marginTop: 16,
          }}>
            {searchQuery ? 'No participants found' : 'No participants in tournament'}
          </Text>
        </View>
      ) : (
        <View>
          {filteredParticipants.map((participant) => {
            const isSelected = selectedParticipantIds.includes(participant.id);
            return (
              <TouchableOpacity
                key={participant.id}
                onPress={() => {
                  if (isSelected) {
                    setSelectedParticipantIds(selectedParticipantIds.filter(id => id !== participant.id));
                  } else {
                    setSelectedParticipantIds([...selectedParticipantIds, participant.id]);
                  }
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isSelected ? colors['bg-primary'] : colors['border-default'],
                  backgroundColor: isSelected ? colors['bg-primary'] + '15' : colors['bg-card'],
                  marginBottom: 12,
                }}
              >
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors['bg-primary'] + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}>
                  <Ionicons name="person" size={20} color={colors['bg-primary']} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    fontFamily: getFontFamily('semibold'),
                    color: colors['text-primary'],
                  }}>
                    {participant.name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    {participant.division && (
                      <Text style={{
                        fontSize: 12,
                        fontFamily: getFontFamily('regular'),
                        color: colors['text-secondary'],
                        marginRight: 8,
                      }}>
                        {participant.division}
                      </Text>
                    )}
                    {participant.weight && (
                      <Text style={{
                        fontSize: 12,
                        fontFamily: getFontFamily('regular'),
                        color: colors['text-secondary'],
                      }}>
                        {participant.weight} kg
                      </Text>
                    )}
                  </View>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={24} color={accent || colors['bg-primary']} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {selectedParticipantIds.length > 0 && (
        <View style={{ 
          marginTop: 20, 
          paddingTop: 20, 
          borderTopWidth: 1, 
          borderTopColor: accent ? getAccentWithOpacity(0.2) : colors['border-default'] 
        }}>
          <Text style={{
            fontSize: 14,
            fontFamily: getFontFamily('semibold'),
            color: accent ? getAccentWithOpacity(0.9) : colors['text-primary'],
            marginBottom: 10,
          }}>
            Selected Participants ({selectedParticipantIds.length})
          </Text>
        </View>
      )}
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={{
        fontSize: 18,
        fontFamily: getFontFamily('bold'),
        color: colors['text-primary'],
        marginBottom: 20,
      }}>
        Review & Create
      </Text>

      <View style={[
        styles.summaryCard,
        accent && {
          borderLeftWidth: 3,
          borderLeftColor: accent,
        }
      ]}>
        <Text style={{
          fontSize: 16,
          fontFamily: getFontFamily('bold'),
          color: colors['text-primary'],
          marginBottom: 12,
        }}>
          {watchedValues.name || 'Event Name'}
        </Text>
        <View style={{ marginBottom: 8 }}>
          <Text style={{
            fontSize: 12,
            fontFamily: getFontFamily('regular'),
            color: colors['text-secondary'],
          }}>
            Category
          </Text>
          <Text style={{
            fontSize: 14,
            fontFamily: getFontFamily('medium'),
            color: colors['text-primary'],
          }}>
            {watchedValues.category || 'N/A'}
          </Text>
        </View>
        <View style={{ marginBottom: 8 }}>
          <Text style={{
            fontSize: 12,
            fontFamily: getFontFamily('regular'),
            color: colors['text-secondary'],
          }}>
            Date
          </Text>
          <Text style={{
            fontSize: 14,
            fontFamily: getFontFamily('medium'),
            color: colors['text-primary'],
          }}>
            {watchedValues.date ? new Date(watchedValues.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
          </Text>
        </View>
        <View>
          <Text style={{
            fontSize: 12,
            fontFamily: getFontFamily('regular'),
            color: colors['text-secondary'],
          }}>
            Participants
          </Text>
          <Text style={{
            fontSize: 14,
            fontFamily: getFontFamily('medium'),
            color: colors['text-primary'],
          }}>
            {selectedParticipantIds.length} participant{selectedParticipantIds.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>
    </View>
  );

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return watchedValues.name && watchedValues.category && watchedValues.date;
      case 2:
        return selectedParticipantIds.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const onNext = () => {
    const maxStep = isEditMode ? 1 : STEPS.length;
    if (currentStep < maxStep && isStepValid()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const onBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditMode && eventId && tournamentId) {
        updateEvent(tournamentId, eventId, {
          ...data,
          participantIds: selectedParticipantIds,
          status: new Date(data.date) > new Date() ? 'upcoming' : 'active',
        });
        router.back();
      } else if (tournamentId) {
        await addEvent(tournamentId, {
          ...data,
          participantIds: selectedParticipantIds,
          status: new Date(data.date) > new Date() ? 'upcoming' : 'active',
        });
        router.back();
      }
    } catch (error) {
      console.error('Error creating event:', error);
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
              title={isEditMode ? 'Save' : (currentStep === STEPS.length ? 'Save' : 'Next')}
              onPress={isEditMode ? handleSubmit(onSubmit) : (currentStep === STEPS.length ? handleSubmit(onSubmit) : onNext)}
              variant="primary"
              size="small"
              disabled={!canSave}
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
          {!isEditMode && renderStepIndicator()}

          {currentStep === 1 && renderStep1()}
          {!isEditMode && currentStep === 2 && renderStep2()}
          {!isEditMode && currentStep === 3 && renderStep3()}

          {/* Back button for multi-step (only show if not on first step) */}
          {!isEditMode && currentStep > 1 && (
            <TouchableOpacity
              onPress={onBack}
              style={{
                marginTop: 24,
                marginBottom: 20,
                paddingVertical: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{
                fontSize: 15,
                fontFamily: getFontFamily('medium'),
                color: colors['text-secondary'],
              }}>
                Back
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>

      </View>
    </SafeAreaView>
  );
}

