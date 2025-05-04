import React, { useState } from "react";
import styled from "styled-components/native";
import { Alert, Platform, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Order } from "@/types/common";

interface JobOfferProps {
  order: Order;
  onAccept: (id: number) => void;
  onDecline?: (id: number) => void;
}

const JobOfferComponent: React.FC<JobOfferProps> = ({
  order,
  onAccept,
  onDecline,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);

  const handleCustomerDetailsShow = () =>
    setShowCustomerDetails(!showCustomerDetails);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
    if (isExpanded) {
      setExpandedItems([]);
    }
  };

  const toggleItemExpand = (itemId: number) => {
    setExpandedItems((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  return (
    <JobOfferContainer>
      <JobDetail>
        <Label>Order ID:</Label>
        <Value>#{order.id}</Value>
      </JobDetail>

      <JobDetail>
        <Label>Price:</Label>
        <Value>€{parseFloat(order.price).toFixed(2)}</Value>
      </JobDetail>

      <JobDetail>
        <Label>Distance:</Label>
        <Value>{order.distance}</Value>
      </JobDetail>

      {order.order_status === "ACCEPTED" && (
        <JobDetail>
          <Label>STATUS:</Label>
          <Value>Accepted, check Current order's page</Value>
        </JobDetail>
      )}

      {isExpanded && (
        <>
          <JobDetail>
            <Label>Pickup Location:</Label>
            <Value>{order.pickup_name}</Value>
          </JobDetail>

          <JobDetail>
            <Label>Destination:</Label>
            <Value>{order.destination_name}</Value>
          </JobDetail>
          <CustomerInfoSection>
            <TouchableOpacity
              onPress={handleCustomerDetailsShow}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <CustomerInfoHeader>Customer Information</CustomerInfoHeader>
              <Ionicons
                name={showCustomerDetails ? "chevron-up" : "chevron-down"}
                size={20}
                color="#555"
              />
            </TouchableOpacity>
            {showCustomerDetails && (
              <>
                <JobDetail>
                  <Label>Email:</Label>
                  <Value>{order.email}</Value>
                </JobDetail>
                <JobDetail>
                  <Label>Phone:</Label>
                  <Value>+995568930229</Value>
                </JobDetail>
              </>
            )}
          </CustomerInfoSection>

          {order.items && order.items.length > 0 && (
            <ItemsContainer>
              <ItemsHeader>Items ({order.items.length})</ItemsHeader>
              {order.items.map((item, index) => (
                <View key={`${item.id}-${index}`}>
                  {!item.name ? (
                    <View></View>
                  ) : (
                    <ItemRow onPress={() => toggleItemExpand(item.id)}>
                      <ItemInfo>
                        <ItemName>{item.name}</ItemName>
                        <ItemDetails>
                          Qty: {item.quantity} • {item.size}
                        </ItemDetails>
                      </ItemInfo>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <ItemPrice>
                          {item?.price ? item.price.toFixed(2) : "0.00"}
                        </ItemPrice>

                        <Ionicons
                          name={
                            expandedItems.includes(item.id)
                              ? "chevron-up"
                              : "chevron-down"
                          }
                          size={18}
                          color="gray"
                          style={{ marginLeft: 8 }}
                        />
                      </View>
                    </ItemRow>
                  )}
                  {!item.name ? (
                    <View></View>
                  ) : (
                    expandedItems.includes(item.id) && (
                      <ItemDropdown>
                        <ItemDetailRow>
                          <ItemDetailLabel>Category:</ItemDetailLabel>
                          <ItemDetailValue>{item.category}</ItemDetailValue>
                        </ItemDetailRow>
                        <ItemDetailRow>
                          <ItemDetailLabel>Sub-category:</ItemDetailLabel>
                          <ItemDetailValue>{item.sub_category}</ItemDetailValue>
                        </ItemDetailRow>
                        <ItemDetailRow>
                          <ItemDetailLabel>Size:</ItemDetailLabel>
                          <ItemDetailValue>{item.size}</ItemDetailValue>
                        </ItemDetailRow>
                        <ItemDetailRow>
                          <ItemDetailLabel>Quantity:</ItemDetailLabel>
                          <ItemDetailValue>{item.quantity}</ItemDetailValue>
                        </ItemDetailRow>
                        <ItemDetailRow>
                          <ItemDetailLabel>Price:</ItemDetailLabel>
                          <ItemDetailValue>
                            €{item.price ? item.price.toFixed(2) : "00"}
                          </ItemDetailValue>
                        </ItemDetailRow>
                      </ItemDropdown>
                    )
                  )}
                </View>
              ))}
            </ItemsContainer>
          )}

          {order.order_status === "PENDING" && (
            <ActionsContainer>
              <ActionButton
                actionType="accept"
                onPress={() => onAccept(order.id)}
              >
                <ButtonText>Accept</ButtonText>
              </ActionButton>
              <ActionButton
                actionType="decline"
                onPress={() => {
                  if (onDecline) {
                    onDecline(order.id);
                  } else {
                    Alert.alert("Declined order");
                  }
                }}
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

const JobDetail = styled.View`
  margin-bottom: 8px;
  flex-direction: row;
  gap: 10px;
`;

const Label = styled.Text`
  font-weight: bold;
  color: #333;
  min-width: 120px;
`;

const Value = styled.Text`
  color: #4caf50;
  font-weight: 500;
  flex: 1;
`;

const ActionsContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 15px;
`;

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

const ExpandButton = styled(TouchableOpacity)`
  align-self: center;
  margin-top: 10px;
  border-radius: 5px;
  flex-direction: row;
`;

const ExpandButtonText = styled.Text`
  color: gray;
  font-size: 14px;
  margin-top: 5px;
  margin-right: 20px;
`;

const ButtonText = styled.Text`
  color: white;
  font-weight: bold;
`;

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

const ItemRow = styled(TouchableOpacity)`
  flex-direction: row;
  justify-content: space-between;
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 8px;
`;

const ItemInfo = styled.View`
  flex: 1;
`;

const ItemName = styled.Text`
  font-weight: 600;
  color: #4caf50;
  font-size: 15px;
`;

const ItemDetails = styled.Text`
  color: #666;
  font-size: 13px;
  margin-top: 3px;
`;

const ItemPrice = styled.Text`
  font-weight: bold;
  color: #4caf50;
  align-self: center;
`;

const ItemDropdown = styled.View`
  background-color: #f0f8f0;
  padding: 12px;
  border-radius: 8px;
  margin-top: 5px;
  margin-bottom: 8px;
  border-left-width: 3px;
  border-left-color: #4caf50;
`;

const ItemDetailRow = styled.View`
  flex-direction: row;
  margin-bottom: 5px;
`;

const ItemDetailLabel = styled.Text`
  font-weight: 600;
  color: #555;
  min-width: 100px;
`;

const ItemDetailValue = styled.Text`
  color: #666;
  flex: 1;
`;

const CustomerInfoSection = styled.View`
  margin-top: 15px;
  padding-top: 10px;
  border-top-width: 1px;
  border-top-color: #eee;
`;

const CustomerInfoHeader = styled.Text`
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 10px;
  color: #333;
`;
