export interface Participant {
  id: number;
  name: string;
  age: number;
  gender: string;
  weight: number;
  phone: string;
  country: string;
  state: string;
  email?: string;
  category?: string;
  created_at?: string;
}

export interface Event {
  id: number;
  name: string;
  event_type: number;
  description?: string;
  created_at?: string;
}

export interface Registration {
  id: number;
  participant_id: number;
  event_id: number;
  bib_number: string;
  division: string;
  created_at: string;
  participant?: Participant;
  event?: Event;
}

export interface Attempt {
  id: number;
  registration_id: number;
  duration_ms?: number;
  reps?: number;
  weight?: number;
  success: boolean;
  notes?: string;
  created_at: string;
  videos?: Video[];
}

export interface Video {
  id: number;
  attempt_id: number;
  file_url: string;
  created_at: string;
}

export interface LeaderboardEntry {
  registration_id: number;
  participant_name: string;
  bib_number: string;
  division: string;
  best_time?: number;
  best_reps?: number;
  best_weight?: number;
  total_attempts: number;
  rank: number;
}

export interface CreateAttemptInput {
  registration_id: number;
  event_id: number;
  participant_id: number;
  duration_ms?: number;
  reps?: number;
  weight?: number;
  success: boolean;
  notes?: string;
}

export interface DashboardStats {
  total_participants: number;
  total_events: number;
  active_events: Event[];
}

