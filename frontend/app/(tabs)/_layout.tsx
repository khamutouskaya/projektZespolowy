import { Tabs } from "expo-router";
import { ImageBackground, StyleSheet } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <ImageBackground
            source={require("../../assets/images/background.png")}
            style={styles.tabBackground}
          />
        ),
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="diary" options={{ title: "Dziennik" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    borderTopWidth: 0,
    backgroundColor: "transparent", // ❗ важно
    height: 80,

    shadowColor: "#736b6b",
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  tabBackground: {
    flex: 1,
  },
});
