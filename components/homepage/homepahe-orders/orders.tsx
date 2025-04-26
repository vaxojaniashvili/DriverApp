import React, { useState } from "react";
import styled from "styled-components/native";
import { Alert, Platform, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Item interface to match your backend data
interface Item {
  id: number;
  name: string;
  size: string;
  price: number;
  category: string;
  quantity: number;
  created_at: string;
  sub_category: string;
}

// Updated props interface to include items
interface JobOfferProps {
  id: string;
  orderNumber: string;
  destination: string;
  pickupLocation: string;
  price: number;
  time: string;
  order_status: string;
  items: Item[]; // Added items array
  onAccept: (id: string) => void;
  onDecline?: (id: string) => void;
}

// Container for the job offer
const JobOfferContainer = styled.View`
  width: 100%;
  padding-top: 15px;
  padding-bottom: 15px;
  padding-horizontal: 24px;
  margin: 10px 0;
  border-radius: 20px;
  elevation: 3;
  shadow-radius: 12px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.35);
  background-color: white;
  box-shadow: ${Platform.OS === "ios"
    ? "0px 4px 8px rgba(0, 0, 0, 0.1)"
    : "0px 4px 8px rgba(0, 0, 0, 1)"};
`;

// Styled component for job details
const JobDetail = styled.View`
  margin-bottom: 8px;
  flex-direction: row;
  gap: 10px;
`;

// Styled component for detail label
const Label = styled.Text`
  font-weight: bold;
  color: #333;
  min-width: 120px;
`;

// Styled component for job data
const Value = styled.Text`
  color: #4caf50;
  font-weight: 500;
  flex: 1;
`;

// Container for action buttons
const ActionsContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 15px;
`;

// Styled button for accept and decline
const ActionButton = styled(TouchableOpacity)<{
  actionType: "accept" | "decline";
}>`
  flex: 1;
  padding: 12px;
  margin: 0 5px;
  border-radius: 5px;
  align-items: center;
  background-color: ${({ actionType }) =>
    actionType === "accept" ? "#4CAF50" : "#F44336"};
`;

// Expand/Collapse Button
const ExpandButton = styled(TouchableOpacity)`
  align-self: center;
  margin-top: 10px;
  /* background-color: #007bff; */
  /* padding: 8px 12px; */
  border-radius: 5px;
  flex-direction: row;
`;

const ExpandButtonText = styled.Text`
  color: gray;
  font-size: 14px;
  margin-top: 5px;
  margin-right: 20px;
`;
const ExpandButtonLessText = styled.Text`
  color: black;
  font-size: 14px;
  margin-top: 5px;
  margin-right: 30px;
`;

const ButtonText = styled.Text`
  color: white;
  font-weight: bold;
`;

const OrderText = styled.Text`
  font-size: 18;
  margin-bottom: 10;
  font-weight: 600;
  color: green;
`;

// New styled components for items section
const ItemsContainer = styled.View`
  margin-top: 15px;
  padding-top: 10px;
  border-top-width: 1px;
  border-top-color: #eee;
`;

const ItemsHeader = styled.Text`
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 10px;
  color: #333;
`;

const ItemRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding: 8px;
  background-color: #f9f9f9;
  border-radius: 5px;
  margin-bottom: 5px;
`;

const ItemInfo = styled.View`
  flex: 1;
`;

const ItemName = styled.Text`
  font-weight: 500;
  color: #4caf50;
`;

const ItemDetails = styled.Text`
  color: #666;
  font-size: 12px;
`;

const ItemPrice = styled.Text`
  font-weight: bold;
  color: #4caf50;
  align-self: center;
`;

const JobOfferComponent: React.FC<JobOfferProps> = ({
  id,
  orderNumber,
  destination,
  pickupLocation,
  price,
  time,
  order_status,
  items,
  onAccept,
  onDecline,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <JobOfferContainer>
      {order_status !== "PENDING" ? (
        <OrderText>Ongoing order</OrderText>
      ) : (
        <OrderText>Available order</OrderText>
      )}
      <JobDetail>
        <Label>Order Number:</Label>
        <Value>{orderNumber}</Value>
      </JobDetail>

      <JobDetail>
        <Label>Price:</Label>
        <Value>€{price.toFixed(2)}</Value>
      </JobDetail>
      {order_status == "ACCEPTED" ? (
        <>
          <Label>STATUS:</Label>
          <Value>Accepted, check Current order's page</Value>
        </>
      ) : null}

      {isExpanded && (
        <>
          {/* <JobDetail>
            <Label>Order Mode:</Label>
            <Value>{orderMode}</Value>
          </JobDetail> */}

          <JobDetail>
            <Label>Pickup Location:</Label>
            <Value>{pickupLocation}</Value>
          </JobDetail>

          <JobDetail>
            <Label>Destination:</Label>
            <Value>{destination}</Value>
          </JobDetail>

          <JobDetail>
            <Label>Time:</Label>
            <Value>{time}</Value>
          </JobDetail>

          {/* Items section */}
          {items && items.length > 0 && (
            <ItemsContainer>
              <ItemsHeader>Items ({items.length})</ItemsHeader>
              {items.map((item, index) => (
                <ItemRow key={`${item.id}-${index}`}>
                  <ItemInfo>
                    <ItemName>{item.name}</ItemName>
                    <ItemDetails>
                      {item.category} - {item.sub_category} - {item.size} - Qty:{" "}
                      {item.quantity}
                    </ItemDetails>
                  </ItemInfo>
                  <ItemPrice>€{item.price.toFixed(2)}</ItemPrice>
                </ItemRow>
              ))}
            </ItemsContainer>
          )}

          {order_status !== "PENDING" ? (
            <Text></Text>
          ) : (
            <ActionsContainer>
              <ActionButton actionType="accept" onPress={() => onAccept(id)}>
                <ButtonText>Accept</ButtonText>
              </ActionButton>
              <ActionButton
                onPress={() => {
                  Alert.alert("Declined order");
                }}
                actionType="decline"
                // onPress={() => onDecline(id)}
              >
                <ButtonText>Decline</ButtonText>
              </ActionButton>
            </ActionsContainer>
          )}
        </>
      )}

      <ExpandButton onPress={toggleExpand}>
        <ExpandButtonText>
          {isExpanded ? "Show Less" : "Show More"}
        </ExpandButtonText>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={16}
          color="gray"
          style={{ marginLeft: -13, marginTop: 5 }}
        />
      </ExpandButton>
    </JobOfferContainer>
  );
};

export default JobOfferComponent;
