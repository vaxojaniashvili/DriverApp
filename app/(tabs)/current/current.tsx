import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import styled from "styled-components/native";
import { useAuthStore } from "@/infrastructure/store/store";
import { supabase } from "@/infrastructure/db/supabase";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

const OrderScreen = () => {
  let { my_id } = useAuthStore();
  const [orders, setOrders]: any = useState([]);
  const [loading, setLoading]: any = useState(true);

  // Define all possible steps for order delivery
  const DELIVERY_STEPS = [
    { id: "ACCEPTED", label: "Order Accepted", icon: "checkmark-circle" },
    { id: "GOING TO DESTINATION", label: "Going to Pickup", icon: "navigate" },
    { id: "LOADING THE VAN", label: "Loading Van", icon: "cube" },
    { id: "HEADING TO DESTINATION", label: "Heading to Delivery", icon: "car" },
    { id: "ARRIVED", label: "Arrived", icon: "location" },
    { id: "DELIVERED", label: "Delivered", icon: "gift" },
    { id: "COMPLETED", label: "Completed", icon: "checkmark-done-circle" },
  ];

  useEffect(() => {
    if (!my_id) return;

    const getOrders = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("driver_id", my_id)
          .eq("live", true);

        if (error) {
          throw error;
        }
        setOrders(data || []);
      } catch (error) {
        console.error("Error Fetching order data:", error);
      } finally {
        setLoading(false);
      }
    };

    getOrders();

    // Set up real-time subscription
    const subscription = supabase
      .channel("order-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `driver_id=eq.${my_id}`,
        },
        (payload) => {
          // Update orders when changes occur
          getOrders();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [my_id]);

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

    if (my_id) {
      try {
        const { error } = await supabase
          .from("orders")
          .update({ order_status: updated_status })
          .eq("id", orderId)
          .eq("driver_id", my_id)
          .eq("status", "PAID")
          .eq("live", true);

        if (error) {
          throw error;
        }

        // Refresh orders after update
        const { data, fetchError }: any = await supabase
          .from("orders")
          .select("*")
          .eq("driver_id", my_id)
          .eq("live", true);

        if (fetchError) {
          throw fetchError;
        }

        setOrders(data || []);
      } catch (error) {
        console.error("Error updating order status:", error);
      }
    }
  }

  // Get the current active order (assuming the first one is active)
  const activeOrder = orders.length > 0 ? orders[0] : null;

  // Find the current step index based on order status
  const getCurrentStepIndex = () => {
    if (!activeOrder) return -1;
    return DELIVERY_STEPS.findIndex(
      (step) => step.id === activeOrder.order_status
    );
  };

  const currentStepIndex = getCurrentStepIndex();

  // Order details (could be calculated from actual data)
  const orderDetails = {
    remainingDistance: activeOrder?.distance
      ? `${activeOrder.distance} km`
      : "-- km",
    speed: "45 km/h", // Example speed (could be fetched from location service)
    eta: activeOrder?.eta || "-- min", // ETA from order or default
  };

  return (
    <Container>
      <StyledMap
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
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
              latitude: activeOrder.pickup_lat,
              longitude: activeOrder.pickup_lng,
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
              latitude: activeOrder.destination_lat,
              longitude: activeOrder.destination_lng,
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

      {loading ? (
        <LoadingOverlay>
          <LoadingText>Loading order information...</LoadingText>
        </LoadingOverlay>
      ) : activeOrder ? (
        <OrderDetailsContainer>
          {/* Order Info Header */}
          <OrderHeader>
            <OrderIdText>Order #{activeOrder.id}</OrderIdText>
            <OrderStatusBadge>
              <OrderStatusText>
                {activeOrder.order_status.replace(/_/g, " ")}
              </OrderStatusText>
            </OrderStatusBadge>
          </OrderHeader>

          {/* Order Details Row */}
          <OrderDetailsRow>
            <DetailItem>
              <DetailIcon>
                <Ionicons name="navigate" size={18} color="#555" />
              </DetailIcon>
              <DetailLabel>Distance</DetailLabel>
              <DetailValue>{orderDetails.remainingDistance}</DetailValue>
            </DetailItem>

            <DetailSeparator />

            <DetailItem>
              <DetailIcon>
                <Ionicons name="speedometer" size={18} color="#555" />
              </DetailIcon>
              <DetailLabel>Speed</DetailLabel>
              <DetailValue>{orderDetails.speed}</DetailValue>
            </DetailItem>

            <DetailSeparator />

            <DetailItem>
              <DetailIcon>
                <Ionicons name="time" size={18} color="#555" />
              </DetailIcon>
              <DetailLabel>ETA</DetailLabel>
              <DetailValue>{orderDetails.eta}</DetailValue>
            </DetailItem>
          </OrderDetailsRow>

          {/* Delivery Steps */}
          <DeliveryStepsContainer>
            {DELIVERY_STEPS.map((step, index) => {
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
                      color={isCompleted ? "#fff" : isCurrent ? "#fff" : "#AAA"}
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

          {/* Action Button */}
          {currentStepIndex < DELIVERY_STEPS.length - 1 && (
            <ActionButton
              onPress={() =>
                handleStepDone(activeOrder.id, activeOrder.order_status)
              }
            >
              <ActionButtonText>
                {`Complete: ${DELIVERY_STEPS[currentStepIndex]?.label}`}
              </ActionButtonText>
            </ActionButton>
          )}
        </OrderDetailsContainer>
      ) : (
        <NoOrderContainer>
          <Ionicons name="car" size={50} color="#CCC" />
          <NoOrderText>No active orders assigned to you</NoOrderText>
        </NoOrderContainer>
      )}
    </Container>
  );
};

// Styled components
const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const StyledMap = styled(MapView)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const MarkerContainer = styled.View`
  background-color: white;
  border-radius: 50px;
  padding: 4px;
  border-width: 2px;
  border-color: white;
  shadow-color: #000;
  shadow-opacity: 0.3;
  shadow-offset: 0px 2px;
  shadow-radius: 5px;
  elevation: 5;
`;

const OrderDetailsContainer = styled.View`
  width: 95%;
  padding: 16px;
  border-radius: 12px;
  background-color: white;
  position: absolute;
  bottom: 20px;
  elevation: 5;
  shadow-color: #000;
  shadow-opacity: 0.2;
  shadow-offset: 0px 3px;
  shadow-radius: 6px;
`;

const OrderHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const OrderIdText = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #333;
`;

const OrderStatusBadge = styled.View`
  background-color: #4285f4;
  padding: 6px 12px;
  border-radius: 20px;
`;

const OrderStatusText = styled.Text`
  font-size: 12px;
  font-weight: bold;
  color: white;
`;

const OrderDetailsRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  margin-bottom: 16px;
  border-top-width: 1px;
  border-bottom-width: 1px;
  border-color: #eeeeee;
`;

const DetailItem = styled.View`
  flex-direction: row;
  align-items: center;
  flex: 1;
  justify-content: center;
`;

const DetailIcon = styled.View`
  margin-right: 4px;
`;

const DetailLabel = styled.Text`
  font-size: 11px;
  color: #777;
  margin-right: 4px;
`;

const DetailValue = styled.Text`
  font-size: 12px;
  font-weight: bold;
  color: #333;
`;

const DetailSeparator = styled.View`
  width: 1px;
  height: 20px;
  background-color: #eeeeee;
`;

const DeliveryStepsContainer = styled.View`
  margin-vertical: 12px;
`;

const DeliveryStep = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 6px;
  position: relative;
`;

const StepIconContainer = styled.View`
  width: 30px;
  height: 30px;
  border-radius: 15px;
  justify-content: center;
  align-items: center;
  background-color: ${(props) =>
    props.isCompleted ? "#4CAF50" : props.isCurrent ? "#4285F4" : "#EEEEEE"};
  z-index: 2;
`;

const StepLabel = styled.Text`
  margin-left: 12px;
  font-size: 13px;
  font-weight: ${(props) => (props.isCurrent ? "bold" : "normal")};
  color: ${(props) =>
    props.isCompleted ? "#4CAF50" : props.isCurrent ? "#4285F4" : "#888"};
`;

const StepConnector = styled.View`
  position: absolute;
  left: 15px;
  top: 30px;
  width: 2px;
  height: 20px;
  background-color: ${(props) => (props.isCompleted ? "#4CAF50" : "#EEEEEE")};
  z-index: 1;
`;

const ActionButton = styled.TouchableOpacity`
  background-color: #4285f4;
  padding: 14px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
`;

const ActionButtonText = styled.Text`
  color: white;
  font-size: 14px;
  font-weight: bold;
`;

const LoadingOverlay = styled.View`
  position: absolute;
  bottom: 20px;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  elevation: 5;
  align-items: center;
`;

const LoadingText = styled.Text`
  font-size: 14px;
  color: #555;
`;

const NoOrderContainer = styled.View`
  position: absolute;
  bottom: 20px;
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  elevation: 5;
  align-items: center;
  width: 90%;
`;

const NoOrderText = styled.Text`
  font-size: 16px;
  color: #777;
  margin-top: 12px;
  text-align: center;
`;

export default OrderScreen;
