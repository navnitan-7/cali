import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import { router } from 'expo-router';

// Determine the API base URL based on platform
const getApiBaseUrl = () => {
  // Check for environment variable first
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  
  if (envUrl) {
    // If environment variable is set, handle Android-specific cases
    if (Platform.OS === 'android') {
      // Android emulator: 127.0.0.1 and localhost don't work, need 10.0.2.2
      // Physical device: 127.0.0.1 doesn't work, need computer's IP
      
      // Parse URL manually (URL constructor may not work in all React Native environments)
      const urlMatch = envUrl.match(/^https?:\/\/([^:]+):?(\d+)?/);
      
      if (urlMatch) {
        const hostname = urlMatch[1];
        const port = urlMatch[2] || '61944';
        
        // Replace localhost/127.0.0.1 with Android-appropriate address
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          // For Android emulator, use 10.0.2.2 (special IP that maps to host's localhost)
          // For physical device, you'll need to set your computer's IP in .env
          // You can detect emulator vs device, but simpler to use 10.0.2.2 for emulator
          // and set computer IP for physical device in .env
          const protocol = envUrl.startsWith('https') ? 'https' : 'http';
          return `${protocol}://10.0.2.2:${port}`;
        }
      }
    }
    
    // For iOS and web, use the env URL as-is
    return envUrl;
  }
  
  // Default based on platform (fallback if no env var)
  // Default to production backend
  return 'https://api.vyzify.com';
};

const API_BASE_URL = getApiBaseUrl();

// Log the API URL being used (helpful for debugging)
console.log(`[API Config] Using API Base URL: ${API_BASE_URL} (Platform: ${Platform.OS})`);
console.log(`[API Config] Environment URL: ${process.env.EXPO_PUBLIC_API_URL || 'not set'}`);

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
        const method = config.method?.toUpperCase() || 'UNKNOWN';
        const url = config.url || 'unknown';
        
        // Log basic request info
        console.log(`[API Request] ${method} ${url}`);
        
        // Log request payload for POST, PUT, PATCH requests
        if (['POST', 'PUT', 'PATCH'].includes(method) && config.data) {
          // Sanitize sensitive data (passwords, tokens, etc.)
          const sanitizedData = this.sanitizeData(config.data);
          console.log(`[API Request] Payload:`, JSON.stringify(sanitizedData, null, 2));
        }
        
        // Log query parameters for GET requests
        if (method === 'GET' && config.params) {
          console.log(`[API Request] Query Params:`, JSON.stringify(config.params, null, 2));
        }
        
        // Log headers (excluding sensitive ones)
        if (config.headers) {
          const headersToLog: Record<string, string> = {};
          Object.keys(config.headers).forEach(key => {
            const lowerKey = key.toLowerCase();
            // Don't log sensitive headers
            if (!lowerKey.includes('authorization') && !lowerKey.includes('token')) {
              headersToLog[key] = config.headers[key] as string;
            }
          });
          if (Object.keys(headersToLog).length > 0) {
            console.log(`[API Request] Headers:`, JSON.stringify(headersToLog, null, 2));
          }
        }
        
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
        const status = response.status;
        const url = response.config.url || 'unknown';
        const method = response.config.method?.toUpperCase() || 'UNKNOWN';
        
        // Log basic response info
        console.log(`[API Response] ${status} ${method} ${url}`);
        
        // Log response data/payload
        if (response.data) {
          // Sanitize sensitive data in response
          const sanitizedData = this.sanitizeData(response.data);
          console.log(`[API Response] Payload:`, JSON.stringify(sanitizedData, null, 2));
        }
        
        // Log response headers (excluding sensitive ones)
        if (response.headers) {
          const headersToLog: Record<string, string> = {};
          Object.keys(response.headers).forEach(key => {
            const lowerKey = key.toLowerCase();
            // Don't log sensitive headers
            if (!lowerKey.includes('authorization') && !lowerKey.includes('token') && !lowerKey.includes('cookie')) {
              headersToLog[key] = response.headers[key] as string;
            }
          });
          if (Object.keys(headersToLog).length > 0) {
            console.log(`[API Response] Headers:`, JSON.stringify(headersToLog, null, 2));
          }
        }
        
        return response;
      },
      async (error) => {
        const isNetworkError = error.message === 'Network Error' || !error.response;
        const method = error.config?.method?.toUpperCase() || 'UNKNOWN';
        const url = error.config?.url || 'unknown';
        const status = error.response?.status;
        
        // Log error request details
        console.error(`[API Response] Error ${status || 'NETWORK'} ${method} ${url}`);
        
        // Log error response payload if available
        if (error.response?.data) {
          const sanitizedErrorData = this.sanitizeData(error.response.data);
          console.error(`[API Response] Error Payload:`, JSON.stringify(sanitizedErrorData, null, 2));
        }
        
        // Log original request payload if it was a POST/PUT/PATCH
        if (['POST', 'PUT', 'PATCH'].includes(method) && error.config?.data) {
          const sanitizedRequestData = this.sanitizeData(error.config.data);
          console.error(`[API Response] Original Request Payload:`, JSON.stringify(sanitizedRequestData, null, 2));
        }
        
        const errorDetails = {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          fullURL: error.config ? `${error.config.baseURL}${error.config.url}` : 'unknown',
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
        };
        
        // Don't log errors for /auth/me 401s (expected during auth check)
        const requestUrl = error.config?.url || '';
        const isAuthCheck = requestUrl.includes('/auth/me') || requestUrl === '/auth/me';
        const isAuthCheck401 = isAuthCheck && error.response?.status === 401;
        
        if (!isAuthCheck401) {
          console.error('[API Response] Error Details:', errorDetails);
        }
        
        // Provide helpful error message for network errors
        if (isNetworkError) {
          console.error('[API Response] Network Error Details:', {
            message: 'Could not reach the backend server',
            attemptedURL: errorDetails.fullURL,
            baseURL: API_BASE_URL,
            platform: Platform.OS,
            suggestions: [
              '1. Make sure the backend server is running (check if you ran: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000)',
              `2. Verify the API URL is correct: ${API_BASE_URL}`,
              Platform.OS === 'android' 
                ? '3. For Android emulator, try: http://10.0.2.2:8000 instead of localhost'
                : Platform.OS === 'web'
                ? '3. For web, make sure you can access the backend at the configured URL'
                : '3. Check your network connection',
              Platform.OS === 'android'
                ? '4. For physical Android device, ensure your device and computer are on the same network, and update the IP in apiConfig.ts'
                : '',
            ].filter(Boolean),
          });
        }
        if (error.response?.status === 401) {
          const requestUrl = error.config?.url || '';
          // Don't logout if 401 is from login/register endpoints (invalid credentials)
          const isAuthEndpoint = requestUrl.includes('/auth/login') || 
                                requestUrl.includes('/auth/register') ||
                                requestUrl === '/auth/login' ||
                                requestUrl === '/auth/register';
          
          // Don't log errors for /auth/me during auth check (expected behavior)
          const isAuthCheck = requestUrl.includes('/auth/me') || requestUrl === '/auth/me';
          
          if (!isAuthEndpoint && !isAuthCheck) {
            // Check if user is authenticated BEFORE removing token
            // Using dynamic import to avoid circular dependency
            try {
              const { useAuthStore } = await import('../stores/authStore');
              const { isAuthenticated, logout } = useAuthStore.getState();
              
              // Only logout if user is actually authenticated (not during login flow)
              if (isAuthenticated) {
                console.log('[API Response] 401 Unauthorized - token expired, logging out');
                
                // Call logout which will remove token and clear state
                await logout();
                
                // Navigate to login page
                setTimeout(() => {
                  try {
                    router.replace('/login');
                  } catch (navError) {
                    console.error('[API Response] Navigation error:', navError);
                  }
                }, 100);
              }
            } catch (logoutError) {
              console.error('[API Response] Error during logout:', logoutError);
              // Fallback: remove token from storage if store access fails
              await storage.removeItem('auth_token');
              await storage.removeItem('token_type');
            }
          }
          
          // Suppress error logging for /auth/me 401s (expected during auth check)
          if (isAuthCheck) {
            // Don't log this as an error, it's expected when checking auth status
            return Promise.reject(error);
          }
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

  /**
   * Sanitize sensitive data from logs (passwords, tokens, etc.)
   */
  private sanitizeData(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }

    const sanitized: Record<string, any> = {};
    const sensitiveKeys = ['password', 'token', 'authorization', 'secret', 'api_key', 'apikey', 'access_token', 'refresh_token'];
    
    for (const key in data) {
      const lowerKey = key.toLowerCase();
      const isSensitive = sensitiveKeys.some(sensitive => lowerKey.includes(sensitive));
      
      if (isSensitive) {
        sanitized[key] = '***REDACTED***';
      } else if (typeof data[key] === 'object' && data[key] !== null) {
        sanitized[key] = this.sanitizeData(data[key]);
      } else {
        sanitized[key] = data[key];
      }
    }
    
    return sanitized;
  }
}

export const apiClient = new ApiClient().getClient();
export { API_BASE_URL };

