import axios from 'axios';
import { API_BASE_URL } from '@/constants/config';
import type {
  Participant,
  Event,
  Registration,
  Attempt,
  Video,
  LeaderboardEntry,
  CreateAttemptInput,
  DashboardStats,
} from '@/types/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Participants
export const getParticipants = async (): Promise<Participant[]> => {
  const { data } = await api.get('/participants/get');
  return data;
};

export const getParticipant = async (id: number): Promise<Participant> => {
  const { data } = await api.get(`/participants/get/${id}`);
  return data?.[0] || data;
};

export const getParticipantRegistrations = async (participantId: number): Promise<Registration[]> => {
  const { data } = await api.get(`/events/get/participant/${participantId}`);
  
  // Transform the data to match our Registration interface
  return data.map((item: any) => ({
    id: item.participant_id, // Using participant_id as registration id
    participant_id: item.participant_id,
    event_id: item.event_id,
    bib_number: `${participantId}`, // Using participant id as bib number
    division: 'General', // Default division
    created_at: new Date().toISOString(),
    event: {
      id: item.id,
      name: item.name,
      event_type: item.event_type,
      description: item.description,
    },
  }));
};

// Events
export const getEvents = async (): Promise<Event[]> => {
  const { data } = await api.get('/events/get');
  return data;
};

export const getEvent = async (id: number): Promise<Event> => {
  const { data } = await api.get(`/events/get/${id}`);
  return data?.[0] || data;
};

export const getEventRegistrations = async (eventId: number): Promise<Registration[]> => {
  const { data } = await api.get(`/participants/by_event/${eventId}`);
  
  // Transform the data to match our Registration interface
  return data.map((item: any) => ({
    id: item.participant_id, // Using participant_id as registration id
    participant_id: item.participant_id,
    event_id: item.event_id,
    bib_number: `${item.id}`, // Using participant id as bib number for now
    division: item.gender, // Using gender as division
    created_at: new Date().toISOString(),
    participant: {
      id: item.id,
      name: item.name,
      age: item.age,
      gender: item.gender,
      weight: item.weight,
      phone: item.phone,
      country: item.country,
      state: item.state,
    },
  }));
};

export const getEventLeaderboard = async (eventId: number): Promise<LeaderboardEntry[]> => {
  // Backend doesn't have leaderboard endpoint yet
  // You may need to add this endpoint to the backend
  return [];
};

// Registrations (participants_events relationship)
export const getRegistration = async (id: number): Promise<Registration> => {
  // Backend doesn't have a direct registration endpoint
  // This would need to be added or we need to construct it from participant and event data
  return {
    id,
    participant_id: 0,
    event_id: 0,
    bib_number: '',
    division: '',
    created_at: new Date().toISOString(),
  };
};

// Attempts (Activity in backend)
export const getRegistrationAttempts = async (registrationId: number, eventId: number, participantId: number): Promise<Attempt[]> => {
  // Backend uses /activity/get_metrics/event_id/{event_id} with participant_id in body
  const { data } = await api.post(`/activity/get_metrics/event_id/${eventId}`, null, {
    params: { participant_id: participantId }
  });
  
  // Transform backend activity data to frontend Attempt format
  return data.map((activity: any) => ({
    id: activity.attempt_id,
    registration_id: registrationId,
    duration_ms: activity.time ? activity.time * 1000 : undefined,
    reps: activity.reps,
    weight: activity.weight,
    success: activity.is_success ?? true,
    notes: activity.type_of_activity,
    created_at: new Date().toISOString(),
    videos: [],
  }));
};

export const createAttempt = async (input: CreateAttemptInput): Promise<Attempt> => {
  // Backend uses /activity/add_activity/ with different structure
  // We need event_id and participant_id which should be passed in the input
  const activityInput = {
    event_id: (input as any).event_id || 1,
    participant_id: (input as any).participant_id || 1,
    attempt_id: Math.floor(Math.random() * 1000000), // Generate random attempt ID
    weight: input.weight || null,
    type_of_activity: input.notes || 'attempt',
    reps: input.reps || null,
    time: input.duration_ms ? input.duration_ms / 1000 : null,
    is_success: input.success,
    is_deleted: false,
  };
  
  await api.post('/activity/add_activity/', activityInput);
  
  return {
    id: activityInput.attempt_id,
    registration_id: input.registration_id,
    duration_ms: input.duration_ms,
    reps: input.reps,
    weight: input.weight,
    success: input.success,
    notes: input.notes,
    created_at: new Date().toISOString(),
    videos: [],
  };
};

export const updateAttempt = async (id: number, input: Partial<CreateAttemptInput>): Promise<Attempt> => {
  // Backend doesn't have update attempt endpoint
  throw new Error('Update attempt not supported by backend');
};

export const deleteAttempt = async (id: number): Promise<void> => {
  // Backend doesn't have delete attempt endpoint
  // Could set is_deleted flag if needed
  throw new Error('Delete attempt not supported by backend');
};

// Videos
export const uploadVideo = async (attemptId: number, file: FormData): Promise<Video> => {
  // Backend doesn't have video upload endpoint yet
  // This would need to be added to the backend
  throw new Error('Video upload not supported by backend yet');
};

export const getAttemptVideos = async (attemptId: number): Promise<Video[]> => {
  // Backend doesn't have video endpoints yet
  return [];
};

export const deleteVideo = async (id: number): Promise<void> => {
  // Backend doesn't have video endpoints yet
  throw new Error('Delete video not supported by backend yet');
};

// Dashboard
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const [participants, events] = await Promise.all([
    getParticipants(),
    getEvents(),
  ]);
  
  return {
    total_participants: participants.length,
    total_events: events.length,
    active_events: events.slice(0, 5),
  };
};

export default api;

