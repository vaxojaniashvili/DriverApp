import React from "react";
import {
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform,
  View,
} from "react-native";
import styled from "styled-components/native";
import { LineChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import FinanceDetails from "@/components/driver-dashboard/finance";
import { useRouter } from "expo-router";

const screenWidth = Dimensions.get("window").width;

const Container = styled.View`
  flex: 1;
  background-color: #f8f9fa;
  ${Platform.OS === "ios" ? "padding-top: 10px;" : "padding-top:40px"}
`;

const InternalContainer = styled.ScrollView`
  flex: 1;
  padding-horizontal: 20px;
  padding-top: ${Platform.OS === "android" ? 10 : 75}px;
  ${Platform.OS === "android" && "margin-top: -25"}
`;

const Header = styled.View`
  margin-bottom: 24px;
`;

const Title = styled.Text`
  font-size: 28px;
  font-weight: 700;
  color: #212529;
`;

const Subtitle = styled.Text`
  font-size: 16px;
  color: #6c757d;
  margin-top: 4px;
`;

const StatsGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const StatCard = styled.TouchableOpacity`
  background-color: #ffffff;
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 16px;
  width: 48%;
  elevation: 2;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 8px;
`;

const StatIcon = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
`;

const StatTitle = styled.Text`
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 4px;
`;

const StatValue = styled.Text`
  font-size: 22px;
  font-weight: bold;
  color: #212529;
`;

const SectionTitle = styled.Text`
  font-size: 20px;
  font-weight: 600;
  color: #212529;
  margin-bottom: 16px;
  margin-top: 8px;
`;

const ChartContainer = styled.View`
  background-color: #ffffff;
  border-radius: 16px;
  padding: 16px 8px;
  margin-bottom: 24px;
  elevation: 2;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 8px;
  width: 100%;
`;

const ChartHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ChartTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: #212529;
`;

const ChartLegend = styled.View`
  flex-direction: row;
  align-items: center;
`;

const LegendDot = styled.View`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: #28c76f;
  margin-right: 6px;
`;

const LegendText = styled.Text`
  font-size: 14px;
  color: #6c757d;
`;

const cardColors = [
  { bg: "#e9f5ff", icon: "#4361ee" },
  { bg: "#fff4de", icon: "#ff9f43" },
  { bg: "#e7f9f0", icon: "#28c76f" },
  { bg: "#fff2f2", icon: "#ea5455" },
  { bg: "#f0eeff", icon: "#7367f0" },
  { bg: "#e8f8ff", icon: "#00cfe8" },
];

const DriverDashboard = () => {
  const data = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [
      {
        data: [10, 20, 15, 30, 40, 35],
        strokeWidth: 2,
        color: (opacity = 1) => `rgba(67, 97, 238, ${opacity})`,
      },
    ],
  };

  const statCards = [
    { title: "Trip Count", value: "52", icon: "car-outline" },
    { title: "Income", value: "$1,240", icon: "wallet-outline" },
    { title: "Your %", value: "25%", icon: "pie-chart-outline" },
    { title: "Dashboard", value: "Active", icon: "speedometer-outline" },
    { title: "Order History", value: "View Details", icon: "time-outline" },
    { title: "Feedback", value: "3.5", icon: "star-outline" },
  ];

  const router = useRouter();

  return (
    <Container>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <InternalContainer showsVerticalScrollIndicator={false}>
        <Header>
          <Title>Driver Dashboard</Title>
          <Subtitle>Welcome back, let's check your stats</Subtitle>
        </Header>

        <StatsGrid>
          {statCards.map((stat, index) => (
            <StatCard
              onPress={() => {
                if (stat.value === "View Details") {
                  router.push(
                    "/(tabs)/driver-panel/order-history/OrderHistory"
                  );
                }
              }}
              key={index}
            >
              <StatIcon
                style={{
                  backgroundColor: cardColors[index % cardColors.length].bg,
                }}
              >
                <Ionicons
                  name={stat.icon}
                  size={22}
                  color={cardColors[index % cardColors.length].icon}
                />
              </StatIcon>
              <StatTitle>{stat.title}</StatTitle>
              <StatValue>{stat.value}</StatValue>
            </StatCard>
          ))}
        </StatsGrid>

        <SectionTitle>Performance</SectionTitle>
        <ChartContainer>
          <ChartHeader>
            <ChartTitle>Weekly Income</ChartTitle>
            <ChartLegend>
              <LegendDot />
              <LegendText>Last 7 days</LegendText>
            </ChartLegend>
          </ChartHeader>

          <LineChart
            data={data}
            width={screenWidth - 52}
            height={220}
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(67, 97, 238, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(108, 117, 125, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#4361ee",
              },
              propsForBackgroundLines: {
                strokeDasharray: "5, 5",
                stroke: "#f1f1f1",
              },
              fillShadowGradientFrom: "#4361ee",
              fillShadowGradientTo: "#ffffff",
              fillShadowGradientOpacity: 0.2,
              paddingRight: 10,
            }}
            bezier
            style={{
              borderRadius: 16,
              paddingRight: 0,
              paddingLeft: 0,
              marginHorizontal: 0,
              alignSelf: "center",
            }}
            withInnerLines={true}
            withOuterLines={true}
            withVerticalLines={true}
            withHorizontalLines={true}
            fromZero
          />
        </ChartContainer>
        <View
          style={
            Platform.OS === "ios" ? { marginBottom: 30 } : { marginBottom: 0 }
          }
        >
          <FinanceDetails />
        </View>
      </InternalContainer>
    </Container>
  );
};

export default DriverDashboard;
