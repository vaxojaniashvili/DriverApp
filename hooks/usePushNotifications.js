import { useEffect, useRef, useState } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform, Alert } from "react-native";
import { supabase } from "@/infrastructure/db/supabase";

// 🔔 NOTIFICATION HANDLER - ყველაზე მნიშვნელოვანი ნაწილი
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    console.log("🔔 Notification Handler Called:", notification);

    // ⚠️ ეს არის მთავარი გასაღები - app foreground-ში როგორ იქცევა
    return {
      shouldShowAlert: true, // ✅ App foreground-ში აჩვენოს alert
      shouldPlaySound: true, // ✅ ხმა დაუკრას
      shouldSetBadge: true, // ✅ Badge icon-ზე
      shouldShowBanner: true, // ✅ iOS banner აჩვენოს
      shouldShowList: true, // ✅ iOS notification center-ში ჩაიწეროს
    };
  },
});

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [channels, setChannels] = useState([]);
  const [notification, setNotification] = useState(null);
  const [tokenError, setTokenError] = useState(null);
  const [tokenStatus, setTokenStatus] = useState("initializing");
  const [driverId, setDriverId] = useState(null);

  const notificationListener = useRef();
  const responseListener = useRef();

  // 🔔 BACKGROUND NOTIFICATION HANDLER
  useEffect(() => {
    const backgroundHandler =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("📱 Background/Closed App Notification Tapped:", response);
        handleNotificationTap(response);
      });

    return () => {
      backgroundHandler &&
        Notifications.removeNotificationSubscription(backgroundHandler);
    };
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("❌ User fetch error:", userError);
          return;
        }

        const id = user?.driverId || user?.id;
        console.log("👤 Driver ID set:", id);
        setDriverId(id);
      } catch (error) {
        console.error("❌ Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    console.log("🚀 Starting push notification setup...");
    setTokenStatus("loading");

    registerForPushNotificationsAsync()
      .then((token) => {
        console.log("✅ Push Token received:", token);
        setExpoPushToken(token ?? "");
        setTokenStatus("success");
        setTokenError(null);

        if (token && driverId) {
          sendTokenToBackend(token, driverId);
        }
      })
      .catch((error) => {
        console.error("❌ Push token error:", error);
        setTokenError(error.message || "Unknown error");
        setTokenStatus("error");
      });

    // 🤖 Android Notification Channel Setup
    if (Platform.OS === "android") {
      setupAndroidNotificationChannel();
      Notifications.getNotificationChannelsAsync().then((value) =>
        setChannels(value ?? [])
      );
    }

    // 🔔 FOREGROUND NOTIFICATION LISTENER
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("🔔 Foreground Notification Received:", notification);
        setNotification(notification);
        handleIncomingNotification(notification);
      });

    // 👆 NOTIFICATION TAP LISTENER
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("👆 Notification Tapped (App Open):", response);
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
  }, [driverId]);

  useEffect(() => {
    if (expoPushToken && driverId) {
      sendTokenToBackend(expoPushToken, driverId);
    }
  }, [driverId, expoPushToken]);

  return {
    expoPushToken,
    notification,
    channels,
    tokenError,
    tokenStatus,
    driverId,
  };
}

// 🤖 ANDROID NOTIFICATION CHANNEL SETUP (გასწორებული)
async function setupAndroidNotificationChannel() {
  if (Platform.OS !== "android") return;

  console.log("🤖 Setting up Android notification channels...");

  // ძირითადი channel - ყველაზე მაღალი prioritet
  await Notifications.setNotificationChannelAsync("default", {
    name: "ძირითადი ნოტიფიკაციები",
    importance: Notifications.AndroidImportance.MAX, // ✅ MAX importance
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#FF231F7C",
    sound: true,
    enableVibrate: true,
    enableLights: true, // ✅ LED lights
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC, // ✅ Lock screen-ზე აჩვენოს
  });

  // ახალი ორდერების channel
  await Notifications.setNotificationChannelAsync("new_orders", {
    name: "ახალი ორდერები",
    importance: Notifications.AndroidImportance.MAX, // ✅ MAX importance
    vibrationPattern: [0, 500, 250, 500, 250, 500], // ✅ უფრო ხანგრძლივი ვიბრაცია
    lightColor: "#00FF00",
    sound: true,
    enableVibrate: true,
    enableLights: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });

  // გადახდების channel
  await Notifications.setNotificationChannelAsync("payments", {
    name: "გადახდები",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 200, 100, 200],
    lightColor: "#FFD700",
    sound: true,
    enableVibrate: true,
    enableLights: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });

  console.log("✅ Android notification channels set up successfully");
}

async function registerForPushNotificationsAsync() {
  let token;

  console.log("📱 Device check:", {
    isDevice: Device.isDevice,
    platform: Platform.OS,
    deviceName: Device.deviceName,
    osVersion: Device.osVersion,
  });

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

      // ✅ უფრო დეტალური permissions request
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowDisplayInCarPlay: true, // ✅ CarPlay support
          allowCriticalAlerts: true, // ✅ Critical alerts
          allowProvisional: true, // ✅ Provisional notifications
          allowAnnouncements: true, // ✅ Siri announcements
        },
        android: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = status;
      console.log("🔐 New permission status:", status);
    }

    if (finalStatus !== "granted") {
      const errorMsg =
        "Push Notifications disabled - Please enable push notifications in Settings";
      console.error("❌ Permission denied:", errorMsg);

      Alert.alert(
        "ნოტიფიკაციები გათიშულია",
        "გთხოვთ ჩართოთ ნოტიფიკაციები:\n\nSettings > [Your App] > Notifications",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Open Settings",
            onPress: () => Notifications.openSettingsAsync(), // ✅ Settings-ში გადაიყვანოს
          },
        ]
      );
      throw new Error(errorMsg);
    }

    try {
      console.log("🔍 Looking for project ID...");

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
    Alert.alert("საჭიროა ფიზიკური მოწყობილობა Push Notifications-ისთვის");
    throw new Error(errorMsg);
  }

  return token;
}

// შესწორებული sendTokenToBackend ფუნქცია
async function sendTokenToBackend(token, driverId) {
  if (!driverId) {
    console.error("❌ Driver ID not available, skipping token registration");
    return;
  }

  try {
    console.log("📤 Sending token to backend with driver ID:", driverId);

    const response = await fetch("https://api.thevanapp.com/api/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pushToken: token,
        driverId: driverId,
        platform: Platform.OS,
        deviceName: Device.deviceName,
        osVersion: Device.osVersion,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Token registered to backend:", result);

    // 🔔 TEST NOTIFICATION SENDING (3 წამის შემდეგ)
    if (__DEV__) {
      console.log(
        "🧪 Development mode - sending test notification in 3 seconds..."
      );
      setTimeout(async () => {
        await sendTestNotification(token);
      }, 3000); // ✅ 3 წამის შემდეგ გაგზავნა
    }
  } catch (error) {
    console.error("❌ Error registering token:", error);
  }
}

// 🧪 გასწორებული TEST NOTIFICATION FUNCTION
async function sendTestNotification(pushToken) {
  try {
    console.log("🧪 Sending test notification to:", pushToken);

    const message = {
      to: pushToken,
      sound: "default",
      title: "🧪 Test Notification",
      body: "თუ ეს ნოტიფიკაცია დაინახეთ, მაშინ ყველაფერი მუშაობს!",
      data: {
        type: "test",
        timestamp: new Date().toISOString(),
      },
      // ✅ Android-specific settings
      android: {
        channelId: "default", // ✅ Android channel
        priority: "max", // ✅ Max priority
        sticky: false,
        vibrate: [0, 250, 250, 250],
      },
      // ✅ iOS-specific settings
      ios: {
        sound: "default",
        badge: 1,
        _displayInForeground: true, // ✅ Foreground-ში აჩვენოს
      },
    };

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    console.log("🧪 Test notification result:", result);

    // ✅ შედეგის შემოწმება
    if (result.data && result.data.status === "ok") {
      console.log("✅ Test notification sent successfully!");
    } else {
      console.log("⚠️ Test notification may have failed:", result);
    }
  } catch (error) {
    console.error("❌ Test notification error:", error);
  }
}

// ✅ გასწორებული handleIncomingNotification
function handleIncomingNotification(notification) {
  const data = notification.request.content.data;
  const title = notification.request.content.title;
  const body = notification.request.content.body;

  console.log("📨 Processing notification:", { title, body, data });

  // ✅ App foreground-ში manual alert გამოჩენა
  if (data?.type === "new_order") {
    console.log("📋 New order notification:", data.orderId);

    // ✅ Manual alert foreground-ში
    setTimeout(() => {
      Alert.alert(title || "🚐 ახალი ორდერი!", body || "ახალი ორდერი დაემატა", [
        {
          text: "OK",
          onPress: () => console.log("User acknowledged notification"),
        },
      ]);
    }, 500);
  } else if (data?.type === "test") {
    console.log("🧪 Test notification received successfully!");

    // ✅ Test notification-ის alert
    setTimeout(() => {
      Alert.alert(
        "🧪 Test Success!",
        "Notifications are working correctly! 🎉",
        [{ text: "Awesome!" }]
      );
    }, 500);
  } else {
    // ✅ ყველა სხვა notification-ისთვის
    setTimeout(() => {
      Alert.alert(title || "შეტყობინება", body || "ახალი შეტყობინება", [
        { text: "OK" },
      ]);
    }, 500);
  }
}

// ✅ გასწორებული handleNotificationTap
function handleNotificationTap(response) {
  const data = response.notification.request.content.data;
  const title = response.notification.request.content.title;
  const body = response.notification.request.content.body;

  console.log("👆 Handling notification tap:", { title, body, data });

  if (data?.type === "new_order") {
    console.log("📋 Navigate to order:", data.orderId);

    Alert.alert("📋 Order Tapped", `You tapped on order: ${data.orderId}`, [
      { text: "OK" },
    ]);
  } else if (data?.type === "payment_received") {
    console.log("💰 Navigate to payments:", data);

    Alert.alert("💰 Payment Tapped", "Navigating to payments...", [
      { text: "OK" },
    ]);
  } else if (data?.type === "test") {
    console.log("🧪 Test notification tapped!");

    Alert.alert(
      "🧪 Test Tapped",
      "Test notification was tapped! Background notifications work! 🎉",
      [{ text: "Great!" }]
    );
  }
}
