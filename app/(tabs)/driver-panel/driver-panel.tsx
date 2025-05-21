import React, { useEffect, useState } from "react";
import { Dimensions, StatusBar, Platform, View, Animated } from "react-native";
import styled from "styled-components/native";
import { LineChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import FinanceDetails from "@/components/driver-dashboard/finance";
import { useFocusEffect, useRouter } from "expo-router";
import { supabase } from "@/infrastructure/db/supabase";
import { LinearGradient } from "expo-linear-gradient";

const screenWidth = Dimensions.get("window").width;

const cardColors = [
  { bg: "#e7f9f0", icon: "#28c76f" },
  { bg: "#e9f5ff", icon: "#4361ee" },
  { bg: "#fff4de", icon: "#ff9f43" },
  { bg: "#f0eeff", icon: "#7367f0" },
  { bg: "#e7f9f0", icon: "#2eb85c" },
  { bg: "#e8f8ff", icon: "#00cfe8" },
];

const primaryGreen = "#28c76f";
const lightGreen = "#e7f9f0";

const dailyData = {
  labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"],
  datasets: [
    {
      data: [5, 8, 22, 35, 28, 25, 15],
      strokeWidth: 2,
      color: (opacity = 1) => `rgba(40, 199, 111, ${opacity})`,
    },
  ],
};

const weeklyData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      data: [15, 25, 18, 32, 45, 38, 22],
      strokeWidth: 2,
      color: (opacity = 1) => `rgba(40, 199, 111, ${opacity})`,
    },
  ],
};

const monthlyData = {
  labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
  datasets: [
    {
      data: [120, 180, 210, 250],
      strokeWidth: 2,
      color: (opacity = 1) => `rgba(46, 184, 92, ${opacity})`,
    },
  ],
};

const DriverDashboard = () => {
  const [driverData, setDriverData] = useState<any>([]);
  const [incomeTimeframe, setIncomeTimeframe] = useState("daily");
  const [chartData, setChartData] = useState(dailyData);
  const [ordersExpanded, setOrdersExpanded] = useState(false);
  const animatedHeight = useState(new Animated.Value(0))[0];
  const [apiToken, setApiToken] = useState<string | null>(null);
  const [orders, setOrders] = useState([]);
  const [driverId, setDriverId] = useState(null);

  const statCards = [
    { title: "Trip Count", value: orders.length || 0, icon: "car-outline" },
    {
      title: "Income",
      value: driverData.totalPaid || 0,
      icon: "wallet-outline",
    },
    // { title: "Your %", value: "25%", icon: "pie-chart-outline" },
    { title: "Rating", value: driverData.rating || 0, icon: "star-outline" },
    {
      title: "Order History",
      value: "View Details",
      icon: "time-outline",
      isButton: true,
    },
    // { title: "Feedback", value: "3.5", icon: "star-half-outline" },
  ];

  const recentOrders = [
    {
      route: "Vake → Saburtalo",
      time: "2 hours ago",
      price: 25,
    },
    {
      route: "Didube → Varketili",
      time: "Yesterday, 18:30",
      price: 35,
    },
    {
      route: "Gldani → Avlabari",
      time: "Today, 11:20",
      price: 28,
    },
  ];

  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        setApiToken(session.access_token);
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("Error fetching user:", userError);
          return;
        }

        const driverUUID = user?.id;

        try {
          const res = await fetch(
            `https://api.thevanapp.com/api/driver-stats/total/${driverUUID}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiToken}`,
              },
            }
          );
          const data = await res.json();
          setDriverData(data);
        } catch (apiError) {
          console.log("API error, using fake data:", apiError);
        }
      } catch (error) {
        console.log("error", error);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const res = await fetch(
          `https://api.thevanapp.com/api/history/driver/${driverId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiToken}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }

        const data = await res.json();
        console.log("Dataaa", data);
        if (Array.isArray(data)) {
          setOrders(data as any);
        } else {
          console.error("Unexpected API response format:", data);
          setOrders([]);
        }
      } catch (error) {
        console.log("Error fetching order history:", error);
        setOrders([]);
      }
    };
    fetchOrderHistory();
  }, [driverId]);

  const toggleTimeframe = () => {
    if (incomeTimeframe === "daily") {
      setIncomeTimeframe("weekly");
      setChartData(weeklyData);
    } else if (incomeTimeframe === "weekly") {
      setIncomeTimeframe("monthly");
      setChartData(monthlyData);
    } else {
      setIncomeTimeframe("daily");
      setChartData(dailyData);
    }
  };

  const toggleOrdersExpanded = () => {
    const toValue = ordersExpanded ? 0 : 1;

    Animated.timing(animatedHeight, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();

    setOrdersExpanded(!ordersExpanded);
  };

  const getTimeframeLegendText = () => {
    switch (incomeTimeframe) {
      case "daily":
        return "Today";
      case "weekly":
        return "Last 7 days";
      case "monthly":
        return "Last 4 weeks";
      default:
        return "Last 7 days";
    }
  };
  return (
    <Container>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <LinearGradient
        colors={["#28c76f", "#18ad50"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          position: "absolute",
          width: "100%",
          height: 150 + (Platform.OS === "ios" ? 200 : 200),
        }}
      />
      <InternalContainer
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <HeaderGradient
          colors={["#28c76f", "#18ad50"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Title>Driver Dashboard</Title>
          <Subtitle>Welcome back, let's check your stats</Subtitle>
        </HeaderGradient>

        <ContentContainer>
          <StatsGrid>
            {statCards.map((stat, index) => (
              <StatCard
                key={index}
                onPress={() => {
                  if (stat.isButton) {
                    router.push(
                      "/(tabs)/driver-panel/order-history/OrderHistory"
                    );
                  }
                }}
              >
                <StatIcon
                  style={{
                    backgroundColor: cardColors[index % cardColors.length].bg,
                  }}
                >
                  <Ionicons
                    name={stat.icon}
                    size={22}
                    color={
                      stat.isButton
                        ? primaryGreen
                        : cardColors[index % cardColors.length].icon
                    }
                  />
                </StatIcon>
                <StatTitle>{stat.title}</StatTitle>
                <StatValueContainer>
                  <StatValue>{stat.value}</StatValue>
                </StatValueContainer>
              </StatCard>
            ))}
          </StatsGrid>

          <SectionHeader>
            <View></View>
            <TimeframeToggle
              onPress={toggleTimeframe}
              style={{ backgroundColor: lightGreen }}
            >
              <TimeframeText style={{ color: primaryGreen }}>
                {incomeTimeframe.charAt(0).toUpperCase() +
                  incomeTimeframe.slice(1)}
              </TimeframeText>
              <Ionicons name="swap-horizontal" size={18} color={primaryGreen} />
            </TimeframeToggle>
          </SectionHeader>

          <ChartContainer>
            <ChartHeader>
              <ChartTitle>
                {incomeTimeframe === "daily"
                  ? "Daily Income"
                  : incomeTimeframe === "weekly"
                  ? "Weekly Income"
                  : "Monthly Income"}
              </ChartTitle>
              <ChartLegend>
                <LegendDot
                  style={{
                    backgroundColor: primaryGreen,
                  }}
                />
                <LegendText>{getTimeframeLegendText()}</LegendText>
              </ChartLegend>
            </ChartHeader>

            <LineChart
              data={chartData}
              width={screenWidth - 60}
              height={220}
              chartConfig={{
                backgroundColor: "#f5f5f5",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "white",
                color: (opacity = 1) => `rgba(40, 199, 111, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 10,
                },
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: primaryGreen,
                },
              }}
              bezier
              style={{
                borderRadius: 10,
                marginVertical: 8,
              }}
            />
          </ChartContainer>

          {/* 
          <RecentOrdersContainer>
            <OrdersHeader onPress={toggleOrdersExpanded}>
              <SectionTitle style={{ marginTop: 0, marginBottom: 0 }}>
                Recent Completed Orders
              </SectionTitle>
              <Ionicons
                name={ordersExpanded ? "chevron-up" : "chevron-down"}
                size={24}
                color={primaryGreen}
              />
            </OrdersHeader>

            <Animated.View
              style={{
                maxHeight: animatedHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: Platform.OS === "ios" ? [0, 245] : [0, 300],
                }),
                overflow: "hidden",
              }}
            >
              <OrdersContent>
                {recentOrders.map((order, index) => (
                  <OrderItem
                    key={index}
                    isLast={index === recentOrders.length - 1}
                  >
                    <OrderLeft>
                      <OrderIcon style={{ backgroundColor: lightGreen }}>
                        <Ionicons
                          name="checkmark-circle"
                          size={22}
                          color={primaryGreen}
                        />
                      </OrderIcon>
                      <OrderInfo>
                        <OrderDestination>{order.route}</OrderDestination>
                        <OrderTime>{order.time}</OrderTime>
                      </OrderInfo>
                    </OrderLeft>
                    <OrderPrice style={{ color: "#2b6a49" }}>
                      ${order.price}
                    </OrderPrice>
                  </OrderItem>
                ))}

                <ViewAllButton
                  onPress={() =>
                    router.push(
                      "/(tabs)/driver-panel/order-history/OrderHistory"
                    )
                  }
                >
                  <ViewAllText style={{ color: primaryGreen }}>
                    View All Orders
                  </ViewAllText>
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={primaryGreen}
                  />
                </ViewAllButton>
              </OrdersContent>
            </Animated.View>
          </RecentOrdersContainer>
*/}

          <View
            style={
              Platform.OS === "ios"
                ? { marginBottom: 50 }
                : { marginBottom: 20 }
            }
          >
            <FinanceDetails />
          </View>
        </ContentContainer>
      </InternalContainer>
    </Container>
  );
};

export default DriverDashboard;

const Container = styled.View`
  flex: 1;
  background-color: #f8f9fa;
`;

const InternalContainer = styled.ScrollView`
  flex: 1;
`;

const HeaderGradient = styled(LinearGradient)`
  padding: 20px;
  padding-top: ${Platform.OS === "ios" ? "60px" : "50px"};
  padding-bottom: 23px;
`;

const ContentContainer = styled.View`
  padding-horizontal: 20px;
  margin-top: -15px;
  background-color: #f8f9fa;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding-top: 20px;
`;

const Title = styled.Text`
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
`;

const Subtitle = styled.Text`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 4px;
`;

const SectionHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  margin-top: 8px;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: #212529;
  margin-bottom: 16px;
  margin-top: 8px;
`;

const TimeframeToggle = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  background-color: #f0f2ff;
  padding-horizontal: 12px;
  padding-vertical: 6px;
  border-radius: 20px;
`;

const TimeframeText = styled.Text`
  font-size: 14px;
  color: #4361ee;
  font-weight: 500;
  margin-right: 6px;
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

const StatValueContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;

const StatValue = styled.Text`
  font-size: 22px;
  font-weight: bold;
  color: #212529;
`;

const ChartContainer = styled.View`
  background-color: #ffffff;
  border-radius: 16px;
  padding: 16px 12px;
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

const RecentOrdersContainer = styled.View`
  background-color: #ffffff;
  border-radius: 16px;
  padding: 13px;
  margin-bottom: 24px;
  elevation: 2;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 8px;
`;

const OrdersHeader = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-vertical: 4px;
`;

const OrdersContent = styled.View`
  margin-top: 12px;
`;

const OrderItem = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-vertical: 12px;
  border-bottom-width: ${(props) => (props.isLast ? "0" : "1px")};
  border-bottom-color: #f0f0f0;
`;

const OrderLeft = styled.View`
  flex-direction: row;
  align-items: center;
`;

const OrderIcon = styled.View`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background-color: #e7f9f0;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
`;

const OrderInfo = styled.View``;

const OrderDestination = styled.Text`
  font-size: 15px;
  font-weight: 500;
  color: #212529;
`;

const OrderTime = styled.Text`
  font-size: 13px;
  color: #6c757d;
  margin-top: 2px;
`;

const OrderPrice = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: #212529;
`;

const ViewAllButton = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: ${Platform.OS === "ios" ? "16px" : "0px"};
  padding-vertical: 10px;
`;

const ViewAllText = styled.Text`
  font-size: 15px;
  font-weight: 500;
  color: #4361ee;
  margin-right: 8px;
`;
