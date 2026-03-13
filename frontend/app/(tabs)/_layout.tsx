import { Tabs } from "expo-router";
<<<<<<< HEAD
import { StyleSheet, ImageBackground } from "react-native";
import LayoutContainer from "@/shared/layout/LayoutContainer";

const TabBarBackground = () => (
  <ImageBackground
    source={require("../../assets/images/background.png")}
    style={{ flex: 1 }}
    resizeMode="cover"
  />
);

export default function TabLayout() {
  return (
    <LayoutContainer>
      <Tabs
        screenOptions={{
          headerShown: false,
          sceneStyle: {
            backgroundColor: "transparent",
          },
          tabBarStyle: styles.tabBar,
          tabBarBackground: TabBarBackground,
        }}
      >
        <Tabs.Screen name="diary" options={{ title: "Dziennik" }} />
        <Tabs.Screen name="planer" options={{ title: "Planer" }} />
        <Tabs.Screen name="home" options={{ title: "Home" }} />
        <Tabs.Screen name="assistant" options={{ title: "Asystent" }} />
        <Tabs.Screen name="reflection" options={{ title: "Reflekcja" }} />
      </Tabs>
    </LayoutContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    borderTopWidth: 0,
    backgroundColor: "transparent",
    height: 80,
    shadowColor: "#736b6b",
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
=======

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="explore" options={{ title: "Explore" }} />
    </Tabs>
  );
}
>>>>>>> 34bd785 (Przywrócenie wcześniejszego stanu maina)
