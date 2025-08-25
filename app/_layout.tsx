import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  registerForPushNotifications,
  addNotificationListeners,
} from "../services/notificationService";
import { supabase } from "@/infrastructure/db/supabase";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Firebase initialization
  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        const { firebase } = require("@react-native-firebase/app");

        if (firebase.apps.length === 0) {
          await firebase.initializeApp();
          console.log("Firebase initialized successfully");
        } else {
          console.log("Firebase already initialized");
        }

        // Initialize messaging after Firebase app is ready
        const messaging = require("@react-native-firebase/messaging").default;

        // Set background message handler
        messaging().setBackgroundMessageHandler(async (remoteMessage) => {
          console.log("Message handled in the background!", remoteMessage);
        });

        setFirebaseInitialized(true);
      } catch (error) {
        console.error("Firebase initialization error:", error);
        setFirebaseInitialized(true); // Continue without Firebase
      }
    };

    initializeFirebase();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Firebase Message Handlers - only after Firebase is initialized
  useEffect(() => {
    if (!firebaseInitialized) return;

    const setupFirebaseHandlers = async () => {
      try {
        const messaging = require("@react-native-firebase/messaging").default;

        // Foreground message handler
        const unsubscribeForeground = messaging().onMessage(
          async (remoteMessage) => {
            console.log("Foreground FCM message received!", remoteMessage);

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
      } catch (error) {
        console.error("Firebase handlers setup error:", error);
        return () => {}; // Empty cleanup function
      }
    };

    const cleanup = setupFirebaseHandlers();
    return () => {
      cleanup.then((cleanupFn) => cleanupFn && cleanupFn());
    };
  }, [firebaseInitialized]);

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

        await registerForPushNotifications(driverId);

        const removeListeners = addNotificationListeners(
          (notification) => {
            console.log("Notification received:", notification);
          },
          (response) => {
            console.log("Notification tapped:", response);
          }
        );

        return removeListeners;
      } catch (error) {
        console.error("Error setting up notifications:", error);
      }
    };

    if (loaded && firebaseInitialized) {
      setupNotifications();
    }
  }, [loaded, firebaseInitialized]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#22c55e" />
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
    </SafeAreaProvider>
  );
}
