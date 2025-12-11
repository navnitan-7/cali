import React, { useState, useMemo, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, Pressable, Alert, Share, Platform, Animated, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../../stores/themeStore';
import { useColors } from '../../../utils/colors';
import { getFontFamily } from '../../../utils/fonts';
import { getCategoryGradient, getCategoryGlow } from '../../../utils/categoryHelpers';
import TabSwitch from '../../../components/ui/TabSwitch';
import FloatingActionButton from '../../../components/ui/FloatingActionButton';
import Button from '../../../components/ui/Button';
import { useEventStore } from '../../../stores/eventStore';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import Toast from '../../../components/ui/Toast';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = 280;

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const isDark = theme === 'dark';
  const colors = useColors(isDark);
  const insets = useSafeAreaInsets();
  const { getEvent, deleteEvent, generateJoinCode } = useEventStore();
  const [activeTab, setActiveTab] = useState('Participants');
  const [sortBy, setSortBy] = useState<'time' | 'reps' | 'both'>('both');
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const eventId = Array.isArray(id) ? id[0] : id;
  const event = eventId ? getEvent(eventId) : undefined;

  // Helper function to parse time string to seconds
  const parseTime = (timeStr: string): number => {
    if (!timeStr || typeof timeStr !== 'string') return Infinity;
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1]; // MM:SS
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2]; // HH:MM:SS
    }
    return Infinity;
  };

  // Calculate rankings based on sort option
  const rankedParticipants = useMemo(() => {
    if (!event || !event.participants) return [];
    
    let participants = [...event.participants];
    
    if (sortBy === 'reps') {
      participants = participants
        .filter(p => p.reps !== undefined)
        .sort((a, b) => (b.reps || 0) - (a.reps || 0));
    } else if (sortBy === 'time') {
      participants = participants
        .filter(p => p.time)
        .sort((a, b) => {
          const timeA = parseTime(a.time || '');
          const timeB = parseTime(b.time || '');
          return timeA - timeB;
        });
    } else {
      // Both: Show participants with either time or reps, sorted by combined score
      participants = participants
        .filter(p => p.time || p.reps !== undefined)
        .sort((a, b) => {
          // Prioritize participants with both metrics
          const aHasBoth = !!(a.time && a.reps !== undefined);
          const bHasBoth = !!(b.time && b.reps !== undefined);
          if (aHasBoth !== bHasBoth) return bHasBoth ? 1 : -1;
          
          // If both have time, sort by time
          if (a.time && b.time) {
            const timeA = parseTime(a.time);
            const timeB = parseTime(b.time);
            if (timeA !== timeB) return timeA - timeB;
          }
          
          // Then sort by reps
          return (b.reps || 0) - (a.reps || 0);
        });
    }
    
    return participants.map((p, index) => ({ ...p, rank: index + 1 }));
  }, [event, sortBy]);

  if (!event) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors['bg-surface'] }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors['text-primary'] }}>Event not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const participants = event.participants || [];

  const styles = StyleSheet.create({
    participantCard: {
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors['border-default'],
      backgroundColor: colors['bg-card'] + 'E6',
    },
    leaderboardCard: {
      borderRadius: 20,
      padding: 20,
      marginBottom: 16,
      borderWidth: 2,
      backgroundColor: colors['bg-card'] + 'E6',
      shadowColor: colors['bg-primary'],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    rankBadge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    activityItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors['border-default'],
    },
  });

  const renderParticipantsTab = () => (
    <View style={{ paddingBottom: insets.bottom + 100 }}>
      <View style={{ marginBottom: 16 }}>
        <Text style={{
          fontSize: 16,
          fontFamily: getFontFamily('semibold'),
          color: colors['text-secondary'],
          marginBottom: 12,
        }}>
          {participants.length} Participants
        </Text>
      </View>

      {participants.length === 0 ? (
        <View style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 40,
        }}>
          <Ionicons name="people-outline" size={48} color={colors['text-muted']} />
          <Text style={{
            fontSize: 16,
            fontFamily: getFontFamily('semibold'),
            color: colors['text-secondary'],
            marginTop: 16,
          }}>
            No participants yet
          </Text>
          <Text style={{
            fontSize: 14,
            fontFamily: getFontFamily('regular'),
            color: colors['text-muted'],
            marginTop: 8,
          }}>
            Add a participant to get started
          </Text>
        </View>
      ) : (
        participants.map((participant) => (
          <TouchableOpacity
            key={participant.id}
            activeOpacity={0.85}
            onPress={() => router.push(`/(tabs)/events/participant/${participant.id}?eventId=${eventId}` as any)}
            style={{
              borderRadius: 20,
              overflow: 'hidden',
              backgroundColor: colors['bg-card'],
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
              marginBottom: 12,
            }}
          >
            <BlurView
              intensity={Platform.OS === 'ios' ? 60 : 40}
              tint={isDark ? 'dark' : 'light'}
              style={{
                backgroundColor: isDark 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(255, 255, 255, 0.7)',
                padding: 16,
                borderWidth: 1,
                borderColor: isDark 
                  ? 'rgba(255, 255, 255, 0.08)' 
                  : 'rgba(0, 0, 0, 0.05)',
                borderRadius: 20,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: colors['bg-primary'] + '20',
                  borderWidth: 2,
                  borderColor: colors['bg-primary'] + '40',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 14,
                }}>
                  <Ionicons name="person" size={28} color={colors['bg-primary']} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 18,
                    fontFamily: getFontFamily('bold'),
                    fontWeight: '700',
                    color: colors['text-primary'],
                    marginBottom: 4,
                  }}>
                    {participant.name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                    {participant.division && (
                      <View style={{
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 8,
                        backgroundColor: colors['bg-primary'] + '15',
                        marginRight: 8,
                        marginBottom: 4,
                      }}>
                        <Text style={{
                          fontSize: 11,
                          fontFamily: getFontFamily('semibold'),
                          color: colors['bg-primary'],
                        }}>
                          {participant.division}
                        </Text>
                      </View>
                    )}
                    {participant.weight && (
                      <Text style={{
                        fontSize: 13,
                        fontFamily: getFontFamily('medium'),
                        color: colors['text-secondary'],
                        marginBottom: 4,
                      }}>
                        {participant.weight} kg
                      </Text>
                    )}
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  {participant.reps !== undefined && (
                    <View style={{
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 12,
                      backgroundColor: colors['bg-primary'] + '20',
                      marginBottom: 4,
                    }}>
                      <Text style={{
                        fontSize: 14,
                        fontFamily: getFontFamily('bold'),
                        color: colors['bg-primary'],
                      }}>
                        {participant.reps} reps
                      </Text>
                    </View>
                  )}
                  {participant.time && (
                    <View style={{
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 12,
                      backgroundColor: colors['bg-primary'] + '20',
                    }}>
                      <Text style={{
                        fontSize: 14,
                        fontFamily: getFontFamily('bold'),
                        color: colors['bg-primary'],
                      }}>
                        {participant.time}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {(participant.videos && participant.videos.length > 0) && (
                <View style={{ 
                  marginTop: 12, 
                  flexDirection: 'row', 
                  alignItems: 'center',
                  paddingTop: 12,
                  borderTopWidth: 1,
                  borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                }}>
                  <Ionicons name="videocam" size={16} color={colors['bg-primary']} />
                  <Text style={{
                    fontSize: 13,
                    fontFamily: getFontFamily('medium'),
                    color: colors['text-secondary'],
                    marginLeft: 6,
                  }}>
                    {participant.videos.length} video{participant.videos.length > 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </BlurView>
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  const renderLeaderboardTab = () => (
    <View style={{ paddingBottom: insets.bottom + 100 }}>
      {/* Sort By Selector */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <Text style={{
          fontSize: 18,
          fontFamily: getFontFamily('bold'),
          color: colors['text-primary'],
        }}>
          Top 3
        </Text>
        <View style={{ position: 'relative', zIndex: 1000 }}>
          <TouchableOpacity
            onPress={() => setShowSortMenu(!showSortMenu)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: colors['border-default'],
              backgroundColor: colors['bg-card'] + 'E6',
            }}
          >
            <Text style={{
              fontSize: 14,
              fontFamily: getFontFamily('medium'),
              color: colors['text-primary'],
              marginRight: 6,
            }}>
              Sort by: {sortBy === 'time' ? 'Time' : sortBy === 'reps' ? 'Reps' : 'Both'}
            </Text>
            <Ionicons name={showSortMenu ? "chevron-up" : "chevron-down"} size={16} color={colors['text-secondary']} />
          </TouchableOpacity>
          
          {showSortMenu && (
            <View style={{
              position: 'absolute',
              top: 40,
              right: 0,
              backgroundColor: colors['bg-card'],
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors['border-default'],
              minWidth: 140,
              shadowColor: colors['bg-primary'],
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 8,
              zIndex: 1001,
            }}>
                <TouchableOpacity
                  onPress={() => {
                    setSortBy('time');
                    setShowSortMenu(false);
                  }}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: colors['border-default'],
                    backgroundColor: sortBy === 'time' ? colors['bg-primary'] + '10' : 'transparent',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{
                    fontSize: 14,
                    fontFamily: getFontFamily('medium'),
                    color: sortBy === 'time' ? colors['bg-primary'] : colors['text-primary'],
                  }}>
                    Time
                  </Text>
                  {sortBy === 'time' && (
                    <Ionicons name="checkmark" size={18} color={colors['bg-primary']} style={{ marginLeft: 8 }} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setSortBy('reps');
                    setShowSortMenu(false);
                  }}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: colors['border-default'],
                    backgroundColor: sortBy === 'reps' ? colors['bg-primary'] + '10' : 'transparent',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{
                    fontSize: 14,
                    fontFamily: getFontFamily('medium'),
                    color: sortBy === 'reps' ? colors['bg-primary'] : colors['text-primary'],
                  }}>
                    Reps
                  </Text>
                  {sortBy === 'reps' && (
                    <Ionicons name="checkmark" size={18} color={colors['bg-primary']} style={{ marginLeft: 8 }} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setSortBy('both');
                    setShowSortMenu(false);
                  }}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    backgroundColor: sortBy === 'both' ? colors['bg-primary'] + '10' : 'transparent',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{
                    fontSize: 14,
                    fontFamily: getFontFamily('medium'),
                    color: sortBy === 'both' ? colors['bg-primary'] : colors['text-primary'],
                  }}>
                    Both
                  </Text>
                  {sortBy === 'both' && (
                    <Ionicons name="checkmark" size={18} color={colors['bg-primary']} style={{ marginLeft: 8 }} />
                  )}
                </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* All Participants Leaderboard */}
      {rankedParticipants.length === 0 ? (
        <View style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 40,
        }}>
          <Ionicons name="trophy-outline" size={48} color={colors['text-muted']} />
          <Text style={{
            fontSize: 16,
            fontFamily: getFontFamily('semibold'),
            color: colors['text-secondary'],
            marginTop: 16,
          }}>
            No rankings yet
          </Text>
          <Text style={{
            fontSize: 14,
            fontFamily: getFontFamily('regular'),
            color: colors['text-muted'],
            marginTop: 8,
          }}>
            Add metrics to participants to see rankings
          </Text>
        </View>
      ) : (
        rankedParticipants.map((participant, index) => {
        const rankColors = [
          { bg: '#FFD700', glow: '#FFD700' }, // Gold
          { bg: '#C0C0C0', glow: '#C0C0C0' }, // Silver
          { bg: '#CD7F32', glow: '#CD7F32' }, // Bronze
        ];
        const isTopThree = index < 3;
        const rankColor = isTopThree ? rankColors[index] : { bg: colors['bg-primary'], glow: colors['bg-primary'] };

        return (
          <View
            key={participant.id}
            style={{
              borderRadius: 24,
              overflow: 'hidden',
              marginBottom: 12,
              shadowColor: isTopThree ? rankColor.glow : '#000',
              shadowOffset: { width: 0, height: isTopThree ? 8 : 4 },
              shadowOpacity: isTopThree ? 0.4 : 0.15,
              shadowRadius: isTopThree ? 20 : 12,
              elevation: isTopThree ? 12 : 8,
            }}
          >
            {isTopThree && (
              <LinearGradient
                colors={[
                  rankColor.bg + '20',
                  rankColor.bg + '10',
                  'transparent',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            )}
            
            <BlurView
              intensity={Platform.OS === 'ios' ? 70 : 50}
              tint={isDark ? 'dark' : 'light'}
              style={{
                backgroundColor: isDark 
                  ? 'rgba(255, 255, 255, 0.08)' 
                  : 'rgba(255, 255, 255, 0.8)',
                padding: 20,
                borderWidth: isTopThree ? 2 : 1,
                borderColor: isTopThree ? rankColor.bg + '60' : (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'),
                borderRadius: 24,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: isTopThree ? 64 : 48,
                  height: isTopThree ? 64 : 48,
                  borderRadius: isTopThree ? 32 : 24,
                  backgroundColor: isTopThree ? rankColor.bg + '30' : colors['bg-secondary'],
                  borderWidth: isTopThree ? 3 : 1,
                  borderColor: isTopThree ? rankColor.bg : colors['border-default'],
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                  shadowColor: isTopThree ? rankColor.glow : 'transparent',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: isTopThree ? 0.8 : 0,
                  shadowRadius: isTopThree ? 16 : 0,
                  elevation: isTopThree ? 8 : 0,
                }}>
                  <Text style={{
                    fontSize: isTopThree ? 24 : 18,
                    fontFamily: getFontFamily('bold'),
                    fontWeight: '800',
                    color: isTopThree ? rankColor.bg : colors['text-primary'],
                  }}>
                    {participant.rank || index + 1}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 22,
                    fontFamily: getFontFamily('bold'),
                    fontWeight: '800',
                    color: colors['text-primary'],
                    marginBottom: 6,
                  }}>
                    {participant.name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                    {participant.division && (
                      <View style={{
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 10,
                        backgroundColor: rankColor.bg + '20',
                        marginRight: 8,
                        marginBottom: 4,
                      }}>
                        <Text style={{
                          fontSize: 12,
                          fontFamily: getFontFamily('semibold'),
                          color: rankColor.bg,
                        }}>
                          {participant.division}
                        </Text>
                      </View>
                    )}
                    {participant.weight && (
                      <Text style={{
                        fontSize: 14,
                        fontFamily: getFontFamily('medium'),
                        color: colors['text-secondary'],
                        marginBottom: 4,
                      }}>
                        {participant.weight} kg
                      </Text>
                    )}
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  {sortBy === 'both' ? (
                    <View style={{ alignItems: 'flex-end' }}>
                      {participant.time && (
                        <View style={{
                          paddingHorizontal: isTopThree ? 12 : 10,
                          paddingVertical: isTopThree ? 6 : 4,
                          borderRadius: 12,
                          backgroundColor: isTopThree ? rankColor.bg + '25' : colors['bg-primary'] + '15',
                          marginBottom: 6,
                        }}>
                          <Text style={{
                            fontSize: isTopThree ? 18 : 14,
                            fontFamily: getFontFamily('bold'),
                            fontWeight: '700',
                            color: isTopThree ? rankColor.bg : colors['bg-primary'],
                          }}>
                            {participant.time}
                          </Text>
                        </View>
                      )}
                      {participant.reps !== undefined && (
                        <View style={{
                          paddingHorizontal: isTopThree ? 12 : 10,
                          paddingVertical: isTopThree ? 6 : 4,
                          borderRadius: 12,
                          backgroundColor: isTopThree ? rankColor.bg + '25' : colors['bg-primary'] + '15',
                        }}>
                          <Text style={{
                            fontSize: isTopThree ? 18 : 14,
                            fontFamily: getFontFamily('bold'),
                            fontWeight: '700',
                            color: isTopThree ? rankColor.bg : colors['bg-primary'],
                          }}>
                            {participant.reps} reps
                          </Text>
                        </View>
                      )}
                    </View>
                  ) : (
                    <View style={{
                      paddingHorizontal: isTopThree ? 14 : 12,
                      paddingVertical: isTopThree ? 8 : 6,
                      borderRadius: 14,
                      backgroundColor: isTopThree ? rankColor.bg + '25' : colors['bg-primary'] + '15',
                    }}>
                      <Text style={{
                        fontSize: isTopThree ? 26 : 18,
                        fontFamily: getFontFamily('bold'),
                        fontWeight: '800',
                        color: isTopThree ? rankColor.bg : colors['bg-primary'],
                      }}>
                        {sortBy === 'time' ? (participant.time || 'N/A') : `${participant.reps || 0} reps`}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </BlurView>
          </View>
        );
        })
      )}
    </View>
  );

  // Animated opacity for top gradient
  const topOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Animated opacity for bottom gradient
  const bottomOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { 
      useNativeDriver: false,
    }
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors['bg-surface'] }}>
      <Toast
        visible={toastVisible}
        message="Copied to clipboard!"
        onHide={() => setToastVisible(false)}
        isDark={isDark}
      />
      <View style={{ flex: 1 }}>
        {/* Sticky Header - Back and Menu */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingTop: Math.max(insets.top - 50, 15),
          paddingBottom: 12,
          zIndex: 20,
          backgroundColor: 'transparent',
        }}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              overflow: 'hidden',
            }}
          >
            <BlurView
              intensity={Platform.OS === 'ios' ? 80 : 60}
              tint={isDark ? 'dark' : 'light'}
              style={{
                flex: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 22,
              }}
            >
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </BlurView>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setMenuVisible(true)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              overflow: 'hidden',
            }}
          >
            <BlurView
              intensity={Platform.OS === 'ios' ? 80 : 60}
              tint={isDark ? 'dark' : 'light'}
              style={{
                flex: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 22,
              }}
            >
              <Ionicons name="ellipsis-horizontal" size={22} color="#FFFFFF" />
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Top Gradient Overlay */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 120,
            opacity: topOpacity,
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <LinearGradient
            colors={isDark 
              ? ['rgba(0, 0, 0, 0.95)', 'rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0)']
              : ['rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.2)', 'rgba(0, 0, 0, 0)']
            }
            locations={[0, 0.5, 1]}
            style={{
              flex: 1,
            }}
          />
        </Animated.View>

        {/* Bottom Gradient Overlay */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 100,
            opacity: bottomOpacity,
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <LinearGradient
            colors={isDark
              ? ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.95)']
              : ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.2)', 'rgba(0, 0, 0, 0.4)']
            }
            locations={[0, 0.5, 1]}
            style={{
              flex: 1,
            }}
          />
        </Animated.View>

        {/* Action Menu Modal */}
        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <Pressable
            style={{
              flex: 1,
              justifyContent: 'flex-start',
              alignItems: 'flex-end',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              paddingTop: 60,
              paddingRight: 16,
            }}
            onPress={() => setMenuVisible(false)}
          >
            <Pressable
              style={{
                backgroundColor: colors['bg-card'],
                borderRadius: 16,
                paddingVertical: 8,
                minWidth: 180,
                borderWidth: 1,
                borderColor: colors['border-default'],
                shadowColor: colors['bg-primary'],
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 12,
              }}
              onPress={(e) => e.stopPropagation()}
            >
              <TouchableOpacity
                onPress={async () => {
                  if (!event || !eventId) {
                    setMenuVisible(false);
                    Alert.alert('Error', 'Event not found');
                    return;
                  }
                  
                  // Generate join code if it doesn't exist
                  let joinCode = event.joinCode;
                  if (!joinCode) {
                    joinCode = generateJoinCode(eventId);
                  }
                  
                  const link = `repx://join/${joinCode}`;
                  
                  // Close menu immediately
                  setMenuVisible(false);
                  
                  // Copy to clipboard
                  try {
                    await Clipboard.setStringAsync(link);
                    setToastVisible(true);
                  } catch (error) {
                    console.error('Failed to copy to clipboard:', error);
                  }
                  
                  // Show share dialog - same as create event
                  try {
                    await Share.share({
                      message: `Join ${event.name}: ${link}`,
                      title: 'Join Event',
                    });
                  } catch (error) {
                    // Share dialog cancelled or failed, but link is already copied
                  }
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
              >
                <Ionicons name="share-outline" size={20} color={colors['text-primary']} />
                <Text style={{
                  fontSize: 16,
                  fontFamily: getFontFamily('medium'),
                  color: colors['text-primary'],
                  marginLeft: 12,
                }}>
                  Share Join Link
                </Text>
              </TouchableOpacity>
              <View style={{
                height: 1,
                backgroundColor: colors['border-default'],
                marginHorizontal: 8,
                marginVertical: 4,
              }} />
              <TouchableOpacity
                onPress={() => {
                  setMenuVisible(false);
                  setDeleteConfirmVisible(true);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
              >
                <Ionicons name="trash-outline" size={20} color={colors['text-danger']} />
                <Text style={{
                  fontSize: 16,
                  fontFamily: getFontFamily('medium'),
                  color: colors['text-danger'],
                  marginLeft: 12,
                }}>
                  Delete Event
                </Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>

        <ConfirmDialog
          visible={deleteConfirmVisible}
          title="Delete Event"
          message="Are you sure you want to delete this event? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          onConfirm={() => {
            if (eventId) {
              deleteEvent(eventId);
              setDeleteConfirmVisible(false);
              router.back();
            }
          }}
          onCancel={() => {
            setDeleteConfirmVisible(false);
          }}
        />

        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          {/* Premium Hero Section */}
          <View style={{ height: HERO_HEIGHT, marginBottom: 20, position: 'relative' }}>
            <LinearGradient
              colors={getCategoryGradient(event.category || 'Other', isDark) as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            
            <BlurView
              intensity={isDark ? 20 : 15}
              tint={isDark ? 'dark' : 'light'}
              style={[StyleSheet.absoluteFill, { opacity: 0.3 }]}
            />

            <View style={{ 
              flex: 1, 
              paddingTop: insets.top + 60, 
              paddingHorizontal: 20, 
              paddingBottom: 20,
              justifyContent: 'space-between',
            }}>
              {/* Category Tag */}
              <View style={{ alignSelf: 'flex-start' }}>
                <View style={{
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 20,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  shadowColor: getCategoryGlow(event.category || 'Other'),
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 12,
                  elevation: 4,
                }}>
                  <Text style={{
                    fontSize: 11,
                    fontFamily: getFontFamily('semibold'),
                    fontWeight: '700',
                    color: '#FFFFFF',
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                  }}>
                    {event.category || 'Event'}
                  </Text>
                </View>
              </View>

              {/* Event Name & Meta */}
              <View>
                <Text style={{
                  fontSize: 36,
                  fontFamily: getFontFamily('bold'),
                  fontWeight: '800',
                  color: '#FFFFFF',
                  letterSpacing: -1,
                  lineHeight: 42,
                  marginBottom: 12,
                  textShadowColor: 'rgba(0, 0, 0, 0.5)',
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 8,
                }} numberOfLines={2}>
                  {event.name}
                </Text>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="calendar" size={16} color="rgba(255, 255, 255, 0.9)" />
                    <Text style={{
                      fontSize: 14,
                      fontFamily: getFontFamily('medium'),
                      color: 'rgba(255, 255, 255, 0.9)',
                      marginLeft: 6,
                      textShadowColor: 'rgba(0, 0, 0, 0.3)',
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 4,
                    }}>
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                  </View>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="people" size={16} color="rgba(255, 255, 255, 0.9)" />
                    <Text style={{
                      fontSize: 14,
                      fontFamily: getFontFamily('medium'),
                      color: 'rgba(255, 255, 255, 0.9)',
                      marginLeft: 6,
                      textShadowColor: 'rgba(0, 0, 0, 0.3)',
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 4,
                    }}>
                      {event.participantCount || 0} {event.participantCount === 1 ? 'participant' : 'participants'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Content Section */}
          <View style={{ paddingHorizontal: 16 }}>

          {/* Event Info Card - Clickable to Edit */}
          <TouchableOpacity
            onPress={() => {
              router.push(`/(tabs)/events/create?eventId=${eventId}` as any);
            }}
            activeOpacity={0.7}
            style={{
              borderRadius: 16,
              padding: 16,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: colors['border-default'],
              backgroundColor: colors['bg-card'] + 'E6',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{
                fontSize: 18,
                fontFamily: getFontFamily('bold'),
                color: colors['text-primary'],
                flex: 1,
              }}>
                Event Details
              </Text>
              <Ionicons name="create-outline" size={20} color={colors['text-secondary']} style={{ marginLeft: 8 }} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="people-outline" size={16} color={colors['text-secondary']} />
              <Text style={{
                fontSize: 14,
                fontFamily: getFontFamily('regular'),
                color: colors['text-secondary'],
                marginLeft: 6,
              }}>
                {event.participantCount || 0} Participants
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="layers-outline" size={16} color={colors['text-secondary']} />
              <Text style={{
                fontSize: 14,
                fontFamily: getFontFamily('regular'),
                color: colors['text-secondary'],
                marginLeft: 6,
              }}>
                {event.divisions?.join(', ') || 'No divisions'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="stats-chart-outline" size={16} color={colors['text-secondary']} />
              <Text style={{
                fontSize: 14,
                fontFamily: getFontFamily('regular'),
                color: colors['text-secondary'],
                marginLeft: 6,
              }}>
                {event.metrics?.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ') || 'No metrics'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Tabs */}
          <TabSwitch
            tabs={['Participants', 'Leaderboard']}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            style="scrollable"
          />

          {/* Tab Content */}
          <View style={{ marginTop: 20 }}>
            {activeTab === 'Participants' && renderParticipantsTab()}
            {activeTab === 'Leaderboard' && renderLeaderboardTab()}
          </View>
          </View>
        </ScrollView>
        
        {/* Overlay to close sort dropdown when clicking outside */}
        {showSortMenu && activeTab === 'Leaderboard' && (
          <Modal
            visible={showSortMenu}
            transparent
            animationType="none"
            onRequestClose={() => setShowSortMenu(false)}
          >
            <Pressable
              style={{ flex: 1 }}
              onPress={() => setShowSortMenu(false)}
            />
          </Modal>
        )}

        <FloatingActionButton
          onPress={() => {
            router.push(`/(tabs)/events/add-participant?eventId=${eventId}` as any);
          }}
          icon="person-add"
        />
      </View>
    </SafeAreaView>
  );
}
