import { Alert } from 'react-native';

export const handleApiError = (error: any, customMessage?: string) => {
  const message = error.response?.data?.detail || error.message || customMessage || 'An error occurred';
  Alert.alert('Error', message);
  console.error('API Error:', error);
};

export const showSuccessMessage = (message: string) => {
  Alert.alert('Success', message);
};

export interface ApiRequestOptions {
  showLoadingIndicator?: boolean;
  showSuccessMessage?: boolean;
  successMessage?: string;
  showErrorAlert?: boolean;
  errorMessage?: string;
}

export const withApiErrorHandling = async <T>(
  apiCall: () => Promise<T>,
  options: ApiRequestOptions = {}
): Promise<{ data: T | null; error: any | null }> => {
  const {
    showSuccessMessage: showSuccess = false,
    successMessage = 'Operation completed successfully',
    showErrorAlert = true,
    errorMessage,
  } = options;

  try {
    const data = await apiCall();
    
    if (showSuccess) {
      showSuccessMessage(successMessage);
    }
    
    return { data, error: null };
  } catch (error: any) {
    if (showErrorAlert) {
      handleApiError(error, errorMessage);
    }
    return { data: null, error };
  }
};

