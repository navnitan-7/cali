import { useState, useCallback } from 'react';
import {
  eventService,
  participantService,
  activityService,
  CreateEventData,
  UpdateEventData,
  CreateParticipantData,
  UpdateParticipantData,
  AddActivityData,
} from '../services';

export const useEventApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createEvent = useCallback(async (data: CreateEventData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await eventService.createEvent(data);
      return result;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to create event';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const getEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const events = await eventService.getEvents();
      return events;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch events';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const getEvent = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const event = await eventService.getEvent(id);
      return event;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch event';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const getEventTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const eventTypes = await eventService.getEventTypes();
      return eventTypes;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch event types';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const getEventsByParticipant = useCallback(async (participantId: number) => {
    try {
      setLoading(true);
      setError(null);
      const events = await eventService.getEventsByParticipant(participantId);
      return events;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch events';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateEvent = useCallback(async (id: number, data: UpdateEventData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await eventService.updateEvent(id, data);
      return result;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to update event';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteEvent = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await eventService.deleteEvent(id);
      return result;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to delete event';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createEvent,
    getEvents,
    getEvent,
    getEventTypes,
    getEventsByParticipant,
    updateEvent,
    deleteEvent,
  };
};

export const useParticipantApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createParticipant = useCallback(async (data: CreateParticipantData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await participantService.createParticipant(data);
      return result;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to create participant';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const getParticipants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const participants = await participantService.getParticipants();
      return participants;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch participants';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const getParticipant = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const participant = await participantService.getParticipant(id);
      return participant;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch participant';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const getParticipantsByEvent = useCallback(async (eventId: number) => {
    try {
      setLoading(true);
      setError(null);
      const participants = await participantService.getParticipantsByEvent(eventId);
      return participants;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch participants';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateParticipant = useCallback(async (id: number, data: UpdateParticipantData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await participantService.updateParticipant(id, data);
      return result;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to update participant';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createParticipant,
    getParticipants,
    getParticipant,
    getParticipantsByEvent,
    updateParticipant,
  };
};

export const useActivityApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMetrics = useCallback(async (eventId: number, participantId: number, eventType: number) => {
    try {
      setLoading(true);
      setError(null);
      const metrics = await activityService.getMetrics(eventId, participantId, eventType);
      return metrics;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch metrics';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const addActivity = useCallback(async (data: AddActivityData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await activityService.addActivity(data);
      return result;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to add activity';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateActivity = useCallback(async (data: AddActivityData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await activityService.updateActivity(data);
      return result;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to update activity';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getMetrics,
    addActivity,
    updateActivity,
  };
};

