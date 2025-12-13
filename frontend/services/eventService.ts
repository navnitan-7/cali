import { apiClient } from './apiConfig';

export interface EventType {
  id: number;
  name: string;
}

export interface Event {
  id: number;
  name: string;
  description: string;
  event_type: string;
  event_id?: number;
  participant_id?: number;
}

export interface CreateEventData {
  name: string;
  description: string;
  event_type: number;
}

class EventService {
  async createEvent(data: CreateEventData): Promise<{ message: string }> {
    const response = await apiClient.post('/events/create', data);
    return response.data;
  }

  async getEvents(): Promise<Event[]> {
    const response = await apiClient.get<Event[]>('/events/get');
    return response.data;
  }

  async getEvent(id: number): Promise<Event> {
    const response = await apiClient.get<Event[]>(`/events/get/${id}`);
    return response.data[0];
  }

  async getEventTypes(): Promise<EventType[]> {
    const response = await apiClient.get<EventType[]>('/events/list_event_type');
    return response.data;
  }

  async getEventsByParticipant(participantId: number): Promise<Event[]> {
    const response = await apiClient.get<Event[]>(`/events/by_participant/${participantId}`);
    return response.data;
  }
}

export const eventService = new EventService();

