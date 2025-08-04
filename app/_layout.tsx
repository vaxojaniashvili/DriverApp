import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import * as Notifications from "expo-notifications";

import { useColorScheme } from "@/hooks/useColorScheme";
import { usePushNotifications } from "@/hooks/usePushNotifications";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Push notifications setup
  const { expoPushToken, notification } = usePushNotifications();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Push token logging and backend registration
  useEffect(() => {
    if (expoPushToken) {
      console.log("✅ Driver app ready with push token:", expoPushToken);
      // Optionally store in AsyncStorage or Context for later use
      // AsyncStorage.setItem('pushToken', expoPushToken);
    }
  }, [expoPushToken]);

  // Handle notifications received while app is open
  useEffect(() => {
    if (notification && isValidNotification(notification)) {
      console.log("🔔 New notification received:", notification);

      const data = notification.request.content.data;
      if (
        data &&
        typeof data === "object" &&
        "type" in data &&
        data.type === "new_order"
      ) {
        console.log("📋 New order notification:", data.orderId);
        // Could trigger a modal, sound, vibration, etc.
      }
    }
  }, [notification]);

  if (!loaded) {
    return null;
  }

  const user = false;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="signUp"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}

function isValidNotification(
  notification: any
): notification is Notifications.Notification {
  return (
    notification &&
    typeof notification === "object" &&
    notification.request &&
    notification.request.content
  );
}
