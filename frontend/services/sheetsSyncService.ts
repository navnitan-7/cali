import { apiClient } from './apiConfig';

export interface SyncResponse {
  message: string;
  participants_added: number;
  associations_added: number;
}

class SheetsSyncService {
  async syncSheets(): Promise<SyncResponse> {
    const response = await apiClient.post<SyncResponse>('/sheets_sync/sync');
    return response.data;
  }
}

export const sheetsSyncService = new SheetsSyncService();

