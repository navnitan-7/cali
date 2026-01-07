import { Platform } from 'react-native';
import { API_BASE_URL } from './apiConfig';

// Storage utility for getting auth token
const getAuthToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem('auth_token');
      }
      return null;
    } else {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      return await AsyncStorage.getItem('auth_token');
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export interface VideoUploadParams {
  file: File | { uri: string; name: string; type: string };
  participantName: string;
  participantId: number;
  eventName: string;
  eventId: number;
  category?: string;
  tournamentName?: string;
  onProgress?: (progress: number) => void;
}

export interface VideoUploadResponse {
  success: boolean;
  message: string;
  file_id: string;
  file_name: string;
  view_link: string;
  download_link: string;
  participant_name: string;
  event_name: string;
  category: string | null;
}

export const videoUploadService = {
  /**
   * Upload a video to Google Drive via the backend
   */
  async uploadVideo(params: VideoUploadParams): Promise<VideoUploadResponse> {
    const {
      file,
      participantName,
      participantId,
      eventName,
      eventId,
      category,
      tournamentName,
      onProgress,
    } = params;

    const formData = new FormData();

    // Handle file based on platform
    if (Platform.OS === 'web') {
      // Web: file is already a File object
      formData.append('file', file as File);
    } else {
      // Native: file is { uri, name, type }
      const nativeFile = file as { uri: string; name: string; type: string };
      formData.append('file', {
        uri: nativeFile.uri,
        name: nativeFile.name,
        type: nativeFile.type || 'video/mp4',
      } as any);
    }

    // Add metadata
    formData.append('participant_name', participantName);
    formData.append('participant_id', participantId.toString());
    formData.append('event_name', eventName);
    formData.append('event_id', eventId.toString());
    if (category) {
      formData.append('category', category);
    }
    if (tournamentName) {
      formData.append('tournament_name', tournamentName);
    }

    // Get auth token
    const token = await getAuthToken();

    // Use XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.open('POST', `${API_BASE_URL}/video_upload/upload`);
      
      // Set auth header if available
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      // Track upload progress
      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Failed to parse server response'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.detail || 'Upload failed'));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error during upload'));
      };

      xhr.ontimeout = () => {
        reject(new Error('Upload timed out'));
      };

      // Set timeout (5 minutes for large videos)
      xhr.timeout = 300000;

      xhr.send(formData);
    });
  },

  /**
   * Get video status/info from Google Drive
   */
  async getVideoStatus(fileId: string): Promise<{
    success: boolean;
    file_id: string;
    file_name: string;
    view_link: string;
    download_link: string;
    size: string;
    created_time: string;
  }> {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/video_upload/status/${fileId}`, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || 'Failed to get video status');
    }

    return response.json();
  },
};

export default videoUploadService;

