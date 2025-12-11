import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Modal, Pressable, Alert, Share } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../../stores/themeStore';
import { useColors } from '../../../utils/colors';
import { getFontFamily } from '../../../utils/fonts';
import Button from '../../../components/ui/Button';
import { FormTextInput } from '../../../components/commonInputComponents/FormTextInput';
import { FormSelectableButtons } from '../../../components/commonInputComponents/FormSelectableButtons';
import { eventSchema, eventDefaults, eventCategories, divisionOptions, metricOptions } from '../../../schemas/eventModal';
import { useEventStore } from '../../../stores/eventStore';
import DateSelector from '../../../components/ui/DateSelector';
import Toast from '../../../components/ui/Toast';
import { useEffect } from 'react';

type FormData = typeof eventDefaults;
type ParticipantEntry = { name: string; weight?: string };

const STEPS = [
  { id: 1, title: 'Event Details' },
  { id: 2, title: 'Metrics Setup' },
  { id: 3, title: 'Add Participants' },
  { id: 4, title: 'Review & Create' },
];

export default function CreateEventScreen() {
  const { eventId } = useLocalSearchParams<{ eventId?: string }>();
  const theme = useTheme();
  const isDark = theme === 'dark';
  const colors = useColors(isDark);
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(1);
  const [participants, setParticipants] = useState<ParticipantEntry[]>([]);
  const [joinLink, setJoinLink] = useState('');
  const [newParticipantName, setNewParticipantName] = useState('');
  const [newParticipantWeight, setNewParticipantWeight] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const isEditMode = !!eventId;
  const { getEvent } = useEventStore();
  const existingEvent = eventId ? getEvent(eventId) : undefined;

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: eventDefaults,
  });

  // Pre-fill form when editing
  useEffect(() => {
    if (isEditMode && existingEvent) {
      reset({
        name: existingEvent.name,
        date: existingEvent.date,
        category: existingEvent.category,
        divisions: existingEvent.divisions || [],
        metrics: existingEvent.metrics || [],
      });
    }
  }, [isEditMode, existingEvent, reset]);

  const watchedValues = watch();

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
    // In edit mode, only show 2 steps: Event Details and Metrics Setup
    const stepsToShow = isEditMode ? STEPS.slice(0, 2) : STEPS;
    
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
                    ? colors['bg-primary'] + '30'
                    : 'transparent',
                  borderColor: isActive || isCompleted
                    ? colors['bg-primary']
                    : colors['border-default'],
                }
              ]}>
                {isCompleted ? (
                  <Ionicons name="checkmark" size={20} color={colors['bg-primary']} />
                ) : (
                  <Text style={{
                    fontSize: 14,
                    fontFamily: getFontFamily('semibold'),
                    color: isActive ? colors['bg-primary'] : colors['text-secondary'],
                  }}>
                    {step.id}
                  </Text>
                )}
              </View>
              <Text style={{
                fontSize: 10,
                fontFamily: getFontFamily('medium'),
                color: isActive ? colors['bg-primary'] : colors['text-secondary'],
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
                  backgroundColor: isCompleted ? colors['bg-primary'] : colors['border-default'],
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
      <FormTextInput
        control={control}
        name="name"
        label="Event Name"
        placeholder="Enter event name"
        isDark={isDark}
        required
        error={errors.name?.message}
      />
      <FormSelectableButtons
        control={control}
        name="category"
        label="Category"
        options={eventCategories}
        isDark={isDark}
        required
        error={errors.category?.message}
      />
      <View style={{ marginBottom: 24 }}>
        <Text style={{
          fontSize: 14,
          fontFamily: getFontFamily('medium'),
          color: colors['text-secondary'],
          marginBottom: 8,
        }}>
          Date {errors.date && <Text style={{ color: colors['text-danger'] }}>*</Text>}
        </Text>
        <Controller
          control={control}
          name="date"
          render={({ field: { onChange, value } }) => {
            const dateValue = value ? new Date(value + 'T00:00:00') : new Date();
            return (
              <>
                <TouchableOpacity
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: errors.date ? colors['border-danger'] : colors['border-default'],
                    paddingVertical: 12,
                  }}
                  onPress={() => {
                    const currentDate = value ? new Date(value + 'T00:00:00') : new Date();
                    setTempDate(currentDate);
                    setShowDatePicker(true);
                  }}
                >
                  <Text style={{
                    fontSize: 16,
                    fontFamily: getFontFamily('regular'),
                    color: value ? colors['text-primary'] : colors['text-secondary'],
                  }}>
                    {value ? new Date(value + 'T00:00:00').toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'Select date'}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && tempDate && (
                  <Modal
                    visible={showDatePicker}
                    transparent
                    animationType="slide"
                    onRequestClose={() => {
                      setShowDatePicker(false);
                      setTempDate(null);
                    }}
                  >
                    <Pressable
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        paddingHorizontal: 20,
                      }}
                      onPress={() => {
                        setShowDatePicker(false);
                        setTempDate(null);
                      }}
                    >
                      <Pressable
                        style={{
                          width: '100%',
                          maxWidth: 400,
                          backgroundColor: colors['bg-card'],
                          borderRadius: 20,
                          padding: 24,
                          borderWidth: 1,
                          borderColor: colors['border-default'],
                        }}
                        onPress={(e) => e.stopPropagation()}
                      >
                        <DateSelector
                          date={tempDate}
                          onDateChange={() => {}}
                          onDateSelect={(selectedDate) => {
                            if (selectedDate) {
                              const dateString = selectedDate.toISOString().split('T')[0];
                              onChange(dateString);
                              setShowDatePicker(false);
                              setTempDate(null);
                            }
                          }}
                        />
                      </Pressable>
                    </Pressable>
                  </Modal>
                )}
              </>
            );
          }}
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
          color: colors['text-secondary'],
          marginBottom: 8,
        }}>
          Divisions {errors.divisions && <Text style={{ color: colors['text-danger'] }}>*</Text>}
        </Text>
        <Controller
          control={control}
          name="divisions"
          render={({ field: { onChange, value } }) => (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {divisionOptions.map((division) => {
                const isSelected = value.includes(division);
                return (
                  <TouchableOpacity
                    key={division}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected
                          ? colors['bg-primary'] + '30'
                          : 'transparent',
                        borderColor: isSelected
                          ? colors['bg-primary']
                          : colors['border-default'],
                      }
                    ]}
                    onPress={() => {
                      if (isSelected) {
                        onChange(value.filter((d: string) => d !== division));
                      } else {
                        onChange([...value, division]);
                      }
                    }}
                  >
                    <Text style={{
                      fontSize: 14,
                      fontFamily: getFontFamily(isSelected ? 'semibold' : 'regular'),
                      color: isSelected ? colors['bg-primary'] : colors['text-primary'],
                    }}>
                      {division}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        />
        {errors.divisions && (
          <Text style={{
            fontSize: 12,
            fontFamily: getFontFamily('regular'),
            color: colors['text-danger'],
            marginTop: 4,
          }}>
            {errors.divisions.message}
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
        Metrics Setup
      </Text>
      <Text style={{
        fontSize: 14,
        fontFamily: getFontFamily('regular'),
        color: colors['text-secondary'],
        marginBottom: 20,
      }}>
        Select divisions and metrics for this event
      </Text>
      
      {/* Show participant count in edit mode */}
      {isEditMode && existingEvent && (
        <View style={{
          borderRadius: 12,
          padding: 16,
          backgroundColor: colors['bg-card'] + 'E6',
          borderWidth: 1,
          borderColor: colors['border-default'],
          marginBottom: 20,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="people-outline" size={20} color={colors['text-secondary']} style={{ marginRight: 8 }} />
              <Text style={{
                fontSize: 14,
                fontFamily: getFontFamily('semibold'),
                color: colors['text-primary'],
              }}>
                Participants
              </Text>
            </View>
            <Text style={{
              fontSize: 18,
              fontFamily: getFontFamily('bold'),
              color: colors['bg-primary'],
            }}>
              {existingEvent.participantCount || existingEvent.participants?.length || 0}
            </Text>
          </View>
        </View>
      )}
      
      <View style={{ marginBottom: 24 }}>
        <Text style={{
          fontSize: 14,
          fontFamily: getFontFamily('medium'),
          color: colors['text-secondary'],
          marginBottom: 8,
        }}>
          Divisions {errors.divisions && <Text style={{ color: colors['text-danger'] }}>*</Text>}
        </Text>
        <Controller
          control={control}
          name="divisions"
          render={({ field: { onChange, value } }) => (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {divisionOptions.map((division) => {
                const isSelected = value.includes(division);
                return (
                  <TouchableOpacity
                    key={division}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected
                          ? colors['bg-primary'] + '30'
                          : 'transparent',
                        borderColor: isSelected
                          ? colors['bg-primary']
                          : colors['border-default'],
                      }
                    ]}
                    onPress={() => {
                      if (isSelected) {
                        onChange(value.filter((d: string) => d !== division));
                      } else {
                        onChange([...value, division]);
                      }
                    }}
                  >
                    <Text style={{
                      fontSize: 14,
                      fontFamily: getFontFamily(isSelected ? 'semibold' : 'regular'),
                      color: isSelected ? colors['bg-primary'] : colors['text-primary'],
                    }}>
                      {division}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        />
        {errors.divisions && (
          <Text style={{
            fontSize: 12,
            fontFamily: getFontFamily('regular'),
            color: colors['text-danger'],
            marginTop: 4,
          }}>
            {errors.divisions.message}
          </Text>
        )}
      </View>
      
      <View style={{ marginBottom: 24 }}>
        <Text style={{
          fontSize: 14,
          fontFamily: getFontFamily('medium'),
          color: colors['text-secondary'],
          marginBottom: 16,
        }}>
          Select the metrics you want to track for this event
        </Text>
        <Controller
          control={control}
          name="metrics"
          render={({ field: { onChange, value } }) => (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {metricOptions.map((metric) => {
              const metricsValue = (value as string[]) || [];
              const isSelected = metricsValue.includes(metric.value);
              return (
                <TouchableOpacity
                  key={metric.value}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected
                        ? colors['bg-primary'] + '30'
                        : 'transparent',
                      borderColor: isSelected
                        ? colors['bg-primary']
                        : colors['border-default'],
                    }
                  ]}
                  onPress={() => {
                    const next = isSelected
                      ? metricsValue.filter((m) => m !== metric.value)
                      : [...metricsValue, metric.value];
                    onChange(next);
                  }}
                >
                  <Text style={{
                    fontSize: 14,
                    fontFamily: getFontFamily(isSelected ? 'semibold' : 'regular'),
                    color: isSelected ? colors['bg-primary'] : colors['text-primary'],
                  }}>
                    {metric.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      />
      {errors.metrics && (
        <Text style={{
          fontSize: 12,
          fontFamily: getFontFamily('regular'),
          color: colors['text-danger'],
          marginTop: 4,
        }}>
          {errors.metrics.message}
        </Text>
      )}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={{
        fontSize: 16,
        fontFamily: getFontFamily('semibold'),
        color: colors['text-primary'],
        marginBottom: 8,
      }}>
        Add Participants
      </Text>
      <Text style={{
        fontSize: 14,
        fontFamily: getFontFamily('regular'),
        color: colors['text-secondary'],
        marginBottom: 20,
      }}>
        Manually add participants or share a join link
      </Text>

      {/* Quick Add Participant Form */}
      <View style={{
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors['border-default'],
        backgroundColor: colors['bg-card'] + 'E6',
        padding: 12,
        marginBottom: 16,
      }}>
        <Text style={{
          fontSize: 13,
          fontFamily: getFontFamily('semibold'),
          color: colors['text-primary'],
          marginBottom: 8,
        }}>
          Add participant
        </Text>
        <TextInput
          placeholder="Name"
          placeholderTextColor={colors['text-secondary']}
          value={newParticipantName}
          onChangeText={setNewParticipantName}
          style={{
            borderWidth: 1,
            borderColor: colors['border-default'],
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 10,
            color: colors['text-primary'],
            marginBottom: 10,
            fontFamily: getFontFamily('regular'),
            backgroundColor: colors['bg-secondary'],
          }}
        />
        <TextInput
          placeholder="Weight (optional)"
          placeholderTextColor={colors['text-secondary']}
          value={newParticipantWeight}
          onChangeText={setNewParticipantWeight}
          keyboardType="numeric"
          style={{
            borderWidth: 1,
            borderColor: colors['border-default'],
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 10,
            color: colors['text-primary'],
            marginBottom: 12,
            fontFamily: getFontFamily('regular'),
            backgroundColor: colors['bg-secondary'],
          }}
        />
        <Button
          title="Add Participant"
          onPress={() => {
            if (!newParticipantName.trim()) return;
            setParticipants([
              ...participants,
              { name: newParticipantName.trim(), weight: newParticipantWeight.trim() || undefined },
            ]);
            setNewParticipantName('');
            setNewParticipantWeight('');
          }}
          variant="outline"
          fullWidth
          size="small"
        />
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
        <Button
          title="Share Join Link"
          onPress={async () => {
            // Generate a preview join code for display
            const previewCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            const link = `repx://join/${previewCode}`;
            setJoinLink(link);
            
            // Copy to clipboard
            await Clipboard.setStringAsync(link);
            
            // Show share dialog
            try {
              await Share.share({
                message: `Join this event: ${link}`,
                title: 'Join Event',
              });
            } catch (error) {
              // Share dialog cancelled or failed, but link is still copied
            }
            
            // Show toast
            setToastVisible(true);
          }}
          variant="outline"
          style={{ flex: 1 }}
        />
        {joinLink && (
          <TouchableOpacity
            onPress={async () => {
              await Clipboard.setStringAsync(joinLink);
              setToastVisible(true);
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: colors['border-default'],
              backgroundColor: colors['bg-secondary'],
            }}
          >
            <Ionicons name="copy-outline" size={18} color={colors['text-primary']} />
          </TouchableOpacity>
        )}
      </View>

      {joinLink && (
        <View style={{
          borderRadius: 12,
          padding: 16,
          backgroundColor: colors['bg-card'] + 'E6',
          borderWidth: 1,
          borderColor: colors['border-default'],
          marginBottom: 20,
        }}>
          <Text style={{
            fontSize: 12,
            fontFamily: getFontFamily('regular'),
            color: colors['text-secondary'],
            marginBottom: 8,
          }}>
            Join Link
          </Text>
          <Text style={{
            fontSize: 14,
            fontFamily: getFontFamily('medium'),
            color: colors['bg-primary'],
          }}>
            {joinLink}
          </Text>
        </View>
      )}


      {participants.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text style={{
            fontSize: 14,
            fontFamily: getFontFamily('semibold'),
            color: colors['text-primary'],
            marginBottom: 10,
          }}>
            Added Participants ({participants.length})
          </Text>
          {participants.map((participant, index) => (
            <View
              key={`${participant.name}-${index}`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors['border-default'],
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 14,
                  fontFamily: getFontFamily('semibold'),
                  color: colors['text-primary'],
                }}>
                  {participant.name}
                </Text>
                {participant.weight ? (
                  <Text style={{
                    fontSize: 12,
                    fontFamily: getFontFamily('regular'),
                    color: colors['text-secondary'],
                    marginTop: 2,
                  }}>
                    {participant.weight} kg
                  </Text>
                ) : null}
              </View>
              <TouchableOpacity
                onPress={() => {
                  setParticipants(participants.filter((_, i) => i !== index));
                }}
              >
                <Ionicons name="close-circle" size={20} color={colors['text-danger']} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderStep4 = () => (
    <View>
      <Text style={{
        fontSize: 18,
        fontFamily: getFontFamily('bold'),
        color: colors['text-primary'],
        marginBottom: 20,
      }}>
        {isEditMode ? 'Review & Update' : 'Review & Create'}
      </Text>

      <View style={styles.summaryCard}>
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
            marginTop: 2,
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
            marginTop: 2,
          }}>
            {watchedValues.date || 'N/A'}
          </Text>
        </View>
        <View style={{ marginBottom: 8 }}>
          <Text style={{
            fontSize: 12,
            fontFamily: getFontFamily('regular'),
            color: colors['text-secondary'],
          }}>
            Divisions
          </Text>
          <Text style={{
            fontSize: 14,
            fontFamily: getFontFamily('medium'),
            color: colors['text-primary'],
            marginTop: 2,
          }}>
            {watchedValues.divisions?.join(', ') || 'None'}
          </Text>
        </View>
        <View>
          <Text style={{
            fontSize: 12,
            fontFamily: getFontFamily('regular'),
            color: colors['text-secondary'],
          }}>
            Metrics
          </Text>
          <Text style={{
            fontSize: 14,
            fontFamily: getFontFamily('medium'),
            color: colors['text-primary'],
            marginTop: 2,
          }}>
            {watchedValues.metrics?.map(m => metricOptions.find(opt => opt.value === m)?.label).join(', ') || 'None'}
          </Text>
        </View>
      </View>
    </View>
  );

  // Validation for each step
  const isStepValid = () => {
    const values = watchedValues;
    switch (currentStep) {
      case 1:
        // Step 1: name, category, date, divisions required
        return !!(
          values.name?.trim() &&
          values.category &&
          values.date &&
          values.divisions &&
          values.divisions.length > 0
        );
      case 2:
        // Step 2: at least one metric required
        return !!(
          values.metrics &&
          Array.isArray(values.metrics) &&
          values.metrics.length > 0
        );
      case 3:
        // Step 3: participants are optional, always valid
        return true;
      case 4:
        // Step 4: review step, always valid
        return true;
      default:
        return false;
    }
  };

  const onNext = () => {
    const maxStep = isEditMode ? 2 : STEPS.length;
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

  const { addEvent, updateEvent, generateJoinCode } = useEventStore();

  const onSubmit = (data: FormData) => {
    if (isEditMode && eventId) {
      // Update existing event
      updateEvent(eventId, {
        ...data,
        participantCount: existingEvent?.participantCount || participants.length,
        status: new Date(data.date) > new Date() ? 'upcoming' : 'active',
      });
      console.log('Event updated:', eventId);
      router.back();
    } else {
      // Create new event
      const newEventId = addEvent({
        ...data,
        participantCount: participants.length,
        status: new Date(data.date) > new Date() ? 'upcoming' : 'active',
      });
      // Generate join code for the event (if not already generated)
      const joinCode = generateJoinCode(newEventId);
      console.log('Event created:', newEventId, 'Join code:', joinCode);
      router.back();
    }
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors['bg-surface'] }}>
      <Toast
        visible={toastVisible}
        message="Copied to clipboard!"
        onHide={() => setToastVisible(false)}
        isDark={isDark}
      />
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
          <TouchableOpacity onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color={colors['icon-primary']} />
          </TouchableOpacity>
          <Text style={{
            fontSize: 18,
            fontFamily: getFontFamily('bold'),
            color: colors['text-primary'],
          }}>
            {isEditMode ? 'Edit Event' : 'Create Event'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {renderStepIndicator()}

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 140 }}
        >
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {!isEditMode && currentStep === 3 && renderStep3()}
          {!isEditMode && currentStep === 4 && renderStep4()}
        </ScrollView>

        {/* Footer Buttons */}
        <View style={{
          flexDirection: 'row',
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 10,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: colors['border-default'],
          backgroundColor: colors['bg-surface'],
          gap: 10,
          marginBottom: 8,
        }}>
          {currentStep > 1 && (
            <Button
              title="Back"
              onPress={onBack}
              variant="outline"
              style={{ flex: 1 }}
            />
          )}
          {currentStep < (isEditMode ? 2 : STEPS.length) ? (
            <Button
              title="Next"
              onPress={onNext}
              variant="primary"
              style={{ flex: 1 }}
              disabled={!isStepValid()}
            />
          ) : (
            <Button
              title={isEditMode ? "Update Event" : "Create Event"}
              onPress={handleSubmit(onSubmit)}
              variant="primary"
              style={{ flex: 1 }}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
