import { apiClient } from './apiConfig';
import { Platform } from 'react-native';

export interface UserRegisterData {
  email: string;
  password: string;
  full_name: string;
}

export interface UserLoginData {
  name: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  name: string;
  password_hash: string;
}

export interface PendingRegistration {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
}

// Cross-platform storage utility
const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
        return null;
      } else {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        return await AsyncStorage.getItem(key);
      }
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },
  
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
      } else {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  },
  
  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
      } else {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Storage removeItem error:', error);
    }
  },
};

class AuthService {
  async register(data: UserRegisterData): Promise<{ message: string; id: number }> {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  }

  async login(data: UserLoginData): Promise<TokenResponse> {
    console.log('[AuthService] Attempting login for:', data.name);
    try {
      const response = await apiClient.post<TokenResponse>('/auth/login', data);
      console.log('[AuthService] Login successful, received token');
      const { access_token, token_type } = response.data;
      
      await storage.setItem('auth_token', access_token);
      await storage.setItem('token_type', token_type);
      
      return response.data;
    } catch (error: any) {
      const isNetworkError = error.message === 'Network Error' || !error.response;
      console.error('[AuthService] Login failed:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        isNetworkError,
        config: error.config ? {
          baseURL: error.config.baseURL,
          url: error.config.url,
          fullURL: `${error.config.baseURL}${error.config.url}`,
        } : undefined,
      });
      
      // Provide user-friendly error message
      if (isNetworkError) {
        const enhancedError = new Error(
          'Cannot connect to the server. Please check:\n' +
          '1. Backend server is running\n' +
          '2. Correct API URL is configured\n' +
          '3. Network connection is working'
        );
        enhancedError.name = 'NetworkError';
        throw enhancedError;
      }
      
      throw error;
    }
  }

  async logout(): Promise<void> {
    await storage.removeItem('auth_token');
    await storage.removeItem('token_type');
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  }

  async approveRegistration(queueId: number): Promise<{ message: string; user_id: number }> {
    const response = await apiClient.post(`/auth/approve/${queueId}`);
    return response.data;
  }

  async getPendingRegistrations(): Promise<PendingRegistration[]> {
    const response = await apiClient.get<PendingRegistration[]>('/auth/pending-registrations');
    return response.data;
  }

  async getStoredToken(): Promise<string | null> {
    return await storage.getItem('auth_token');
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getStoredToken();
    return !!token;
  }
}

export const authService = new AuthService();

