import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { ImageBackground, StyleSheet, Alert } from "react-native";
import { useAuthStore } from "../../src/services/store/useAuthStore"; //TODO tymczasowe do wylogowywania

const TabBarBackground = () => (
  <ImageBackground
    source={require("../../assets/images/background.png")}
    style={{ flex: 1, borderRadius: 28, overflow: "hidden" }}
    resizeMode="cover"
  />
);

export default function TabLayout() {
  const logout = useAuthStore((state) => state.logout); //TODO tymczasowe wylogowywanie
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: "transparent",
        },
        tabBarStyle: styles.tabBar,
        tabBarBackground: TabBarBackground,
        //tabBarActiveTintColor: "#355A7A",
        //tabBarInactiveTintColor: "rgba(111,122,134,0.55)",
        //tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="planer"
        options={{
          title: "Planer",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="diary"
        options={{
          title: "Dziennik",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="reflection"
        options={{
          title: "Refleksja",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sunny-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="assistant"
        options={{
          title: "Asystent",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="logout" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 4,
    borderTopWidth: 0,
    backgroundColor: "transparent",
    height: 78,
    borderRadius: 28,
    shadowColor: "#736b6b",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    paddingTop: 6,
    paddingBottom: 6,
  },

  tabBarLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
});
