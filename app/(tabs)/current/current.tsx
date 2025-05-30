import React, { useState, useEffect, useCallback } from "react";
import { Platform } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import styled from "styled-components/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { supabase } from "@/infrastructure/db/supabase";
import { useFocusEffect, useRouter } from "expo-router";
import OrderDetails from "@/components/OrderDetails";

const OrderScreen = () => {
  const [orders, setOrders] = useState<any>([]);
  const [my_id, setMy_id] = useState(0);
  const [loading, setLoading] = useState<any>(true);
  const [apiToken, setApiToken] = useState(null);
  const [allDetailsVisible, setAllDetailsVisible] = useState(false);
  const [expandedItemIds, setExpandedItemIds] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchDriverUUID = async () => {
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
        setMy_id(driverUUID as any);
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    };

    fetchDriverUUID();
  }, []);

  const toggleItemExpansion = (itemId) => {
    setExpandedItemIds((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.access_token) {
          setApiToken(sessionData.session.access_token as any);
        }
      } catch (error) {
        console.log("Error fetching token:", error);
      }
    };

    fetchToken();
  }, []);

  const DELIVERY_STEPS = [
    { id: "ACCEPTED", label: "Order Accepted", icon: "checkmark-circle" },
    { id: "GOING TO DESTINATION", label: "Going to Pickup", icon: "navigate" },
    { id: "LOADING THE VAN", label: "Loading Van", icon: "cube" },
    { id: "HEADING TO DESTINATION", label: "Heading to Delivery", icon: "car" },
    { id: "ARRIVED", label: "Arrived", icon: "location" },
    { id: "DELIVERED", label: "Delivered", icon: "gift" },
    { id: "COMPLETED", label: "Completed", icon: "checkmark-done-circle" },
  ];

  const handleChatPress = (order: any) => {
    router.push({
      pathname: "/(tabs)/Activity/activity",
      params: {
        orderId: order.id,
        customerEmail: order.email,
        customerPhone: "+995568930229",
        type: "messages",
      },
    });
  };

  const handleSupportPress = (order: any) => {
    router.push({
      pathname: "/(tabs)/Activity/activity",
      params: {
        orderId: order.id,
        driverId: my_id,
        issueType: "delivery_support",
        type: "support",
      },
    });
  };
  const getOrders = async () => {
    if (!my_id || !apiToken) return;

    setLoading(true);
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
            id: my_id,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(`API response error: ${res.status}`);
      }

      const data = await res.json();
      setOrders(data || []);
    } catch (error) {
      console.error("Error Fetching order data:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      console.log("OrderScreen focused - fetching current orders");
      if (apiToken) {
        getOrders();
      }

      return () => {
        console.log("OrderScreen lost focus");
      };
    }, [apiToken, my_id])
  );

  useEffect(() => {
    if (!my_id || !apiToken) return;

    getOrders();
    const timeoutId = setInterval(() => {
      getOrders();
    }, 3000000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [my_id, apiToken]);

  async function handleStepDone(orderId: any, currentStatus: any) {
    let updated_status;
    switch (currentStatus) {
      case "ACCEPTED":
        updated_status = "GOING TO DESTINATION";
        break;
      case "GOING TO DESTINATION":
        updated_status = "LOADING THE VAN";
        break;
      case "LOADING THE VAN":
        updated_status = "HEADING TO DESTINATION";
        break;
      case "HEADING TO DESTINATION":
        updated_status = "ARRIVED";
        break;
      case "ARRIVED":
        updated_status = "DELIVERED";
        break;
      case "DELIVERED":
        updated_status = "COMPLETED";
        break;
      default:
        updated_status = "PENDING";
    }

    if (my_id && apiToken) {
      try {
        const response = await fetch(
          `https://api.thevanapp.com/api/paidorders/complex/statusupdate/${orderId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiToken}`,
            },
            body: JSON.stringify({
              status: updated_status,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const fetchRes = await fetch(
          "https://api.thevanapp.com/api/paidorders/checker",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiToken}`,
            },
            body: JSON.stringify({
              id: my_id,
            }),
          }
        );

        if (!fetchRes.ok) {
          throw new Error(`API response error: ${fetchRes.status}`);
        }

        const data = await fetchRes.json();
        setOrders(data || []);
      } catch (error) {
        console.error("Error updating order status:", error);
      }
    }
  }

  const getActiveOrder = () => {
    if (!orders || orders.length === 0) return null;

    const activeOrders = orders.filter(
      (order) => order.order_status !== "COMPLETED"
    );

    if (activeOrders.length === 0) {
      const mostRecentOrder = [...orders].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      )[0];
      return mostRecentOrder;
    }

    const sortedActiveOrders = [...activeOrders].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    return sortedActiveOrders[0];
  };

  const activeOrder = getActiveOrder();

  const getCurrentStepIndex = () => {
    if (!activeOrder) return -1;
    return DELIVERY_STEPS.findIndex(
      (step) => step.id === activeOrder.order_status
    );
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <Container>
      <StyledMap
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 35.894509,
          longitude: 14.479826,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {activeOrder && activeOrder.pickup_lat && (
          <Marker
            coordinate={{
              latitude:
                typeof activeOrder.pickup_lat === "string"
                  ? parseFloat(activeOrder.pickup_lat)
                  : activeOrder.pickup_lat,
              longitude:
                typeof activeOrder.pickup_lng === "string"
                  ? parseFloat(activeOrder.pickup_lng)
                  : activeOrder.pickup_lng,
            }}
            title="Pickup"
            description="Order pickup point"
          >
            <MarkerContainer>
              <Ionicons name="home" size={22} color="#4CAF50" />
            </MarkerContainer>
          </Marker>
        )}

        {activeOrder && activeOrder.destination_lat && (
          <Marker
            coordinate={{
              latitude:
                typeof activeOrder.destination_lat === "string"
                  ? parseFloat(activeOrder.destination_lat)
                  : activeOrder.destination_lat,
              longitude:
                typeof activeOrder.destination_lng === "string"
                  ? parseFloat(activeOrder.destination_lng)
                  : activeOrder.destination_lng,
            }}
            title="Destination"
            description="Order Destination point"
          >
            <MarkerContainer>
              <Ionicons name="logo-dropbox" size={22} color="#4CAF50" />
            </MarkerContainer>
          </Marker>
        )}
      </StyledMap>

      <OrderDetailsContainer showsVerticalScrollIndicator={false}>
        {loading ? (
          <LoadingOverlay>
            <LoadingText>Loading order information...</LoadingText>
          </LoadingOverlay>
        ) : activeOrder ? (
          <>
            <OrderHeader>
              <OrderIdText>Order #{activeOrder.id}</OrderIdText>
              <OrderStatusBadge>
                <OrderStatusText>
                  {activeOrder.order_status.replace(/_/g, " ")}
                </OrderStatusText>
              </OrderStatusBadge>
            </OrderHeader>

            <OrderCreationTime>
              Created: {new Date(activeOrder.created_at).toLocaleString()}
            </OrderCreationTime>

            <OrderDetailsRow>
              <DetailItem>
                <DetailIcon>
                  <Ionicons name="navigate" size={18} color="#555" />
                </DetailIcon>
                <DetailLabel>Distance</DetailLabel>
                <DetailValue>{activeOrder.distance}</DetailValue>
              </DetailItem>

              <DetailSeparator />

              <DetailItem>
                <DetailIcon>
                  <MaterialIcons name="euro" size={18} color="#555" />
                </DetailIcon>
                <DetailLabel>Price</DetailLabel>
                <DetailValue>€{activeOrder.price}</DetailValue>
              </DetailItem>

              <DetailSeparator />

              <DetailItem>
                <DetailIcon>
                  <Ionicons name="pricetag" size={18} color="#555" />
                </DetailIcon>
                <DetailLabel>Status</DetailLabel>
                <DetailValue>{activeOrder.status}</DetailValue>
              </DetailItem>
            </OrderDetailsRow>

            {activeOrder.order_status !== "COMPLETED" && (
              <OrderDetails
                activeOrder={activeOrder}
                allDetailsVisible={allDetailsVisible}
                setAllDetailsVisible={setAllDetailsVisible}
                expandedItemIds={expandedItemIds}
                toggleItemExpansion={toggleItemExpansion}
                handleChatPress={handleChatPress}
                handleSupportPress={handleSupportPress}
              />
            )}

            <DeliveryStepsContainer>
              {DELIVERY_STEPS.map((step, index: number) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isPending = index > currentStepIndex;

                return (
                  <DeliveryStep
                    key={step.id}
                    isCompleted={isCompleted}
                    isCurrent={isCurrent}
                    isPending={isPending}
                  >
                    <StepIconContainer
                      isCompleted={isCompleted}
                      isCurrent={isCurrent}
                      isPending={isPending}
                    >
                      <Ionicons
                        name={step.icon}
                        size={18}
                        color={
                          isCompleted ? "#fff" : isCurrent ? "#fff" : "#AAA"
                        }
                      />
                    </StepIconContainer>

                    <StepLabel
                      isCompleted={isCompleted}
                      isCurrent={isCurrent}
                      isPending={isPending}
                    >
                      {step.label}
                    </StepLabel>

                    {index < DELIVERY_STEPS.length - 1 && (
                      <StepConnector
                        isCompleted={isCompleted}
                        isCurrent={false}
                        isPending={true}
                      />
                    )}
                  </DeliveryStep>
                );
              })}
            </DeliveryStepsContainer>

            {currentStepIndex < DELIVERY_STEPS.length - 1 && (
              <MainActionButton
                onPress={() =>
                  handleStepDone(activeOrder.id, activeOrder.order_status)
                }
              >
                <MainActionButtonText>
                  {`Complete: ${DELIVERY_STEPS[currentStepIndex]?.label}`}
                </MainActionButtonText>
              </MainActionButton>
            )}

            {activeOrder.order_status === "COMPLETED" && (
              <CompletedMessage>
                This order has been completed. Waiting for new orders...
              </CompletedMessage>
            )}
          </>
        ) : (
          <NoOrderContainer>
            <Ionicons name="car" size={50} color="#CCC" />
            <NoOrderText>No active orders assigned to you</NoOrderText>
          </NoOrderContainer>
        )}
      </OrderDetailsContainer>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: #f5f5f5;
`;

const StyledMap = styled(MapView)`
  height: 45%;
  width: 100%;
`;

const MarkerContainer = styled.View`
  background-color: #fff;
  padding: 5px;
  border-radius: 20px;
  border-width: 2px;
  border-color: #4caf50;
`;

const OrderDetailsContainer = styled.ScrollView`
  flex: 1;
  background-color: #fff;
  border-top-left-radius: 25px;
  border-top-right-radius: 25px;
  margin-top: 0px;
  padding: 20px;
  shadow-color: #000;
  shadow-offset: 0px -2px;
  shadow-opacity: 0.1;
  shadow-radius: 3px;
  elevation: 5;
`;

const LoadingOverlay = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const LoadingText = styled.Text`
  font-size: 16px;
  color: #4caf50;
`;

const NoOrderContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const NoOrderText = styled.Text`
  font-size: 18px;
  color: #4caf50;
  margin-top: 15px;
  text-align: center;
`;

const OrderHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const OrderIdText = styled.Text`
  font-size: 18px;
  font-weight: bold;
`;

const OrderStatusBadge = styled.View`
  background-color: #4caf50;
  padding: 5px 10px;
  border-radius: 10px;
`;

const OrderStatusText = styled.Text`
  color: white;
  font-weight: bold;
  font-size: 12px;
`;

const OrderCreationTime = styled.Text`
  font-size: 12px;
  margin-bottom: 15px;
`;

const OrderDetailsRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 8px;
  margin-bottom: 20px;
  border: 1px solid #e8f5e9;
`;

const DetailItem = styled.View`
  flex: 1;
  align-items: center;
`;

const DetailIcon = styled.View`
  margin-bottom: 5px;
`;

const DetailLabel = styled.Text`
  font-size: 12px;
  margin-bottom: 3px;
`;

const DetailValue = styled.Text`
  font-size: 13px;
  font-weight: bold;
  color: #388e3c;
`;

const DetailSeparator = styled.View`
  width: 1px;
  background-color: #ccead6;
  height: 30px;
  margin-top: 5px;
`;

const DeliveryStepsContainer = styled.View`
  margin-bottom: 20px;
`;

const DeliveryStep = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
  position: relative;
`;

const StepIconContainer = styled.View`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: ${(props) =>
    props.isCompleted ? "#4CAF50" : props.isCurrent ? "#2196F3" : "#EEEEEE"};
  justify-content: center;
  align-items: center;
  margin-right: 10px;
`;

const StepLabel = styled.Text`
  font-size: 14px;
  color: ${(props) =>
    props.isCompleted ? "#4CAF50" : props.isCurrent ? "#2196F3" : "#999999"};
  font-weight: ${(props) =>
    props.isCompleted || props.isCurrent ? "bold" : "normal"};
`;

const StepConnector = styled.View`
  position: absolute;
  left: 15px;
  top: 32px;
  width: 2px;
  height: 20px;
  background-color: ${(props) => (props.isCompleted ? "#4CAF50" : "#EEEEEE")};
`;

const MainActionButton = styled.TouchableOpacity`
  background-color: #4caf50;
  padding: 15px;
  border-radius: 10px;
  align-items: center;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 3px;
  elevation: 2;
  ${Platform.OS === "android" ? "margin-bottom:30px" : "margin-bottom:30px"}
`;

const MainActionButtonText = styled.Text`
  color: white;
  font-weight: bold;
  font-size: 16px;
`;

const CompletedMessage = styled.Text`
  text-align: center;
  margin-bottom: 25px;
  color: #4caf50;
  font-style: italic;
`;

export default OrderScreen;
