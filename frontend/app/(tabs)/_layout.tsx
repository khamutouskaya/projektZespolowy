import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          backgroundColor: "rgba(240, 229, 255, 0.5)", // 👈 белый + прозрачность
          borderTopWidth: 0,
          position: "absolute",
        },

        tabBarActiveTintColor: "#375a85",
        tabBarInactiveTintColor: "rgba(55,90,133,0.5)",
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="diary" options={{ title: "Dziennik" }} />
    </Tabs>
  );
}
