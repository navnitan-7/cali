import { Stack } from 'expo-router';

export default function EventsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Events',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Event Details',
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: 'Create Event',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="add-participant"
        options={{
          title: 'Add Participant',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="participant/[participantId]"
        options={{
          title: 'Participant Details',
        }}
      />
    </Stack>
  );
}
