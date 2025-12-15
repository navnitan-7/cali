import { z } from 'zod';

// Event Schema
export const eventSchema = z.object({
  name: z.string()
    .min(1, 'Event name is required')
    .max(100, 'Event name must be less than 100 characters'),
  category: z.string()
    .min(1, 'Category is required'),
});

export type EventData = z.infer<typeof eventSchema>;

// Extended type (includes id)
export interface EventDataWithId extends EventData {
  id?: string;
  participantCount?: number;
  status?: 'active' | 'upcoming' | 'completed';
}

// Default values
export const eventDefaults: EventData = {
  name: '',
  category: '',
};

// Event categories
export const eventCategories = [
  'Calisthenics',
  'Street Workout',
  'Strength',
  'Endurance',
  'Freestyle',
  'Other',
];

// Divisions
export const divisionOptions = [
  'Men',
  'Women',
  'Open',
  'Youth',
  'Senior',
];

// Metrics
export const metricOptions = [
  { value: 'time', label: 'Time' },
  { value: 'weight', label: 'Weight' },
  { value: 'reps', label: 'Reps' },
];
