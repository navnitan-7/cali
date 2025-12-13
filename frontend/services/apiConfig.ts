import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';

// Determine the API base URL based on platform
const getApiBaseUrl = () => {
  // Check for environment variable first
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // Default based on platform
  if (Platform.OS === 'android') {
    // For physical Android devices, use your computer's local IP
    // For Android emulator, use: http://10.0.2.2:8000
    // TODO: Create a .env file with: EXPO_PUBLIC_API_URL=http://YOUR_IP:8000
    return 'http://192.168.1.17:8000';
  }
  
  // iOS simulator and web can use localhost
  return 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();

// Log the API URL being used (helpful for debugging)
console.log(`[API Config] Using API Base URL: ${API_BASE_URL} (Platform: ${Platform.OS})`);

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

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
        try {
          const token = await storage.getItem('auth_token');
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('[API Request] Added auth token to request');
          }
        } catch (error) {
          console.error('[API Request] Error getting token from storage:', error);
        }
        return config;
      },
      (error) => {
        console.error('[API Request] Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        console.log(`[API Response] ${response.status} ${response.config.url}`);
        return response;
      },
      async (error) => {
        console.error('[API Response] Error:', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
        });
        if (error.response?.status === 401) {
          console.log('[API Response] 401 Unauthorized - removing token');
          await storage.removeItem('auth_token');
        }
        return Promise.reject(error);
      }
    );
  }

  public getClient(): AxiosInstance {
    return this.client;
  }

  public setBaseURL(url: string) {
    this.client.defaults.baseURL = url;
  }
}

export const apiClient = new ApiClient().getClient();
export { API_BASE_URL };

