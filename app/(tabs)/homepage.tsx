import {
  Platform,
  StatusBar,
  RefreshControl,
  View,
  ActivityIndicator,
} from "react-native";
import styled from "styled-components/native";
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
import { useFocusEffect } from "expo-router";
import JobSelectionComponent from "@/components/homepage/jobs-selection/JobSelection";

const HomeScreen: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string>("");
  const [driverData, setDriverData] = useState<DriverData | null>(null);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [activeOrder, setActiveOrder] = useState<OrderData | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [apiToken, setApiToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [ongoingOrders, setOngoingOrders] = useState<OrderData[]>([]);

  const { setMode, mode, setmyID, isAutomatic } =
    useAuthStore() as unknown as AuthStoreState;
  const modeRef = useRef<"active" | "off" | "break">(mode);

  const [location, setLocation] = useState<LocationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [locationSendError, setLocationSendError] = useState<string | null>(
    null
  );
  const [lastSentTime, setLastSentTime] = useState<number>(0);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          throw error;
        }

        if (user) {
          setUserEmail(user?.email || "");

          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session?.access_token) {
            setApiToken(sessionData.session.access_token);
          }
        }
      } catch (error) {
        // console.log("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    (async () => {
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
  }, []);

  useEffect(() => {
    if (!userEmail) return;

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
          console.log("No driver data found");
          setDriverData(null);
          return;
        }

        const currentDriver = data.find((driver) => driver.email === userEmail);

        if (!currentDriver) {
          console.log("No driver data found for email:", userEmail);
          setDriverData(null);
          return;
        }

        setDriverData(currentDriver);

        if (currentDriver.id) {
          setmyID(currentDriver.id);
        } else {
          console.error("Driver data missing ID field");
        }
      } catch (error) {
        console.error("Error fetching driver data:", error);
        setDriverData(null);
      } finally {
        setLoadingData(false);
      }
    };

    fetchDriverData();
  }, [userEmail]);

  const sendLocationToApi = async () => {
    if (!userEmail || !location || !apiToken) {
      console.log("Missing data for API call: userEmail, location, or token");
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
      console.error("Error sending location to API:", error);
      setLocationSendError("Failed to send location data");
    }
  };

  useEffect(() => {
    if (!userEmail || !location || !apiToken) {
      return;
    }

    const intervalId = setInterval(() => {
      sendLocationToApi();
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [userEmail, location, apiToken]);

  useEffect(() => {
    if (location && apiToken && userEmail) {
      const currentTime = Date.now();
      if (currentTime - lastSentTime > 2000) {
        sendLocationToApi();
      }
    }
  }, [location]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      const res = await fetch(
        "https://api.thevanapp.com/api/paidorders/checker",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiToken}`,
          },
          body: JSON.stringify({
            id: "eifmimsdaisndis93",
          }),
        }
      );

      if (!res.ok) {
        throw new Error(`API response error: ${res.status}`);
      }

      const data = await res.json();
      console.log("Checker response data:", data);

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
            console.log(
              "All orders are COMPLETED or CANCELLED, need to fetch pending orders"
            );
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

      console.log("Fetching pending orders from main endpoint");

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
      console.log("Pending orders data:", pendingData);

      if (Array.isArray(pendingData) && pendingData.length > 0) {
        processOrders(pendingData);
        setRefreshing(false);
        return true;
      } else {
        console.log("No pending orders found");
        setOrders([]);
        setActiveOrder(null);
        setRefreshing(false);
        return false;
      }
    } catch (error) {
      console.error("Error refreshing orders:", error);
      setRefreshing(false);
      return false;
    }
  }, [apiToken]);

  const processOrders = (ordersData: any[]) => {
    if (!Array.isArray(ordersData)) {
      console.log("Order data is not an array:", ordersData);
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

    console.log("Active order:", active);
    console.log("Pending orders:", pendingOrders);

    setActiveOrder(active || null);
    setOngoingOrders(ongoing);
    setOrders(pendingOrders);
  };

  useFocusEffect(
    useCallback(() => {
      console.log("HomePage is focused - refreshing orders");
      onRefresh();

      return () => {
        console.log("HomePage lost focus");
      };
    }, [onRefresh])
  );

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!apiToken) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        await onRefresh();
      } catch (error) {
        console.error("Error loading data:", error);
        if (isMounted) {
          setOrders([]);
          setActiveOrder(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    const refreshInterval = setInterval(() => {
      if (isMounted) {
        console.log("Refreshing orders automatically");
        onRefresh();
      }
    }, 300000);

    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
    };
  }, [apiToken, onRefresh]);

  const handleAccept = async (orderId: string) => {
    if (!driverData?.id || !apiToken) return;

    try {
      const response = await fetch(
        `https://api.thevanapp.com/api/paidorders/${orderId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: "eifmimsdaisndis93",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }

      onRefresh();
    } catch (error) {
      console.log("error");
    }
  };

  const displayName = userEmail ? userEmail.split("@")[0] : "Driver";
  const capitalizedDisplayName =
    displayName.charAt(0).toUpperCase() + displayName.slice(1);

  return (
    <Container>
      <GradientHeader
        colors={[DriverModeColors.gradient1, DriverModeColors.gradient2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <ScrollableContent
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[DriverModeColors.primary]}
            tintColor={DriverModeColors.primary}
          />
        }
      >
        <Innercontainer>
          <Header>
            <HeaderRow>
              <UserInfo>
                <UserGreeting>Welcome, {capitalizedDisplayName}</UserGreeting>
                {driverData?.plate && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 6,
                    }}
                  >
                    <IconContainer>
                      <FontAwesome5 name="car-alt" size={16} color="#FFF" />
                    </IconContainer>
                    <UserDetail>Vehicle: {driverData.plate}</UserDetail>
                  </View>
                )}
              </UserInfo>
            </HeaderRow>
            <StatusContainer active={mode === "active"}>
              <StatusIndicator active={mode === "active"} />
              <StatusText active={mode === "active"}>
                {mode === "active" ? "ONLINE" : "OFFLINE"}
              </StatusText>
            </StatusContainer>

            {errorMsg ? (
              <LocationStatus theme="error">
                <MaterialIcons
                  name="error-outline"
                  size={18}
                  color={DriverModeColors.danger}
                />
                <LocationStatusText theme="error">
                  {errorMsg}
                </LocationStatusText>
              </LocationStatus>
            ) : locationSendError ? (
              <LocationStatus theme="error">
                <MaterialIcons
                  name="error-outline"
                  size={18}
                  color={DriverModeColors.danger}
                />
                <LocationStatusText theme="error">
                  {locationSendError}
                </LocationStatusText>
              </LocationStatus>
            ) : location ? (
              <LocationStatus>
                <MaterialIcons
                  name="location-on"
                  size={18}
                  color={DriverModeColors.success}
                />
                <LocationStatusText>
                  Location tracking active
                </LocationStatusText>
              </LocationStatus>
            ) : null}
          </Header>

          <ModeContainer>
            <Drivermodecomponent />
          </ModeContainer>
          <ModeContainer>
            <JobSelectionComponent />
          </ModeContainer>

          {isAutomatic && ongoingOrders.length > 0 && (
            <JobsContainer>
              <SectionTitle>Ongoing Orders</SectionTitle>
              {ongoingOrders.map((order) => (
                <JobOfferComponent
                  key={order.id}
                  id={order.id}
                  items={order.items}
                  order_status={order.order_status}
                  orderNumber={`Order #${order.id.toString().slice(-3)}`}
                  destination={order.destination_name || ""}
                  pickupLocation={order.pickup_name || ""}
                  price={Number(order.price) || 0}
                  time={new Date(order.created_at).toLocaleString()}
                  onAccept={() => {}}
                />
              ))}
            </JobsContainer>
          )}

          {!isAutomatic && (
            <JobsContainer>
              <SectionTitle>Available Orders</SectionTitle>
              {loadingData ? (
                <>
                  <ActivityIndicator
                    size="large"
                    color={DriverModeColors.primary}
                  />
                  <LoadingText>Loading your jobs...</LoadingText>
                </>
              ) : orders && orders.length > 0 ? (
                orders.map((order: OrderData) => (
                  <JobOfferComponent
                    key={order.id}
                    id={order.id}
                    items={order.items}
                    order_status={order.order_status}
                    orderNumber={`Order #${order.id.toString().slice(-3)}`}
                    destination={order.destination_name || ""}
                    pickupLocation={order.pickup_name || ""}
                    price={Number(order.price) || 0}
                    time={new Date(order.created_at).toLocaleString()}
                    onAccept={() => handleAccept(order.id)}
                  />
                ))
              ) : (
                <NoJobsText>
                  No available Orders at the moment. Pull down to refresh.
                </NoJobsText>
              )}
            </JobsContainer>
          )}
          {isAutomatic && ongoingOrders.length === 0 && (
            <NoOngoingJobsText>
              No available ongoing Orders at the moment. Pull down to refresh.
            </NoOngoingJobsText>
          )}
        </Innercontainer>
      </ScrollableContent>
    </Container>
  );
};

export default HomeScreen;

const Container = styled.View`
  flex: 1;
  background-color: ${DriverModeColors.light};
`;

const ScrollableContent = styled.ScrollView`
  flex: 1;
  width: 100%;
`;

const Innercontainer = styled.View`
  align-items: center;
  width: 100%;
  justify-content: flex-start;
  padding-top: ${Platform.OS === "android"
    ? StatusBar.currentHeight
      ? StatusBar.currentHeight + 8
      : 8
    : 65}px;
  padding-horizontal: 12px;
`;

const Header = styled.View`
  width: 100%;
  padding: 18px;
  background-color: ${DriverModeColors.cardBg};
  border-radius: 20px;
  margin-bottom: 16px;
  elevation: 2;
  shadow-opacity: 0.12;
  shadow-radius: 8px;
  shadow-color: #000;
  shadow-offset: 0px 3px;
  border-width: 0.5px;
  border-color: rgba(255, 255, 255, 0.8);
`;

const HeaderRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const UserInfo = styled.View`
  flex: 1;
`;

const UserGreeting = styled.Text`
  font-size: 22px;
  font-weight: 700;
  color: ${DriverModeColors.dark};
  margin-bottom: 4px;
`;

const UserDetail = styled.Text`
  font-size: 14px;
  color: ${DriverModeColors.darkGray};
  font-weight: 500;
  flex-direction: row;
  align-items: center;
  position: relative;
  top: ${Platform.OS === "android" ? "7px" : "8px"};
`;

const StatusIndicator = styled.View<StatusProps>`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${(props) =>
    props.active ? DriverModeColors.success : DriverModeColors.danger};
  margin-right: 6px;
`;

const StatusContainer = styled.View<StatusProps>`
  flex-direction: row;
  align-items: center;
  margin-top: 12px;
  background-color: ${(props) =>
    props.active
      ? DriverModeColors.statusBgOnline
      : DriverModeColors.statusBgOffline};
  padding: 8px 12px;
  border-radius: 8px;
  border-width: 0.5px;
  border-color: ${(props) =>
    props.active ? DriverModeColors.success : DriverModeColors.danger};
`;

const StatusText = styled.Text<StatusProps>`
  font-size: 12px;
  font-weight: 600;
  color: ${(props) =>
    props.active ? DriverModeColors.success : DriverModeColors.danger};
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

const ModeContainer = styled.View`
  width: 100%;
  padding: 16px;
  background-color: white;
  border-radius: 16px;
  margin-bottom: 16px;
  elevation: 2;
  shadow-opacity: 0.12;
  shadow-radius: 8px;
  shadow-color: #000;
  shadow-offset: 0px 3px;
  border-width: 0.5px;
  border-color: rgba(255, 255, 255, 0.8);
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: ${DriverModeColors.dark};
  margin-bottom: 14px;
  width: 100%;
  padding-horizontal: 2px;
  letter-spacing: -0.3px;
`;

const JobsContainer = styled.View`
  width: 100%;
  margin-bottom: 24px;
`;

const NoJobsText = styled.Text`
  font-size: 14px;
  color: green;
  text-align: center;
  padding: 24px;
  /* background-color: white; */
  border-radius: 16px;
  /* elevation: 2; */
  shadow-opacity: 0.12;
  shadow-radius: 8px;
  /* shadow-color: #000; */
  shadow-offset: 0px 3px;
  border-width: 0.5px;
  border-color: rgba(255, 255, 255, 0.35);
`;

const NoOngoingJobsText = styled.Text`
  font-size: 14px;
  color: green;
  text-align: center;
  padding: 20px;
  /* background-color: white; */
  border-radius: 16px;
  /* elevation: 2; */
  shadow-opacity: 0.12;
  shadow-radius: 8px;
  /* shadow-color: #000; */
  shadow-offset: 0px 3px;
  border-width: 0.5px;
  border-color: rgba(255, 255, 255, 0.35);
`;

const LocationStatus = styled.View<ThemeProps>`
  flex-direction: row;
  align-items: center;
  background-color: ${(props) =>
    props.theme === "error"
      ? DriverModeColors.statusBgOffline
      : DriverModeColors.statusBgOnline};
  padding: 8px 12px;
  border-radius: 8px;
  margin-top: 12px;
  width: 100%;
  border-width: 0.5px;
  border-color: ${(props) =>
    props.theme === "error"
      ? DriverModeColors.danger
      : DriverModeColors.success};
`;

const LocationStatusText = styled.Text<ThemeProps>`
  color: ${(props) =>
    props.theme === "error"
      ? DriverModeColors.danger
      : DriverModeColors.success};
  font-size: 12px;
  font-weight: 500;
  margin-left: 6px;
  letter-spacing: 0.1px;
`;

const LoadingText = styled.Text`
  font-size: 14px;
  font-weight: 500;
  color: ${DriverModeColors.darkGray};
  margin-top: 12px;
`;

const IconContainer = styled.View`
  padding: 6px;
  border-radius: 8px;
  margin-right: 8px;
  background-color: ${DriverModeColors.vehicleGreen};
`;

const GradientHeader = styled(LinearGradient)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: ${Platform.OS === "android" ? "260px" : "300px"};
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
`;
