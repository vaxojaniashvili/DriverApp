import { useEffect, useRef, useState } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform, Alert } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [channels, setChannels] = useState([]);
  const [notification, setNotification] = useState(false);
  const [tokenError, setTokenError] = useState(null);
  const [tokenStatus, setTokenStatus] = useState("initializing"); // "initializing", "loading", "success", "error"

  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    console.log("🚀 Starting push notification setup...");
    setTokenStatus("loading");

    registerForPushNotificationsAsync()
      .then((token) => {
        console.log("✅ Push Token received:", token);
        setExpoPushToken(token ?? "");
        setTokenStatus("success");
        setTokenError(null);

        if (token) {
          sendTokenToBackend(token);
        }
      })
      .catch((error) => {
        console.error("❌ Push token error:", error);
        setTokenError(error.message || "Unknown error");
        setTokenStatus("error");
      });

    if (Platform.OS === "android") {
      Notifications.getNotificationChannelsAsync().then((value) =>
        setChannels(value ?? [])
      );
    }

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("🔔 Notification Received:", notification);
        setNotification(notification);
        handleIncomingNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("👆 Notification Tapped:", response);
        handleNotificationTap(response);
      });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return {
    expoPushToken,
    notification,
    channels,
    tokenError,
    tokenStatus,
  };
}

async function registerForPushNotificationsAsync() {
  let token;

  console.log("📱 Device check:", {
    isDevice: Device.isDevice,
    platform: Platform.OS,
    deviceName: Device.deviceName,
    osVersion: Device.osVersion,
  });

  if (Platform.OS === "android") {
    console.log("🤖 Setting up Android notification channel...");
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  // 🔧 DEVELOPMENT MODE: Allow emulator testing
  const isDevelopment = __DEV__;
  const shouldAllowEmulator = isDevelopment;

  if (Device.isDevice || shouldAllowEmulator) {
    console.log("📋 Checking notification permissions...");
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    console.log("🔐 Current permission status:", existingStatus);

    if (existingStatus !== "granted") {
      console.log("🔐 Requesting notification permissions...");
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log("🔐 New permission status:", status);
    }

    if (finalStatus !== "granted") {
      const errorMsg =
        "Push Notifications disabled - Please enable push notifications in Settings";
      console.error("❌ Permission denied:", errorMsg);
      Alert.alert(
        "Push Notifications disabled",
        "Please enable push notifications in Settings"
      );
      throw new Error(errorMsg);
    }

    try {
      console.log("🔍 Looking for project ID...");

      // Try multiple ways to get project ID
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId ??
        Constants?.manifest?.extra?.eas?.projectId;

      console.log("🔍 Project ID sources:", {
        expoConfig: Constants?.expoConfig?.extra?.eas?.projectId,
        easConfig: Constants?.easConfig?.projectId,
        manifest: Constants?.manifest?.extra?.eas?.projectId,
        final: projectId,
      });

      if (!projectId) {
        const errorMsg = "Project ID not found in Constants";
        console.error("❌", errorMsg);
        throw new Error(errorMsg);
      }

      console.log("🎯 Using project ID:", projectId);
      console.log("📤 Requesting Expo push token...");

      const tokenResult = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      token = tokenResult.data;

      console.log("✅ Push token generated successfully:", token);
    } catch (e) {
      console.error("❌ Push token generation error:", e);
      console.error("❌ Error details:", {
        message: e.message,
        stack: e.stack,
        constants: {
          expoConfig: !!Constants?.expoConfig,
          easConfig: !!Constants?.easConfig,
          manifest: !!Constants?.manifest,
        },
      });
      throw e;
    }
  } else {
    const errorMsg = "Physical device required for Push Notifications";
    console.error("❌", errorMsg);
    Alert.alert("Physical device required for Push Notifications");
    throw new Error(errorMsg);
  }

  return token;
}

function handleIncomingNotification(notification) {
  const data = notification.request.content.data;

  console.log("Notification data:", data);

  // Don't show alert here - let the HomeScreen handle it
  // This prevents duplicate alerts
  if (data?.type === "new_order") {
    console.log("📋 New order notification:", data.orderId);
    // Alert will be shown in HomeScreen component
  }
}

function handleNotificationTap(response) {
  const data = response.notification.request.content.data;

  if (data?.type === "new_order") {
    console.log("Navigate to order:", data.orderId);
    // You can add navigation logic here if needed
    // For now, just log the action
  }
}
async function sendTokenToBackend(token) {
  try {
    const response = await fetch("https://api.thevanapp.com/api/pushtoken", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pushToken: token,
        driverId: "12342242",
        platform: Platform.OS,
        deviceInfo: {
          deviceName: Device.deviceName,
          osVersion: Device.osVersion,
        },
      }),
    });

    const result = await response.json();
    console.log("✅ Token registered to backend:", result);
  } catch (error) {
    console.error("❌ Error registering token:", error);
  }
}
