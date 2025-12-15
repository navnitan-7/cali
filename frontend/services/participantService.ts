import { apiClient } from './apiConfig';

export interface Participant {
  id: number;
  name: string;
  age: number;
  gender: string;
  weight: number;
  phone: string;
  country: string;
  state: string;
  event_id?: number;
  participant_id?: number;
}

export interface CreateParticipantData {
  name: string;
  age: number;
  gender: string;
  weight: number;
  phone: string;
  country: string;
  state: string;
  event_id: number[];
}

export interface UpdateParticipantData {
  name: string;
  age: number;
  gender: string;
  weight: number;
  phone: string;
  country: string;
  state: string;
  event_id?: number[];
}

class ParticipantService {
  async createParticipant(data: CreateParticipantData): Promise<{ message: string; participant_id: number }> {
    const response = await apiClient.post('/participants/create', data);
    return response.data;
  }

  async getParticipants(): Promise<Participant[]> {
    const response = await apiClient.get<Participant[]>('/participants/get');
    return response.data;
  }

  async getParticipant(id: number): Promise<Participant> {
    const response = await apiClient.get<Participant[]>(`/participants/get/${id}`);
    return response.data[0];
  }

  async getParticipantsByEvent(eventId: number): Promise<Participant[]> {
    const response = await apiClient.get<Participant[]>(`/participants/by_event/${eventId}`);
    return response.data;
  }

  async updateParticipant(id: number, data: UpdateParticipantData): Promise<{ message: string }> {
    const response = await apiClient.put(`/participants/update/${id}`, data);
    return response.data;
  }
}

export const participantService = new ParticipantService();

