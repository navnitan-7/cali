import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, Pressable, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '../../../../stores/themeStore';
import { useColors } from '../../../../utils/colors';
import { getFontFamily } from '../../../../utils/fonts';
import TabSwitch from '../../../../components/ui/TabSwitch';
import FloatingActionButton from '../../../../components/ui/FloatingActionButton';
import { SkeletonContainer } from '../../../../components/ui/Skeleton';
import { useTournamentStore } from '../../../../stores/tournamentStore';
import { getTournamentAccent, getTournamentAccentDark } from '../../../../utils/tournamentAccent';
import ConfirmDialog from '../../../../components/ui/ConfirmDialog';

export default function TournamentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const isDark = theme === 'dark';
  const colors = useColors(isDark);
  const insets = useSafeAreaInsets();
  const { getTournament, deleteTournament, syncEventsOnly, syncParticipantsOnly, isLoadingEvents, isLoadingParticipants } = useTournamentStore();
  const [activeTab, setActiveTab] = useState('Events');
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  
  const tournamentId = Array.isArray(id) ? id[0] : id;
  const tournament = tournamentId ? getTournament(tournamentId) : undefined;
  
  // Track if initial load has happened for this tournament
  const initialLoadRef = useRef<string | null>(null);
  const hasLoadedEventsRef = useRef(false);
  const hasLoadedParticipantsRef = useRef(false);

  // Initialize ref on mount or when tournamentId changes
  if (tournamentId && initialLoadRef.current !== tournamentId) {
    initialLoadRef.current = tournamentId;
    hasLoadedEventsRef.current = false;
    hasLoadedParticipantsRef.current = false;
  }

  // Initial load on first visit - Events tab
  useEffect(() => {
    if (activeTab === 'Events' && tournamentId && !hasLoadedEventsRef.current && initialLoadRef.current === tournamentId) {
      const { isLoadingEvents } = useTournamentStore.getState();
      // Only sync if not already loading (request deduplication)
      if (!isLoadingEvents) {
        console.log('[TournamentDetailScreen] First visit - loading events...');
        syncEventsOnly(tournamentId).then(() => {
          hasLoadedEventsRef.current = true;
        }).catch(error => {
          console.error('[TournamentDetailScreen] Failed to sync events:', error);
        });
      }
    }
  }, [activeTab, tournamentId, syncEventsOnly]);

  // Initial load on first visit - Participants tab
  useEffect(() => {
    if (activeTab === 'Participants' && tournamentId && !hasLoadedParticipantsRef.current && initialLoadRef.current === tournamentId) {
      const { isLoadingParticipants } = useTournamentStore.getState();
      // Only sync if not already loading (request deduplication)
      if (!isLoadingParticipants) {
        console.log('[TournamentDetailScreen] First visit - loading participants...');
        syncParticipantsOnly(tournamentId).then(() => {
          hasLoadedParticipantsRef.current = true;
        }).catch(error => {
          console.error('[TournamentDetailScreen] Failed to sync participants:', error);
        });
      }
    }
  }, [activeTab, tournamentId, syncParticipantsOnly]);

  // Get tournament accent color
  const accent = useMemo(() => {
    if (!tournament) return null;
    const baseAccent = getTournamentAccent(tournament.name, tournament.description);
    return isDark ? getTournamentAccentDark(baseAccent) : baseAccent;
  }, [tournament, isDark]);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(() => {
    if (!tournamentId) return;
    
    // Don't refresh if already loading
    if (isLoadingEvents || isLoadingParticipants) return;
    
    // Refresh based on active tab
    if (activeTab === 'Events') {
      syncEventsOnly(tournamentId).catch(error => {
        console.error('[TournamentDetailScreen] Failed to refresh events:', error);
      });
    } else if (activeTab === 'Participants') {
      syncParticipantsOnly(tournamentId).catch(error => {
        console.error('[TournamentDetailScreen] Failed to refresh participants:', error);
      });
    }
  }, [tournamentId, activeTab, isLoadingEvents, isLoadingParticipants, syncEventsOnly, syncParticipantsOnly]);
  
  // Determine if currently refreshing
  const isRefreshing = isLoadingEvents || isLoadingParticipants;

  if (!tournament) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors['bg-surface'] }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors['text-primary'] }}>Tournament not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderEventsTab = () => (
    <View style={{ paddingBottom: insets.bottom + 100 }}>
      {isLoadingEvents ? (
        <SkeletonContainer count={3} layout="event" />
      ) : tournament.events.length === 0 ? (
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
            No events yet
          </Text>
        </View>
      ) : (
        tournament.events.map((event) => {
          const eventParticipants = tournament.participants.filter(p => 
            event.participantIds.includes(p.id)
          );
          
          return (
            <TouchableOpacity
              key={event.id}
              activeOpacity={0.7}
              onPress={() => router.push(`/(tabs)/tournaments/${tournamentId}/events/${event.id}` as any)}
              style={{
                backgroundColor: colors['bg-card'],
                borderRadius: 12,
                padding: 14,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: colors['border-default'],
                borderLeftWidth: accent ? 3 : 1,
                borderLeftColor: accent ? accent.primary : colors['border-default'],
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    fontFamily: getFontFamily('semibold'),
                    color: colors['text-primary'],
                    marginBottom: 6,
                  }} numberOfLines={1}>
                    {event.name}
                  </Text>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
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
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="people-outline" size={12} color={colors['text-secondary']} />
                      <Text style={{
                        fontSize: 12,
                        fontFamily: getFontFamily('regular'),
                        color: colors['text-secondary'],
                        marginLeft: 4,
                      }}>
                        {eventParticipants.length}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <Ionicons name="chevron-forward" size={18} color={colors['text-muted']} style={{ marginLeft: 12 }} />
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );

  const renderParticipantsTab = () => (
    <View style={{ paddingBottom: insets.bottom + 100 }}>
      {isLoadingParticipants ? (
        <SkeletonContainer count={4} layout="participant" />
      ) : tournament.participants.length === 0 ? (
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
        tournament.participants.map((participant) => (
          <TouchableOpacity
            key={participant.id}
            activeOpacity={0.7}
            onPress={() => router.push(`/(tabs)/tournaments/${tournamentId}/participants/${participant.id}` as any)}
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
            
            <Ionicons name="chevron-forward" size={18} color={colors['text-muted']} />
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors['bg-surface'] }}>
      <View style={{ flex: 1 }}>
        {/* Tournament Header with Accent */}
        <View style={{
          position: 'relative',
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors['border-default'],
          overflow: 'hidden',
        }}>
          {/* Abstract accent background */}
          {accent && (
            <>
              <View style={{
                position: 'absolute',
                top: -40,
                right: -40,
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: accent.primary + '08',
                opacity: 0.6,
              }} />
              <View style={{
                position: 'absolute',
                bottom: -30,
                left: -30,
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: accent.primary + '06',
                opacity: 0.4,
              }} />
            </>
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
                {tournament.name}
              </Text>
              <Text style={{
                fontSize: 13,
                fontFamily: getFontFamily('regular'),
                color: colors['text-secondary'],
                marginTop: 2,
              }}>
                {new Date(tournament.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setMenuVisible(true)}
              style={{ padding: 4 }}
            >
              <Ionicons name="ellipsis-vertical" size={22} color={colors['text-primary']} />
            </TouchableOpacity>
          </View>
          
          {/* Accent border at bottom */}
          {accent && (
            <View style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 2,
              backgroundColor: accent.primary + '40',
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
            tabs={['Events', 'Participants']}
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
            {activeTab === 'Events' && renderEventsTab()}
            {activeTab === 'Participants' && renderParticipantsTab()}
          </View>
        </ScrollView>

        <FloatingActionButton
          onPress={() => {
            if (activeTab === 'Events') {
              router.push(`/(tabs)/tournaments/${tournamentId}/events/create` as any);
            } else {
              router.push(`/(tabs)/tournaments/${tournamentId}/participants/create` as any);
            }
          }}
          icon="add"
        />
      </View>

      {/* Tournament Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={() => setMenuVisible(false)}
        >
          <View style={{
            position: 'absolute',
            top: insets.top + 60,
            right: 16,
            backgroundColor: colors['bg-card'],
            borderRadius: 12,
            paddingVertical: 8,
            minWidth: 160,
            borderWidth: 1,
            borderColor: colors['border-default'],
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 8,
          }}>
            <TouchableOpacity
              onPress={() => {
                setMenuVisible(false);
                router.push(`/(tabs)/tournaments/${tournamentId}/edit` as any);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 12,
              }}
            >
              <Ionicons name="create-outline" size={20} color={colors['text-primary']} />
              <Text style={{
                fontSize: 15,
                fontFamily: getFontFamily('medium'),
                color: colors['text-primary'],
                marginLeft: 12,
              }}>
                Edit Tournament
              </Text>
            </TouchableOpacity>
            <View style={{
              height: 1,
              backgroundColor: colors['border-default'],
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
                fontSize: 15,
                fontFamily: getFontFamily('medium'),
                color: colors['text-danger'],
                marginLeft: 12,
              }}>
                Delete Tournament
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        visible={deleteConfirmVisible}
        title="Delete Tournament"
        message={`Are you sure you want to delete "${tournament.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => {
          deleteTournament(tournamentId);
          router.replace('/(tabs)/tournaments' as any);
        }}
        onCancel={() => setDeleteConfirmVisible(false)}
        variant="danger"
      />
    </SafeAreaView>
  );
}
