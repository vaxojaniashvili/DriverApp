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

export async function registerForPushNotifications(driverId) {
  if (!Device.isDevice) {
    alert("Must use physical device for Push Notifications");
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    alert("Failed to get push token!");
    return;
  }

  // Firebase device token
  const deviceToken = await Notifications.getDevicePushTokenAsync();
  console.log("Device Token:", deviceToken.data);

  // Backend-ზე გაგზავნა
  await savePushTokenToBackend(deviceToken.data, driverId);

  return deviceToken.data;
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
