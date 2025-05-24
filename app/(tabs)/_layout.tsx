import { Tabs } from "expo-router";
import React from "react";
import { useColorScheme } from "@/hooks/useColorScheme";
import { CustomTabBar } from "@/components/navigation/CustomTabBar";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="homepage"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="current/current"
        options={{
          title: "Current",
        }}
      />
      <Tabs.Screen
        name="Activity/activity"
        options={{
          title: "Activity",
        }}
      />
      <Tabs.Screen name="orderHistory" options={{ title: "orderHistory" }} />
      <Tabs.Screen
        name="settings/index"
        options={{
          title: "Settings",
        }}
      />
      <Tabs.Screen
        name="settings/editprofile"
        options={{
          title: "Settings",
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="settings/notifications"
        options={{
          title: "Settings",
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="settings/privace"
        options={{
          title: "Settings",
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="settings/support"
        options={{
          title: "Settings",
          tabBarButton: () => null,
        }}
      />
    </Tabs>
  );
}
