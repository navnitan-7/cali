import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { EventDataWithId } from '../schemas/eventModal';

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
  addEvent: (event: EventDataWithId) => string; // Returns event ID
  updateEvent: (id: string, event: Partial<EventDataWithId>) => void;
  deleteEvent: (id: string) => void;
  addParticipant: (eventId: string, participant: Omit<Participant, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateParticipant: (eventId: string, participantId: string, participant: Partial<Participant>) => void;
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
      addParticipant: (eventId, participant) => {
        const id = Date.now().toString() + Math.random().toString(36).substring(7);
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
        }));
        return id;
      },
      updateParticipant: (eventId, participantId, updates) => {
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
        }));
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

