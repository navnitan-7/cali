import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Platform } from 'react-native';
import { eventService, EventType } from '../services';

interface EventTypesStore {
  eventTypes: EventType[];
  isLoading: boolean;
  lastFetched: number | null;
  fetchEventTypes: () => Promise<void>;
  getCachedEventTypes: () => EventType[];
}

// Create cross-platform storage adapter
const asyncStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(name);
        }
        return null;
      } else {
        const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
        return await AsyncStorage.getItem(name);
      }
    } catch (error) {
      console.error('Error getting item from storage:', error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(name, value);
        }
      } else {
        const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
        await AsyncStorage.setItem(name, value);
      }
    } catch (error) {
      console.error('Error setting item in storage:', error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(name);
        }
      } else {
        const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
        await AsyncStorage.removeItem(name);
      }
    } catch (error) {
      console.error('Error removing item from storage:', error);
    }
  },
};

export const useEventTypesStore = create<EventTypesStore>()(
  persist(
    (set, get) => ({
      eventTypes: [],
      isLoading: false,
      lastFetched: null,

      fetchEventTypes: async () => {
        const state = get();
        // Only fetch if not already loading and cache is older than 1 hour (optional)
        const oneHour = 60 * 60 * 1000;
        const cacheAge = state.lastFetched ? Date.now() - state.lastFetched : Infinity;
        
        if (state.isLoading || (cacheAge < oneHour && state.eventTypes.length > 0)) {
          return;
        }

        try {
          set({ isLoading: true });
          const types = await eventService.getEventTypes();
          set({ 
            eventTypes: types, 
            isLoading: false,
            lastFetched: Date.now(),
          });
        } catch (error) {
          console.error('[EventTypesStore] Error fetching event types:', error);
          set({ isLoading: false });
        }
      },

      getCachedEventTypes: () => {
        return get().eventTypes;
      },
    }),
    {
      name: 'event-types-storage',
      storage: createJSONStorage(() => asyncStorage),
    }
  )
);

