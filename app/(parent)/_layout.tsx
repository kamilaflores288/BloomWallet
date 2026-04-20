import { Stack } from 'expo-router';

export default function ParentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
