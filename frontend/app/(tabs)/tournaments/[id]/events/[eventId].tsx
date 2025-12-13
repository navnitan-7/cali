import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '../../../../../stores/themeStore';
import { useColors } from '../../../../../utils/colors';
import { getFontFamily } from '../../../../../utils/fonts';
import TabSwitch from '../../../../../components/ui/TabSwitch';
import { useTournamentStore } from '../../../../../stores/tournamentStore';
import ConfirmDialog from '../../../../../components/ui/ConfirmDialog';
import { getTournamentAccent, getTournamentAccentDark } from '../../../../../utils/tournamentAccent';

export default function EventDetailScreen() {
  const { id: tournamentId, eventId } = useLocalSearchParams<{ id: string; eventId: string }>();
  const theme = useTheme();
  const isDark = theme === 'dark';
  const colors = useColors(isDark);
  const insets = useSafeAreaInsets();
  const { 
    getTournament, 
    getEvent, 
    deleteEvent,
    getEventParticipantData,
    addEventParticipant,
  } = useTournamentStore();
  const [activeTab, setActiveTab] = useState('Participants');
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  const tournament = tournamentId ? getTournament(tournamentId) : undefined;
  const event = tournamentId && eventId ? getEvent(tournamentId, eventId) : undefined;

  // Get tournament accent color
  const accent = useMemo(() => {
    if (!tournament) return null;
    const baseAccent = getTournamentAccent(tournament.name, tournament.description);
    return isDark ? getTournamentAccentDark(baseAccent) : baseAccent;
  }, [tournament, isDark]);

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

  const [addParticipantModalVisible, setAddParticipantModalVisible] = useState(false);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);

  // Get available participants (not already in event)
  const availableParticipants = useMemo(() => {
    if (!tournament) return [];
    return tournament.participants.filter(p => !event.participantIds.includes(p.id));
  }, [tournament, event]);

  const handleAddParticipants = () => {
    if (!tournamentId || !eventId) return;
    selectedParticipantIds.forEach(participantId => {
      addEventParticipant(tournamentId, eventId, participantId);
    });
    setSelectedParticipantIds([]);
    setAddParticipantModalVisible(false);
  };

  const renderParticipantsTab = () => (
    <View style={{ paddingBottom: insets.bottom + 100 }}>
      {/* Add Participant Button */}
      {availableParticipants.length > 0 && (
        <TouchableOpacity
          onPress={() => setAddParticipantModalVisible(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 14,
            paddingHorizontal: 16,
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: accent ? accent.primary : colors['bg-primary'],
            borderStyle: 'dashed',
            backgroundColor: accent ? accent.primary + '08' : colors['bg-primary'] + '08',
            marginBottom: 16,
          }}
        >
          <Ionicons 
            name="add-circle-outline" 
            size={20} 
            color={accent ? accent.primary : colors['bg-primary']} 
          />
          <Text style={{
            fontSize: 15,
            fontFamily: getFontFamily('semibold'),
            color: accent ? accent.primary : colors['bg-primary'],
            marginLeft: 8,
          }}>
            Add Participants
          </Text>
        </TouchableOpacity>
      )}

      {eventParticipants.length === 0 ? (
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
            {availableParticipants.length > 0 ? 'No participants yet' : 'All participants added'}
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

    const topThree = leaderboard.slice(0, 3);
    const rest = leaderboard.slice(3);

    return (
      <View style={{ paddingBottom: insets.bottom + 100 }}>
        {/* Minimal Top 3 */}
        {topThree.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{
              fontSize: 14,
              fontFamily: getFontFamily('semibold'),
              color: colors['text-secondary'],
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}>
              Top 3
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end' }}>
              {topThree.map((participant, index) => {
                const rank = index + 1;
                const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
                const heights = [60, 50, 40];
                
                return (
                  <TouchableOpacity
                    key={participant.id}
                    onPress={() => router.push(`/(tabs)/tournaments/${tournamentId}/events/${eventId}/participants/${participant.id}` as any)}
                    style={{ alignItems: 'center', flex: 1 }}
                  >
                    <View style={{
                      width: 50,
                      height: heights[index],
                      borderRadius: 8,
                      backgroundColor: accent 
                        ? accent.primary + '10' 
                        : colors['bg-primary'] + '15',
                      borderWidth: 1.5,
                      borderColor: medalColors[index],
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 8,
                    }}>
                      <Ionicons name="trophy" size={16} color={medalColors[index]} />
                      <Text style={{
                        fontSize: 14,
                        fontFamily: getFontFamily('bold'),
                        color: medalColors[index],
                        marginTop: 2,
                      }}>
                        {rank}
                      </Text>
                    </View>
                    <Text style={{
                      fontSize: 13,
                      fontFamily: getFontFamily('medium'),
                      color: colors['text-primary'],
                      textAlign: 'center',
                      marginBottom: 2,
                    }} numberOfLines={1}>
                      {participant.name}
                    </Text>
                    {participant.primaryValue && (
                      <Text style={{
                        fontSize: 11,
                        fontFamily: getFontFamily('regular'),
                        color: colors['text-secondary'],
                      }}>
                        {participant.primaryValue}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Rest of participants - minimal list */}
        {rest.length > 0 && (
          <View>
            <Text style={{
              fontSize: 14,
              fontFamily: getFontFamily('semibold'),
              color: colors['text-secondary'],
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}>
              Rankings
            </Text>
            {rest.map((participant) => (
              <TouchableOpacity
                key={participant.id}
                activeOpacity={0.7}
                onPress={() => router.push(`/(tabs)/tournaments/${tournamentId}/events/${eventId}/participants/${participant.id}` as any)}
                style={{
                  backgroundColor: colors['bg-card'],
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 6,
                  borderWidth: 1,
                  borderColor: colors['border-default'],
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <View style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: accent 
                    ? accent.primary + '15' 
                    : colors['bg-primary'] + '15',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}>
                  <Text style={{
                    fontSize: 12,
                    fontFamily: getFontFamily('semibold'),
                    color: colors['bg-primary'],
                  }}>
                    {participant.rank}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 14,
                    fontFamily: getFontFamily('medium'),
                    color: colors['text-primary'],
                  }}>
                    {participant.name}
                  </Text>
                </View>
                {participant.primaryValue && (
                  <Text style={{
                    fontSize: 13,
                    fontFamily: getFontFamily('medium'),
                    color: colors['text-secondary'],
                  }}>
                    {participant.primaryValue}
                  </Text>
                )}
                <Ionicons name="chevron-forward" size={16} color={colors['text-muted']} style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors['bg-surface'] }}>
      <View style={{ flex: 1 }}>
        {/* Event Header with Accent */}
        <View style={{
          position: 'relative',
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 16,
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
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: accent.primary + '06',
              opacity: 0.5,
            }} />
          )}
          
          <View style={{ flexDirection: 'row', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
              <Ionicons name="arrow-back" size={22} color={colors['text-primary']} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 18,
                fontFamily: getFontFamily('semibold'),
                color: colors['text-primary'],
              }} numberOfLines={1}>
                {event.name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 12 }}>
                <View style={{
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 4,
                  backgroundColor: accent 
                    ? accent.primary + '15' 
                    : colors['bg-primary'] + '15',
                }}>
                  <Text style={{
                    fontSize: 11,
                    fontFamily: getFontFamily('medium'),
                    color: accent ? accent.primary : colors['bg-primary'],
                  }}>
                    {event.category}
                  </Text>
                </View>
                <Text style={{
                  fontSize: 12,
                  fontFamily: getFontFamily('regular'),
                  color: colors['text-secondary'],
                }}>
                  {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setMenuVisible(true)}>
              <Ionicons name="ellipsis-horizontal" size={20} color={colors['text-secondary']} />
            </TouchableOpacity>
          </View>
          
          {/* Accent border */}
          {accent && (
            <View style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 2,
              backgroundColor: accent.primary + '30',
            }} />
          )}
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Lightweight Tabs with Accent */}
          <TabSwitch
            tabs={['Participants', 'Leaderboard']}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            style="underline"
            accentColor={accent?.primary}
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
          onConfirm={() => {
            if (tournamentId && eventId) {
              deleteEvent(tournamentId, eventId);
              setDeleteConfirmVisible(false);
              router.back();
            }
          }}
          onCancel={() => {
            setDeleteConfirmVisible(false);
          }}
        />

        {/* Add Participants Modal */}
        <Modal
          visible={addParticipantModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setAddParticipantModalVisible(false)}
        >
          <Pressable
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'flex-end',
            }}
            onPress={() => setAddParticipantModalVisible(false)}
          >
            <Pressable
              style={{
                backgroundColor: colors['bg-card'],
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                maxHeight: '80%',
                paddingTop: 20,
                paddingBottom: insets.bottom + 20,
              }}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: colors['border-default'],
              }}>
                <Text style={{
                  fontSize: 18,
                  fontFamily: getFontFamily('semibold'),
                  color: colors['text-primary'],
                }}>
                  Add Participants
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setAddParticipantModalVisible(false);
                    setSelectedParticipantIds([]);
                  }}
                >
                  <Ionicons name="close" size={24} color={colors['text-primary']} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={{ maxHeight: 400 }}
                contentContainerStyle={{ padding: 16 }}
              >
                {availableParticipants.length === 0 ? (
                  <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                    <Ionicons name="checkmark-circle" size={48} color={colors['text-muted']} />
                    <Text style={{
                      fontSize: 15,
                      fontFamily: getFontFamily('medium'),
                      color: colors['text-secondary'],
                      marginTop: 12,
                    }}>
                      All participants are already added
                    </Text>
                  </View>
                ) : (
                  availableParticipants.map((participant) => {
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
                          padding: 14,
                          borderRadius: 12,
                          borderWidth: 1.5,
                          borderColor: isSelected
                            ? (accent ? accent.primary : colors['bg-primary'])
                            : colors['border-default'],
                          backgroundColor: isSelected
                            ? (accent ? accent.primary + '10' : colors['bg-primary'] + '10')
                            : colors['bg-card'],
                          marginBottom: 10,
                        }}
                      >
                        <View style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: isSelected
                            ? (accent ? accent.primary : colors['bg-primary'])
                            : colors['bg-secondary'],
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 12,
                        }}>
                          {isSelected ? (
                            <Ionicons 
                              name="checkmark" 
                              size={20} 
                              color={isDark ? '#000' : '#FFF'} 
                            />
                          ) : (
                            <Text style={{
                              fontSize: 16,
                              fontFamily: getFontFamily('semibold'),
                              color: colors['text-primary'],
                            }}>
                              {participant.name.charAt(0).toUpperCase()}
                            </Text>
                          )}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{
                            fontSize: 15,
                            fontFamily: getFontFamily('medium'),
                            color: colors['text-primary'],
                          }}>
                            {participant.name}
                          </Text>
                          {participant.weight && (
                            <Text style={{
                              fontSize: 12,
                              fontFamily: getFontFamily('regular'),
                              color: colors['text-secondary'],
                              marginTop: 2,
                            }}>
                              {participant.weight} kg
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>

              {selectedParticipantIds.length > 0 && (
                <View style={{
                  paddingHorizontal: 20,
                  paddingTop: 16,
                  borderTopWidth: 1,
                  borderTopColor: colors['border-default'],
                }}>
                  <TouchableOpacity
                    onPress={handleAddParticipants}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 14,
                      borderRadius: 12,
                      backgroundColor: colors['bg-primary'],
                    }}
                  >
                    <Ionicons name="add" size={20} color={isDark ? '#000' : '#FFF'} />
                    <Text style={{
                      fontSize: 16,
                      fontFamily: getFontFamily('semibold'),
                      color: isDark ? '#000' : '#FFF',
                      marginLeft: 8,
                    }}>
                      Add {selectedParticipantIds.length} Participant{selectedParticipantIds.length > 1 ? 's' : ''}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
