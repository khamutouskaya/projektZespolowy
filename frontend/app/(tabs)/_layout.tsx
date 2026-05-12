import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { useAuthStore } from "../../src/services/store/useAuthStore"; //TODO tymczasowe do wylogowywania

const TabBarBackground = () => (
  <View style={styles.tabBarBackgroundContainer}>
    <BlurView
      intensity={10}
      tint="light"
      style={styles.blurView}
    />
  </View>
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
        tabBarItemStyle: styles.tabBarItem,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIconStyle: styles.tabBarIcon,
        //tabBarActiveTintColor: "#355A7A",
        //tabBarInactiveTintColor: "rgba(111,122,134,0.55)",
      }}
    >
      <Tabs.Screen
        name="planer"
        options={{
          title: "Planer",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "today" : "today-outline"} size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="diary"
        options={{
          title: "Dziennik",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "create" : "create-outline"} size={size} color={color} />
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
        name="mentalSupport"
        options={{
          title: "Mental Support",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "heart-circle" : "heart-circle-outline"} size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="assistant"
        options={{
          title: "Asystent",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "color-wand" : "color-wand-outline"}
              size={size}
              color={color}
            />
          ),
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
    left: 20,
    right: 20,
    bottom: 12,
    borderTopWidth: 0,
    backgroundColor: "transparent",
    height: 64,
    borderRadius: 32,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 20,
    paddingTop: 4,
    paddingBottom: 4,
    paddingHorizontal: 4,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  tabBarBackgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    overflow: "hidden",
  },
  blurView: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 0,
    marginBottom: 2,
  },
  tabBarItem: {
    paddingHorizontal: 0,
    minWidth: 50,
  },
  tabBarIcon: {
    marginTop: 2,
  },
});
