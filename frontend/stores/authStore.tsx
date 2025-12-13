import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService, User } from '../services';
import { Platform } from 'react-native';

interface AuthStore {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (name: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, fullName: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  clearError: () => void;
}

// Create cross-platform storage adapter
const asyncStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        // Use localStorage for web
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(name);
        }
        return null;
      } else {
        // Use AsyncStorage for native platforms
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
        // Use localStorage for web
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(name, value);
        }
      } else {
        // Use AsyncStorage for native platforms
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
        // Use localStorage for web
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(name);
        }
      } else {
        // Use AsyncStorage for native platforms
        const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
        await AsyncStorage.removeItem(name);
      }
    } catch (error) {
      console.error('Error removing item from storage:', error);
    }
  },
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (name: string, password: string) => {
        console.log('[AuthStore] Login initiated for:', name);
        try {
          set({ isLoading: true, error: null });
          console.log('[AuthStore] Calling authService.login...');
          const tokenResponse = await authService.login({ name, password });
          console.log('[AuthStore] Token received, fetching user data...');
          const user = await authService.getCurrentUser();
          console.log('[AuthStore] Login complete, user:', user.name);
          
          set({ 
            isAuthenticated: true, 
            user,
            token: tokenResponse.access_token,
            isLoading: false 
          });
          return true;
        } catch (error: any) {
          console.error('[AuthStore] Login error:', error);
          const errorMessage = error.response?.data?.detail || 'Login failed';
          set({ 
            isAuthenticated: false, 
            user: null,
            token: null,
            error: errorMessage,
            isLoading: false 
          });
          return false;
        }
      },

      register: async (email: string, password: string, fullName: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authService.register({
            email,
            password,
            full_name: fullName,
          });
          set({ isLoading: false });
          return { 
            success: true, 
            message: 'Registration submitted. Waiting for approval.' 
          };
        } catch (error: any) {
          const errorMessage = error.response?.data?.detail || 'Registration failed';
          set({ error: errorMessage, isLoading: false });
          return { success: false, message: errorMessage };
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } finally {
          set({ 
            isAuthenticated: false, 
            user: null,
            token: null,
            error: null 
          });
        }
      },

      checkAuth: async () => {
        try {
          const isAuth = await authService.isAuthenticated();
          if (isAuth) {
            const user = await authService.getCurrentUser();
            const token = await authService.getStoredToken();
            set({ 
              isAuthenticated: true, 
              user,
              token 
            });
          } else {
            set({ 
              isAuthenticated: false, 
              user: null,
              token: null 
            });
          }
        } catch (error) {
          set({ 
            isAuthenticated: false, 
            user: null,
            token: null 
          });
        }
      },

      getCurrentUser: async () => {
        try {
          const user = await authService.getCurrentUser();
          set({ user });
        } catch (error: any) {
          const errorMessage = error.response?.data?.detail || 'Failed to get user';
          set({ error: errorMessage });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => asyncStorage),
    }
  )
);

