import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

// Configuration
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Replace your registerForPushNotifications function with this:

export async function registerForPushNotifications(driverId) {
  console.log(
    "🔍 Starting registerForPushNotifications with driverId:",
    driverId
  );

  if (!Device.isDevice) {
    console.log("❌ Must use physical device for Push Notifications");
    alert("Must use physical device for Push Notifications");
    return null; // Changed from return; to return null;
  }

  try {
    // Added try-catch wrapper
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    console.log("📱 Existing notification permission status:", existingStatus);

    if (existingStatus !== "granted") {
      console.log("🔔 Requesting notification permissions...");
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log("📱 New permission status:", status);
    }

    if (finalStatus !== "granted") {
      console.log("❌ Failed to get push notification permissions");
      alert("Failed to get push token!");
      return null; // Changed from return; to return null;
    }

    console.log("🚀 Getting device push token...");

    // Firebase device token
    const deviceToken = await Notifications.getDevicePushTokenAsync();
    console.log("📋 Device Token Result:", deviceToken);
    console.log("📋 Device Token Type:", typeof deviceToken);
    console.log("📋 Device Token Data:", deviceToken?.data);
    console.log("📋 Device Token Type (data):", typeof deviceToken?.data);

    const tokenData = deviceToken?.data;

    if (!tokenData) {
      // Added null check
      console.log("❌ No device token received");
      return null;
    }

    console.log("✅ Device Token received:", tokenData);

    // Backend-ზე გაგზავნა
    await savePushTokenToBackend(tokenData, driverId);

    return tokenData; // Changed from deviceToken.data to tokenData
  } catch (error) {
    // Added error handling
    console.error("💥 Error in registerForPushNotifications:", error);
    return null;
  }
}

export async function savePushTokenToBackend(pushToken, driverId) {
  try {
    const deviceInfo = await Device.getDeviceTypeAsync();
    const deviceName = await Device.deviceName;
    const osVersion = Device.osVersion;

    const response = await fetch("https://api.thevanapp.com/api/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pushToken: pushToken,
        driverId: driverId,
        platform: Platform.OS,
        deviceName: deviceName || "Unknown Device",
        osVersion: osVersion,
      }),
    });

    if (response.ok) {
      console.log("Push token saved successfully");
    } else {
      console.error("Failed to save push token");
    }
  } catch (error) {
    console.error("Error saving push token:", error);
  }
}

export function addNotificationListeners(onReceived, onResponseReceived) {
  const notificationListener =
    Notifications.addNotificationReceivedListener(onReceived);
  const responseListener =
    Notifications.addNotificationResponseReceivedListener(onResponseReceived);

  return () => {
    Notifications.removeNotificationSubscription(notificationListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
}
