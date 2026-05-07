import { Stack } from "expo-router";

export default function DiaryLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: "horizontal",
        animationDuration: 200,
      }}
    >
      <Stack.Screen
        name="index"
        options={{ animation: "none" }}
      />
      <Stack.Screen
        name="note"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="entry"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="test"
        options={{ animation: "slide_from_right" }}
      />
    </Stack>
  );
}
