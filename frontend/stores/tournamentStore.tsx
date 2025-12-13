import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { EventDataWithId } from '../schemas/eventModal';
import { eventService, participantService } from '../services';
import { useEventStore } from './eventStore';

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
  date: string;
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
  addTournament: (tournament: Omit<Tournament, 'id' | 'participants' | 'events' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateTournament: (id: string, updates: Partial<Tournament>) => void;
  deleteTournament: (id: string) => void;
  getTournament: (id: string) => Tournament | undefined;
  
  // Participant management
  addParticipant: (tournamentId: string, participant: Omit<Participant, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateParticipant: (tournamentId: string, participantId: string, updates: Partial<Participant>) => Promise<void>;
  deleteParticipant: (tournamentId: string, participantId: string) => void;
  getParticipant: (tournamentId: string, participantId: string) => Participant | undefined;
  
  // Event management
  addEvent: (tournamentId: string, event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => string;
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
      addParticipant: (tournamentId, participant) => {
        const id = Date.now().toString() + Math.random().toString(36).substring(7);
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
        return id;
      },
      
      updateParticipant: (tournamentId, participantId, updates) => {
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
      addEvent: (tournamentId, event) => {
        const id = Date.now().toString() + Math.random().toString(36).substring(7);
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
        return id;
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
    }
  )
);

