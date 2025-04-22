import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";

const FinanceDetails = () => {
  const items = [
    { label: "Receipt - January", type: "receipt", date: "Jan 31, 2023" },
    { label: "Invoice - February", type: "invoice", date: "Feb 28, 2023" },
    { label: "Receipt - March", type: "receipt", date: "Mar 31, 2023" },
    { label: "Invoice - April", type: "invoice", date: "Apr 30, 2023" },
  ];

  const getDocumentDetails = (type: any) => {
    switch (type) {
      case "receipt":
        return {
          icon: "receipt-outline",
          color: "#4361ee",
          bgColor: "#e9f5ff",
        };
      case "invoice":
        return {
          icon: "document-text-outline",
          color: "#ff9f43",
          bgColor: "#fff4de",
        };
      default:
        return {
          icon: "document-outline",
          color: "#6c757d",
          bgColor: "#f0f0f0",
        };
    }
  };

  return (
    <Container>
      <SectionHeader>
        <SectionTitle>Financial Records</SectionTitle>
        <ViewAllButton>
          <ViewAllText>View All</ViewAllText>
          <Ionicons name="arrow-forward-outline" size={16} color="#4361ee" />
        </ViewAllButton>
      </SectionHeader>

      <Description>Download your monthly receipts and invoices</Description>

      <ItemsContainer>
        {items.map((item, index) => {
          const { icon, color, bgColor } = getDocumentDetails(item.type);

          return (
            <Item key={index}>
              <ItemLeftSection>
                <IconContainer style={{ backgroundColor: bgColor }}>
                  <Ionicons name={icon} size={22} color={color} />
                </IconContainer>
                <ItemDetails>
                  <ItemLabel>{item.label}</ItemLabel>
                  <ItemDate>{item.date}</ItemDate>
                </ItemDetails>
              </ItemLeftSection>

              <DownloadButton>
                <Ionicons name="download-outline" size={20} color="#fff" />
                <ButtonText>Download</ButtonText>
              </DownloadButton>
            </Item>
          );
        })}
      </ItemsContainer>
    </Container>
  );
};

export default FinanceDetails;

// Styled Components
const Container = styled.View`
  background-color: #ffffff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 55px;
  elevation: 2;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 8px;
`;

const SectionHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const SectionTitle = styled.Text`
  font-size: 20px;
  font-weight: 600;
  color: #212529;
`;

const ViewAllButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
`;

const ViewAllText = styled.Text`
  font-size: 14px;
  color: #4361ee;
  margin-right: 4px;
`;

const Description = styled.Text`
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 20px;
`;

const ItemsContainer = styled.View``;

const Item = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom-width: 1px;
  border-bottom-color: #f1f1f1;
`;

const ItemLeftSection = styled.View`
  flex-direction: row;
  align-items: center;
`;

const IconContainer = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  justify-content: center;
  align-items: center;
  margin-right: 16px;
`;

const ItemDetails = styled.View``;

const ItemLabel = styled.Text`
  font-size: 12px;
  font-weight: 500;
  color: #212529;
`;

const ItemDate = styled.Text`
  font-size: 13px;
  color: #6c757d;
  margin-top: 2px;
`;

const DownloadButton = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  background-color: #4361ee;
  padding: 10px 16px;
  border-radius: 12px;
`;

const ButtonText = styled.Text`
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  margin-left: 6px;
`;
