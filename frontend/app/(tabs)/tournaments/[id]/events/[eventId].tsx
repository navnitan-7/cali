import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Pressable, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '../../../../../stores/themeStore';
import { useColors } from '../../../../../utils/colors';
import { getFontFamily } from '../../../../../utils/fonts';
import TabSwitch from '../../../../../components/ui/TabSwitch';
import { SkeletonContainer } from '../../../../../components/ui/Skeleton';
import { useTournamentStore } from '../../../../../stores/tournamentStore';
import ConfirmDialog from '../../../../../components/ui/ConfirmDialog';
import { getTournamentAccent, getTournamentAccentDark } from '../../../../../utils/tournamentAccent';

export default function EventDetailScreen() {
  const { id, eventId: eventIdParam } = useLocalSearchParams<{ id: string; eventId: string }>();
  const theme = useTheme();
  const isDark = theme === 'dark';
  const colors = useColors(isDark);
  const insets = useSafeAreaInsets();
  
  const tournamentId = Array.isArray(id) ? id[0] : id;
  const eventId = Array.isArray(eventIdParam) ? eventIdParam[0] : eventIdParam;
  const { 
    getTournament, 
    getEvent, 
    deleteEvent,
    getEventParticipantData,
    syncEventDetails,
    isLoadingEventDetails,
  } = useTournamentStore();
  const [activeTab, setActiveTab] = useState('Participants');
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const tournament = tournamentId ? getTournament(tournamentId) : undefined;
  const event = tournamentId && eventId ? getEvent(tournamentId, eventId) : undefined;

  // Track if initial load has happened for this event
  const initialLoadRef = useRef<string | null>(null);
  const hasLoadedEventDetailsRef = useRef(false);

  // Initialize ref on mount or when eventId changes
  useEffect(() => {
    const currentEventKey = tournamentId && eventId ? `${tournamentId}-${eventId}` : null;
    if (currentEventKey && initialLoadRef.current !== currentEventKey) {
      initialLoadRef.current = currentEventKey;
      hasLoadedEventDetailsRef.current = false;
    }
  }, [tournamentId, eventId]);

  // Initial load ONLY when event is first opened (chosen by user)
  useEffect(() => {
    const currentEventKey = tournamentId && eventId ? `${tournamentId}-${eventId}` : null;
    // Only load if this is a new event (different from previously loaded)
    // and we haven't loaded it yet in this session
    if (tournamentId && eventId && initialLoadRef.current === currentEventKey && !hasLoadedEventDetailsRef.current) {
      const { isLoadingEventDetails } = useTournamentStore.getState();
      // Only sync if not already loading this event (request deduplication)
      if (!isLoadingEventDetails[eventId]) {
        console.log('[EventDetailScreen] Event chosen - loading participants via by_event API...');
        syncEventDetails(tournamentId, eventId).then(() => {
          hasLoadedEventDetailsRef.current = true;
        }).catch(error => {
          console.error('[EventDetailScreen] Failed to sync event details:', error);
        });
      }
    }
  }, [tournamentId, eventId, syncEventDetails]);

  // Get tournament accent color
  const accent = useMemo(() => {
    if (!tournament) return null;
    const baseAccent = getTournamentAccent(tournament.name, tournament.description);
    return isDark ? getTournamentAccentDark(baseAccent) : baseAccent;
  }, [tournament, isDark]);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(() => {
    if (!tournamentId || !eventId) return;
    
    // Don't refresh if already loading
    const { isLoadingEventDetails } = useTournamentStore.getState();
    if (isLoadingEventDetails[eventId]) return;
    
    console.log('[EventDetailScreen] Pull to refresh - syncing event details...');
    // Force refresh on pull-to-refresh
    syncEventDetails(tournamentId, eventId, true).catch(error => {
      console.error('[EventDetailScreen] Failed to refresh event details:', error);
    });
  }, [tournamentId, eventId, syncEventDetails]);
  
  // Determine if currently refreshing
  const isRefreshing = isLoadingEventDetails[eventId] || false;

  // Get participants for this event with their event-specific data
  const eventParticipants = useMemo(() => {
    if (!tournament || !event) return [];
    return tournament.participants
      .filter(p => event.participantIds.includes(p.id))
      .map(p => ({
        ...p,
        eventData: getEventParticipantData(tournamentId!, eventId, p.id),
      }));
  }, [tournament, event, tournamentId, eventId, getEventParticipantData]);

  // Calculate leaderboard (ranked by best metrics)
  const leaderboard = useMemo(() => {
    if (!eventParticipants.length) return [];
    
    return eventParticipants
      .map(p => {
        const data = p.eventData;
        let score = 0;
        let primaryMetric: string | null = null;
        let primaryValue: string | number | null = null;

        if (data?.reps !== undefined) {
          score = data.reps;
          primaryMetric = 'reps';
          primaryValue = data.reps;
        } else if (data?.weight !== undefined) {
          score = data.weight;
          primaryMetric = 'weight';
          primaryValue = `${data.weight} kg`;
        } else if (data?.time) {
          const timeParts = data.time.split(':').map(Number);
          const seconds = timeParts.length === 2 
            ? timeParts[0] * 60 + timeParts[1]
            : timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
          score = -seconds;
          primaryMetric = 'time';
          primaryValue = data.time;
        }

        return {
          ...p,
          score,
          primaryMetric,
          primaryValue,
        };
      })
      .sort((a, b) => b.score - a.score)
      .map((p, index) => ({
        ...p,
        rank: index + 1,
      }));
  }, [eventParticipants]);

  if (!tournament || !event) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors['bg-surface'] }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors['text-primary'] }}>Event not found</Text>
        </View>
      </SafeAreaView>
    );
  }


  const renderParticipantsTab = () => {
    const isLoading = isLoadingEventDetails[eventId];
    
    return (
      <View style={{ paddingBottom: insets.bottom + 100 }}>
        {isLoading ? (
          <SkeletonContainer count={4} layout="participant" />
        ) : eventParticipants.length === 0 ? (
        <View style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 40,
        }}>
          <Ionicons name="people-outline" size={36} color={colors['text-muted']} />
          <Text style={{
            fontSize: 15,
            fontFamily: getFontFamily('medium'),
            color: colors['text-secondary'],
            marginTop: 12,
          }}>
            No participants yet
          </Text>
        </View>
      ) : (
        eventParticipants.map((participant) => {
          const eventData = participant.eventData;
          return (
            <TouchableOpacity
              key={participant.id}
              activeOpacity={0.7}
              onPress={() => router.push(`/(tabs)/tournaments/${tournamentId}/events/${eventId}/participants/${participant.id}` as any)}
              style={{
                backgroundColor: colors['bg-card'],
                borderRadius: 12,
                padding: 12,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: colors['border-default'],
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <View style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: accent 
                  ? accent.primary + '15' 
                  : colors['bg-primary'] + '15',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
                position: 'relative',
              }}>
                <Text style={{
                  fontSize: 14,
                  fontFamily: getFontFamily('semibold'),
                  color: accent ? accent.primary : colors['bg-primary'],
                }}>
                  {participant.name.charAt(0).toUpperCase()}
                </Text>
                {/* Accent dot indicator */}
                {accent && (
                  <View style={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: accent.primary,
                    borderWidth: 2,
                    borderColor: colors['bg-card'],
                  }} />
                )}
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
                {eventData && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                    {eventData.reps !== undefined && (
                      <View style={{
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4,
                        backgroundColor: accent 
                          ? accent.primary + '10' 
                          : colors['bg-primary'] + '10',
                      }}>
                        <Text style={{
                          fontSize: 11,
                          fontFamily: getFontFamily('medium'),
                          color: accent ? accent.primary : colors['bg-primary'],
                        }}>
                          {eventData.reps} reps
                        </Text>
                      </View>
                    )}
                    {eventData.weight !== undefined && (
                      <View style={{
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4,
                        backgroundColor: accent 
                          ? accent.primary + '10' 
                          : colors['bg-primary'] + '10',
                      }}>
                        <Text style={{
                          fontSize: 11,
                          fontFamily: getFontFamily('medium'),
                          color: accent ? accent.primary : colors['bg-primary'],
                        }}>
                          {eventData.weight} kg
                        </Text>
                      </View>
                    )}
                    {eventData.time && (
                      <View style={{
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4,
                        backgroundColor: accent 
                          ? accent.primary + '10' 
                          : colors['bg-primary'] + '10',
                      }}>
                        <Text style={{
                          fontSize: 11,
                          fontFamily: getFontFamily('medium'),
                          color: accent ? accent.primary : colors['bg-primary'],
                        }}>
                          {eventData.time}
                        </Text>
                      </View>
                    )}
                    {eventData.videos && eventData.videos.length > 0 && (
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4,
                        backgroundColor: accent 
                          ? accent.primary + '10' 
                          : colors['bg-primary'] + '10',
                      }}>
                        <Ionicons name="videocam" size={10} color={accent ? accent.primary : colors['bg-primary']} />
                        <Text style={{
                          fontSize: 11,
                          fontFamily: getFontFamily('medium'),
                          color: accent ? accent.primary : colors['bg-primary'],
                          marginLeft: 4,
                        }}>
                          {eventData.videos.length}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
              
              <Ionicons name="chevron-forward" size={18} color={colors['text-muted']} />
            </TouchableOpacity>
          );
        })
      )}
    </View>
    );
  };

  const renderLeaderboardTab = () => {
    if (leaderboard.length === 0) {
      return (
        <View style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 40,
        }}>
          <Ionicons name="trophy-outline" size={36} color={colors['text-muted']} />
          <Text style={{
            fontSize: 15,
            fontFamily: getFontFamily('medium'),
            color: colors['text-secondary'],
            marginTop: 12,
          }}>
            No rankings yet
          </Text>
        </View>
      );
    }

    const getRankBadgeStyle = (rank: number) => {
      if (rank === 1) {
        return {
          backgroundColor: '#FFD700' + (isDark ? '25' : '20'),
          borderColor: '#FFD700',
        };
      } else if (rank === 2) {
        return {
          backgroundColor: '#C0C0C0' + (isDark ? '25' : '20'),
          borderColor: '#C0C0C0',
        };
      } else if (rank === 3) {
        return {
          backgroundColor: '#CD7F32' + (isDark ? '25' : '20'),
          borderColor: '#CD7F32',
        };
      }
      return {
        backgroundColor: accent 
          ? accent.primary + '15' 
          : colors['bg-primary'] + '15',
        borderColor: colors['border-default'],
      };
    };

    const getRankTextColor = (rank: number) => {
      if (rank === 1) return '#FFD700';
      if (rank === 2) return '#C0C0C0';
      if (rank === 3) return '#CD7F32';
      return accent ? accent.primary : colors['bg-primary'];
    };

    return (
      <View style={{ paddingBottom: insets.bottom + 100 }}>
        {leaderboard.map((participant) => {
          const rankStyle = getRankBadgeStyle(participant.rank);
          const rankTextColor = getRankTextColor(participant.rank);
          const isTopThree = participant.rank <= 3;
          
          return (
            <TouchableOpacity
              key={participant.id}
              activeOpacity={0.7}
              onPress={() => router.push(`/(tabs)/tournaments/${tournamentId}/events/${eventId}/participants/${participant.id}` as any)}
              style={{
                backgroundColor: colors['bg-card'],
                borderRadius: 12,
                padding: 14,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: isTopThree ? rankStyle.borderColor : colors['border-default'],
                flexDirection: 'row',
                alignItems: 'center',
                borderLeftWidth: isTopThree ? 3 : 1,
                borderLeftColor: isTopThree ? rankStyle.borderColor : (accent ? accent.primary : colors['border-default']),
              }}
            >
              <View style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: rankStyle.backgroundColor,
                borderWidth: isTopThree ? 1.5 : 0,
                borderColor: rankStyle.borderColor,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
                position: 'relative',
              }}>
                {isTopThree ? (
                  <Ionicons 
                    name="trophy" 
                    size={18} 
                    color={rankTextColor} 
                  />
                ) : (
                  <Text style={{
                    fontSize: 14,
                    fontFamily: getFontFamily('semibold'),
                    color: rankTextColor,
                  }}>
                    {participant.rank}
                  </Text>
                )}
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
                {participant.primaryValue && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <Text style={{
                      fontSize: 12,
                      fontFamily: getFontFamily('regular'),
                      color: colors['text-secondary'],
                    }}>
                      {participant.primaryMetric === 'time' ? '⏱' : participant.primaryMetric === 'weight' ? '⚖' : '💪'}
                    </Text>
                    <Text style={{
                      fontSize: 12,
                      fontFamily: getFontFamily('medium'),
                      color: isTopThree ? rankTextColor : colors['text-secondary'],
                    }}>
                      {participant.primaryValue}
                    </Text>
                  </View>
                )}
              </View>
              
              <Ionicons name="chevron-forward" size={16} color={colors['text-muted']} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors['bg-surface'] }}>
      <View style={{ flex: 1 }}>
        {/* Event Header with Accent - Level 2: Medium prominence */}
        <View style={{
          position: 'relative',
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors['border-default'],
          overflow: 'hidden',
        }}>
          {/* Abstract accent background - Level 2: Single, smaller circle */}
          {accent && (
            <View style={{
              position: 'absolute',
              top: -25,
              right: -25,
              width: 85,
              height: 85,
              borderRadius: 42.5,
              backgroundColor: accent.primary + (isDark ? '10' : '15'),
            }} />
          )}
          
          <View style={{ flexDirection: 'row', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12, padding: 4 }}>
              <Ionicons name="arrow-back" size={22} color={colors['text-primary']} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 18,
                fontFamily: getFontFamily('semibold'),
                color: colors['text-primary'],
                letterSpacing: -0.3,
              }} numberOfLines={1}>
                {event.name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <View style={{
                  paddingHorizontal: 7,
                  paddingVertical: 3,
                  borderRadius: 5,
                  backgroundColor: accent 
                    ? accent.primary + '12' 
                    : colors['bg-primary'] + '12',
                }}>
                  <Text style={{
                    fontSize: 11,
                    fontFamily: getFontFamily('medium'),
                    color: accent ? accent.primary : colors['bg-primary'],
                    letterSpacing: 0.2,
                  }}>
                    {event.category}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={() => setMenuVisible(true)} style={{ padding: 4 }}>
              <Ionicons name="ellipsis-horizontal" size={20} color={colors['text-primary']} />
            </TouchableOpacity>
          </View>
          
          {/* Accent border - Level 2: More subtle */}
          {accent && (
            <View style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 2,
              backgroundColor: accent.primary + '28',
            }} />
          )}
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={accent?.primary || colors['bg-primary']}
            />
          }
        >
          {/* Lightweight Tabs with Accent */}
          <TabSwitch
            tabs={['Participants', 'Leaderboard']}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            style="underline"
            accentColor={accent?.primary}
            counts={[eventParticipants.length, undefined]}
          />

          {/* Subtle Accent Divider */}
          {accent && (
            <View style={{
              height: 1,
              backgroundColor: accent.primary + '15',
              marginHorizontal: 16,
              marginTop: -8,
              marginBottom: 8,
            }} />
          )}

          {/* Tab Content */}
          <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
            {activeTab === 'Participants' && renderParticipantsTab()}
            {activeTab === 'Leaderboard' && renderLeaderboardTab()}
          </View>
        </ScrollView>

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
              justifyContent: 'flex-end',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
            }}
            onPress={() => setMenuVisible(false)}
          >
            <Pressable
              style={{
                backgroundColor: colors['bg-card'],
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                paddingTop: 8,
                paddingBottom: insets.bottom + 8,
              }}
              onPress={(e) => e.stopPropagation()}
            >
              <TouchableOpacity
                onPress={() => {
                  setMenuVisible(false);
                  router.push(`/(tabs)/tournaments/${tournamentId}/events/create?eventId=${eventId}` as any);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                }}
              >
                <Ionicons name="create-outline" size={20} color={colors['text-primary']} />
                <Text style={{
                  fontSize: 16,
                  fontFamily: getFontFamily('regular'),
                  color: colors['text-primary'],
                  marginLeft: 12,
                }}>
                  Edit Event
                </Text>
              </TouchableOpacity>
              <View style={{
                height: 1,
                backgroundColor: colors['border-default'],
                marginHorizontal: 16,
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
                  paddingVertical: 14,
                }}
              >
                <Ionicons name="trash-outline" size={20} color={colors['text-danger']} />
                <Text style={{
                  fontSize: 16,
                  fontFamily: getFontFamily('regular'),
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
          loading={isDeleting}
          onConfirm={async () => {
            if (tournamentId && eventId) {
              setIsDeleting(true);
              try {
                await deleteEvent(tournamentId, eventId);
                setDeleteConfirmVisible(false);
                setIsDeleting(false);
                router.back();
              } catch (error: any) {
                console.error('Error deleting event:', error);
                setIsDeleting(false);
                setDeleteConfirmVisible(false);
                const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to delete event. Please try again.';
                Alert.alert('Cannot Delete Event', errorMessage);
              }
            }
          }}
          onCancel={() => {
            setDeleteConfirmVisible(false);
          }}
        />

      </View>
    </SafeAreaView>
  );
}
