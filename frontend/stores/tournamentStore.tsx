import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { EventDataWithId } from '../schemas/eventModal';
import { eventService, participantService } from '../services';

interface Participant {
  id: string;
  name: string;
  weight?: number;
  division?: string;
  createdAt: string;
  updatedAt: string;
}

// Event-specific participant data (metrics, videos, attempts)
export interface EventParticipantData {
  participantId: string;
  // Metrics
  time?: string; // Format: "MM:SS" or "HH:MM:SS"
  reps?: number;
  weight?: number; // Weight lifted in kg
  // Videos
  videos?: Array<{ 
    id: string;
    uri: string; 
    name?: string;
    uploadedAt: string;
  }>;
  // Attempts/Activity history
  attempts?: Array<{
    id: string;
    timestamp: string;
    type: 'metric' | 'video' | 'note';
    data: {
      time?: string;
      reps?: number;
      weight?: number;
      videoUri?: string;
      note?: string;
    };
  }>;
  createdAt: string;
  updatedAt: string;
}

interface Event {
  id: string;
  name: string;
  category: string;
  divisions: string[];
  metrics: string[];
  participantIds: string[]; // References to tournament participants
  participantData: Record<string, EventParticipantData>; // Map of participantId -> event-specific data
  status?: 'active' | 'upcoming' | 'completed';
  createdAt: string;
  updatedAt: string;
}

interface Tournament {
  id: string;
  name: string;
  date: string;
  description?: string;
  participants: Participant[];
  events: Event[];
  status?: 'active' | 'upcoming' | 'completed';
  createdAt: string;
  updatedAt: string;
}

interface TournamentStore {
  tournaments: Tournament[];
  // Loading states for request deduplication
  isLoadingEvents: boolean;
  isLoadingParticipants: boolean;
  isLoadingEventDetails: Record<string, boolean>; // eventId -> loading state
  // In-flight promises for deduplication
  syncEventsPromise: Promise<void> | null;
  syncParticipantsPromise: Promise<void> | null;
  syncEventDetailsPromises: Record<string, Promise<void>>; // eventId -> promise
  
  syncEventsFromBackend: () => Promise<void>;
  syncEventsOnly: (tournamentId: string) => Promise<void>;
  syncParticipantsOnly: (tournamentId: string) => Promise<void>;
  syncEventDetails: (tournamentId: string, eventId: string, forceRefresh?: boolean) => Promise<void>;
  addTournament: (tournament: Omit<Tournament, 'id' | 'participants' | 'events' | 'createdAt' | 'updatedAt'>) => string;
  updateTournament: (id: string, updates: Partial<Tournament>) => void;
  deleteTournament: (id: string) => void;
  getTournament: (id: string) => Tournament | undefined;
  
  // Participant management
  addParticipant: (tournamentId: string, participant: Omit<Participant, 'id' | 'createdAt' | 'updatedAt'>, eventIds?: string[]) => Promise<string>;
  updateParticipant: (tournamentId: string, participantId: string, updates: Partial<Participant>) => Promise<void>;
  deleteParticipant: (tournamentId: string, participantId: string) => void;
  getParticipant: (tournamentId: string, participantId: string) => Participant | undefined;
  
  // Event management
  addEvent: (tournamentId: string, event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateEvent: (tournamentId: string, eventId: string, updates: Partial<Event>) => void;
  deleteEvent: (tournamentId: string, eventId: string) => void;
  getEvent: (tournamentId: string, eventId: string) => Event | undefined;
  
  // Event participant management (linking tournament participants to events)
  addEventParticipant: (tournamentId: string, eventId: string, participantId: string) => void;
  removeEventParticipant: (tournamentId: string, eventId: string, participantId: string) => void;
  
  // Event-specific participant data management
  updateEventParticipantData: (
    tournamentId: string,
    eventId: string,
    participantId: string,
    updates: Partial<Omit<EventParticipantData, 'participantId' | 'createdAt' | 'updatedAt'>>
  ) => void;
  addEventParticipantVideo: (
    tournamentId: string,
    eventId: string,
    participantId: string,
    video: { uri: string; name?: string }
  ) => void;
  addEventParticipantAttempt: (
    tournamentId: string,
    eventId: string,
    participantId: string,
    attempt: Omit<NonNullable<EventParticipantData['attempts']>[0], 'id' | 'timestamp'>
  ) => void;
  getEventParticipantData: (
    tournamentId: string,
    eventId: string,
    participantId: string
  ) => EventParticipantData | undefined;
}

// Create async storage adapter
const asyncStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      return await AsyncStorage.getItem(name);
    } catch (error) {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.setItem(name, value);
    } catch (error) {
      // Ignore storage errors
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      await AsyncStorage.removeItem(name);
    } catch (error) {
      // Ignore storage errors
    }
  },
};

// Default mock tournaments
const getDefaultTournaments = (): Tournament[] => {
  const now = new Date();
  const futureDate1 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const futureDate2 = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

  return [
    {
      id: '1',
      name: 'Street Fitness Championship 2025',
      date: futureDate1.toISOString().split('T')[0],
      description: 'Annual street fitness competition',
      participants: [],
      events: [],
      status: 'upcoming',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: '2',
      name: 'Calisthenics Masters',
      date: futureDate2.toISOString().split('T')[0],
      description: 'Elite calisthenics tournament',
      participants: [],
      events: [],
      status: 'upcoming',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
  ];
};

export const useTournamentStore = create<TournamentStore>()(
  persist(
    (set, get) => ({
      tournaments: getDefaultTournaments(),
      isLoadingEvents: false,
      isLoadingParticipants: false,
      isLoadingEventDetails: {},
      syncEventsPromise: null,
      syncParticipantsPromise: null,
      syncEventDetailsPromises: {},
      
      syncEventsFromBackend: async () => {
        // If already syncing, return the existing promise
        if (get().syncEventsPromise) {
          console.log('[TournamentStore] Sync already in progress, returning existing promise');
          return get().syncEventsPromise!;
        }
        
        // If already loading, don't start another sync
        if (get().isLoadingEvents) {
          console.log('[TournamentStore] Events already loading, skipping duplicate call');
          return Promise.resolve();
        }
        
        const syncPromise = (async () => {
          try {
            set({ isLoadingEvents: true });
            console.log('[TournamentStore] Syncing events from backend...');
            const backendEvents = await eventService.getEvents();
          console.log('[TournamentStore] Received events from backend:', backendEvents);
          
          // Get all participants from backend (but don't fetch participants for each event)
          const backendParticipants = await participantService.getParticipants();
          console.log('[TournamentStore] Received participants from backend:', backendParticipants);
          
          // Transform backend events to tournament event format (without fetching participants for each event)
          // Participants will be fetched only when a specific event is opened
          const transformedEvents: Event[] = backendEvents.map((be: any) => {
            return {
              id: be.id.toString(),
              name: be.name,
              category: be.event_type || 'Other',
              divisions: ['Open'],
              metrics: ['time', 'reps'],
              participantIds: [], // Don't fetch participants here - will be fetched when event is opened
              participantData: {},
              status: 'upcoming',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          });
          
          // Transform backend participants to tournament participant format (deduplicate)
          const participantMap = new Map<string, Participant>();
          backendParticipants.forEach((bp: any) => {
            const id = bp.id.toString();
            if (!participantMap.has(id)) {
              participantMap.set(id, {
                id,
                name: bp.name,
                weight: bp.weight,
                division: bp.gender || 'Open',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
            }
          });
          const transformedParticipants = Array.from(participantMap.values());
          
          // Update tournaments - add events and participants to the first tournament (or create a default one)
          set((state) => {
            const tournaments = [...state.tournaments];
            
            // If no tournaments, create a default one
            if (tournaments.length === 0) {
              const now = new Date().toISOString();
              tournaments.push({
                id: '1',
                name: 'My Tournament',
                date: new Date().toISOString().split('T')[0],
                participants: transformedParticipants,
                events: transformedEvents,
                status: 'active',
                createdAt: now,
                updatedAt: now,
              });
            } else {
              // Update first tournament with synced events and participants
              // Merge participants (avoid duplicates by ID)
              const existingParticipantIds = new Set(tournaments[0].participants.map(p => p.id));
              const newParticipants = transformedParticipants.filter(p => !existingParticipantIds.has(p.id));
              
              // Replace events with backend events (merge participantIds from existing events if needed)
              const existingEventsMap = new Map(tournaments[0].events.map(e => [e.id, e]));
              const updatedEvents = transformedEvents.map(backendEvent => {
                const existingEvent = existingEventsMap.get(backendEvent.id);
                return {
                  ...backendEvent,
                  participantIds: existingEvent?.participantIds || backendEvent.participantIds,
                  participantData: existingEvent?.participantData || backendEvent.participantData,
                };
              });
              
              // Add any events that exist locally but not in backend (preserve them)
              const backendEventIds = new Set(transformedEvents.map(e => e.id));
              const localOnlyEvents = tournaments[0].events.filter(e => !backendEventIds.has(e.id));
              
              tournaments[0] = {
                ...tournaments[0],
                participants: [...tournaments[0].participants.filter(p => 
                  transformedParticipants.some(tp => tp.id === p.id)
                ), ...newParticipants],
                events: [...updatedEvents, ...localOnlyEvents],
                updatedAt: new Date().toISOString(),
              };
            }
            
            return { tournaments };
          });
          
          console.log('[TournamentStore] Events and participants synced successfully');
          } catch (error) {
            console.error('[TournamentStore] Error syncing from backend:', error);
          } finally {
            set({ isLoadingEvents: false, syncEventsPromise: null });
          }
        })();
        
        set({ syncEventsPromise: syncPromise });
        return syncPromise;
      },
      
      syncEventsOnly: async (tournamentId: string) => {
        // If already syncing, return the existing promise
        if (get().syncEventsPromise) {
          console.log('[TournamentStore] Events sync already in progress, returning existing promise');
          return get().syncEventsPromise!;
        }
        
        // If already loading, don't start another sync
        if (get().isLoadingEvents) {
          console.log('[TournamentStore] Events already loading, skipping duplicate call');
          return Promise.resolve();
        }
        
        const syncPromise = (async () => {
          try {
            set({ isLoadingEvents: true });
            console.log('[TournamentStore] Syncing events only for tournament:', tournamentId);
            const backendEvents = await eventService.getEvents();
          
          // Transform backend events to tournament event format (without fetching participants)
          const transformedEvents: Event[] = backendEvents.map((be: any) => {
            return {
              id: be.id.toString(),
              name: be.name,
              category: be.event_type || 'Other',
              divisions: ['Open'],
              metrics: ['time', 'reps'],
              participantIds: [], // Don't fetch participants here - will be fetched when needed
              participantData: {},
              status: 'upcoming',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          });
          
          // Update tournament with events only
          set((state) => ({
            tournaments: state.tournaments.map((tournament) => {
              if (tournament.id === tournamentId) {
                const existingEventsMap = new Map(tournament.events.map(e => [e.id, e]));
                const updatedEvents = transformedEvents.map(backendEvent => {
                  const existingEvent = existingEventsMap.get(backendEvent.id);
                  return {
                    ...backendEvent,
                    participantIds: existingEvent?.participantIds || backendEvent.participantIds,
                    participantData: existingEvent?.participantData || backendEvent.participantData,
                  };
                });
                const backendEventIds = new Set(transformedEvents.map(e => e.id));
                const localOnlyEvents = tournament.events.filter(e => !backendEventIds.has(e.id));
                
                return {
                  ...tournament,
                  events: [...updatedEvents, ...localOnlyEvents],
                  updatedAt: new Date().toISOString(),
                };
              }
              return tournament;
            }),
          }));
          
          console.log('[TournamentStore] Events synced successfully');
          } catch (error) {
            console.error('[TournamentStore] Error syncing events:', error);
          } finally {
            set({ isLoadingEvents: false, syncEventsPromise: null });
          }
        })();
        
        set({ syncEventsPromise: syncPromise });
        return syncPromise;
      },
      
      syncParticipantsOnly: async (tournamentId: string) => {
        // If already syncing, return the existing promise
        if (get().syncParticipantsPromise) {
          console.log('[TournamentStore] Participants sync already in progress, returning existing promise');
          return get().syncParticipantsPromise!;
        }
        
        // If already loading, don't start another sync
        if (get().isLoadingParticipants) {
          console.log('[TournamentStore] Participants already loading, skipping duplicate call');
          return Promise.resolve();
        }
        
        const syncPromise = (async () => {
          try {
            set({ isLoadingParticipants: true });
            console.log('[TournamentStore] Syncing participants only for tournament:', tournamentId);
            const backendParticipants = await participantService.getParticipants();
          
          // Transform backend participants to tournament participant format (deduplicate)
          const participantMap = new Map<string, Participant>();
          backendParticipants.forEach((bp: any) => {
            const id = bp.id.toString();
            if (!participantMap.has(id)) {
              participantMap.set(id, {
                id,
                name: bp.name,
                weight: bp.weight,
                division: bp.gender || 'Open',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
            }
          });
          const transformedParticipants = Array.from(participantMap.values());
          
          // Update tournament with participants only
          set((state) => ({
            tournaments: state.tournaments.map((tournament) => {
              if (tournament.id === tournamentId) {
                const existingParticipantIds = new Set(tournament.participants.map(p => p.id));
                const newParticipants = transformedParticipants.filter(p => !existingParticipantIds.has(p.id));
                
                return {
                  ...tournament,
                  participants: [...tournament.participants.filter(p => 
                    transformedParticipants.some(tp => tp.id === p.id)
                  ), ...newParticipants],
                  updatedAt: new Date().toISOString(),
                };
              }
              return tournament;
            }),
          }));
          
          console.log('[TournamentStore] Participants synced successfully');
          } catch (error) {
            console.error('[TournamentStore] Error syncing participants:', error);
          } finally {
            set({ isLoadingParticipants: false, syncParticipantsPromise: null });
          }
        })();
        
        set({ syncParticipantsPromise: syncPromise });
        return syncPromise;
      },
      
      syncEventDetails: async (tournamentId: string, eventId: string, forceRefresh: boolean = false) => {
        // If force refresh (pull-to-refresh), always proceed with API call
        if (!forceRefresh) {
          // Check if we already have participantIds for this event (from previous load)
          const tournament = get().tournaments.find(t => t.id === tournamentId);
          const event = tournament?.events.find(e => e.id === eventId);
          // Only skip if event has participantIds AND it was explicitly set (not just empty array from initial state)
          // We check if the event has been updated after creation, indicating it was loaded via API
          if (event && event.participantIds !== undefined && event.updatedAt && event.updatedAt !== event.createdAt) {
            console.log('[TournamentStore] Event already loaded via by_event API, skipping:', eventId);
            return Promise.resolve();
          }
        }
        
        // If already syncing this event, return the existing promise
        const existingPromise = get().syncEventDetailsPromises[eventId];
        if (existingPromise) {
          console.log('[TournamentStore] Event details sync already in progress for event:', eventId);
          return existingPromise;
        }
        
        // If already loading this event, don't start another sync
        if (get().isLoadingEventDetails[eventId]) {
          console.log('[TournamentStore] Event details already loading for event:', eventId);
          return Promise.resolve();
        }
        
        const syncPromise = (async () => {
          try {
            set((state) => ({
              isLoadingEventDetails: { ...state.isLoadingEventDetails, [eventId]: true },
            }));
            console.log('[TournamentStore] Syncing event details:', eventId);
            const eventParticipants = await participantService.getParticipantsByEvent(parseInt(eventId));
          
          // Update the event's participantIds
          set((state) => ({
            tournaments: state.tournaments.map((tournament) => {
              if (tournament.id === tournamentId) {
                return {
                  ...tournament,
                  events: tournament.events.map((event) => {
                    if (event.id === eventId) {
                      return {
                        ...event,
                        participantIds: eventParticipants.map((p: any) => p.id?.toString() || p.participant_id?.toString()).filter(Boolean),
                        updatedAt: new Date().toISOString(),
                      };
                    }
                    return event;
                  }),
                  updatedAt: new Date().toISOString(),
                };
              }
              return tournament;
            }),
          }));
          
          console.log('[TournamentStore] Event details synced successfully');
          } catch (error) {
            console.error('[TournamentStore] Error syncing event details:', error);
          } finally {
            set((state) => {
              const newLoadingState = { ...state.isLoadingEventDetails };
              delete newLoadingState[eventId];
              const newPromises = { ...state.syncEventDetailsPromises };
              delete newPromises[eventId];
              return {
                isLoadingEventDetails: newLoadingState,
                syncEventDetailsPromises: newPromises,
              };
            });
          }
        })();
        
        set((state) => ({
          syncEventDetailsPromises: { ...state.syncEventDetailsPromises, [eventId]: syncPromise },
        }));
        return syncPromise;
      },
      
      addTournament: (tournament) => {
        const id = Date.now().toString() + Math.random().toString(36).substring(7);
        const now = new Date().toISOString();
        const newTournament: Tournament = {
          ...tournament,
          id,
          participants: [],
          events: [],
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          tournaments: [...state.tournaments, newTournament],
        }));
        return id;
      },
      
      updateTournament: (id, updates) => {
        set((state) => ({
          tournaments: state.tournaments.map((tournament) =>
            tournament.id === id
              ? { ...tournament, ...updates, updatedAt: new Date().toISOString() }
              : tournament
          ),
        }));
      },
      
      deleteTournament: (id) => {
        set((state) => ({
          tournaments: state.tournaments.filter((tournament) => tournament.id !== id),
        }));
      },
      
      getTournament: (id) => {
        return get().tournaments.find((tournament) => tournament.id === id);
      },
      
      // Participant management
      addParticipant: async (tournamentId, participant, eventIds) => {
        try {
          // Get all events for this tournament to get their IDs
          const tournament = get().tournaments.find(t => t.id === tournamentId);
          if (!tournament) {
            throw new Error('Tournament not found');
          }

          // Use provided event IDs or fall back to all events in tournament
          let selectedEventIds: number[];
          if (eventIds && eventIds.length > 0) {
            selectedEventIds = eventIds.map(id => parseInt(id)).filter(id => !isNaN(id));
          } else {
            selectedEventIds = tournament.events.map(e => parseInt(e.id)).filter(id => !isNaN(id));
          }

          // Validate that at least one event is selected
          if (selectedEventIds.length === 0) {
            throw new Error('At least one event must be selected');
          }

          // Call backend API to create participant
          const result = await participantService.createParticipant({
            name: participant.name,
            age: 0, // Default - update if you have age field
            gender: participant.division || 'Open',
            weight: participant.weight || 0,
            phone: '', // Add if needed
            country: '', // Add if needed
            state: '', // Add if needed
            event_id: selectedEventIds,
          });

          const id = result.participant_id.toString();
        const now = new Date().toISOString();
        const newParticipant: Participant = {
          ...participant,
          id,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          tournaments: state.tournaments.map((tournament) =>
            tournament.id === tournamentId
              ? {
                  ...tournament,
                  participants: [...tournament.participants, newParticipant],
                  updatedAt: new Date().toISOString(),
                }
              : tournament
          ),
        }));
          
          // Sync from backend to ensure UI is updated
          get().syncEventsFromBackend().catch(err => {
            console.error('[TournamentStore] Error syncing after participant creation:', err);
          });
          
        return id;
        } catch (error) {
          console.error('[TournamentStore] Error creating participant:', error);
          throw error;
        }
      },
      
      updateParticipant: async (tournamentId, participantId, updates) => {
        try {
          // Get current participant data
          const tournament = get().tournaments.find(t => t.id === tournamentId);
          const currentParticipant = tournament?.participants.find(p => p.id === participantId);
          
          if (!currentParticipant) {
            throw new Error('Participant not found');
          }

          // Get all events for this tournament to get their IDs
          const eventIds = tournament?.events.map(e => parseInt(e.id)).filter(id => !isNaN(id)) || [];

          // Call backend API to update participant
          await participantService.updateParticipant(parseInt(participantId), {
            name: updates.name || currentParticipant.name,
            age: 0, // Default - update if you have age field
            gender: updates.division || currentParticipant.division || 'Open',
            weight: updates.weight !== undefined ? (updates.weight || 0) : (currentParticipant.weight || 0),
            phone: '', // Add if needed
            country: '', // Add if needed
            state: '', // Add if needed
          });

          // Update local state
        set((state) => ({
          tournaments: state.tournaments.map((tournament) =>
            tournament.id === tournamentId
              ? {
                  ...tournament,
                  participants: tournament.participants.map((p) =>
                    p.id === participantId
                      ? { ...p, ...updates, updatedAt: new Date().toISOString() }
                      : p
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : tournament
          ),
        }));
        } catch (error) {
          console.error('[TournamentStore] Error updating participant:', error);
          throw error;
        }
      },
      
      deleteParticipant: (tournamentId, participantId) => {
        set((state) => ({
          tournaments: state.tournaments.map((tournament) =>
            tournament.id === tournamentId
              ? {
                  ...tournament,
                  participants: tournament.participants.filter((p) => p.id !== participantId),
                  // Also remove from all events in this tournament
                  events: tournament.events.map((event) => {
                    const { [participantId]: removed, ...restParticipantData } = event.participantData || {};
                    return {
                      ...event,
                      participantIds: event.participantIds.filter((pid) => pid !== participantId),
                      participantData: restParticipantData,
                    };
                  }),
                  updatedAt: new Date().toISOString(),
                }
              : tournament
          ),
        }));
      },
      
      getParticipant: (tournamentId, participantId) => {
        const tournament = get().tournaments.find((t) => t.id === tournamentId);
        return tournament?.participants.find((p) => p.id === participantId);
      },
      
      // Event management
      addEvent: async (tournamentId, event) => {
        try {
          // Get event types from backend to map category to event_type ID
          const eventTypes = await eventService.getEventTypes();
          
          // Find event type by name (category)
          let eventTypeId = 1; // Default to first event type
          const eventType = eventTypes.find(et => et.name === event.category);
          if (eventType) {
            eventTypeId = eventType.id;
          } else if (eventTypes.length > 0) {
            // If category doesn't match, use first available event type
            eventTypeId = eventTypes[0].id;
          }

          // Call backend API to create event
          const result = await eventService.createEvent({
            name: event.name,
            description: event.name, // Use name as description if no description field
            event_type: eventTypeId,
          });

          // After creating, fetch all events to get the new event ID
          const backendEvents = await eventService.getEvents();
          const newBackendEvent = backendEvents[backendEvents.length - 1]; // Get the last one (newly created)
          
          const id = newBackendEvent.id.toString();
        const now = new Date().toISOString();
        const newEvent: Event = {
          ...event,
          id,
          participantIds: event.participantIds || [],
          participantData: {},
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          tournaments: state.tournaments.map((tournament) =>
            tournament.id === tournamentId
              ? {
                  ...tournament,
                  events: [...tournament.events, newEvent],
                  updatedAt: new Date().toISOString(),
                }
              : tournament
          ),
        }));
          
          // Sync events for this specific tournament to ensure UI is updated
          get().syncEventsOnly(tournamentId).catch(err => {
            console.error('[TournamentStore] Error syncing after event creation:', err);
          });
          
        return id;
        } catch (error) {
          console.error('[TournamentStore] Error creating event:', error);
          throw error;
        }
      },
      
      updateEvent: (tournamentId, eventId, updates) => {
        set((state) => ({
          tournaments: state.tournaments.map((tournament) =>
            tournament.id === tournamentId
              ? {
                  ...tournament,
                  events: tournament.events.map((event) =>
                    event.id === eventId
                      ? { ...event, ...updates, updatedAt: new Date().toISOString() }
                      : event
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : tournament
          ),
        }));
      },
      
      deleteEvent: (tournamentId, eventId) => {
        set((state) => ({
          tournaments: state.tournaments.map((tournament) =>
            tournament.id === tournamentId
              ? {
                  ...tournament,
                  events: tournament.events.filter((event) => event.id !== eventId),
                  updatedAt: new Date().toISOString(),
                }
              : tournament
          ),
        }));
      },
      
      getEvent: (tournamentId, eventId) => {
        const tournament = get().tournaments.find((t) => t.id === tournamentId);
        return tournament?.events.find((e) => e.id === eventId);
      },
      
      // Event participant management
      addEventParticipant: (tournamentId, eventId, participantId) => {
        set((state) => ({
          tournaments: state.tournaments.map((tournament) =>
            tournament.id === tournamentId
              ? {
                  ...tournament,
                  events: tournament.events.map((event) =>
                    event.id === eventId
                      ? {
                          ...event,
                          participantIds: event.participantIds.includes(participantId)
                            ? event.participantIds
                            : [...event.participantIds, participantId],
                          updatedAt: new Date().toISOString(),
                        }
                      : event
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : tournament
          ),
        }));
      },
      
      removeEventParticipant: (tournamentId, eventId, participantId) => {
        set((state) => ({
          tournaments: state.tournaments.map((tournament) =>
            tournament.id === tournamentId
              ? {
                  ...tournament,
                  events: tournament.events.map((event) => {
                    if (event.id === eventId) {
                      const { [participantId]: removed, ...restParticipantData } = event.participantData || {};
                      return {
                        ...event,
                        participantIds: event.participantIds.filter((pid) => pid !== participantId),
                        participantData: restParticipantData,
                        updatedAt: new Date().toISOString(),
                      };
                    }
                    return event;
                  }),
                  updatedAt: new Date().toISOString(),
                }
              : tournament
          ),
        }));
      },
      
      // Event-specific participant data management
      updateEventParticipantData: (tournamentId, eventId, participantId, updates) => {
        set((state) => ({
          tournaments: state.tournaments.map((tournament) =>
            tournament.id === tournamentId
              ? {
                  ...tournament,
                  events: tournament.events.map((event) => {
                    if (event.id === eventId) {
                      const now = new Date().toISOString();
                      const existingData = event.participantData?.[participantId];
                      const updatedData: EventParticipantData = {
                        ...existingData,
                        participantId,
                        ...updates,
                        createdAt: existingData?.createdAt || now,
                        updatedAt: now,
                      };
                      return {
                        ...event,
                        participantData: {
                          ...(event.participantData || {}),
                          [participantId]: updatedData,
                        },
                        updatedAt: now,
                      };
                    }
                    return event;
                  }),
                  updatedAt: new Date().toISOString(),
                }
              : tournament
          ),
        }));
      },
      
      addEventParticipantVideo: (tournamentId, eventId, participantId, video) => {
        const videoId = Date.now().toString() + Math.random().toString(36).substring(7);
        const now = new Date().toISOString();
        set((state) => ({
          tournaments: state.tournaments.map((tournament) =>
            tournament.id === tournamentId
              ? {
                  ...tournament,
                  events: tournament.events.map((event) => {
                    if (event.id === eventId) {
                      const existingData = event.participantData?.[participantId];
                      const newVideo = {
                        id: videoId,
                        ...video,
                        uploadedAt: now,
                      };
                      const updatedData: EventParticipantData = {
                        ...existingData,
                        participantId,
                        videos: [...(existingData?.videos || []), newVideo],
                        createdAt: existingData?.createdAt || now,
                        updatedAt: now,
                      };
                      return {
                        ...event,
                        participantData: {
                          ...(event.participantData || {}),
                          [participantId]: updatedData,
                        },
                        updatedAt: now,
                      };
                    }
                    return event;
                  }),
                  updatedAt: new Date().toISOString(),
                }
              : tournament
          ),
        }));
      },
      
      addEventParticipantAttempt: (tournamentId, eventId, participantId, attempt) => {
        const attemptId = Date.now().toString() + Math.random().toString(36).substring(7);
        const now = new Date().toISOString();
        set((state) => ({
          tournaments: state.tournaments.map((tournament) =>
            tournament.id === tournamentId
              ? {
                  ...tournament,
                  events: tournament.events.map((event) => {
                    if (event.id === eventId) {
                      const existingData = event.participantData?.[participantId];
                      const newAttempt: NonNullable<EventParticipantData['attempts']>[0] = {
                        id: attemptId,
                        timestamp: now,
                        type: attempt.type,
                        data: attempt.data,
                      };
                      const updatedData: EventParticipantData = {
                        ...existingData,
                        participantId,
                        attempts: [...(existingData?.attempts || []), newAttempt],
                        createdAt: existingData?.createdAt || now,
                        updatedAt: now,
                      };
                      return {
                        ...event,
                        participantData: {
                          ...(event.participantData || {}),
                          [participantId]: updatedData,
                        },
                        updatedAt: now,
                      };
                    }
                    return event;
                  }),
                  updatedAt: new Date().toISOString(),
                }
              : tournament
          ),
        }));
      },
      
      getEventParticipantData: (tournamentId, eventId, participantId) => {
        const tournament = get().tournaments.find((t) => t.id === tournamentId);
        const event = tournament?.events.find((e) => e.id === eventId);
        return event?.participantData?.[participantId];
      },
    }),
    {
      name: 'tournament-storage',
      storage: createJSONStorage(() => asyncStorage),
      partialize: (state) => ({
        tournaments: state.tournaments,
        // Don't persist loading states and promises
      }),
    }
  )
);

