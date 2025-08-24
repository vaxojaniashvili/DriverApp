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
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { useColorScheme } from "@/hooks/useColorScheme";
// Firebase და Notifications import
import {
  registerForPushNotifications,
  addNotificationListeners,
} from "../services/notificationService";
import "../services/firebaseConfig"; // Firebase initialization
// Firebase messaging import
import messaging from "@react-native-firebase/messaging";
import { supabase } from "@/infrastructure/db/supabase";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Firebase background message handler (app-ის გარეთ უნდა იყოს)
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log("Message handled in the background!", remoteMessage);
});

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

  // Firebase Message Handlers
  useEffect(() => {
    if (Platform.OS === "android") {
      const setupFirebaseHandlers = () => {
        // Foreground message handler
        const unsubscribeForeground = messaging().onMessage(
          async (remoteMessage) => {
            console.log("Foreground FCM message received!", remoteMessage);

            // Show local notification when app is in foreground
            await Notifications.scheduleNotificationAsync({
              content: {
                title: remoteMessage.notification?.title || "New Message",
                body:
                  remoteMessage.notification?.body || "You have a new message",
                data: remoteMessage.data,
                sound: true,
              },
              trigger: null,
            });
          }
        );

        // Notification opened app from background
        const unsubscribeNotificationOpened =
          messaging().onNotificationOpenedApp((remoteMessage) => {
            console.log(
              "Notification opened app from background:",
              remoteMessage
            );
          });

        // Check if app was opened from notification (cold start)
        messaging()
          .getInitialNotification()
          .then((remoteMessage) => {
            if (remoteMessage) {
              console.log(
                "App opened from notification (cold start):",
                remoteMessage
              );
            }
          });

        return () => {
          unsubscribeForeground();
          unsubscribeNotificationOpened();
        };
      };

      const cleanup = setupFirebaseHandlers();
      return cleanup;
    }
  }, []);

  useEffect(() => {
    const setupNotifications = async () => {
      const fetchUserData = async () => {
        try {
          const {
            data: { user },
            error,
          } = await supabase.auth.getUser();

          if (error) {
            console.error("Supabase getUser error:", error);
            return null;
          }

          return user;
        } catch (error) {
          console.error("Error fetching user data:", error);
          return null;
        }
      };

      const user = await fetchUserData();

      try {
        const driverId = user?.id || "d2d9c7ea-213d-4dee-8aaf-a55a163b75ce";

        if (!user) {
          console.log(
            "User not logged in. Using fallback ID for push notification registration."
          );
        }

        // Register for push notifications
        await registerForPushNotifications(driverId);

        // Add notification listeners
        const removeListeners = addNotificationListeners(
          (notification) => {
            console.log("Notification received:", notification);
            // აქ შეგიძლია notification handle-ი
          },
          (response) => {
            console.log("Notification tapped:", response);
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
