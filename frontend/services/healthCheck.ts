import { apiClient } from './apiConfig';

export const healthCheck = async (): Promise<{ status: 'ok' | 'error'; message?: string }> => {
  try {
    const response = await apiClient.get('/');
    if (response.status === 200) {
      return { status: 'ok', message: response.data.message };
    }
    return { status: 'error', message: 'Unexpected response' };
  } catch (error: any) {
    return { 
      status: 'error', 
      message: error.message || 'Backend is not reachable' 
    };
  }
};

