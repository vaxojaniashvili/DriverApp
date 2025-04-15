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
      ? StatusBar.currentHeight + 12
      : 12
    : 75}px;
  padding-horizontal: 10px;
`;

const Header = styled.View`
  width: 100%;
  padding: 24px;
  background-color: ${DriverModeColors.cardBg};
  border-radius: 30px;
  margin-bottom: 20px;
  elevation: 3;
  shadow-opacity: 0.15;
  shadow-radius: 12px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  border-width: 1px;
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
  font-size: 26px;
  font-weight: bold;
  color: ${DriverModeColors.dark};
  margin-bottom: 8px;
`;

const UserDetail = styled.Text`
  font-size: 16px;
  color: ${DriverModeColors.darkGray};
  font-weight: 500;
  flex-direction: row;
  align-items: center;
`;

const StatusIndicator = styled.View<StatusProps>`
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: ${(props) =>
    props.active ? DriverModeColors.success : DriverModeColors.danger};
  margin-right: 8px;
`;

const StatusContainer = styled.View<StatusProps>`
  flex-direction: row;
  align-items: center;
  margin-top: 16px;
  background-color: ${(props) =>
    props.active
      ? DriverModeColors.statusBgOnline
      : DriverModeColors.statusBgOffline};
  padding: 10px 16px;
  border-radius: 12px;
  border-width: 1px;
  border-color: ${(props) =>
    props.active ? DriverModeColors.success : DriverModeColors.danger};
`;

const StatusText = styled.Text<StatusProps>`
  font-size: 14px;
  font-weight: 600;
  color: ${(props) =>
    props.active ? DriverModeColors.success : DriverModeColors.danger};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ModeContainer = styled.View`
  width: 100%;
  padding: 24px;
  background-color: ${DriverModeColors.cardBg};
  border-radius: 30px;
  margin-bottom: 24px;
  elevation: 3;
  shadow-opacity: 0.15;
  shadow-radius: 12px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.8);
`;

const SectionTitle = styled.Text`
  font-size: 22px;
  font-weight: bold;
  color: ${DriverModeColors.dark};
  margin-bottom: 18px;
  width: 100%;
  padding-horizontal: 4px;
  letter-spacing: -0.5px;
`;

const JobsContainer = styled.View`
  width: 100%;
  margin-bottom: 32px;
`;

const NoJobsText = styled.Text`
  font-size: 16px;
  color: ${DriverModeColors.darkGray};
  text-align: center;
  padding: 32px;
  background-color: ${DriverModeColors.cardBg};
  border-radius: 20px;
  elevation: 2;
  shadow-opacity: 0.1;
  shadow-radius: 6px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.8);
`;

const LocationStatus = styled.View<ThemeProps>`
  flex-direction: row;
  align-items: center;
  background-color: ${(props) =>
    props.theme === "error"
      ? DriverModeColors.statusBgOffline
      : DriverModeColors.statusBgOnline};
  padding: 10px 16px;
  border-radius: 12px;
  margin-top: 14px;
  width: 100%;
  border-width: 1px;
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
  font-size: 14px;
  font-weight: 500;
  margin-left: 8px;
  letter-spacing: 0.2px;
`;

const LoadingContainer = styled.View`
  background-color: ${DriverModeColors.cardBg};
  border-radius: 20px;
  padding: 32px;
  align-items: center;
  justify-content: center;
  elevation: 2;
  shadow-opacity: 0.1;
  shadow-radius: 6px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.8);
`;

const LoadingText = styled.Text`
  font-size: 16px;
  font-weight: 500;
  color: ${DriverModeColors.darkGray};
  margin-top: 16px;
`;

const IconContainer = styled.View`
  padding: 8px;
  border-radius: 10px;
  margin-right: 10px;
  background-color: ${DriverModeColors.primary};
`;

const GradientHeader = styled(LinearGradient)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: ${Platform.OS === "android" ? "280px" : "305px"};
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
`;

const HomeScreen: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string>("");
  const [driverData, setDriverData] = useState<DriverData | null>(null);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [apiToken, setApiToken] = useState<string | null>(null);

  const { setMode, mode, setmyID } =
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
        console.error("Error fetching user:", error);
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
          `https://thevanapp-node.onrender.com/driverparam?email=${userEmail}`
        );

        if (!response.ok) {
          throw new Error(`Network response error: ${response.status}`);
        }

        const data = await response.json();

        if (!data || !Array.isArray(data) || data.length === 0) {
          console.log("No driver data found for email:", userEmail);
          setDriverData(null);
          return;
        }

        setDriverData(data[0]);
        if (data[0].id) {
          setmyID(data[0].id);
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

  useEffect(() => {
    if (!userEmail || !location) return;

    const updateDriverData = async () => {
      try {
        const payload = {
          live_location: { lat: location.latitude, lng: location.longitude },
          status: modeRef.current,
        };

        const { error } = await supabase
          .from("drivers")
          .update(payload)
          .eq("email", userEmail);

        if (error) {
          throw error;
        }
      } catch (error) {
        console.error("Error updating driver data in Supabase:", error);
      }
    };

    updateDriverData();
  }, [userEmail, location, mode]);

  useEffect(() => {
    if (!driverData?.id) return;

    const getOrders = async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("driver_id", driverData.id)
          .eq("status", "PAID")
          .eq("live", true);

        if (error) {
          throw error;
        }

        setOrders(data || []);
      } catch (error) {
        console.error("Error Fetching order data:", error);
      }
    };

    getOrders();
  }, [driverData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    if (driverData?.id) {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("driver_id", driverData.id)
          .eq("live", true);

        if (!error) {
          setOrders(data || []);
        }
      } catch (error) {
        console.error("Error refreshing orders:", error);
      }
    }

    setRefreshing(false);
  }, [driverData]);

  const handleAccept = async (orderId: string, answer: string) => {
    if (driverData?.id) {
      try {
        const { error } = await supabase
          .from("orders")
          .update({ order_status: answer })
          .eq("id", orderId)
          .eq("driver_id", driverData.id)
          .eq("live", true);

        if (!error) {
          const { data, error: fetchError } = await supabase
            .from("orders")
            .select("*")
            .eq("driver_id", driverData.id)
            .eq("live", true);

          if (!fetchError) {
            setOrders(data || []);
          }
        }
      } catch (error) {
        console.error("Error updating order status:", error);
      }
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
                <UserGreeting>Hey, {capitalizedDisplayName}</UserGreeting>
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

          <SectionTitle>Available Jobs</SectionTitle>
          <JobsContainer>
            {loadingData ? (
              <LoadingContainer>
                <ActivityIndicator
                  size="large"
                  color={DriverModeColors.primary}
                />
                <LoadingText>Loading your jobs...</LoadingText>
              </LoadingContainer>
            ) : orders && orders.length > 0 ? (
              orders.map((order: OrderData) => (
                <JobOfferComponent
                  key={order.id}
                  id={order.id}
                  order_status={order.order_status || ""}
                  orderNumber={`Order #${order.id.toString().slice(-3)}`}
                  orderMode={"Items"}
                  destination={order.destination_name || ""}
                  pickupLocation={order.pickup_name || ""}
                  price={order.price || 0}
                  time={new Date(order.created_at).toLocaleString()}
                  onAccept={() => handleAccept(order.id, "ACCEPTED")}
                  onDecline={() => handleAccept(order.id, "DECLIENED")}
                />
              ))
            ) : (
              <NoJobsText>
                No available jobs at the moment. Pull down to refresh.
              </NoJobsText>
            )}
          </JobsContainer>
        </Innercontainer>
      </ScrollableContent>
    </Container>
  );
};

export default HomeScreen;
