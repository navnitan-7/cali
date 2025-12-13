import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { EventDataWithId } from '../schemas/eventModal';
import { eventService, participantService, Event as BackendEvent, Participant as BackendParticipant } from '../services';

interface Participant {
  id: string;
  name: string;
  weight?: number;
  division?: string;
  reps?: number;
  time?: string; // Format: "MM:SS" or "HH:MM:SS"
  videos?: Array<{ uri: string; name?: string }>; // Array of video objects with URI and name
  attachments?: Array<{ uri: string; name?: string }>; // Array of attachment objects with URI and name
  createdAt: string;
  updatedAt: string;
}

interface EventWithParticipants extends EventDataWithId {
  participants: Participant[];
  joinCode?: string; // Unique code for joining via link
}

interface EventStore {
  events: EventWithParticipants[];
  isLoading: boolean;
  error: string | null;
  
  // Backend sync methods
  syncEventsFromBackend: () => Promise<void>;
  syncParticipantsFromBackend: (eventId: string) => Promise<void>;
  
  // Local methods
  addEvent: (event: EventDataWithId) => string; // Returns event ID
  updateEvent: (id: string, event: Partial<EventDataWithId>) => void;
  deleteEvent: (id: string) => void;
  addParticipant: (eventId: string, participant: Omit<Participant, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateParticipant: (eventId: string, participantId: string, participant: Partial<Participant>) => Promise<void>;
  deleteParticipant: (eventId: string, participantId: string) => void;
  getEvent: (id: string) => EventWithParticipants | undefined;
  getEventByJoinCode: (joinCode: string) => EventWithParticipants | undefined;
  generateJoinCode: (eventId: string) => string;
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

// Default mock events
const getDefaultEvents = (): EventWithParticipants[] => {
  const now = new Date();
  const futureDate1 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
  const futureDate2 = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 days from now
  const futureDate3 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days from now
  const pastDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000); // 15 days ago

  return [
    {
      id: '1',
      name: 'Calisthenics Championship 2025',
      date: futureDate1.toISOString().split('T')[0],
      category: 'Calisthenics',
      divisions: ['Men', 'Women', 'Open'],
      metrics: ['time', 'reps'],
      participantCount: 24,
      status: 'upcoming',
      participants: [],
    },
    {
      id: '2',
      name: 'Street Workout Battle',
      date: futureDate2.toISOString().split('T')[0],
      category: 'Street Workout',
      divisions: ['Men', 'Women'],
      metrics: ['reps', 'weight'],
      participantCount: 18,
      status: 'upcoming',
      participants: [],
    },
    {
      id: '3',
      name: 'Pull-Up Challenge',
      date: pastDate.toISOString().split('T')[0],
      category: 'Strength',
      divisions: ['Open'],
      metrics: ['reps'],
      participantCount: 32,
      status: 'completed',
      participants: [],
    },
    {
      id: '4',
      name: 'Muscle-Up Masters 2025',
      date: futureDate3.toISOString().split('T')[0],
      category: 'Calisthenics',
      divisions: ['Men', 'Women'],
      metrics: ['time', 'reps', 'weight'],
      participantCount: 15,
      status: 'upcoming',
      participants: [],
    },
  ];
};

export const useEventStore = create<EventStore>()(
  persist(
    (set, get) => ({
      events: getDefaultEvents(),
      isLoading: false,
      error: null,
      
      // Sync events from backend
      syncEventsFromBackend: async () => {
        try {
          set({ isLoading: true, error: null });
          console.log('[EventStore] Syncing events from backend...');
          const backendEvents = await eventService.getEvents();
          console.log('[EventStore] Received events:', backendEvents);
          
          // Transform backend events to frontend format
          const transformedEvents: EventWithParticipants[] = backendEvents.map((be: BackendEvent) => {
            const existingEvent = get().events.find(e => e.id === be.id.toString());
            return {
              id: be.id.toString(),
              name: be.name,
              date: existingEvent?.date || new Date().toISOString().split('T')[0],
              category: be.event_type,
              divisions: existingEvent?.divisions || ['Open'],
              metrics: existingEvent?.metrics || ['time', 'reps'],
              participantCount: existingEvent?.participantCount || 0,
              status: existingEvent?.status || 'upcoming',
              participants: existingEvent?.participants || [],
              joinCode: existingEvent?.joinCode,
            };
          });
          
          set({ events: transformedEvents, isLoading: false });
          console.log('[EventStore] Events synced successfully');
        } catch (error: any) {
          console.error('[EventStore] Error syncing events:', error);
          set({ error: error.message || 'Failed to sync events', isLoading: false });
        }
      },
      
      // Sync participants for a specific event from backend
      syncParticipantsFromBackend: async (eventId: string) => {
        try {
          set({ isLoading: true, error: null });
          console.log('[EventStore] Syncing participants for event:', eventId);
          const backendParticipants = await participantService.getParticipantsByEvent(parseInt(eventId));
          console.log('[EventStore] Received participants:', backendParticipants);
          
          // Transform backend participants to frontend format
          const transformedParticipants: Participant[] = backendParticipants.map((bp: BackendParticipant) => ({
            id: bp.id.toString(),
            name: bp.name,
            weight: bp.weight,
            division: bp.gender,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
          
          // Update the event with these participants
          set((state) => ({
            events: state.events.map((event) =>
              event.id === eventId
                ? {
                    ...event,
                    participants: transformedParticipants,
                    participantCount: transformedParticipants.length,
                  }
                : event
            ),
            isLoading: false,
          }));
          console.log('[EventStore] Participants synced successfully');
        } catch (error: any) {
          console.error('[EventStore] Error syncing participants:', error);
          set({ error: error.message || 'Failed to sync participants', isLoading: false });
        }
      },
      addEvent: (event) => {
        const id = Date.now().toString() + Math.random().toString(36).substring(7);
        const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const newEvent: EventWithParticipants = {
          ...event,
          id,
          participants: [],
          participantCount: 0,
          status: event.status || 'upcoming',
          joinCode,
        };
        set((state) => ({
          events: [...state.events, newEvent],
        }));
        return id;
      },
      updateEvent: (id, updates) => {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === id ? { ...event, ...updates } : event
          ),
        }));
      },
      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter((event) => event.id !== id),
        }));
      },
      addParticipant: async (eventId, participant) => {
        try {
          set({ isLoading: true, error: null });
          console.log('[EventStore] Creating participant in backend:', participant);
          
          // Call backend API
          const result = await participantService.createParticipant({
            name: participant.name,
            age: 0, // Default values - update based on your needs
            gender: participant.division || 'Open',
            weight: participant.weight || 0,
            phone: '', // Add to participant interface if needed
            country: '', // Add to participant interface if needed
            state: '', // Add to participant interface if needed
            event_id: [parseInt(eventId)],
          });
          
          console.log('[EventStore] Participant created:', result);
          
          // Update local state
          const id = result.participant_id.toString();
          const now = new Date().toISOString();
          const newParticipant: Participant = {
            ...participant,
            id,
            createdAt: now,
            updatedAt: now,
          };
          
          set((state) => ({
            events: state.events.map((event) =>
              event.id === eventId
                ? {
                    ...event,
                    participants: [...event.participants, newParticipant],
                    participantCount: event.participants.length + 1,
                  }
                : event
            ),
            isLoading: false,
          }));
          
          return id;
        } catch (error: any) {
          console.error('[EventStore] Error creating participant:', error);
          set({ error: error.message || 'Failed to create participant', isLoading: false });
          throw error;
        }
      },
      updateParticipant: async (eventId, participantId, updates) => {
        try {
          set({ isLoading: true, error: null });
          console.log('[EventStore] Updating participant in backend:', participantId, updates);
          
          // Get current participant data to merge with updates
          const event = get().events.find(e => e.id === eventId);
          const currentParticipant = event?.participants.find(p => p.id === participantId);
          
          if (!currentParticipant) {
            throw new Error('Participant not found');
          }
          
          // Call backend API
          await participantService.updateParticipant(parseInt(participantId), {
            name: updates.name || currentParticipant.name,
            age: 0, // Default - update if you have age field
            gender: updates.division || currentParticipant.division || 'Open',
            weight: updates.weight || currentParticipant.weight || 0,
            phone: '', // Add if needed
            country: '', // Add if needed
            state: '', // Add if needed
          });
          
          console.log('[EventStore] Participant updated successfully');
          
          // Update local state
          set((state) => ({
            events: state.events.map((event) =>
              event.id === eventId
                ? {
                    ...event,
                    participants: event.participants.map((p) =>
                      p.id === participantId
                        ? { ...p, ...updates, updatedAt: new Date().toISOString() }
                        : p
                    ),
                  }
                : event
            ),
            isLoading: false,
          }));
        } catch (error: any) {
          console.error('[EventStore] Error updating participant:', error);
          set({ error: error.message || 'Failed to update participant', isLoading: false });
          throw error;
        }
      },
      deleteParticipant: (eventId, participantId) => {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === eventId
              ? {
                  ...event,
                  participants: event.participants.filter((p) => p.id !== participantId),
                  participantCount: Math.max(0, event.participants.length - 1),
                }
              : event
          ),
        }));
      },
      getEvent: (id) => {
        return get().events.find((event) => event.id === id);
      },
      getEventByJoinCode: (joinCode) => {
        return get().events.find((event) => event.joinCode === joinCode);
      },
      generateJoinCode: (eventId) => {
        const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        set((state) => ({
          events: state.events.map((event) =>
            event.id === eventId ? { ...event, joinCode } : event
          ),
        }));
        return joinCode;
      },
    }),
    {
      name: 'event-storage',
      storage: createJSONStorage(() => asyncStorage),
    }
  )
);

