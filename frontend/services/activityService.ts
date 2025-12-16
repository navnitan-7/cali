import { apiClient } from './apiConfig';

export interface ActivityMetric {
  attempt_id: number;
  time?: number;
  weight?: number;
  type_of_activity?: string;
  is_success?: boolean;
}

export interface AddActivityData {
  event_id: number;
  event_type: number;
  participant_id: number;
  attempt_id: number;
  weight?: number | null;
  type_of_activity: string;
  reps?: number | null;
  time?: number | null;
  is_success?: boolean | null;
  is_deleted?: boolean | null;
}

class ActivityService {
  async getMetrics(eventId: number, participantId: number, eventType: number): Promise<ActivityMetric[]> {
    const response = await apiClient.post<ActivityMetric[]>(
      `/activity/get_metrics/event_id/${eventId}`,
      null,
      {
        params: { participant_id: participantId, event_type: eventType },
      }
    );
    return response.data;
  }

  async addActivity(data: AddActivityData): Promise<{ message: string }> {
    const response = await apiClient.post('/activity/add_activity/', data);
    return response.data;
  }

  async updateActivity(data: AddActivityData): Promise<{ message: string }> {
    const response = await apiClient.put('/activity/update_activity/', data);
    return response.data;
  }
}

export const activityService = new ActivityService();

