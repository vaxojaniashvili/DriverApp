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

  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => {
        console.log("Push Token:", token);
        setExpoPushToken(token ?? "");

        if (token) {
          sendTokenToBackend(token);
        }
      })
      .catch((error) => console.error("Push token error:", error));

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
  };
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      Alert.alert(
        "Push Notifications გათიშულია",
        "გთხოვთ ჩართოთ push notifications Settings-ში"
      );
      return;
    }

    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error("Project ID not found");
      }

      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log("✅ Push token generated:", token);
    } catch (e) {
      console.error("❌ Push token error:", e);
      token = `${e}`;
    }
  } else {
    Alert.alert("Physical device საჭიროა Push Notifications-ისთვის");
  }

  return token;
}

function handleIncomingNotification(notification) {
  const data = notification.request.content.data;

  console.log("Notification data:", data);

  if (data?.type === "new_order") {
    Alert.alert("ახალი ორდერი!", `ორდერი #${data.orderId}`, [
      { text: "შევეხოთ", onPress: () => console.log("Order viewed") },
      { text: "მოგვიანებით", style: "cancel" },
    ]);
  }
}

function handleNotificationTap(response) {
  const data = response.notification.request.content.data;

  if (data?.type === "new_order") {
    console.log("Navigate to order:", data.orderId);
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
        driverId: "CURRENT_DRIVER_ID",
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
