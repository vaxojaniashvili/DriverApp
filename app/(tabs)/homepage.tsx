import {
  Platform,
  StatusBar,
  RefreshControl,
  View,
  ActivityIndicator,
  Text,
  Alert,
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
import { useFocusEffect, useRouter } from "expo-router";
import JobSelectionComponent from "@/components/homepage/jobs-selection/JobSelection";
import PickupRadiusSelector from "@/components/homepage/pickup-radius/PickupRadiusSelector";

const HomeScreen: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string>("");
  const [driverData, setDriverData] = useState<DriverData | null>(null);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [activeOrder, setActiveOrder] = useState<OrderData | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [apiToken, setApiToken] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [userId, setUserId] = useState(null);

  const [userIndicator, setUserIndicator] = useState<string | null>(null);
  const [driverDetails, setDriverDetails] = useState<any>(null);

  const [ongoingOrders, setOngoingOrders] = useState<OrderData[]>([]);
  const router = useRouter();

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
    fetchUserData();
  }, []);

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
        setDriverDetails(driverInfo);
        setUserIndicator(driverInfo.indicator);

        if (driverInfo.email === userEmail) {
          setDriverData({
            ...driverInfo,
            plate: driverInfo.plate,
            id: driverInfo.id,
          } as DriverData);
        }
      }
    } catch (error) {
      console.log("Error fetching driver details:", error);
    }
  };

  const fetchUserData = async () => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      setSession(session);

      if (sessionError || !session) {
        console.error("No active session found");
        router.replace("/authentication" as any);
        return;
      }

      setApiToken(session.access_token);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      console.log("userrr", user);

      if (user?.user_metadata.status === "incomplete") {
        console.log("User status is incomplete. Sending API request...");

        try {
          const res = await fetch(
            "https://api.thevanapp.com/api/driver-details",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                unique_id: user.id,
                name: user.user_metadata.first_name,
                last_name: user.user_metadata.last_name,
                email: user.email,
              }),
            }
          );
          if (res.ok) {
            Alert.alert("okeyaa");
          }

          if (res.ok || res.status === 409) {
            console.log(
              "API request successful or data already exists. Updating status to complete..."
            );

            const { error: updateError } = await supabase.auth.updateUser({
              data: {
                status: "complete",
              },
            });

            if (updateError) {
              console.error("Failed to update user status:", updateError);
            } else {
              console.log("User status updated to complete");
            }
          } else {
            console.error("API request failed with status:", res.status);
          }
        } catch (apiError) {
          console.error("Error sending API request:", apiError);
        }
      }

      setUserId(user?.id as any);

      if (userError || !user) {
        console.error("Error fetching user:", userError);
        return;
      }

      setUserEmail(user.email || user.user_metadata.email || "");
      await fetchDriverDetails();
    } catch (error) {
      console.error("Error in fetchUserData:", error);
    }
  };

  useEffect(() => {
    if (userEmail && apiToken) {
      const interval = setInterval(() => {
        fetchDriverDetails();
      }, 100);

      return () => clearInterval(interval);
    }
  }, [userEmail, apiToken]);

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
  }, [userEmail, apiToken, userIndicator]);

  const sendLocationToApi = async () => {
    if (!userEmail || !location || !apiToken || userIndicator !== "active") {
      console.log(
        "Missing data or indicator not active, skipping location update"
      );
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

      // if (response.ok) {
      //   console.log("sending to api");
      // }

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
    await fetchDriverDetails();

    if (!apiToken || userIndicator !== "active") {
      console.log("No API token or indicator not active, skipping refresh");
      setRefreshing(false);
      return false;
    }

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error fetching user:", userError);
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
  }, [apiToken, userIndicator]);

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

    setActiveOrder(active || null);
    setOngoingOrders(ongoing);
    setOrders(pendingOrders);
  };

  useFocusEffect(
    useCallback(() => {
      fetchDriverDetails().then(() => {
        if (apiToken && userIndicator === "active") {
          onRefresh();
        }
      });

      return () => {};
    }, [onRefresh, apiToken, userIndicator])
  );

  const handleAccept = async (orderId: string) => {
    if (!driverData?.id || !apiToken || userIndicator !== "active") {
      console.log("Missing driver data, API token, or indicator not active");
      return;
    }

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error fetching user:", userError);
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
      console.log("Error accepting order:", error);
    }
  };

  const displayName = userEmail ? userEmail.split("@")[0] : "Driver";
  const capitalizedDisplayName =
    displayName.charAt(0).toUpperCase() + displayName.slice(1);

  return (
    <Container>
      <GradientHeader
        colors={["#27ae60", "#1e8449"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <ScrollableContent
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            enabled={userIndicator === "active"}
          />
        }
      >
        <Innercontainer>
          <Header>
            <HeaderContent>
              <UserInfoSection>
                <AvatarContainer>
                  <Avatar>
                    {capitalizedDisplayName.charAt(0).toUpperCase()}
                  </Avatar>
                </AvatarContainer>
                <UserTextInfo>
                  <UserGreeting>Welcome, {capitalizedDisplayName}</UserGreeting>
                  {userIndicator !== "active" ? (
                    <Text style={{ fontWeight: 500 }}>
                      Status: <Text style={{ color: "red" }}>Incomplete</Text>
                    </Text>
                  ) : (
                    <Text style={{ fontWeight: 500 }}>
                      Status: <Text style={{ color: "green" }}>Completed</Text>
                    </Text>
                  )}
                </UserTextInfo>
              </UserInfoSection>

              <UserDetailsSection>
                <InfoCard>
                  <InfoIcon>
                    <MaterialIcons name="email" size={16} color="#666" />
                  </InfoIcon>
                  <InfoText>{userEmail}</InfoText>
                </InfoCard>

                {driverData?.plate && userIndicator === "active" && (
                  <InfoCard style={{ height: 50 }}>
                    <View>
                      <FontAwesome5 name="car-alt" size={16} color="#666" />
                    </View>
                    <Text style={{ marginLeft: 20 }}>{driverData.plate}</Text>
                  </InfoCard>
                )}
              </UserDetailsSection>

              {userIndicator !== "active" && (
                <>
                  <VerificationAlert>
                    <AlertIcon>
                      <MaterialIcons name="warning" size={24} color="#F59E0B" />
                    </AlertIcon>
                    <AlertContent>
                      <AlertTitle>Account verification is required.</AlertTitle>
                      <AlertDescription>
                        Please verify your account to get started.
                      </AlertDescription>
                    </AlertContent>
                  </VerificationAlert>
                  <VerifyButton
                    onPress={() => router.push("/(tabs)/driverVerification")}
                  >
                    <VerifyButtonContent>
                      <VerifyButtonText>Verify</VerifyButtonText>
                      <MaterialIcons
                        name="arrow-forward"
                        size={20}
                        color="#FFF"
                      />
                    </VerifyButtonContent>
                  </VerifyButton>
                </>
              )}

              {userIndicator === "active" && (
                <StatusSection>
                  <StatusCard active={mode === "active"}>
                    <StatusIndicator active={mode === "active"} />
                    <StatusText active={mode === "active"}>
                      {mode === "active" ? "ONLINE" : "OFFLINE"}
                    </StatusText>
                  </StatusCard>

                  {errorMsg ? (
                    <LocationCard theme="error">
                      <MaterialIcons
                        name="error-outline"
                        size={18}
                        color={DriverModeColors.danger}
                      />
                      <LocationCardText theme="error">
                        {errorMsg}
                      </LocationCardText>
                    </LocationCard>
                  ) : locationSendError ? (
                    <LocationCard theme="error">
                      <MaterialIcons
                        name="error-outline"
                        size={18}
                        color={DriverModeColors.danger}
                      />
                      <LocationCardText theme="error">
                        {locationSendError}
                      </LocationCardText>
                    </LocationCard>
                  ) : location && userIndicator === "active" ? (
                    <LocationCard>
                      <MaterialIcons
                        name="location-on"
                        size={18}
                        color={DriverModeColors.success}
                      />
                      <LocationCardText>
                        Location tracking active
                      </LocationCardText>
                    </LocationCard>
                  ) : null}
                </StatusSection>
              )}
            </HeaderContent>
          </Header>

          {userIndicator === "active" && (
            <>
              <ModeContainer>
                <Drivermodecomponent />
              </ModeContainer>
              <ModeContainer>
                <JobSelectionComponent />
              </ModeContainer>

              {userIndicator === "active" && isAutomatic && (
                <ModeContainer>
                  <PickupRadiusSelector />
                </ModeContainer>
              )}

              {userIndicator === "active" &&
                isAutomatic &&
                ongoingOrders.length > 0 && (
                  <JobsContainer>
                    <SectionTitle>Ongoing Orders</SectionTitle>
                    {ongoingOrders.map((order) => (
                      <JobOfferComponent
                        key={order.id}
                        order={order}
                        onAccept={() => {}}
                      />
                    ))}
                  </JobsContainer>
                )}

              {userIndicator === "active" && !isAutomatic && (
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
                        order={order}
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

              {userIndicator === "active" &&
                isAutomatic &&
                ongoingOrders.length === 0 && (
                  <NoOngoingJobsText>
                    No available ongoing Orders at the moment. Pull down to
                    refresh.
                  </NoOngoingJobsText>
                )}

              {userIndicator !== "active" && (
                <NoJobsText style={{ marginTop: 20, color: "#666" }}>
                  You are currently offline. Go online to see available orders.
                </NoJobsText>
              )}
            </>
          )}

          {userIndicator !== "active" && (
            <NoJobsText style={{ marginTop: 20, color: "red" }}>
              Please verify your account to start accepting orders
            </NoJobsText>
          )}
        </Innercontainer>
      </ScrollableContent>
    </Container>
  );
};

export default HomeScreen;

// Styled components remain the same as in original code
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
  shadow-opacity: 0.22;
  shadow-radius: 8px;
  shadow-color: #000;
  shadow-offset: 0px 3px;
  border-width: 0.5px;
  border-color: rgba(255, 255, 255, 0.8);
`;

const UserGreeting = styled.Text`
  font-size: 22px;
  font-weight: 700;
  color: ${DriverModeColors.dark};
  margin-bottom: 4px;
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
  border-radius: 16px;
  shadow-opacity: 0.12;
  shadow-radius: 8px;
  shadow-offset: 0px 3px;
  border-width: 0.5px;
  border-color: rgba(255, 255, 255, 0.35);
`;

const NoOngoingJobsText = styled.Text`
  font-size: 14px;
  color: green;
  text-align: center;
  padding: 20px;
  border-radius: 16px;
  shadow-opacity: 0.12;
  shadow-radius: 8px;
  shadow-offset: 0px 3px;
  border-width: 0.5px;
  border-color: rgba(255, 255, 255, 0.35);
`;
const LoadingText = styled.Text`
  font-size: 14px;
  font-weight: 500;
  color: ${DriverModeColors.darkGray};
  margin-top: 12px;
`;

const GradientHeader = styled(LinearGradient)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: ${Platform.OS === "android" ? "250px" : "290px"};
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
`;
const HeaderContent = styled.View``;

const UserInfoSection = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 20px;
`;

const AvatarContainer = styled.View`
  margin-right: 16px;
`;

const Avatar = styled.Text`
  width: 56px;
  height: 56px;
  background-color: #27ae60;
  color: #ffffff;
  font-size: 24px;
  font-weight: 700;
  border-radius: 28px;
  text-align: center;
  line-height: 56px;
`;

const UserTextInfo = styled.View`
  flex: 1;
`;

const UserFullName = styled.Text`
  font-size: 20px;
  color: #1a1a1a;
  font-weight: 700;
  letter-spacing: -0.3px;
`;

const UserDetailsSection = styled.View`
  margin-bottom: 20px;
`;

const InfoCard = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: #f8f9fa;
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 8px;
`;

const InfoIcon = styled.View`
  margin-right: 10px;
  width: 24px;
  height: 24px;
  background-color: #ffffff;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
`;

const InfoText = styled.Text`
  font-size: 14px;
  color: #333333;
  font-weight: 500;
  flex: 1;
`;

const VerificationAlert = styled.View`
  flex-direction: row;
  background-color: #fff7ed;
  padding: 16px;
  border-radius: 16px;
  margin-bottom: 16px;
  border-width: 1px;
  border-color: #fed7aa;
`;

const AlertIcon = styled.View`
  margin-right: 12px;
  padding-top: 2px;
`;

const AlertContent = styled.View`
  flex: 1;
`;

const AlertTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #c05621;
  margin-bottom: 4px;
`;

const AlertDescription = styled.Text`
  font-size: 14px;
  color: #92400e;
  line-height: 20px;
`;

const VerifyButton = styled.TouchableOpacity`
  background-color: #27ae60;
  padding: 16px;
  border-radius: 16px;
  align-items: center;
  margin-bottom: 20px;
  active-opacity: 0.8;
`;

const VerifyButtonContent = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const VerifyButtonText = styled.Text`
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  margin-right: 8px;
`;

const StatusSection = styled.View`
  gap: 10px;
`;

const StatusCard = styled.View<StatusProps>`
  flex-direction: row;
  align-items: center;
  background-color: ${(props) => (props.active ? "#F0FDF4" : "#FEF2F2")};
  padding: 12px 16px;
  border-radius: 12px;
  border-width: 1px;
  border-color: ${(props) => (props.active ? "#BBF7D0" : "#FECACA")};
`;

const StatusIndicator = styled.View<StatusProps>`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${(props) => (props.active ? "#10B981" : "#EF4444")};
  margin-right: 8px;
`;

const StatusText = styled.Text<StatusProps>`
  font-size: 14px;
  font-weight: 600;
  color: ${(props) => (props.active ? "#059669" : "#DC2626")};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const LocationCard = styled.View<ThemeProps>`
  flex-direction: row;
  align-items: center;
  background-color: ${(props) =>
    props.theme === "error" ? "#FEF2F2" : "#F0FDF4"};
  padding: 12px 16px;
  border-radius: 12px;
  border-width: 1px;
  border-color: ${(props) => (props.theme === "error" ? "#FECACA" : "#BBF7D0")};
`;

const LocationCardText = styled.Text<ThemeProps>`
  color: ${(props) => (props.theme === "error" ? "#DC2626" : "#059669")};
  font-size: 14px;
  font-weight: 500;
  margin-left: 8px;
`;
