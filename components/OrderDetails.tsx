import React from "react";
import { TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";

const OrderDetails = ({
  activeOrder,
  allDetailsVisible,
  setAllDetailsVisible,
  expandedItemIds,
  toggleItemExpansion,
  handleChatPress,
  handleSupportPress,
}: any) => {
  const toggleAllDetails = () => {
    setAllDetailsVisible(!allDetailsVisible);
  };

  return (
    <UnifiedDetailsContainer>
      <TouchableOpacity onPress={toggleAllDetails}>
        <UnifiedDetailsHeader>
          <HeaderLeftSection>
            <Ionicons name="information-circle" size={18} color="#555" />
            <UnifiedDetailsHeaderText>Order Details</UnifiedDetailsHeaderText>
          </HeaderLeftSection>
          <Ionicons
            name={allDetailsVisible ? "chevron-up" : "chevron-down"}
            size={20}
            color="#555"
          />
        </UnifiedDetailsHeader>
      </TouchableOpacity>

      {allDetailsVisible && (
        <>
          <ContentSection>
            <DetailSectionHeader>
              <DetailSectionIcon>
                <Ionicons name="location" size={18} color="#555" />
              </DetailSectionIcon>
              <DetailSectionTitle>Location Details</DetailSectionTitle>
            </DetailSectionHeader>

            <SectionContent>
              <LocationItem>
                <LocationIconContainer>
                  <Ionicons name="location" size={20} color="#4CAF50" />
                </LocationIconContainer>
                <LocationDetails>
                  <LocationTitle>Pickup</LocationTitle>
                  <LocationName>{activeOrder.pickup_name}</LocationName>
                </LocationDetails>
              </LocationItem>
              <LocationArrow>
                <Ionicons name="arrow-down" size={24} color="#999" />
              </LocationArrow>

              <LocationItem>
                <LocationIconContainer>
                  <Ionicons name="flag" size={20} color="#F44336" />
                </LocationIconContainer>
                <LocationDetails>
                  <LocationTitle>Destination</LocationTitle>
                  <LocationName>{activeOrder.destination_name}</LocationName>
                </LocationDetails>
              </LocationItem>
            </SectionContent>
          </ContentSection>

          <SectionDivider />

          <ContentSection>
            <DetailSectionHeader>
              <DetailSectionIcon>
                <Ionicons name="business" size={18} color="#555" />
              </DetailSectionIcon>
              <DetailSectionTitle>Building Access</DetailSectionTitle>
            </DetailSectionHeader>

            <SectionContent>
              <CustomerDetail>
                <CustomerLabel>Floor:</CustomerLabel>
                <CustomerValue>
                  {activeOrder.floor || "Ground Floor"}
                </CustomerValue>
              </CustomerDetail>
              <CustomerDetail style={{ marginTop: 3 }}>
                <CustomerLabel>Elevator:</CustomerLabel>
                <CustomerValue style={{ marginLeft: 5 }}>
                  {activeOrder.elevator ? "Available" : "Not Available"}
                </CustomerValue>
              </CustomerDetail>
            </SectionContent>
          </ContentSection>

          {activeOrder.items && activeOrder.items.length > 0 && (
            <ContentSection>
              <DetailSectionHeader>
                <DetailSectionIcon>
                  <Ionicons name="list" size={18} color="#555" />
                </DetailSectionIcon>
                <DetailSectionTitle>Order Items</DetailSectionTitle>
              </DetailSectionHeader>

              <SectionContent>
                {activeOrder.items.map((item: any, index: number) => {
                  const isExpanded = expandedItemIds.includes(item.id || index);
                  return (
                    <OrderItemContainer key={index}>
                      <TouchableOpacity
                        onPress={() => toggleItemExpansion(item.id || index)}
                      >
                        <OrderItemRow>
                          <OrderItemInfo>
                            <OrderItemName>{item.name}</OrderItemName>
                            <OrderItemDetails>
                              {item.category} • {item.sub_category} • Size:{" "}
                              {item.size}
                            </OrderItemDetails>
                          </OrderItemInfo>
                          <OrderItemPriceContainer>
                            <OrderItemPrice>€{item.price}</OrderItemPrice>
                            <ExpandIcon>
                              <Ionicons
                                name={
                                  isExpanded ? "chevron-up" : "chevron-down"
                                }
                                size={16}
                                color="#555"
                              />
                            </ExpandIcon>
                          </OrderItemPriceContainer>
                        </OrderItemRow>
                      </TouchableOpacity>

                      {isExpanded && (
                        <ItemDropdown>
                          <ItemDetailRow>
                            <ItemDetailLabel>Category:</ItemDetailLabel>
                            <ItemDetailValue>{item.category}</ItemDetailValue>
                          </ItemDetailRow>
                          <ItemDetailRow>
                            <ItemDetailLabel>Sub-category:</ItemDetailLabel>
                            <ItemDetailValue>
                              {item.sub_category}
                            </ItemDetailValue>
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
                              €{item.price.toFixed(2)}
                            </ItemDetailValue>
                          </ItemDetailRow>
                        </ItemDropdown>
                      )}
                      <ItemSeparator />
                    </OrderItemContainer>
                  );
                })}

                <OrderItemTotalRow>
                  <OrderItemTotalLabel>Total</OrderItemTotalLabel>
                  <OrderItemTotalValue>
                    €{activeOrder.price}
                  </OrderItemTotalValue>
                </OrderItemTotalRow>
              </SectionContent>
            </ContentSection>
          )}

          <SectionDivider />

          {activeOrder.email && (
            <ContentSection>
              <DetailSectionHeader>
                <DetailSectionIcon>
                  <Ionicons name="person" size={18} color="#555" />
                </DetailSectionIcon>
                <DetailSectionTitle>Customer</DetailSectionTitle>
              </DetailSectionHeader>

              <SectionContent>
                <CustomerDetail>
                  <CustomerLabel>Email:</CustomerLabel>
                  <CustomerValue>{activeOrder.email}</CustomerValue>
                </CustomerDetail>
                <CustomerDetail style={{ marginTop: 3 }}>
                  <CustomerLabel>Phone:</CustomerLabel>
                  <CustomerValue> +995568930229</CustomerValue>
                </CustomerDetail>

                <CommunicationActionsContainer>
                  <ActionButton onPress={() => handleChatPress(activeOrder)}>
                    <ActionButtonIcon>
                      <Ionicons
                        name="chatbubble-outline"
                        size={18}
                        color="#007AFF"
                      />
                    </ActionButtonIcon>
                    <ActionButtonText>Chat with Customer</ActionButtonText>
                  </ActionButton>

                  <ActionButton onPress={() => handleSupportPress(activeOrder)}>
                    <ActionButtonIcon>
                      <Ionicons
                        name="headset-outline"
                        size={18}
                        color="#FF6B35"
                      />
                    </ActionButtonIcon>
                    <ActionButtonText>Contact Support</ActionButtonText>
                  </ActionButton>
                </CommunicationActionsContainer>
              </SectionContent>
            </ContentSection>
          )}
        </>
      )}
    </UnifiedDetailsContainer>
  );
};

const UnifiedDetailsContainer = styled.View`
  margin-bottom: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 15px;
  border: 1px solid #e8f5e9;
`;

const UnifiedDetailsHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  border-bottom-width: 2px;
  border-bottom-color: #4caf50;
  padding-bottom: 12px;
`;

const UnifiedDetailsHeaderText = styled.Text`
  font-size: 18px;
  font-weight: bold;
  margin-left: 8px;
  color: #388e3c;
`;

const HeaderLeftSection = styled.View`
  flex-direction: row;
  align-items: center;
`;

const ContentSection = styled.View`
  margin-bottom: 10px;
`;

const SectionContent = styled.View`
  border-radius: 12px;
  padding: 12px;
  margin-top: 5px;
`;

const DetailSectionHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin: 10px 0;
`;

const DetailSectionIcon = styled.View`
  margin-right: 8px;
  background-color: #e8f5e9;
  padding: 6px;
  border-radius: 20px;
`;

const DetailSectionTitle = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #388e3c;
  flex: 1;
`;

const SectionDivider = styled.View`
  height: 2px;
  background-color: #ccead6;
  margin: 20px 0;
`;

const LocationItem = styled.View`
  flex-direction: row;
  padding: 5px 0;
`;

const LocationIconContainer = styled.View`
  width: 30px;
  height: 30px;
  background-color: #fff;
  border-radius: 15px;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
  border: 1px solid #4caf50;
`;

const LocationDetails = styled.View`
  flex: 1;
`;

const LocationTitle = styled.Text`
  font-size: 12px;
`;

const LocationName = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: #388e3c;
`;

const LocationArrow = styled.View`
  align-items: center;
  margin: 5px 0;
`;

const CustomerDetail = styled.View`
  flex-direction: row;
  margin-bottom: 5px;
`;

const CustomerLabel = styled.Text`
  font-size: 14px;
  width: 60px;
`;

const CustomerValue = styled.Text`
  font-size: 14px;
  color: #388e3c;
  flex: 1;
  margin-left: -15px;
`;

const OrderItemContainer = styled.View`
  margin-bottom: 2px;
`;

const OrderItemRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding: 8px 0;
`;

const OrderItemInfo = styled.View`
  flex: 1;
`;

const OrderItemName = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: #388e3c;
`;

const OrderItemDetails = styled.Text`
  font-size: 12px;
  margin-top: 2px;
`;

const OrderItemPriceContainer = styled.View`
  align-items: flex-end;
  flex-direction: row;
`;

const OrderItemPrice = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: #388e3c;
`;

const ExpandIcon = styled.View`
  margin-left: 5px;
`;

const ItemSeparator = styled.View`
  height: 1px;
  background-color: #ccead6;
  margin-top: 2px;
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

const OrderItemTotalRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 10px;
  padding-top: 10px;
`;

const OrderItemTotalLabel = styled.Text`
  font-size: 14px;
  font-weight: bold;
`;

const OrderItemTotalValue = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #4caf50;
`;

const QuickActionsContainer = styled.View`
  flex-direction: row;
  gap: 8px;
`;

const QuickActionIcon = styled.View`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background-color: #f8f9fa;
  align-items: center;
  justify-content: center;
  border: 1px solid #e9ecef;
`;

const CommunicationActionsContainer = styled.View`
  flex-direction: row;
  margin-top: 15px;
  gap: 8px;
`;

const ActionButton = styled.TouchableOpacity`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
`;

const ActionButtonIcon = styled.View`
  margin-right: 6px;
`;

const ActionButtonText = styled.Text`
  font-size: 12px;
  font-weight: 500;
  color: #495057;
`;

export default OrderDetails;
