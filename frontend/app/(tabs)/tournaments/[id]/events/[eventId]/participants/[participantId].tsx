import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Animated, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '@/stores/themeStore';
import { useColors } from '@/utils/colors';
import { getFontFamily } from '@/utils/fonts';
import { useTournamentStore, EventParticipantData } from '@/stores/tournamentStore';
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
  const [editingMetric, setEditingMetric] = useState<'time' | 'reps' | 'weight' | null>(null);
  const [tempTime, setTempTime] = useState('');
  const [tempReps, setTempReps] = useState('');
  const [tempWeight, setTempWeight] = useState('');
  
  // Stopwatch state
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [stopwatchPaused, setStopwatchPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // in milliseconds
  const [savedTime, setSavedTime] = useState(0); // saved time when paused
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

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

  // Get tournament accent color
  const accent = useMemo(() => {
    if (!tournament) return null;
    const baseAccent = getTournamentAccent(tournament.name, tournament.description);
    return isDark ? getTournamentAccentDark(baseAccent) : baseAccent;
  }, [tournament, isDark]);

  // Helper to get accent with opacity
  const getAccentWithOpacity = (opacity: number) => {
    if (!accent) return '';
    const hexOpacity = Math.round(opacity * 255).toString(16).padStart(2, '0');
    return accent.primary + hexOpacity;
  };

  // Format time from milliseconds to MM:SS or HH:MM:SS
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Parse time string to milliseconds
  const parseTimeToMs = (timeStr: string): number => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 2) {
      // MM:SS
      return (parts[0] * 60 + parts[1]) * 1000;
    } else if (parts.length === 3) {
      // HH:MM:SS
      return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
    }
    return 0;
  };

  // Stopwatch controls
  useEffect(() => {
    if (stopwatchRunning && !stopwatchPaused) {
      startTimeRef.current = Date.now() - savedTime;
      intervalRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTimeRef.current);
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [stopwatchRunning, stopwatchPaused, savedTime]);

  // Pulse animation for running stopwatch
  useEffect(() => {
    if (stopwatchRunning && !stopwatchPaused) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [stopwatchRunning, stopwatchPaused]);

  // Initialize saved time from eventData
  useEffect(() => {
    if (eventData?.time && !stopwatchRunning && elapsedTime === 0) {
      const ms = parseTimeToMs(eventData.time);
      setSavedTime(ms);
      setElapsedTime(ms);
    }
  }, [eventData?.time]);

  const handleStartStopwatch = () => {
    if (stopwatchPaused) {
      // Resume
      setStopwatchPaused(false);
      setStopwatchRunning(true);
    } else {
      // Start fresh or continue
      setStopwatchRunning(true);
      setStopwatchPaused(false);
    }
  };

  const handlePauseStopwatch = () => {
    setStopwatchPaused(true);
    setSavedTime(elapsedTime);
  };

  const handleStopStopwatch = () => {
    setStopwatchRunning(false);
    setStopwatchPaused(false);
    setSavedTime(elapsedTime);
    // Auto-save the time
    if (tournamentId && eventId && participantId && elapsedTime > 0) {
      const timeStr = formatTime(elapsedTime);
      updateEventParticipantData(tournamentId, eventId, participantId, {
        time: timeStr,
      });
      addEventParticipantAttempt(tournamentId, eventId, participantId, {
        type: 'metric',
        data: { time: timeStr },
      });
    }
  };

  const handleResetStopwatch = () => {
    setStopwatchRunning(false);
    setStopwatchPaused(false);
    setElapsedTime(0);
    setSavedTime(0);
  };

  if (!tournament || !event || !participant) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors['bg-surface'] }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors['text-primary'] }}>Participant not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSaveMetric = (type: 'time' | 'reps' | 'weight') => {
    if (!tournamentId || !eventId || !participantId) return;

    let value: string | number | undefined;
    if (type === 'time') {
      if (!tempTime.trim()) {
        Alert.alert('Error', 'Please enter a valid time');
        return;
      }
      value = tempTime;
    } else if (type === 'reps') {
      const repsNum = parseInt(tempReps);
      if (isNaN(repsNum) || repsNum < 0) {
        Alert.alert('Error', 'Please enter a valid number of reps');
        return;
      }
      value = repsNum;
    } else if (type === 'weight') {
      const weightNum = parseFloat(tempWeight);
      if (isNaN(weightNum) || weightNum < 0) {
        Alert.alert('Error', 'Please enter a valid weight');
        return;
      }
      value = weightNum;
    }

    updateEventParticipantData(tournamentId, eventId, participantId, {
      [type]: value,
    });

    addEventParticipantAttempt(tournamentId, eventId, participantId, {
      type: 'metric',
      data: { [type]: value },
    });

    setEditingMetric(null);
    setTempTime('');
    setTempReps('');
    setTempWeight('');
  };

  const handleAddVideo = () => {
    Alert.alert('Coming Soon', 'Video upload functionality will be available soon');
  };

  const renderMetricsTab = () => (
    <View style={{ paddingBottom: insets.bottom + 100 }}>
      {/* Time Metric with Stopwatch */}
      <View style={{
        borderRadius: 14,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: accent ? getAccentWithOpacity(0.2) : colors['border-default'],
        backgroundColor: colors['bg-card'],
        overflow: 'hidden',
      }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="time-outline" size={20} color={accent ? accent.primary : colors['bg-primary']} />
            <Text style={{
              fontSize: 16,
              fontFamily: getFontFamily('semibold'),
              color: colors['text-primary'],
              marginLeft: 8,
            }}>
              Time
            </Text>
          </View>
          {!editingMetric && !stopwatchRunning && (
            <TouchableOpacity 
              onPress={() => {
                setEditingMetric('time');
                setTempTime(eventData?.time || formatTime(elapsedTime || savedTime));
              }}
              style={{ padding: 4 }}
            >
              <Ionicons name="create-outline" size={18} color={colors['text-secondary']} />
            </TouchableOpacity>
          )}
        </View>

        {/* Stopwatch Display */}
        {!editingMetric ? (
          <View>
            <Animated.View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 24,
                paddingHorizontal: 16,
                marginBottom: 20,
                borderRadius: 12,
                backgroundColor: stopwatchRunning && !stopwatchPaused
                  ? (accent ? getAccentWithOpacity(0.08) : colors['bg-primary'] + '10')
                  : colors['bg-secondary'],
                transform: [{ scale: stopwatchRunning && !stopwatchPaused ? pulseAnim : 1 }],
              }}
            >
              <Text style={{
                fontSize: 48,
                fontFamily: getFontFamily('bold'),
                color: stopwatchRunning && !stopwatchPaused
                  ? (accent ? accent.primary : colors['bg-primary'])
                  : colors['text-primary'],
                letterSpacing: 2,
              }}>
                {formatTime(stopwatchRunning ? elapsedTime : (savedTime || parseTimeToMs(eventData?.time || '00:00')))}
              </Text>
              {stopwatchRunning && !stopwatchPaused && (
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  marginTop: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 12,
                  backgroundColor: accent ? getAccentWithOpacity(0.15) : colors['bg-primary'] + '20',
                }}>
                  <View style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: accent ? accent.primary : colors['bg-primary'],
                    marginRight: 6,
                  }} />
                  <Text style={{
                    fontSize: 12,
                    fontFamily: getFontFamily('medium'),
                    color: accent ? accent.primary : colors['bg-primary'],
                  }}>
                    Running
                  </Text>
                </View>
              )}
            </Animated.View>

            {/* Stopwatch Controls - Elegant Buttons */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              {!stopwatchRunning ? (
                <TouchableOpacity
                  onPress={handleStartStopwatch}
                  activeOpacity={0.8}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 16,
                    borderRadius: 14,
                    backgroundColor: colors['bg-primary'],
                    overflow: 'hidden',
                    shadowColor: colors['bg-primary'],
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 10,
                  }}>
                    <Ionicons name="play" size={16} color={isDark ? '#000' : '#FFF'} />
                  </View>
                  <Text style={{
                    fontSize: 16,
                    fontFamily: getFontFamily('semibold'),
                    color: isDark ? '#000' : '#FFF',
                  }}>
                    Start
                  </Text>
                </TouchableOpacity>
              ) : stopwatchPaused ? (
                <>
                  <TouchableOpacity
                    onPress={handleStartStopwatch}
                    activeOpacity={0.8}
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 16,
                      borderRadius: 14,
                      backgroundColor: colors['bg-primary'],
                      overflow: 'hidden',
                      shadowColor: colors['bg-primary'],
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <View style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 10,
                    }}>
                      <Ionicons name="play" size={16} color={isDark ? '#000' : '#FFF'} />
                    </View>
                    <Text style={{
                      fontSize: 16,
                      fontFamily: getFontFamily('semibold'),
                      color: isDark ? '#000' : '#FFF',
                    }}>
                      Resume
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleResetStopwatch}
                    activeOpacity={0.7}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 14,
                      borderWidth: 1.5,
                      borderColor: colors['border-default'],
                      backgroundColor: colors['bg-card'],
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="refresh" size={22} color={colors['text-primary']} />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={handlePauseStopwatch}
                    activeOpacity={0.7}
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 16,
                      borderRadius: 14,
                      borderWidth: 1.5,
                      borderColor: accent ? getAccentWithOpacity(0.3) : colors['border-default'],
                      backgroundColor: colors['bg-card'],
                    }}
                  >
                    <View style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: accent ? getAccentWithOpacity(0.1) : colors['bg-secondary'],
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 10,
                    }}>
                      <Ionicons 
                        name="pause" 
                        size={16} 
                        color={accent ? accent.primary : colors['text-primary']} 
                      />
                    </View>
                    <Text style={{
                      fontSize: 16,
                      fontFamily: getFontFamily('semibold'),
                      color: colors['text-primary'],
                    }}>
                      Pause
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleStopStopwatch}
                    activeOpacity={0.8}
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 16,
                      borderRadius: 14,
                      backgroundColor: colors['bg-primary'],
                      overflow: 'hidden',
                      shadowColor: colors['bg-primary'],
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <View style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 10,
                    }}>
                      <Ionicons name="stop" size={16} color={isDark ? '#000' : '#FFF'} />
                    </View>
                    <Text style={{
                      fontSize: 16,
                      fontFamily: getFontFamily('semibold'),
                      color: isDark ? '#000' : '#FFF',
                    }}>
                      Stop & Save
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Saved Time Display */}
            {eventData?.time && !stopwatchRunning && (
              <View style={{
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: colors['border-default'],
              }}>
                <Text style={{
                  fontSize: 12,
                  fontFamily: getFontFamily('regular'),
                  color: colors['text-secondary'],
                  marginBottom: 4,
                }}>
                  Saved Time
                </Text>
                <Text style={{
                  fontSize: 18,
                  fontFamily: getFontFamily('semibold'),
                  color: colors['text-primary'],
                }}>
                  {eventData.time}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View>
            <TimePicker
              value={tempTime || '00:00'}
              onChange={setTempTime}
              isDark={isDark}
              accentColor={accent?.primary}
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <Button
                title="Save"
                onPress={() => handleSaveMetric('time')}
                variant="primary"
                size="medium"
                style={{ flex: 1 }}
              />
              <Button
                title="Cancel"
                onPress={() => {
                  setEditingMetric(null);
                  setTempTime('');
                }}
                variant="outline"
                size="medium"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}
      </View>

      {/* Reps Metric */}
      <View style={{
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors['border-default'],
        backgroundColor: colors['bg-card'],
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="repeat-outline" size={18} color={accent ? accent.primary : colors['bg-primary']} />
            <Text style={{
              fontSize: 15,
              fontFamily: getFontFamily('medium'),
              color: colors['text-primary'],
              marginLeft: 8,
            }}>
              Reps
            </Text>
          </View>
          {!editingMetric && (
            <TouchableOpacity onPress={() => {
              setEditingMetric('reps');
              setTempReps(eventData?.reps?.toString() || '');
            }}>
              <Ionicons name="create-outline" size={18} color={colors['text-secondary']} />
            </TouchableOpacity>
          )}
        </View>
        {editingMetric === 'reps' ? (
          <View>
            <TextInput
              placeholder="Number of reps"
              placeholderTextColor={colors['text-secondary']}
              value={tempReps}
              onChangeText={setTempReps}
              keyboardType="numeric"
              style={{
                borderWidth: 1,
                borderColor: colors['border-default'],
                borderRadius: 8,
                padding: 10,
                color: colors['text-primary'],
                fontFamily: getFontFamily('regular'),
                backgroundColor: colors['bg-secondary'],
                marginBottom: 10,
                fontSize: 14,
              }}
            />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button
                title="Save"
                onPress={() => handleSaveMetric('reps')}
                variant="primary"
                size="small"
                style={{ flex: 1 }}
              />
              <Button
                title="Cancel"
                onPress={() => {
                  setEditingMetric(null);
                  setTempReps('');
                }}
                variant="outline"
                size="small"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        ) : (
          <Text style={{
            fontSize: 16,
            fontFamily: getFontFamily('semibold'),
            color: colors['text-primary'],
          }}>
            {eventData?.reps !== undefined ? `${eventData.reps} reps` : 'Not set'}
          </Text>
        )}
      </View>

      {/* Weight Metric */}
      <View style={{
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors['border-default'],
        backgroundColor: colors['bg-card'],
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="barbell-outline" size={18} color={accent ? accent.primary : colors['bg-primary']} />
            <Text style={{
              fontSize: 15,
              fontFamily: getFontFamily('medium'),
              color: colors['text-primary'],
              marginLeft: 8,
            }}>
              Weight
            </Text>
          </View>
          {!editingMetric && (
            <TouchableOpacity onPress={() => {
              setEditingMetric('weight');
              setTempWeight(eventData?.weight?.toString() || '');
            }}>
              <Ionicons name="create-outline" size={18} color={colors['text-secondary']} />
            </TouchableOpacity>
          )}
        </View>
        {editingMetric === 'weight' ? (
          <View>
            <TextInput
              placeholder="Weight in kg"
              placeholderTextColor={colors['text-secondary']}
              value={tempWeight}
              onChangeText={setTempWeight}
              keyboardType="decimal-pad"
              style={{
                borderWidth: 1,
                borderColor: colors['border-default'],
                borderRadius: 8,
                padding: 10,
                color: colors['text-primary'],
                fontFamily: getFontFamily('regular'),
                backgroundColor: colors['bg-secondary'],
                marginBottom: 10,
                fontSize: 14,
              }}
            />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button
                title="Save"
                onPress={() => handleSaveMetric('weight')}
                variant="primary"
                size="small"
                style={{ flex: 1 }}
              />
              <Button
                title="Cancel"
                onPress={() => {
                  setEditingMetric(null);
                  setTempWeight('');
                }}
                variant="outline"
                size="small"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        ) : (
          <Text style={{
            fontSize: 16,
            fontFamily: getFontFamily('semibold'),
            color: colors['text-primary'],
          }}>
            {eventData?.weight !== undefined ? `${eventData.weight} kg` : 'Not set'}
          </Text>
        )}
      </View>
    </View>
  );

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

  const renderActivityTab = () => (
    <View style={{ paddingBottom: insets.bottom + 100 }}>
      {eventData?.attempts && eventData.attempts.length > 0 ? (
        eventData.attempts
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .map((attempt) => (
            <View
              key={attempt.id}
              style={{
                borderRadius: 12,
                padding: 12,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: colors['border-default'],
                backgroundColor: colors['bg-card'],
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Ionicons 
                  name={
                    attempt.type === 'metric' ? 'stats-chart' :
                    attempt.type === 'video' ? 'videocam' :
                    'document-text'
                  } 
                  size={16} 
                  color={accent ? accent.primary : colors['bg-primary']} 
                />
                <Text style={{
                  fontSize: 13,
                  fontFamily: getFontFamily('medium'),
                  color: colors['text-primary'],
                  marginLeft: 8,
                  textTransform: 'capitalize',
                }}>
                  {attempt.type}
                </Text>
                <Text style={{
                  fontSize: 12,
                  fontFamily: getFontFamily('regular'),
                  color: colors['text-secondary'],
                  marginLeft: 'auto',
                }}>
                  {new Date(attempt.timestamp).toLocaleString()}
                </Text>
              </View>
              {attempt.data.time && (
                <Text style={{
                  fontSize: 13,
                  fontFamily: getFontFamily('regular'),
                  color: colors['text-secondary'],
                }}>
                  Time: {attempt.data.time}
                </Text>
              )}
              {attempt.data.reps !== undefined && (
                <Text style={{
                  fontSize: 13,
                  fontFamily: getFontFamily('regular'),
                  color: colors['text-secondary'],
                }}>
                  Reps: {attempt.data.reps}
                </Text>
              )}
              {attempt.data.weight !== undefined && (
                <Text style={{
                  fontSize: 13,
                  fontFamily: getFontFamily('regular'),
                  color: colors['text-secondary'],
                }}>
                  Weight: {attempt.data.weight} kg
                </Text>
              )}
              {attempt.data.note && (
                <Text style={{
                  fontSize: 13,
                  fontFamily: getFontFamily('regular'),
                  color: colors['text-secondary'],
                  marginTop: 4,
                }}>
                  {attempt.data.note}
                </Text>
              )}
            </View>
          ))
      ) : (
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
      )}
    </View>
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

          {/* Lightweight Tabs */}
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
    </SafeAreaView>
  );
}
