import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Platform, ActivityIndicator, Switch, Modal, Pressable, FlatList, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '@/stores/themeStore';
import { useColors } from '@/utils/colors';
import { getFontFamily } from '@/utils/fonts';
import { useTournamentStore, EventParticipantData } from '@/stores/tournamentStore';
import { activityService, AddActivityData } from '@/services/activityService';
import { useActivityApi } from '@/hooks/useApiIntegration';
import { useEventTypesStore } from '@/stores/eventTypesStore';
import { ACTIVITY_FIELDS_BY_EVENT, MAX_ATTEMPTS_PER_EVENT, FIELD_LABELS, FIELD_ICONS } from '@/constants/activityFields';
import Button from '@/components/ui/Button';
import TabSwitch from '@/components/ui/TabSwitch';
import TimePicker from '@/components/ui/TimePicker';
import { getTournamentAccent, getTournamentAccentDark } from '@/utils/tournamentAccent';

export default function EventParticipantDetailScreen() {
  const { id: tournamentId, eventId, participantId } = useLocalSearchParams<{ 
    id: string; 
    eventId: string; 
    participantId: string;
  }>();
  const theme = useTheme();
  const isDark = theme === 'dark';
  const colors = useColors(isDark);
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('Metrics');
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [hasSyncedActivity, setHasSyncedActivity] = useState(false);
  const [editingAttemptId, setEditingAttemptId] = useState<string | null>(null);
  
  const { eventTypes } = useEventTypesStore();
  const { addActivity } = useActivityApi();

  const {
    getTournament,
    getEvent,
    getParticipant,
    getEventParticipantData,
    updateEventParticipantData,
    addEventParticipantVideo,
    addEventParticipantAttempt,
  } = useTournamentStore();

  const tournament = tournamentId ? getTournament(tournamentId) : undefined;
  const event = tournamentId && eventId ? getEvent(tournamentId, eventId) : undefined;
  const participant = tournamentId && participantId ? getParticipant(tournamentId, participantId) : undefined;
  const eventData = tournamentId && eventId && participantId 
    ? getEventParticipantData(tournamentId, eventId, participantId)
    : undefined;

  // Get event type ID from event category
  const eventTypeId = useMemo(() => {
    if (!event?.category || !eventTypes.length) return null;
    const eventType = eventTypes.find(et => et.name === event.category);
    return eventType?.id || null;
  }, [event?.category, eventTypes]);

  // Get required fields for this event type
  const requiredFields = useMemo(() => {
    if (!eventTypeId || !(eventTypeId in ACTIVITY_FIELDS_BY_EVENT)) return [];
    return ACTIVITY_FIELDS_BY_EVENT[eventTypeId];
  }, [eventTypeId]);

  // Get activity type from event (auto-populated, not editable)
  const activityType = useMemo(() => {
    return event?.category || event?.name || '';
  }, [event?.category, event?.name]);

  // Sync activity when Activity tab is opened (for future API integration)
  useEffect(() => {
    if (activeTab === 'Activity' && eventId && participantId && tournamentId) {
      // Future: Load activity from API here
      // setIsLoadingActivity(true);
      // activityService.getActivity(parseInt(eventId), parseInt(participantId))
      //   .then(activity => {
      //     setIsLoadingActivity(false);
      //   })
      //   .catch(error => {
      //     setIsLoadingActivity(false);
      //   });
    }
  }, [activeTab, eventId, participantId, tournamentId]);

  // Calculate next attempt_id based on existing attempts
  const getNextAttemptId = useMemo(() => {
    if (!eventTypeId) return 1;
    
    const maxAttempts = MAX_ATTEMPTS_PER_EVENT[eventTypeId] || 1;
    const existingAttemptIds = (eventData?.attempts || [])
      .filter(attempt => attempt.type === 'metric' && attempt.data.attempt_id !== undefined)
      .map(attempt => {
        const attemptId = attempt.data.attempt_id;
        return typeof attemptId === 'number' ? attemptId : parseInt(String(attemptId)) || 0;
      })
      .filter(id => id > 0);
    
    // Find the next available attempt_id starting from 1
    for (let i = 1; i <= maxAttempts; i++) {
      if (!existingAttemptIds.includes(i)) {
        return i;
      }
    }
    
    // If all attempts are used, return the next number
    const maxExistingId = existingAttemptIds.length > 0 ? Math.max(...existingAttemptIds) : 0;
    return Math.min(maxExistingId + 1, maxAttempts);
  }, [eventTypeId, eventData?.attempts]);

  // Initialize form values when modals open
  useEffect(() => {
    if (showMetricsModal || showAddActivityModal) {
      if (editingAttemptId) {
        // Pre-fill form with existing attempt data when editing
        const attemptToEdit = eventData?.attempts?.find(a => a.id === editingAttemptId);
          if (attemptToEdit && attemptToEdit.data) {
          const editData: Record<string, any> = {
            is_success: attemptToEdit.data.is_success !== undefined ? attemptToEdit.data.is_success : true,
          };
          
          if (attemptToEdit.data.attempt_id !== undefined) {
            editData.attempt_id = attemptToEdit.data.attempt_id;
          }
          if (attemptToEdit.data.time !== undefined) {
            // Convert time from seconds (number) to time string format if needed
            if (typeof attemptToEdit.data.time === 'number') {
              editData.time = secondsToTimeString(attemptToEdit.data.time);
            } else if (typeof attemptToEdit.data.time === 'string') {
              editData.time = attemptToEdit.data.time;
            }
          }
          if (attemptToEdit.data.weight !== undefined) {
            editData.weight = attemptToEdit.data.weight;
          }
          
          setFormValues(editData);
        }
      } else {
        // Initialize new form with default values
        const initialValues: Record<string, any> = {
          is_success: true,
          attempt_id: getNextAttemptId,
        };
        setFormValues(initialValues);
      }
    }
  }, [showMetricsModal, showAddActivityModal, editingAttemptId, eventData?.attempts, getNextAttemptId]);

  // Get tournament accent color
  const accent = useMemo(() => {
    if (!tournament) return null;
    const baseAccent = getTournamentAccent(tournament.name, tournament.description);
    return isDark ? getTournamentAccentDark(baseAccent) : baseAccent;
  }, [tournament, isDark]);

  if (!tournament || !event || !participant) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors['bg-surface'] }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors['text-primary'] }}>Participant not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSubmitForm = async () => {
    if (!tournamentId || !eventId || !participantId || !eventTypeId) return;

    // Validate required fields - check for empty strings and whitespace
    // Skip type_of_activity as it's auto-populated from event
    const validatedValues: Record<string, any> = {};
    for (const field of requiredFields) {
      if (field === 'type_of_activity') continue; // Skip type_of_activity as it's auto-populated from event
      
      const value = formValues[field];
      
      // Special handling for attempt_id - must be a valid number
      if (field === 'attempt_id') {
        if (value === undefined || value === null || value === '') {
          Alert.alert('Error', `${FIELD_LABELS[field]} is required`);
          return;
        }
        const attemptIdNum = typeof value === 'number' ? value : parseInt(value);
        if (isNaN(attemptIdNum)) {
          Alert.alert('Error', `${FIELD_LABELS[field]} must be a valid number`);
          return;
        }
        validatedValues[field] = attemptIdNum;
        continue;
      }
      
      const isEmpty = value === undefined || value === null || value === '' || 
                     (typeof value === 'string' && value.trim() === '');
      
      if (isEmpty) {
        Alert.alert('Error', `${FIELD_LABELS[field]} is required`);
        return;
      }
      
      // Store validated value (trimmed if string)
      validatedValues[field] = typeof value === 'string' ? value.trim() : value;
    }
    
    // Always include is_success with default true if not in requiredFields or not set
    if (!validatedValues.hasOwnProperty('is_success')) {
      validatedValues['is_success'] = formValues['is_success'] !== undefined 
        ? (formValues['is_success'] === true || formValues['is_success'] === 'true')
        : true; // Default to true
    }

    try {
      setIsSubmitting(true);

      // Prepare activity data for backend with all required fields
      // Use validated values for required fields, and formValues for optional fields
      // type_of_activity is automatically taken from event category/name
      const activityData: AddActivityData = {
        event_id: parseInt(eventId),
        participant_id: parseInt(participantId),
        attempt_id: requiredFields.includes('attempt_id')
          ? (typeof validatedValues['attempt_id'] === 'number' 
              ? validatedValues['attempt_id'] 
              : parseInt(validatedValues['attempt_id']))
          : Date.now(), // Fallback to auto-generate if not required
        // type_of_activity is automatically populated from event category/name
        type_of_activity: activityType || event?.name || '',
        weight: requiredFields.includes('weight')
          ? (typeof validatedValues['weight'] === 'number' 
              ? validatedValues['weight'] 
              : parseFloat(validatedValues['weight']))
          : (formValues['weight'] !== undefined && formValues['weight'] !== '' 
              ? (typeof formValues['weight'] === 'number' ? formValues['weight'] : parseFloat(formValues['weight']))
              : null),
        time: requiredFields.includes('time')
          ? (typeof validatedValues['time'] === 'string' 
              ? parseTimeToSeconds(validatedValues['time']) 
              : validatedValues['time'])
          : (formValues['time'] && formValues['time'] !== '00:00:000' && formValues['time'] !== '00:00:000:000'
              ? (typeof formValues['time'] === 'string' ? parseTimeToSeconds(formValues['time']) : formValues['time'])
              : null),
        is_success: requiredFields.includes('is_success')
          ? (validatedValues['is_success'] === true || validatedValues['is_success'] === 'true')
          : (formValues['is_success'] !== undefined 
              ? (formValues['is_success'] === true || formValues['is_success'] === 'true')
              : null),
        reps: null,
        is_deleted: false,
      };

      // Add activity to backend
      await addActivity(activityData);

      // Update local state
      const updateData: Record<string, any> = {};
      requiredFields.forEach(reqField => {
        if (reqField !== 'attempt_id' && reqField !== 'type_of_activity' && formValues[reqField] !== undefined) {
          updateData[reqField] = formValues[reqField];
        }
      });

      // Add type_of_activity to updateData if it's required (it's auto-populated)
      if (requiredFields.includes('type_of_activity')) {
        updateData.type_of_activity = activityType || event?.name || '';
      }

      updateEventParticipantData(tournamentId, eventId, participantId, updateData);

      // Prepare attempt data with all fields including type_of_activity and is_success
      const attemptData: Record<string, any> = { ...updateData };
      // Always include is_success (default to true if not set)
      attemptData.is_success = validatedValues['is_success'] !== undefined 
        ? (validatedValues['is_success'] === true || validatedValues['is_success'] === 'true')
        : (formValues['is_success'] !== undefined 
            ? (formValues['is_success'] === true || formValues['is_success'] === 'true')
            : true); // Default to true
      if (requiredFields.includes('type_of_activity')) {
        attemptData.type_of_activity = activityType || event?.name || '';
      }

      addEventParticipantAttempt(tournamentId, eventId, participantId, {
        type: 'metric',
        data: attemptData,
      });

      // Reset form and close modal
      setEditingAttemptId(null);
      setFormValues({});
      setIsSubmitting(false);
      setShowAddActivityModal(false);
      
      // Refresh activity list
      setHasSyncedActivity(false);
      
      Alert.alert('Success', 'Activity added successfully');
    } catch (error: any) {
      console.error('Error saving activity:', error);
      setIsSubmitting(false);
      Alert.alert('Error', error.message || 'Failed to add activity');
    }
  };

  // Helper to parse time string to seconds (with milliseconds/microseconds as decimal)
  const parseTimeToSeconds = (timeStr: string): number => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 2) {
      // MM:SS format
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      // Check if third part is hours (0-23) or milliseconds (0-999)
      if (parts[0] < 24 && parts[1] < 60 && parts[2] < 60) {
        // HH:MM:SS format
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else {
        // MM:SS:MS format - convert to seconds with milliseconds as decimal
        return parts[0] * 60 + parts[1] + parts[2] / 1000;
      }
    } else if (parts.length === 4) {
      // MM:SS:MS:US format - convert to seconds with microseconds as decimal
      return parts[0] * 60 + parts[1] + parts[2] / 1000 + parts[3] / 1000000;
    }
    return 0;
  };

  // Helper to convert seconds to time string format (MM:SS:MS:US)
  const secondsToTimeString = (seconds: number): string => {
    const totalSeconds = Math.floor(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    
    // Extract milliseconds and microseconds from decimal part
    const decimalPart = seconds - totalSeconds;
    const milliseconds = Math.floor(decimalPart * 1000);
    const microseconds = Math.floor((decimalPart * 1000 - milliseconds) * 1000);
    
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}:${microseconds.toString().padStart(3, '0')}`;
  };

  const handleAddVideo = () => {
    Alert.alert('Coming Soon', 'Video upload functionality will be available soon');
  };

  // Get metrics fields (time, weight, etc.) - exclude type_of_activity, but always include is_success
  const metricsFields = useMemo(() => {
    const fields = requiredFields.filter(f => f !== 'attempt_id' && f !== 'type_of_activity' && f !== 'is_success');
    // Always add is_success to metrics fields
    if (!fields.includes('is_success')) {
      fields.push('is_success');
    }
    return fields;
  }, [requiredFields]);

  // Get all activity fields (including attempt_id, is_success) - always include is_success
  const activityFields = useMemo(() => {
    const fields = requiredFields.filter(f => f !== 'type_of_activity'); // type_of_activity is auto-populated
    // Always add is_success to activity fields if not already present
    if (!fields.includes('is_success')) {
      fields.push('is_success');
    }
    return fields;
  }, [requiredFields]);



  // Render a single form field for metrics (time, weight, is_success)
  const renderMetricsField = (field: string) => {
    const iconName = FIELD_ICONS[field] || 'ellipse-outline';
    const label = FIELD_LABELS[field] || field;
    const isRequired = requiredFields.includes(field);

    return (
      <View key={field} style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Ionicons name={iconName as any} size={18} color={accent ? accent.primary : colors['bg-primary']} />
          <Text style={{
            fontSize: 14,
            fontFamily: getFontFamily('medium'),
            color: colors['text-primary'],
            marginLeft: 8,
          }}>
            {label} {isRequired && <Text style={{ color: colors['text-danger'] }}>*</Text>}
          </Text>
        </View>

        {field === 'time' ? (
          <TimePicker
            value={formValues[field] || '00:00:000:000'}
            onChange={(value) => setFormValues(prev => ({ ...prev, [field]: value }))}
            isDark={isDark}
            accentColor={accent?.primary}
            precision="microseconds"
          />
        ) : field === 'weight' ? (
          <TextInput
            placeholder="Weight in kg"
            placeholderTextColor={colors['text-secondary']}
            value={formValues[field]?.toString() || ''}
            onChangeText={(value) => setFormValues(prev => ({ ...prev, [field]: value }))}
            keyboardType="decimal-pad"
            style={{
              borderWidth: 1,
              borderColor: colors['border-default'],
              borderRadius: 8,
              padding: 12,
              color: colors['text-primary'],
              fontFamily: getFontFamily('regular'),
              backgroundColor: colors['bg-secondary'],
              fontSize: 14,
            }}
          />
        ) : field === 'is_success' ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Switch
              value={formValues[field] !== undefined ? (formValues[field] === true || formValues[field] === 'true') : true}
              onValueChange={(value) => setFormValues(prev => ({ ...prev, [field]: value }))}
              trackColor={{ false: colors['bg-secondary'], true: accent?.primary || colors['bg-primary'] }}
              thumbColor={(formValues[field] !== undefined ? (formValues[field] === true || formValues[field] === 'true') : true) ? '#fff' : colors['text-secondary']}
            />
            <Text style={{
              fontSize: 14,
              fontFamily: getFontFamily('regular'),
              color: colors['text-secondary'],
              marginLeft: 12,
            }}>
              {(formValues[field] !== undefined ? (formValues[field] === true || formValues[field] === 'true') : true) ? 'Success' : 'Failed'}
            </Text>
          </View>
        ) : null}
      </View>
    );
  };

  // Render a single form field for activity (all fields including attempt_id, is_success)
  const renderActivityField = (field: string) => {
    const iconName = FIELD_ICONS[field] || 'ellipse-outline';
    const label = FIELD_LABELS[field] || field;
    const isRequired = requiredFields.includes(field);

    return (
      <View key={field} style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Ionicons name={iconName as any} size={18} color={accent ? accent.primary : colors['bg-primary']} />
          <Text style={{
            fontSize: 14,
            fontFamily: getFontFamily('medium'),
            color: colors['text-primary'],
            marginLeft: 8,
          }}>
            {label} {isRequired && <Text style={{ color: colors['text-danger'] }}>*</Text>}
          </Text>
        </View>

        {field === 'attempt_id' ? (
          <TextInput
            placeholder="Attempt ID"
            placeholderTextColor={colors['text-secondary']}
            value={formValues[field]?.toString() || ''}
            onChangeText={(value) => setFormValues(prev => ({ ...prev, [field]: value }))}
            keyboardType="numeric"
            style={{
              borderWidth: 1,
              borderColor: colors['border-default'],
              borderRadius: 8,
              padding: 12,
              color: colors['text-primary'],
              fontFamily: getFontFamily('regular'),
              backgroundColor: colors['bg-secondary'],
              fontSize: 14,
            }}
          />
        ) : field === 'time' ? (
          <TimePicker
            value={formValues[field] || '00:00:000:000'}
            onChange={(value) => setFormValues(prev => ({ ...prev, [field]: value }))}
            isDark={isDark}
            accentColor={accent?.primary}
            precision="microseconds"
          />
        ) : field === 'weight' ? (
          <TextInput
            placeholder="Weight in kg"
            placeholderTextColor={colors['text-secondary']}
            value={formValues[field]?.toString() || ''}
            onChangeText={(value) => setFormValues(prev => ({ ...prev, [field]: value }))}
            keyboardType="decimal-pad"
            style={{
              borderWidth: 1,
              borderColor: colors['border-default'],
              borderRadius: 8,
              padding: 12,
              color: colors['text-primary'],
              fontFamily: getFontFamily('regular'),
              backgroundColor: colors['bg-secondary'],
              fontSize: 14,
            }}
          />
        ) : field === 'is_success' ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Switch
              value={formValues[field] === true || formValues[field] === 'true'}
              onValueChange={(value) => setFormValues(prev => ({ ...prev, [field]: value }))}
              trackColor={{ false: colors['bg-secondary'], true: accent?.primary || colors['bg-primary'] }}
              thumbColor={formValues[field] === true || formValues[field] === 'true' ? '#fff' : colors['text-secondary']}
            />
            <Text style={{
              fontSize: 14,
              fontFamily: getFontFamily('regular'),
              color: colors['text-secondary'],
              marginLeft: 12,
            }}>
              {formValues[field] === true || formValues[field] === 'true' ? 'Success' : 'Failed'}
            </Text>
          </View>
        ) : null}
      </View>
    );
  };

  const renderVideosTab = () => (
    <View style={{ paddingBottom: insets.bottom + 100 }}>
      <TouchableOpacity
        onPress={handleAddVideo}
        style={{
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: colors['border-default'],
          backgroundColor: colors['bg-card'],
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="videocam-outline" size={24} color={colors['text-secondary']} />
        <Text style={{
          fontSize: 14,
          fontFamily: getFontFamily('medium'),
          color: colors['text-primary'],
          marginTop: 8,
        }}>
          Add Video
        </Text>
        <Text style={{
          fontSize: 12,
          fontFamily: getFontFamily('regular'),
          color: colors['text-secondary'],
          marginTop: 2,
        }}>
          Upload participant attempt video
        </Text>
      </TouchableOpacity>

      {eventData?.videos && eventData.videos.length > 0 ? (
        eventData.videos.map((video) => (
          <View
            key={video.id}
            style={{
              borderRadius: 12,
              padding: 12,
              marginBottom: 8,
              borderWidth: 1,
              borderColor: colors['border-default'],
              backgroundColor: colors['bg-card'],
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Ionicons name="videocam" size={20} color={accent ? accent.primary : colors['bg-primary']} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{
                fontSize: 14,
                fontFamily: getFontFamily('medium'),
                color: colors['text-primary'],
              }}>
                {video.name || 'Video'}
              </Text>
              <Text style={{
                fontSize: 12,
                fontFamily: getFontFamily('regular'),
                color: colors['text-secondary'],
                marginTop: 2,
              }}>
                {new Date(video.uploadedAt).toLocaleDateString()}
              </Text>
            </View>
              <TouchableOpacity>
                <Ionicons name="play-circle" size={24} color={accent ? accent.primary : colors['bg-primary']} />
              </TouchableOpacity>
          </View>
        ))
      ) : (
        <View style={{ alignItems: 'center', paddingVertical: 30 }}>
          <Ionicons name="videocam-outline" size={32} color={colors['text-muted']} />
          <Text style={{
            fontSize: 13,
            fontFamily: getFontFamily('regular'),
            color: colors['text-secondary'],
            marginTop: 8,
          }}>
            No videos uploaded yet
          </Text>
        </View>
      )}
    </View>
  );

  // Memoized sorted attempts for performance
  const sortedAttempts = useMemo(() => {
    if (!eventData?.attempts || eventData.attempts.length === 0) return [];
    return [...eventData.attempts].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [eventData?.attempts]);

  // Memoized Activity Item Component for better performance
  const ActivityItem = React.memo(({ 
    item, 
    colors: itemColors, 
    accent: itemAccent, 
    isDark: itemIsDark,
    onEdit
  }: { 
    item: NonNullable<EventParticipantData['attempts']>[0];
    colors: ReturnType<typeof useColors>;
    accent: ReturnType<typeof getTournamentAccent> | null;
    isDark: boolean;
    onEdit: (attemptId: string) => void;
  }) => {
    const getTypeIcon = (type: string) => {
      switch (type) {
        case 'metric': return 'stats-chart';
        case 'video': return 'videocam';
        default: return 'document-text';
      }
    };

    return (
      <View
        style={{
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: itemColors['border-default'],
          backgroundColor: itemColors['bg-card'],
          shadowColor: itemIsDark ? '#000' : '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <View style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: itemAccent ? itemAccent.primary + '20' : itemColors['bg-primary'] + '20',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}>
            <Ionicons 
              name={getTypeIcon(item.type) as any} 
              size={18} 
              color={itemAccent ? itemAccent.primary : itemColors['bg-primary']} 
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 14,
              fontFamily: getFontFamily('semibold'),
              color: itemColors['text-primary'],
              textTransform: 'capitalize',
            }}>
              {item.type}
              {item.data.attempt_id && (
                <Text style={{ fontFamily: getFontFamily('regular'), color: itemColors['text-secondary'] }}>
                  {' '}(Attempt {item.data.attempt_id})
                </Text>
              )}
            </Text>
            <Text style={{
              fontSize: 11,
              fontFamily: getFontFamily('regular'),
              color: itemColors['text-secondary'],
              marginTop: 2,
            }}>
              {new Date(item.timestamp).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
          {item.type === 'metric' && (
            <TouchableOpacity
              onPress={() => onEdit(item.id)}
              style={{
                padding: 8,
                borderRadius: 8,
                backgroundColor: itemAccent ? itemAccent.primary + '20' : itemColors['bg-secondary'],
              }}
            >
              <Ionicons 
                name="create-outline" 
                size={20} 
                color={itemAccent ? itemAccent.primary : itemColors['bg-primary']} 
              />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={{
          borderTopWidth: 1,
          borderTopColor: itemColors['border-default'],
          paddingTop: 12,
          gap: 8,
        }}>
          {item.data.attempt_id !== undefined && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="pricetag-outline" size={14} color={itemColors['text-secondary']} style={{ marginRight: 8 }} />
              <Text style={{
                fontSize: 13,
                fontFamily: getFontFamily('medium'),
                color: itemColors['text-primary'],
              }}>
                Attempt ID: <Text style={{ fontFamily: getFontFamily('regular'), color: itemColors['text-secondary'] }}>{item.data.attempt_id}</Text>
              </Text>
            </View>
          )}
          {item.data.time && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="time-outline" size={14} color={itemColors['text-secondary']} style={{ marginRight: 8 }} />
              <Text style={{
                fontSize: 13,
                fontFamily: getFontFamily('medium'),
                color: itemColors['text-primary'],
              }}>
                Time: <Text style={{ fontFamily: getFontFamily('regular'), color: itemColors['text-secondary'] }}>{item.data.time}</Text>
              </Text>
            </View>
          )}
          {item.data.reps !== undefined && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="repeat-outline" size={14} color={itemColors['text-secondary']} style={{ marginRight: 8 }} />
              <Text style={{
                fontSize: 13,
                fontFamily: getFontFamily('medium'),
                color: itemColors['text-primary'],
              }}>
                Reps: <Text style={{ fontFamily: getFontFamily('regular'), color: itemColors['text-secondary'] }}>{item.data.reps}</Text>
              </Text>
            </View>
          )}
          {item.data.weight !== undefined && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="barbell-outline" size={14} color={itemColors['text-secondary']} style={{ marginRight: 8 }} />
              <Text style={{
                fontSize: 13,
                fontFamily: getFontFamily('medium'),
                color: itemColors['text-primary'],
              }}>
                Weight: <Text style={{ fontFamily: getFontFamily('regular'), color: itemColors['text-secondary'] }}>{item.data.weight} kg</Text>
              </Text>
            </View>
          )}
          {item.data.type_of_activity && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="list-outline" size={14} color={itemColors['text-secondary']} style={{ marginRight: 8 }} />
              <Text style={{
                fontSize: 13,
                fontFamily: getFontFamily('medium'),
                color: itemColors['text-primary'],
              }}>
                Type: <Text style={{ fontFamily: getFontFamily('regular'), color: itemColors['text-secondary'] }}>{item.data.type_of_activity}</Text>
              </Text>
            </View>
          )}
          {item.data.is_success !== undefined && (
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center',
              marginTop: 4,
            }}>
              <View style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: item.data.is_success 
                  ? (itemAccent ? itemAccent.primary + '20' : itemColors['text-success'] + '20')
                  : itemColors['text-danger'] + '20',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8,
              }}>
                <Ionicons 
                  name={item.data.is_success ? 'checkmark' : 'close'} 
                  size={12} 
                  color={item.data.is_success 
                    ? (itemAccent ? itemAccent.primary : itemColors['text-success'])
                    : itemColors['text-danger']
                  } 
                />
              </View>
              <Text style={{
                fontSize: 13,
                fontFamily: getFontFamily('medium'),
                color: itemColors['text-primary'],
              }}>
                {item.data.is_success ? 'Success' : 'Failed'}
              </Text>
            </View>
          )}
          {item.data.note && (
            <View style={{
              marginTop: 8,
              padding: 10,
              borderRadius: 8,
              backgroundColor: itemColors['bg-secondary'],
            }}>
              <Text style={{
                fontSize: 12,
                fontFamily: getFontFamily('regular'),
                color: itemColors['text-secondary'],
                fontStyle: 'italic',
              }}>
                {item.data.note}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  });

  // Render Metrics Tab
  const renderMetricsTab = () => {
    if (!eventTypeId || metricsFields.length === 0) {
      return (
        <View style={{ paddingBottom: insets.bottom + 100, alignItems: 'center', paddingVertical: 40 }}>
          <Ionicons name="stats-chart-outline" size={32} color={colors['text-muted']} />
          <Text style={{
            fontSize: 14,
            fontFamily: getFontFamily('medium'),
            color: colors['text-secondary'],
            marginTop: 12,
          }}>
            No metrics required for this event
          </Text>
        </View>
      );
    }

    return (
      <View style={{ paddingBottom: insets.bottom + 100 }}>
        <View style={{
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: colors['border-default'],
          backgroundColor: colors['bg-card'],
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="stats-chart" size={20} color={accent ? accent.primary : colors['bg-primary']} />
              <Text style={{
                fontSize: 16,
                fontFamily: getFontFamily('semibold'),
                color: colors['text-primary'],
                marginLeft: 8,
              }}>
                Metrics
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                requestAnimationFrame(() => {
                  setEditingAttemptId(null);
                  setShowMetricsModal(true);
                });
              }}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: accent ? accent.primary : colors['bg-primary'],
              }}
            >
              <Ionicons name="add" size={16} color={isDark ? '#000' : '#FFF'} />
              <Text style={{
                fontSize: 14,
                fontFamily: getFontFamily('medium'),
                color: isDark ? '#000' : '#FFF',
                marginLeft: 6,
              }}>
                Add Metric
              </Text>
            </TouchableOpacity>
          </View>

          {/* Current Metrics Display */}
          <View style={{
            borderWidth: 1,
            borderColor: colors['border-default'],
            borderRadius: 8,
            padding: 12,
              backgroundColor: colors['bg-secondary'],
            }}>
            {eventData?.time && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name="time-outline" size={16} color={colors['text-secondary']} style={{ marginRight: 8 }} />
                <Text style={{
                  fontSize: 14,
                  fontFamily: getFontFamily('medium'),
                  color: colors['text-primary'],
                }}>
                  Time: <Text style={{ fontFamily: getFontFamily('regular'), color: colors['text-secondary'] }}>{eventData.time}</Text>
                </Text>
              </View>
            )}
            {eventData?.weight !== undefined && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="barbell-outline" size={16} color={colors['text-secondary']} style={{ marginRight: 8 }} />
                <Text style={{
                  fontSize: 14,
                  fontFamily: getFontFamily('medium'),
                  color: colors['text-primary'],
                }}>
                  Weight: <Text style={{ fontFamily: getFontFamily('regular'), color: colors['text-secondary'] }}>{eventData.weight} kg</Text>
                </Text>
              </View>
            )}
            {!eventData?.time && !eventData?.weight && (
                <Text style={{
                fontSize: 13,
                fontFamily: getFontFamily('regular'),
                  color: colors['text-secondary'],
                fontStyle: 'italic',
                }}>
                No metrics recorded yet
                </Text>
            )}
              </View>
            </View>
      </View>
    );
  };

  // Render Activity Tab - Display Only (populated from Metrics and Videos)
  const renderActivityTab = () => {
    return (
      <View style={{ paddingBottom: insets.bottom + 100 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Ionicons name="list-outline" size={18} color={accent ? accent.primary : colors['bg-primary']} />
          <Text style={{
            fontSize: 16,
            fontFamily: getFontFamily('semibold'),
            color: colors['text-primary'],
            marginLeft: 8,
          }}>
            Activity History
          </Text>
          {sortedAttempts.length > 0 && (
            <View style={{
              marginLeft: 8,
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 12,
              backgroundColor: accent ? accent.primary + '20' : colors['bg-primary'] + '20',
            }}>
              <Text style={{
                fontSize: 11,
                fontFamily: getFontFamily('semibold'),
                color: accent ? accent.primary : colors['bg-primary'],
              }}>
                {sortedAttempts.length}
              </Text>
            </View>
          )}
        </View>

        {/* Activity History */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name="time-outline" size={18} color={accent ? accent.primary : colors['bg-primary']} />
          <Text style={{
              fontSize: 16,
            fontFamily: getFontFamily('semibold'),
              color: colors['text-primary'],
              marginLeft: 8,
          }}>
            Activity History
            </Text>
            {sortedAttempts.length > 0 && (
              <View style={{
                marginLeft: 8,
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 12,
                backgroundColor: accent ? accent.primary + '20' : colors['bg-primary'] + '20',
              }}>
                <Text style={{
                  fontSize: 11,
                  fontFamily: getFontFamily('semibold'),
                  color: accent ? accent.primary : colors['bg-primary'],
                }}>
                  {sortedAttempts.length}
          </Text>
              </View>
            )}
          </View>
        </View>

        {isLoadingActivity ? (
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 60,
          }}>
            <ActivityIndicator size="large" color={accent?.primary || colors['bg-primary']} />
            <Text style={{
              fontSize: 14,
              fontFamily: getFontFamily('medium'),
              color: colors['text-secondary'],
              marginTop: 12,
            }}>
              Loading activity...
            </Text>
          </View>
        ) : sortedAttempts.length > 0 ? (
          <FlatList
            data={sortedAttempts}
            renderItem={({ item }) => (
              <ActivityItem 
                item={item} 
                colors={colors}
                accent={accent}
                isDark={isDark}
                onEdit={(attemptId) => {
                  setEditingAttemptId(attemptId);
                  setShowMetricsModal(true);
                }}
              />
            )}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            removeClippedSubviews={true}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', paddingVertical: 30 }}>
                <Ionicons name="time-outline" size={32} color={colors['text-muted']} />
                  <Text style={{
                    fontSize: 13,
                    fontFamily: getFontFamily('regular'),
                    color: colors['text-secondary'],
                  marginTop: 8,
                  }}>
                  No activity recorded yet
                  </Text>
                </View>
            }
          />
        ) : (
          <View style={{ 
            alignItems: 'center', 
            paddingVertical: 40,
            paddingHorizontal: 20,
          }}>
            <View style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: colors['bg-secondary'],
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Ionicons name="time-outline" size={32} color={colors['text-muted']} />
            </View>
                  <Text style={{
              fontSize: 15,
              fontFamily: getFontFamily('semibold'),
              color: colors['text-primary'],
              marginBottom: 4,
                  }}>
              No activity yet
                  </Text>
                  <Text style={{
                    fontSize: 13,
                    fontFamily: getFontFamily('regular'),
                    color: colors['text-secondary'],
              textAlign: 'center',
                  }}>
              Start tracking activities by adding your first attempt
                  </Text>
          </View>
        )}
      </View>
    );
  };

  // Memoized metrics fields
  const memoizedMetricsFields = useMemo(() => {
    return metricsFields.map(field => renderMetricsField(field));
  }, [metricsFields, formValues, colors, accent, isDark]);

  // Memoized activity fields
  const memoizedActivityFields = useMemo(() => {
    return activityFields.map(field => renderActivityField(field));
  }, [activityFields, formValues, colors, accent, isDark]);


  // Handle Metrics Submit
  const handleSubmitMetrics = async () => {
    if (!tournamentId || !eventId || !participantId || !eventTypeId) return;

    const validatedValues: Record<string, any> = {};
    for (const field of metricsFields) {
      // Skip validation for is_success as it has a default value
      if (field === 'is_success') {
        validatedValues[field] = formValues[field] !== undefined 
          ? (formValues[field] === true || formValues[field] === 'true')
          : true; // Default to true
        continue;
      }
      
      const value = formValues[field];
      const isEmpty = value === undefined || value === null || value === '' || 
                     (typeof value === 'string' && value.trim() === '');
      
      if (isEmpty && requiredFields.includes(field)) {
        Alert.alert('Error', `${FIELD_LABELS[field]} is required`);
        return;
      }
      
      validatedValues[field] = typeof value === 'string' ? value.trim() : value;
    }

    try {
      setIsSubmitting(true);

      // Get attempt_id from form or use calculated next attempt_id
      const attemptId = validatedValues['attempt_id'] !== undefined
        ? (typeof validatedValues['attempt_id'] === 'number' 
            ? validatedValues['attempt_id'] 
            : parseInt(validatedValues['attempt_id']))
        : (formValues['attempt_id'] !== undefined
            ? (typeof formValues['attempt_id'] === 'number'
                ? formValues['attempt_id']
                : parseInt(formValues['attempt_id']))
            : getNextAttemptId);

      // Prepare activity data for backend
      const activityData: AddActivityData = {
        event_id: parseInt(eventId),
        participant_id: parseInt(participantId),
        attempt_id: attemptId,
        type_of_activity: activityType || event?.name || '',
        weight: validatedValues['weight'] ? parseFloat(validatedValues['weight']) : null,
        time: validatedValues['time'] ? parseTimeToSeconds(validatedValues['time']) : null,
        is_success: validatedValues['is_success'] !== undefined 
          ? (validatedValues['is_success'] === true || validatedValues['is_success'] === 'true')
          : (formValues['is_success'] !== undefined 
              ? (formValues['is_success'] === true || formValues['is_success'] === 'true')
              : true), // Default to true
        reps: null,
        is_deleted: false,
      };

      await addActivity(activityData);

      // Update local state
      const updateData: Record<string, any> = {};
      metricsFields.forEach(field => {
        if (formValues[field] !== undefined) {
          updateData[field] = formValues[field];
        }
      });
      // Always include is_success (default to true if not set)
      updateData.is_success = formValues['is_success'] !== undefined 
        ? (formValues['is_success'] === true || formValues['is_success'] === 'true')
        : true;

      updateEventParticipantData(tournamentId, eventId, participantId, updateData);
      addEventParticipantAttempt(tournamentId, eventId, participantId, {
        type: 'metric',
        data: updateData,
      });

      setEditingAttemptId(null);
      setFormValues({});
      setIsSubmitting(false);
      setShowMetricsModal(false);
      Alert.alert('Success', editingAttemptId ? 'Metric updated successfully' : 'Metric added successfully');
    } catch (error: any) {
      console.error('Error saving metric:', error);
      setIsSubmitting(false);
      Alert.alert('Error', error.message || 'Failed to add metric');
    }
  };

  // Render Metrics Modal
  const renderMetricsModal = () => (
    <Modal
      visible={showMetricsModal}
      transparent
      animationType="slide"
      onRequestClose={() => {
        if (!isSubmitting) {
          setShowMetricsModal(false);
          setFormValues({});
        }
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <Pressable
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
          onPress={() => {
            if (!isSubmitting) {
              setShowMetricsModal(false);
              setFormValues({});
            }
          }}
        >
          <Pressable
            style={{
              backgroundColor: colors['bg-card'],
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingTop: 20,
              paddingBottom: insets.bottom + 20,
              paddingHorizontal: 16,
              maxHeight: '90%',
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: 20,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="stats-chart" size={24} color={accent ? accent.primary : colors['bg-primary']} />
                  <Text style={{
                  fontSize: 18,
                  fontFamily: getFontFamily('semibold'),
                  color: colors['text-primary'],
                  marginLeft: 8,
                  }}>
                  {editingAttemptId ? 'Edit Metric' : 'Add Metric'}
                  </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (!isSubmitting) {
                    setShowMetricsModal(false);
                    setEditingAttemptId(null);
                    setFormValues({});
                  }
                }}
                disabled={isSubmitting}
              >
                <Ionicons name="close" size={24} color={colors['text-secondary']} />
              </TouchableOpacity>
          </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {memoizedMetricsFields}

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 20, marginBottom: 10 }}>
                <Button
                  title="Cancel"
                  onPress={() => {
                    if (!isSubmitting) {
                      setShowMetricsModal(false);
                      setEditingAttemptId(null);
                      setFormValues({});
                    }
                  }}
                  variant="outline"
                  size="medium"
                  disabled={isSubmitting}
                  style={{ flex: 1 }}
                />
                <Button
                  title={isSubmitting ? (editingAttemptId ? "Updating..." : "Adding...") : (editingAttemptId ? "Update Metric" : "Add Metric")}
                  onPress={handleSubmitMetrics}
                  variant="primary"
                  size="medium"
                  disabled={isSubmitting}
                  style={{ flex: 1 }}
                />
      </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
    );

  // Render Add Activity Modal
  const renderAddActivityModal = () => (
    <Modal
      visible={showAddActivityModal}
      transparent
      animationType="slide"
      onRequestClose={() => {
        if (!isSubmitting) {
          setShowAddActivityModal(false);
          setFormValues({});
        }
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <Pressable
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
        onPress={() => {
          if (!isSubmitting) {
            setShowAddActivityModal(false);
            setFormValues({});
          }
        }}
      >
        <Pressable
          style={{
            backgroundColor: colors['bg-card'],
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingTop: 20,
            paddingBottom: insets.bottom + 20,
            paddingHorizontal: 16,
            maxHeight: '90%',
          }}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: 20,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="add-circle" size={24} color={accent ? accent.primary : colors['bg-primary']} />
              <Text style={{
                fontSize: 18,
                fontFamily: getFontFamily('semibold'),
                color: colors['text-primary'],
                marginLeft: 8,
              }}>
                Add Activity
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                if (!isSubmitting) {
                  setShowAddActivityModal(false);
                  setFormValues({});
                }
              }}
              disabled={isSubmitting}
            >
              <Ionicons name="close" size={24} color={colors['text-secondary']} />
            </TouchableOpacity>
          </View>

          {/* Form Content */}
          <ScrollView 
            showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 20 }}
          >
              {memoizedActivityFields}

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 20, marginBottom: 10 }}>
              <Button
                title="Cancel"
                onPress={() => {
                  if (!isSubmitting) {
                    setShowAddActivityModal(false);
                    setFormValues({});
                  }
                }}
                variant="outline"
                size="medium"
                disabled={isSubmitting}
                style={{ flex: 1 }}
              />
              <Button
                title={isSubmitting ? "Adding..." : "Add Activity"}
                onPress={handleSubmitForm}
                variant="primary"
                size="medium"
                disabled={isSubmitting}
                style={{ flex: 1 }}
              />
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors['bg-surface'] }}>
      <View style={{ flex: 1 }}>
        {/* Minimal Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors['border-default'],
        }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={22} color={colors['text-primary']} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 17,
              fontFamily: getFontFamily('semibold'),
              color: colors['text-primary'],
            }} numberOfLines={1}>
              {participant.name}
            </Text>
            <Text style={{
              fontSize: 12,
              fontFamily: getFontFamily('regular'),
              color: colors['text-secondary'],
              marginTop: 2,
            }} numberOfLines={1}>
              {event.name}
            </Text>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Participant Info - Minimal */}
          <View style={{
            borderRadius: 12,
            padding: 12,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: colors['border-default'],
            backgroundColor: colors['bg-card'],
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: accent 
                ? accent.primary + '15' 
                : colors['bg-primary'] + '15',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}>
              <Text style={{
                fontSize: 16,
                fontFamily: getFontFamily('semibold'),
                color: accent ? accent.primary : colors['bg-primary'],
              }}>
                {participant.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 15,
                fontFamily: getFontFamily('medium'),
                color: colors['text-primary'],
                marginBottom: 2,
              }}>
                {participant.name}
              </Text>
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

          {/* Tabs */}
          <TabSwitch
            tabs={['Metrics', 'Videos', 'Activity']}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            style="underline"
          />

          {/* Tab Content */}
          <View style={{ marginTop: 12 }}>
            {activeTab === 'Metrics' && renderMetricsTab()}
            {activeTab === 'Videos' && renderVideosTab()}
            {activeTab === 'Activity' && renderActivityTab()}
          </View>
        </ScrollView>
      </View>

      {/* Add Metrics Modal */}
      {renderMetricsModal()}
      
      {/* Add Activity Modal */}
      {renderAddActivityModal()}
    </SafeAreaView>
  );
}
