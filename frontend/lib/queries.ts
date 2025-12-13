import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './api';
import type { CreateAttemptInput } from '@/types/api';

// Participants
export const useParticipants = () => {
  return useQuery({
    queryKey: ['participants'],
    queryFn: api.getParticipants,
  });
};

export const useParticipant = (id: number) => {
  return useQuery({
    queryKey: ['participants', id],
    queryFn: () => api.getParticipant(id),
    enabled: !!id,
  });
};

export const useParticipantRegistrations = (participantId: number) => {
  return useQuery({
    queryKey: ['participants', participantId, 'registrations'],
    queryFn: () => api.getParticipantRegistrations(participantId),
    enabled: !!participantId,
  });
};

// Events
export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: api.getEvents,
  });
};

export const useEvent = (id: number) => {
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => api.getEvent(id),
    enabled: !!id,
  });
};

export const useEventRegistrations = (eventId: number) => {
  return useQuery({
    queryKey: ['events', eventId, 'registrations'],
    queryFn: () => api.getEventRegistrations(eventId),
    enabled: !!eventId,
  });
};

export const useEventLeaderboard = (eventId: number) => {
  return useQuery({
    queryKey: ['events', eventId, 'leaderboard'],
    queryFn: () => api.getEventLeaderboard(eventId),
    enabled: !!eventId,
  });
};

// Registrations
export const useRegistration = (id: number) => {
  return useQuery({
    queryKey: ['registrations', id],
    queryFn: () => api.getRegistration(id),
    enabled: !!id,
  });
};

// Attempts
export const useRegistrationAttempts = (registrationId: number, eventId: number, participantId: number) => {
  return useQuery({
    queryKey: ['registrations', registrationId, 'attempts'],
    queryFn: () => api.getRegistrationAttempts(registrationId, eventId, participantId),
    enabled: !!registrationId && !!eventId && !!participantId,
  });
};

export const useCreateAttempt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: CreateAttemptInput) => api.createAttempt(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['registrations', variables.registration_id, 'attempts'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useUpdateAttempt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<CreateAttemptInput> }) =>
      api.updateAttempt(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useDeleteAttempt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => api.deleteAttempt(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

// Videos
export const useAttemptVideos = (attemptId: number) => {
  return useQuery({
    queryKey: ['attempts', attemptId, 'videos'],
    queryFn: () => api.getAttemptVideos(attemptId),
    enabled: !!attemptId,
  });
};

export const useUploadVideo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ attemptId, file }: { attemptId: number; file: FormData }) =>
      api.uploadVideo(attemptId, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attempts', variables.attemptId, 'videos'] });
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
    },
  });
};

export const useDeleteVideo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => api.deleteVideo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attempts'] });
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
    },
  });
};

// Dashboard
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: api.getDashboardStats,
  });
};

