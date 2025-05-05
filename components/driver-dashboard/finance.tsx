import React from "react";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";

const FinanceDetails = () => {
  const items = [
    {
      label: "April Summary",
      date: "Apr 30, 2023",
      amount: "$1,240",
      orders: "52 orders",
    },
    {
      label: "March Summary",
      date: "Mar 31, 2023",
      amount: "$1,105",
      orders: "47 orders",
    },
    {
      label: "February Summary",
      date: "Feb 28, 2023",
      amount: "$950",
      orders: "38 orders",
    },
  ];

  return (
    <Container>
      <SectionHeader>
        <SectionTitle>Recent Earnings</SectionTitle>
        <ViewAllButton>
          <ViewAllText>View All</ViewAllText>
          <Ionicons name="chevron-forward" size={16} color="#28c76f" />
        </ViewAllButton>
      </SectionHeader>

      <ItemsContainer>
        {items.map((item, index) => (
          <Item key={index} isLast={index === items.length - 1}>
            <ItemLeftSection>
              <IconContainer>
                <Ionicons name="calendar-outline" size={20} color="#28c76f" />
              </IconContainer>
              <ItemDetails>
                <ItemLabel>{item.label}</ItemLabel>
                <ItemInfo>
                  {item.orders} • {item.date}
                </ItemInfo>
              </ItemDetails>
            </ItemLeftSection>

            <ItemRightSection>
              <AmountText>{item.amount}</AmountText>
              <DownloadIcon name="download-outline" size={18} color="#28c76f" />
            </ItemRightSection>
          </Item>
        ))}
      </ItemsContainer>

      <TotalRow>
        <TotalLabel>Quarter total:</TotalLabel>
        <TotalAmount>$3,295</TotalAmount>
      </TotalRow>
    </Container>
  );
};

export default FinanceDetails;

const Container = styled.View`
  background-color: #ffffff;
  border-radius: 16px;
  padding: 16px;
  elevation: 2;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 8px;
  margin-bottom: -30px;
`;

const SectionHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: #212529;
`;

const ViewAllButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
`;

const ViewAllText = styled.Text`
  font-size: 14px;
  color: #28c76f;
  font-weight: 500;
`;

const ItemsContainer = styled.View`
  margin-bottom: 16px;
`;

const Item = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom-width: ${(props) => (props.isLast ? "0" : "1px")};
  border-bottom-color: #f0f0f0;
`;

const ItemLeftSection = styled.View`
  flex-direction: row;
  align-items: center;
`;

const IconContainer = styled.View`
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background-color: #e7f9f0;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
`;

const ItemDetails = styled.View``;

const ItemLabel = styled.Text`
  font-size: 15px;
  font-weight: 500;
  color: #212529;
`;

const ItemInfo = styled.Text`
  font-size: 12px;
  color: #6c757d;
  margin-top: 2px;
`;

const ItemRightSection = styled.View`
  flex-direction: row;
  align-items: center;
`;

const AmountText = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #2b6a49;
  margin-right: 10px;
`;

const DownloadIcon = styled(Ionicons)``;

const TotalRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: #e7f9f0;
  border-radius: 12px;
  padding: 12px 16px;
`;

const TotalLabel = styled.Text`
  font-size: 14px;
  font-weight: 500;
  color: #2b6a49;
`;

const TotalAmount = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: #28c76f;
`;
