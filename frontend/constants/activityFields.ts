// Activity fields mapping based on event_type ID (matches backend constants.py)
export const ACTIVITY_FIELDS_BY_EVENT: Record<number, string[]> = {
  1: ["attempt_id", "time"],
  2: ["attempt_id", "weight", "type_of_activity", "is_success"],
  3: ["attempt_id", "time", "type_of_activity", "is_success"],
  4: ["attempt_id", "time", "type_of_activity", "is_success"],
};

// Maximum attempts per event type (matches backend activity.py)
export const MAX_ATTEMPTS_PER_EVENT: Record<number, number> = {
  1: 1,
  2: 6,
  3: 1,
  4: 1,
};

// Field labels for display
export const FIELD_LABELS: Record<string, string> = {
  attempt_id: "Attempt ID",
  time: "Time",
  weight: "Weight",
  type_of_activity: "Type of Activity",
  is_success: "Success",
};

// Field icons (Ionicons names)
export const FIELD_ICONS: Record<string, string> = {
  attempt_id: "number-outline",
  time: "time-outline",
  weight: "barbell-outline",
  type_of_activity: "list-outline",
  is_success: "checkmark-circle-outline",
};

