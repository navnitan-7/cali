import { 
  eventService, 
  participantService, 
  activityService,
  Event,
  Participant,
  CreateEventData,
  CreateParticipantData,
  UpdateParticipantData,
  AddActivityData
} from './index';

class TournamentApiService {
  async syncEventsFromBackend(): Promise<Event[]> {
    try {
      const events = await eventService.getEvents();
      return events;
    } catch (error) {
      console.error('Error syncing events:', error);
      throw error;
    }
  }

  async createEventInBackend(data: CreateEventData): Promise<{ message: string }> {
    try {
      const result = await eventService.createEvent(data);
      return result;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async syncParticipantsFromBackend(): Promise<Participant[]> {
    try {
      const participants = await participantService.getParticipants();
      return participants;
    } catch (error) {
      console.error('Error syncing participants:', error);
      throw error;
    }
  }

  async createParticipantInBackend(data: CreateParticipantData): Promise<{ message: string; participant_id: number }> {
    try {
      const result = await participantService.createParticipant(data);
      return result;
    } catch (error) {
      console.error('Error creating participant:', error);
      throw error;
    }
  }

  async updateParticipantInBackend(id: number, data: UpdateParticipantData): Promise<{ message: string }> {
    try {
      const result = await participantService.updateParticipant(id, data);
      return result;
    } catch (error) {
      console.error('Error updating participant:', error);
      throw error;
    }
  }

  async getParticipantsByEvent(eventId: number): Promise<Participant[]> {
    try {
      const participants = await participantService.getParticipantsByEvent(eventId);
      return participants;
    } catch (error) {
      console.error('Error getting participants by event:', error);
      throw error;
    }
  }

  async addActivityToBackend(data: AddActivityData): Promise<{ message: string }> {
    try {
      const result = await activityService.addActivity(data);
      return result;
    } catch (error) {
      console.error('Error adding activity:', error);
      throw error;
    }
  }

  async getMetricsForParticipant(eventId: number, participantId: number) {
    try {
      const metrics = await activityService.getMetrics(eventId, participantId);
      return metrics;
    } catch (error) {
      console.error('Error getting metrics:', error);
      throw error;
    }
  }
}

export const tournamentApiService = new TournamentApiService();

