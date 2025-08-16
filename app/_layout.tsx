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

import { useColorScheme } from "@/hooks/useColorScheme";
// Firebase და Notifications import
import {
  registerForPushNotifications,
  addNotificationListeners,
} from "../services/notificationService";
import "../services/firebaseConfig"; // Firebase initialization

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Push Notifications Setup
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        // Driver ID - შეცვალე შენი authentication logic-ით
        const driverId = "driver_12345"; // ეს უნდა მოიღო user authentication-იდან

        // Register for push notifications
        await registerForPushNotifications(driverId);

        // Add notification listeners
        const removeListeners = addNotificationListeners(
          (notification) => {
            console.log("📱 Notification received:", notification);
            // აქ შეგიძლია notification handle-ი
          },
          (response) => {
            console.log("👆 Notification tapped:", response);
            // აქ შეგიძლია notification tap handle-ი
          }
        );

        // Cleanup function
        return removeListeners;
      } catch (error) {
        console.error("Error setting up notifications:", error);
      }
    };

    if (loaded) {
      setupNotifications();
    }
  }, [loaded]);

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
