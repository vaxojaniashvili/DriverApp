import {
  Platform,
  StatusBar,
  RefreshControl,
  View,
  ActivityIndicator,
  Text,
  Alert,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  AppState,
} from "react-native";
import { useState, useEffect, useRef, useCallback } from "react";
import Drivermodecomponent from "@/components/homepage/driver-mode/driver-mode";
import JobOfferComponent from "@/components/homepage/homepahe-orders/orders";
import { supabase } from "@/infrastructure/db/supabase";
import * as Location from "expo-location";
import { useAuthStore } from "@/infrastructure/store/store";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { DriverModeColors } from "@/constants/Colors";
import {
  AuthStoreState,
  DriverData,
  LocationData,
  OrderData,
  StatusProps,
  ThemeProps,
} from "@/types/common";
import { useFocusEffect, useRouter, useLocalSearchParams } from "expo-router";
import JobSelectionComponent from "@/components/homepage/jobs-selection/JobSelection";
import PickupRadiusSelector from "@/components/homepage/pickup-radius/PickupRadiusSelector";

// 🔔 PUSH NOTIFICATIONS IMPORTS
import { usePushNotifications } from "@/hooks/usePushNotifications";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

const HomeScreen: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<number>();
  const [driverData, setDriverData] = useState<DriverData | null>(null);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [activeOrder, setActiveOrder] = useState<OrderData | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [apiToken, setApiToken] = useState<string | null>(null);
  const [fullname, setFullname] = useState("");
  const [session, setSession] = useState<any>(null);
  const [userId, setUserId] = useState(null);
  const [lastName, setLastName] = useState("");

  const [userIndicator, setUserIndicator] = useState<string | null>(null);
  const [driverDetails, setDriverDetails] = useState<any>(null);
  const [ongoingOrders, setOngoingOrders] = useState<OrderData[]>([]);

  const router = useRouter();
  const params = useLocalSearchParams();

  const { setMode, mode, setmyID, isAutomatic } =
    useAuthStore() as unknown as AuthStoreState;
  const modeRef = useRef<"active" | "off" | "break">(mode);

  // Get session from Zustand store
  const {
    session: storeSession,
    user: storeUser,
    loadSessionFromStorage,
    setSession: setStoreSession,
    setUser: setStoreUser,
    selectedCountryFlag,
  } = useAuthStore();

  const [location, setLocation] = useState<LocationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [locationSendError, setLocationSendError] = useState<string | null>(
    null
  );
  const [lastSentTime, setLastSentTime] = useState<number>(0);
  const [statusUpdateCompleted, setStatusUpdateCompleted] = useState(false);
  const [paramsProcessed, setParamsProcessed] = useState(false);
  const [fetchUserDataInProgress, setFetchUserDataInProgress] = useState(false);

  // 🔔 PUSH NOTIFICATIONS HOOK
  const { expoPushToken, notification, tokenError, tokenStatus } =
    usePushNotifications();

  // 📱 APP STATE TRACKING
  const [appState, setAppState] = useState(AppState.currentState);

  // 🔔 NOTIFICATION HANDLING STATE
  const [lastNotificationId, setLastNotificationId] = useState<string | null>(
    null
  );
  const [notificationQueue, setNotificationQueue] = useState<any[]>([]);

  // 📱 APP STATE LISTENER
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (appState.match(/inactive|background/) && nextAppState === "active") {
        checkPendingNotifications();
      }
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription?.remove();
  }, [appState]);

  // 🔔 CHECK PENDING NOTIFICATIONS WHEN APP BECOMES ACTIVE
  const checkPendingNotifications = async () => {
    try {
      const pendingNotifications =
        await Notifications.getPresentedNotificationsAsync();
      if (pendingNotifications.length > 0) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error checking pending notifications:", error);
    }
  };

  // 🔔 PROCESS NOTIFICATIONS BY TYPE
  const processNotificationByType = (data: any, notification: any) => {
    const notificationType = data?.type || "general";

    switch (notificationType) {
      case "new_order":
        handleNewOrderNotification(data, notification);
        break;
      case "order_status_update":
        handleOrderStatusNotification(data, notification);
        break;
      case "payment_received":
        handlePaymentNotification(data, notification);
        break;
      case "announcement":
        handleAnnouncementNotification(data, notification);
        break;
      case "manual_test":
      case "step_test":
      case "test":
        handleTestNotification(data, notification);
        break;
      default:
        handleGeneralNotification(data, notification);
        break;
    }
  };

  // 📋 NEW ORDER NOTIFICATION
  const handleNewOrderNotification = (data: any, notification: any) => {
    setTimeout(() => {
      onRefresh();
    }, 500);

    setTimeout(() => {
      Alert.alert(
        "🚐 ახალი ორდერი!",
        `ორდერი #${data.orderId || "Unknown"}\n${
          notification.request.content.body || "დაემატა ახალი ორდერი"
        }`,
        [
          {
            text: "ნახვა",
            onPress: () => {
              onRefresh();
            },
          },
          {
            text: "OK",
            style: "cancel",
          },
        ],
        { cancelable: true }
      );
    }, 1000);
  };

  // 📊 ORDER STATUS UPDATE NOTIFICATION
  const handleOrderStatusNotification = (data: any, notification: any) => {
    onRefresh();

    if (data?.message || notification.request.content.body) {
      Alert.alert(
        "📊 ორდერის სტატუსი განახლდა",
        data?.message || notification.request.content.body,
        [{ text: "OK" }]
      );
    }
  };

  // 💰 PAYMENT NOTIFICATION
  const handlePaymentNotification = (data: any, notification: any) => {
    const amount = data.amount || "Unknown";
    const orderId = data.orderId || "Unknown";

    Alert.alert(
      "💰 გადახდა მიღებულია!",
      `ორდერი #${orderId}: ${amount}₾\n${
        notification.request.content.body || ""
      }`,
      [
        {
          text: "დეტალების ნახვა",
          onPress: () => {
            // Navigate to payment/earnings section
          },
        },
        {
          text: "OK",
          style: "cancel",
        },
      ]
    );
  };

  // 🧪 TEST NOTIFICATION HANDLER
  const handleTestNotification = (data: any, notification: any) => {
    const isManualTest = data.type === "manual_test";
    const isStepTest = data.type === "step_test";

    setTimeout(() => {
      Alert.alert(
        isStepTest
          ? "🧪 Step Test Success!"
          : isManualTest
          ? "🧪 Manual Test Success!"
          : "🧪 Test Success!",
        `${
          isStepTest ? "Step test" : isManualTest ? "Manual test" : "Test"
        } notification received! ✅ Notifications are working! 🎉`,
        [{ text: "Awesome! 🚀" }]
      );
    }, 500);
  };

  // 📢 ANNOUNCEMENT NOTIFICATION
  const handleAnnouncementNotification = (data: any, notification: any) => {
    Alert.alert(
      data.title || notification.request.content.title || "შეტყობინება",
      data.message || notification.request.content.body || "ახალი შეტყობინება",
      [{ text: "OK" }]
    );
  };

  // 🔔 GENERAL NOTIFICATION
  const handleGeneralNotification = (data: any, notification: any) => {
    onRefresh();

    if (
      notification.request.content.title ||
      notification.request.content.body
    ) {
      Alert.alert(
        notification.request.content.title || "შეტყობინება",
        notification.request.content.body || "ახალი შეტყობინება",
        [{ text: "OK" }]
      );
    }
  };

  // 🔔 NOTIFICATION HANDLING
  useEffect(() => {
    if (
      !notification ||
      typeof notification !== "object" ||
      !notification.request
    ) {
      return;
    }

    const notificationId = notification.request.identifier;
    const data = notification.request.content.data as any;

    // Prevent duplicate notifications
    if (lastNotificationId === notificationId) {
      return;
    }

    setLastNotificationId(notificationId);
    setNotificationQueue((prev) => [
      ...prev,
      { notification, timestamp: Date.now() },
    ]);
    processNotificationByType(data, notification);
  }, [notification]);

  // 🔔 REGISTER PUSH TOKEN
  const sendTokenToBackend = async (token: string, driverId: string) => {
    if (!token || !driverId) {
      return;
    }

    try {
      const response = await fetch("https://api.thevanapp.com/api/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({
          pushToken: token,
          driverId: driverId,
          platform: Platform.OS,
          deviceName: Device.deviceName || "Unknown",
          osVersion: Device.osVersion || "Unknown",
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log("Push token registered successfully");
    } catch (error) {
      console.error("Token registration failed:", error.message);
    }
  };

  // 🔔 REGISTER TOKEN WHEN READY
  useEffect(() => {
    if (expoPushToken && userId && apiToken) {
      sendTokenToBackend(expoPushToken, userId);
    }
  }, [expoPushToken, userId, apiToken, tokenStatus]);

  // 🔔 TOKEN ERROR HANDLING
  useEffect(() => {
    if (tokenError) {
      Alert.alert(
        "ნოტიფიკაციების პრობლემა",
        `შეცდომა: ${tokenError}\n\nგთხოვთ დარეწმუნდეთ რომ ნოტიფიკაციები ჩართულია`,
        [{ text: "OK" }]
      );
    }
  }, [tokenError]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    loadSessionFromStorage();
  }, []);

  useEffect(() => {
    if (
      params.sessionData &&
      params.userData &&
      !paramsProcessed &&
      !fetchUserDataInProgress
    ) {
      setParamsProcessed(true);
      setFetchUserDataInProgress(true);
      fetchUserData();
    }
  }, [params, paramsProcessed, fetchUserDataInProgress]);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
    };
    fetchUser();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (
        (!params.sessionData || !params.userData || !paramsProcessed) &&
        !fetchUserDataInProgress
      ) {
        setFetchUserDataInProgress(true);
        fetchUserData();
      }
    }, [
      params.sessionData,
      params.userData,
      paramsProcessed,
      fetchUserDataInProgress,
    ])
  );

  useEffect(() => {
    if (storeUser?.id) {
      setStatusUpdateCompleted(false);
    }
  }, [storeUser?.id]);

  const fetchDriverDetails = async () => {
    try {
      const response = await fetch(
        `https://api.thevanapp.com/api/driver-details/${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiToken}`,
          },
        }
      );

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const driverInfo = data[0];
        setFullname(driverInfo.name);
        setLastName(driverInfo.last_name);
        setDriverDetails(driverInfo);
        setUserIndicator(driverInfo.indicator || data[0].indicator);

        if (!userEmail && driverInfo.email) {
          setUserEmail(driverInfo.email);
        }

        setDriverData({
          ...driverInfo,
          plate: driverInfo.plate,
          id: driverInfo.id,
        } as DriverData);
      }
    } catch (error) {
      console.error("Error fetching driver details:", error);
    }
  };

  const fetchUserData = async () => {
    try {
      await loadSessionFromStorage();

      if (params.sessionData && params.userData) {
        try {
          const sessionFromParams = JSON.parse(params.sessionData as string);
          const userFromParams = JSON.parse(params.userData as string);

          setStoreSession(sessionFromParams);
          setStoreUser(userFromParams);
          const session = sessionFromParams;
          const user = userFromParams;

          if (session && user) {
            setSession(session);
            setApiToken(session.access_token);
            setUserId(user?.id as any);
            setUserEmail(user.email || user.user_metadata.email || "");
            setPhoneNumber(user.phone || user.user_metadata.phone || "");

            const status = user.user_metadata?.status;
            if (status === "active" || status === "complete") {
              // Stay on homepage
            } else {
              router.replace("/(tabs)/driverVerification");
              return;
            }
          }
        } catch (parseError) {
          console.error("Parse error:", parseError);
        }
      }

      let session = storeSession;
      let user = storeUser;

      if (session && user) {
        setSession(session);
        setApiToken(session.access_token);
        setUserId(user?.id as any);
        setUserEmail(user.email || user.user_metadata.email || "");
        setPhoneNumber(user.phone || user.user_metadata.phone || "");
      } else {
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Session timeout")), 10000)
        );

        try {
          const result = (await Promise.race([
            sessionPromise,
            timeoutPromise,
          ])) as any;
          session = result.data.session;
          user = result.data.session?.user;
        } catch (sessionError) {
          try {
            const {
              data: { session: retrySession },
            } = await supabase.auth.getSession();
            session = retrySession;
            user = retrySession?.user;
          } catch (retryError) {
            session = null;
            user = null;
          }
        }

        if (!session || !user) {
          router.replace("/signUp");
          return;
        }

        setSession(session);
        setApiToken(session.access_token);
        setUserId(user?.id as any);

        const userEmailValue = user.email || user.user_metadata?.email || "";
        const phoneValue = user.phone || user.user_metadata?.phone || "";

        setUserEmail(userEmailValue);
        setPhoneNumber(phoneValue);

        await fetchDriverDetails();
      }

      setUserId(user?.id as any);
      await fetchDriverDetails();
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setFetchUserDataInProgress(false);
    }
  };

  useEffect(() => {
    if (userEmail && apiToken && !driverData) {
      fetchDriverDetails();
    }
  }, [userEmail, apiToken, driverData]);

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    (async () => {
      if (!apiToken || userIndicator !== "active") return;

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          return;
        }

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 10000,
            distanceInterval: 0,
          },
          (loc) => {
            setLocation({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            });
          }
        );
      } catch (error) {
        setErrorMsg("Failed to initialize location tracking");
      }
    })();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [apiToken, userIndicator]);

  useEffect(() => {
    if (!userEmail || !apiToken || userIndicator !== "active") return;

    const fetchDriverData = async () => {
      setLoadingData(true);

      try {
        const response = await fetch(
          `https://api.thevanapp.com/api/driver-loc`
        );

        if (!response.ok) {
          throw new Error(`Network response error: ${response.status}`);
        }

        const data = await response.json();

        if (!data || !Array.isArray(data) || data.length === 0) {
          setDriverData(null);
          return;
        }

        const currentDriver = data.find((driver) => driver.email === userEmail);

        if (!currentDriver) {
          setDriverData(null);
          return;
        }

        setDriverData(currentDriver);

        if (currentDriver.id) {
          setmyID(currentDriver.id);
        }
      } catch (error) {
        setDriverData(null);
      } finally {
        setLoadingData(false);
      }
    };

    fetchDriverData();
  }, [userEmail, apiToken, userIndicator]);

  const sendLocationToApi = async () => {
    if (!userEmail || !location || !apiToken || userIndicator !== "active") {
      return;
    }

    try {
      setLocationSendError(null);

      const payload = {
        email: userEmail,
        location: {
          lat: location.latitude,
          lng: location.longitude,
        },
        status: modeRef.current,
      };

      const response = await fetch("https://api.thevanapp.com/api/driver-loc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }

      setLastSentTime(Date.now());
    } catch (error) {
      setLocationSendError("Failed to send location data");
    }
  };

  useEffect(() => {
    if (!userEmail || !location || !apiToken || userIndicator !== "active") {
      return;
    }

    const intervalId = setInterval(() => {
      sendLocationToApi();
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [userEmail, location, apiToken, userIndicator]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDriverDetails();

    if (!apiToken || userIndicator !== "active") {
      setRefreshing(false);
      return false;
    }

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        setRefreshing(false);
        return;
      }

      const driverUUID = user?.id;
      const res = await fetch(
        "https://api.thevanapp.com/api/paidorders/checker",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiToken}`,
          },
          body: JSON.stringify({
            id: driverUUID,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(`API response error: ${res.status}`);
      }

      const data = await res.json();

      if (
        data &&
        (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0)
      ) {
        if (Array.isArray(data)) {
          const allCompleted = data.every(
            (order) =>
              order.order_status === "COMPLETED" ||
              order.order_status === "CANCELLED"
          );

          if (allCompleted) {
            setActiveOrder(null);
          } else {
            processOrders(data);
            setRefreshing(false);
            return true;
          }
        } else {
          processOrders([data]);
          setRefreshing(false);
          return true;
        }
      }

      const pendingRes = await fetch(
        "https://api.thevanapp.com/api/paidorders",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiToken}`,
          },
        }
      );

      if (!pendingRes.ok) {
        throw new Error(`API response error: ${pendingRes.status}`);
      }

      const pendingData = await pendingRes.json();

      if (Array.isArray(pendingData) && pendingData.length > 0) {
        processOrders(pendingData);
        setRefreshing(false);
        return true;
      } else {
        setOrders([]);
        setActiveOrder(null);
        setRefreshing(false);
        return false;
      }
    } catch (error) {
      setRefreshing(false);
      return false;
    }
  }, [apiToken, userIndicator]);

  useFocusEffect(
    useCallback(() => {
      const refreshUserData = async () => {
        try {
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError || !user) {
            return;
          }
        } catch (error) {
          console.error("Error refreshing user data:", error);
        }
      };

      refreshUserData().then(() => {
        fetchDriverDetails().then(() => {
          if (apiToken && userIndicator === "active") {
            onRefresh();
          }
        });
      });

      return () => {};
    }, [onRefresh, apiToken, userIndicator])
  );

  const processOrders = (ordersData: any[]) => {
    if (!Array.isArray(ordersData)) {
      setOrders([]);
      setActiveOrder(null);
      setOngoingOrders([]);
      return;
    }

    const processedOrders = ordersData.map((order) => ({
      ...order,
      id: order.id || Math.random().toString(),
      price: Number(order.price) || 0,
      order_status: order.order_status || "PENDING",
      destination_name: order.destination_name || "",
      pickup_name: order.pickup_name || "",
    }));

    const ongoing = processedOrders.filter(
      (order) =>
        order.order_status !== "PENDING" &&
        order.order_status !== "COMPLETED" &&
        order.order_status !== "CANCELLED"
    );

    const active = ongoing.length > 0 ? ongoing[0] : null;
    const pendingOrders = processedOrders.filter(
      (order) => order.order_status === "PENDING"
    );

    setActiveOrder(active || null);
    setOngoingOrders(ongoing);
    setOrders(pendingOrders);
  };

  const handleAccept = async (orderId: string) => {
    if (!driverData?.id || !apiToken || userIndicator !== "active") {
      return;
    }

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        return;
      }

      const driverUUID = user?.id;

      const response = await fetch(
        `https://api.thevanapp.com/api/paidorders/${orderId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: driverUUID,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }

      onRefresh();
    } catch (error) {
      console.error("Error accepting order:", error);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#27ae60", "#1e8449"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      />
      <ScrollView
        style={styles.scrollableContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            enabled={userIndicator === "active"}
          />
        }
      >
        <View style={styles.innerContainer}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.userInfoSection}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {fullname.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={styles.userTextInfo}>
                  <Text style={styles.userGreeting}>
                    Welcome, {fullname + " " + lastName}
                  </Text>
                  {userIndicator !== "active" ? (
                    <Text style={{ fontWeight: "500" }}>
                      Status: <Text style={{ color: "red" }}>Incomplete</Text>
                    </Text>
                  ) : (
                    <Text style={{ fontWeight: "500" }}>
                      Status: <Text style={{ color: "green" }}>Completed</Text>
                    </Text>
                  )}
                  <View style={{ flexDirection: "row", marginTop: 2 }}>
                    <Text>Driver:</Text>
                    <Text
                      style={{
                        color: mode === "active" ? "green" : "red",
                        marginLeft: 9,
                      }}
                    >
                      {mode === "active" ? "Active" : "Inactive"}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", marginTop: 4 }}>
                    <Text>Notifications:</Text>
                    <Text
                      style={{
                        color:
                          tokenStatus === "success" && expoPushToken
                            ? "green"
                            : tokenStatus === "error"
                            ? "red"
                            : "orange",
                        marginLeft: 9,
                      }}
                    >
                      {tokenStatus === "success" && expoPushToken
                        ? "✅ Ready"
                        : tokenStatus === "error"
                        ? "❌ Error"
                        : tokenStatus === "loading"
                        ? "⏳ Setting up..."
                        : "⏳ Initializing..."}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.userDetailsSection}>
                <View style={styles.infoCard}>
                  <View style={styles.infoIcon}>
                    <Text>{selectedCountryFlag}</Text>
                  </View>
                  <Text style={styles.infoText}>
                    {`+${phoneNumber}` || "No phone number"}
                  </Text>
                </View>

                {driverData?.plate && userIndicator === "active" && (
                  <View style={[styles.infoCard, { height: 50 }]}>
                    <View>
                      <FontAwesome5 name="car-alt" size={16} color="#666" />
                    </View>
                    <Text style={{ marginLeft: 20 }}>{driverData.plate}</Text>
                  </View>
                )}
              </View>

              {userIndicator !== "active" && (
                <>
                  <View style={styles.verificationAlert}>
                    <View style={styles.alertIcon}>
                      <MaterialIcons name="warning" size={24} color="#F59E0B" />
                    </View>
                    <View style={styles.alertContent}>
                      <Text style={styles.alertTitle}>
                        Account verification is required.
                      </Text>
                      <Text style={styles.alertDescription}>
                        Please verify your account to get started.
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.verifyButton}
                    onPress={() => router.push("/(tabs)/driverVerification")}
                  >
                    <View style={styles.verifyButtonContent}>
                      <Text style={styles.verifyButtonText}>Continue</Text>
                      <MaterialIcons
                        name="arrow-forward"
                        size={20}
                        color="#FFF"
                      />
                    </View>
                  </TouchableOpacity>
                </>
              )}

              {userIndicator === "active" && (
                <View style={styles.statusSection}>
                  <View
                    style={[
                      styles.statusCard,
                      {
                        backgroundColor:
                          mode === "active" ? "#F0FDF4" : "#FEF2F2",
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.statusIndicator,
                        {
                          backgroundColor:
                            mode === "active" ? "#10B981" : "#EF4444",
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        { color: mode === "active" ? "#059669" : "#DC2626" },
                      ]}
                    >
                      {mode === "active" ? "ONLINE" : "OFFLINE"}
                    </Text>
                  </View>

                  {errorMsg ? (
                    <View
                      style={[styles.locationCard, styles.locationCardError]}
                    >
                      <MaterialIcons
                        name="error-outline"
                        size={18}
                        color={DriverModeColors.danger}
                      />
                      <Text
                        style={[
                          styles.locationCardText,
                          styles.locationCardTextError,
                        ]}
                      >
                        {errorMsg}
                      </Text>
                    </View>
                  ) : locationSendError ? (
                    <View
                      style={[styles.locationCard, styles.locationCardError]}
                    >
                      <MaterialIcons
                        name="error-outline"
                        size={18}
                        color={DriverModeColors.danger}
                      />
                      <Text
                        style={[
                          styles.locationCardText,
                          styles.locationCardTextError,
                        ]}
                      >
                        {locationSendError}
                      </Text>
                    </View>
                  ) : location && userIndicator === "active" ? (
                    <View style={styles.locationCard}>
                      <MaterialIcons
                        name="location-on"
                        size={18}
                        color={DriverModeColors.success}
                      />
                      <Text style={styles.locationCardText}>
                        Location tracking active
                      </Text>
                    </View>
                  ) : null}
                </View>
              )}
            </View>
          </View>

          {userIndicator === "active" && (
            <>
              <View style={styles.modeContainer}>
                <Drivermodecomponent />
              </View>
              <View style={styles.modeContainer}>
                <JobSelectionComponent />
              </View>

              {userIndicator === "active" && isAutomatic && (
                <View style={styles.modeContainer}>
                  <PickupRadiusSelector />
                </View>
              )}

              {userIndicator === "active" &&
                isAutomatic &&
                ongoingOrders.length > 0 && (
                  <View style={styles.jobsContainer}>
                    <Text style={styles.sectionTitle}>Ongoing Orders</Text>
                    {ongoingOrders.map((order) => (
                      <JobOfferComponent
                        key={order.id}
                        order={order}
                        onAccept={() => {}}
                      />
                    ))}
                  </View>
                )}

              {userIndicator === "active" && !isAutomatic && (
                <View style={styles.jobsContainer}>
                  <Text style={styles.sectionTitle}>Available Orders</Text>
                  {loadingData ? (
                    <>
                      <ActivityIndicator
                        size="large"
                        color={DriverModeColors.primary}
                      />
                      <Text style={styles.loadingText}>
                        Loading your jobs...
                      </Text>
                    </>
                  ) : orders && orders.length > 0 ? (
                    orders.map((order: OrderData) => (
                      <JobOfferComponent
                        key={order.id}
                        order={order}
                        onAccept={() => handleAccept(order.id)}
                      />
                    ))
                  ) : (
                    <Text style={styles.noJobsText}>
                      No available Orders at the moment. Pull down to refresh.
                    </Text>
                  )}
                </View>
              )}

              {userIndicator === "active" &&
                isAutomatic &&
                ongoingOrders.length === 0 && (
                  <Text style={styles.noOngoingJobsText}>
                    No available ongoing Orders at the moment. Pull down to
                    refresh.
                  </Text>
                )}

              {userIndicator !== "active" && (
                <Text
                  style={[styles.noJobsText, { marginTop: 20, color: "#666" }]}
                >
                  You are currently offline. Go online to see available orders.
                </Text>
              )}
            </>
          )}

          {userIndicator !== "active" && (
            <Text style={[styles.noJobsText, { marginTop: 20, color: "red" }]}>
              Please verify your account to start accepting orders
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

// STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DriverModeColors.light,
  },
  scrollableContent: {
    flex: 1,
    width: "100%",
  },
  innerContainer: {
    alignItems: "center",
    width: "100%",
    justifyContent: "flex-start",
    paddingTop:
      Platform.OS === "android"
        ? StatusBar.currentHeight
          ? StatusBar.currentHeight + 8
          : 8
        : 65,
    paddingHorizontal: 12,
  },
  header: {
    width: "100%",
    padding: 18,
    backgroundColor: DriverModeColors.cardBg,
    borderRadius: 20,
    marginBottom: 16,
    elevation: 2,
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  headerContent: {},
  userInfoSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    backgroundColor: "#27ae60",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700",
  },
  userTextInfo: {
    flex: 1,
  },
  userGreeting: {
    fontSize: 20,
    fontWeight: "700",
    color: DriverModeColors.dark,
    marginBottom: 4,
  },
  userDetailsSection: {
    marginBottom: 20,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  infoIcon: {
    marginRight: 10,
    width: 24,
    height: 24,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "500",
    flex: 1,
  },
  verificationAlert: {
    flexDirection: "row",
    backgroundColor: "#fff7ed",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#fed7aa",
  },
  alertIcon: {
    marginRight: 12,
    paddingTop: 2,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#c05621",
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 14,
    color: "#92400e",
    lineHeight: 20,
  },
  verifyButton: {
    backgroundColor: "#27ae60",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  verifyButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  verifyButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  statusSection: {
    gap: 10,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  locationCardError: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  locationCardText: {
    color: "#059669",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  locationCardTextError: {
    color: "#DC2626",
  },
  modeContainer: {
    width: "100%",
    padding: 16,
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  jobsContainer: {
    width: "100%",
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: DriverModeColors.dark,
    marginBottom: 14,
    width: "100%",
    paddingHorizontal: 2,
    letterSpacing: -0.3,
  },
  noJobsText: {
    fontSize: 14,
    color: "green",
    textAlign: "center",
    padding: 24,
    borderRadius: 16,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
  noOngoingJobsText: {
    fontSize: 14,
    color: "green",
    textAlign: "center",
    padding: 20,
    borderRadius: 16,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "500",
    color: DriverModeColors.darkGray,
    marginTop: 12,
    textAlign: "center",
  },
  gradientHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "android" ? 250 : 290,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
});

export default HomeScreen;
