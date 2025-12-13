import { Stack } from 'expo-router';

export default function TournamentDetailLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="edit"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen name="events" />
      <Stack.Screen name="participants" />
    </Stack>
  );
}

