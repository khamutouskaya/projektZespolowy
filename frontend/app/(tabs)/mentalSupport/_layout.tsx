import { Stack } from "expo-router";

export default function MentalSupportLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="breathing" />
      <Stack.Screen name="meditation" />
      <Stack.Screen name="nature" />
      <Stack.Screen name="training" />
    </Stack>
  );
}
