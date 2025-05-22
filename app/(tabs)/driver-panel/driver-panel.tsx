import React, { useEffect, useState } from "react";
import { StatusBar, Platform, View } from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import FinanceDetails from "@/components/driver-dashboard/finance";
import { useRouter } from "expo-router";
import { supabase } from "@/infrastructure/db/supabase";
import { LinearGradient } from "expo-linear-gradient";

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

const defaultDriverData = {
  driverId: null,
  months: {
    January: 0,
    February: 0,
    March: 0,
    April: 0,
    May: 0,
    June: 0,
    July: 0,
    August: 0,
    September: 0,
    October: 0,
    November: 0,
    December: 0,
  },
  rating: "0",
  totalPaid: 0,
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const monthColors = [
  "#28c76f",
  "#4361ee",
  "#ff9f43",
  "#7367f0",
  "#2eb85c",
  "#00cfe8",
  "#ea5455",
  "#ff6b6b",
  "#a8e6cf",
  "#ffa8a8",
  "#b8860b",
  "#dda0dd",
];

const DriverDashboard = () => {
  const [driverData, setDriverData] = useState(defaultDriverData);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(
    new Date().getMonth()
  );
  const [loading, setLoading] = useState(true);
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
    { title: "Rating", value: driverData.rating || 0, icon: "star-outline" },
    {
      title: "Order History",
      value: "View Details",
      icon: "time-outline",
      isButton: true,
    },
  ];

  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          setLoading(false);
          return;
        }

        setApiToken(session?.access_token);
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("Error fetching user:", userError);
          setLoading(false);
          return;
        }

        const driverUUID = user?.id;
        setDriverId(driverUUID);

        if (session?.access_token && driverUUID) {
          try {
            const res = await fetch(
              `https://api.thevanapp.com/api/driver-stats/total/${driverUUID}`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${session.access_token}`,
                },
              }
            );

            if (!res.ok) {
              throw new Error(`API responded with status: ${res.status}`);
            }

            const data = await res.json();
            console.log("Driver stats data:", data);

            setDriverData({
              driverId: data.driverId || driverUUID,
              months: data.months || defaultDriverData.months,
              rating: data.rating || "0",
              totalPaid: data.totalPaid || 0,
            });
          } catch (apiError) {
            console.log("API error:", apiError);
            setDriverData(defaultDriverData);
          }
        }
      } catch (error) {
        console.log("General error:", error);
        setDriverData(defaultDriverData);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      if (!driverId || !apiToken) return;

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
        console.log("Order history data:", data);
        if (Array.isArray(data)) {
          setOrders(data);
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
  }, [driverId, apiToken]);

  const navigateMonth = (direction) => {
    if (direction === "prev") {
      setCurrentMonthIndex((prev) => (prev === 0 ? 11 : prev - 1));
    } else {
      setCurrentMonthIndex((prev) => (prev === 11 ? 0 : prev + 1));
    }
  };

  const getCurrentMonthData = () => {
    const currentMonth = monthNames[currentMonthIndex];
    return driverData.months[currentMonth] || 0;
  };

  const formatCurrency = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
          </SectionHeader>

          <ModernChartContainer>
            <ChartHeader>
              <MonthNavigator>
                <MonthNavButton onPress={() => navigateMonth("prev")}>
                  <Ionicons
                    name="chevron-back"
                    size={18}
                    color={primaryGreen}
                  />
                </MonthNavButton>
                <MonthDisplayContainer>
                  <CurrentMonthText>
                    {monthNames[currentMonthIndex]}
                  </CurrentMonthText>
                  <MonthSubtext>{new Date().getFullYear()}</MonthSubtext>
                </MonthDisplayContainer>
                <MonthNavButton onPress={() => navigateMonth("next")}>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={primaryGreen}
                  />
                </MonthNavButton>
              </MonthNavigator>
            </ChartHeader>

            <IncomeCardGradient
              colors={
                getCurrentMonthData() > 0
                  ? [
                      monthColors[currentMonthIndex] + "15",
                      monthColors[currentMonthIndex] + "05",
                    ]
                  : ["#f8f9fa", "#f1f2f4"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <IncomeIconContainer>
                <IncomeIconBackground
                  colors={[
                    monthColors[currentMonthIndex],
                    monthColors[currentMonthIndex] + "80",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons
                    name={
                      getCurrentMonthData() > 0 ? "wallet" : "wallet-outline"
                    }
                    size={28}
                    color="#ffffff"
                  />
                </IncomeIconBackground>
              </IncomeIconContainer>

              <ModernIncomeAmount>
                ${formatCurrency(getCurrentMonthData())}
              </ModernIncomeAmount>

              <IncomeDetailsRow>
                <IncomeLabel>{monthNames[currentMonthIndex]} Total</IncomeLabel>
                <IncomeStatus isPositive={getCurrentMonthData() > 0}>
                  <Ionicons
                    name={
                      getCurrentMonthData() > 0
                        ? "checkmark-circle"
                        : "alert-circle"
                    }
                    size={16}
                    color={getCurrentMonthData() > 0 ? "#28c76f" : "#ff6b6b"}
                  />
                  <StatusText isPositive={getCurrentMonthData() > 0}>
                    {getCurrentMonthData() > 0 ? "Active" : "No Income"}
                  </StatusText>
                </IncomeStatus>
              </IncomeDetailsRow>

              {getCurrentMonthData() > 0 && (
                <ProgressContainer>
                  <ProgressLabel>Monthly Target Progress</ProgressLabel>
                  <ProgressBarContainer>
                    <ProgressBar
                      style={{
                        width: `${Math.min(
                          (getCurrentMonthData() / 5000) * 100,
                          100
                        )}%`,
                        backgroundColor: monthColors[currentMonthIndex],
                      }}
                    />
                  </ProgressBarContainer>
                  <ProgressText>
                    ${formatCurrency(getCurrentMonthData())} / $5,000 target
                  </ProgressText>
                </ProgressContainer>
              )}

              {getCurrentMonthData() === 0 && (
                <EmptyStateContainer>
                  <EmptyStateIcon>
                    <Ionicons
                      name="bar-chart-outline"
                      size={32}
                      color="#6c757d"
                    />
                  </EmptyStateIcon>
                  <EmptyStateText>No trips recorded this month</EmptyStateText>
                  <EmptyStateSubtext>
                    Start driving to see your earnings here
                  </EmptyStateSubtext>
                </EmptyStateContainer>
              )}
            </IncomeCardGradient>

            {getCurrentMonthData() > 0 && (
              <StatsRow>
                <StatItem>
                  <StatItemIcon>
                    <Ionicons name="car" size={18} color={primaryGreen} />
                  </StatItemIcon>
                  <StatItemLabel>Avg/Trip</StatItemLabel>
                  <StatItemValue>
                    $
                    {(
                      getCurrentMonthData() / Math.max(orders.length, 1)
                    ).toFixed(0)}
                  </StatItemValue>
                </StatItem>

                <StatDivider />

                <StatItem>
                  <StatItemIcon>
                    <Ionicons name="time" size={18} color="#4361ee" />
                  </StatItemIcon>
                  <StatItemLabel>Whole Year</StatItemLabel>
                  <StatItemValue>{orders.length} trips</StatItemValue>
                </StatItem>

                <StatDivider />

                <StatItem>
                  <StatItemIcon>
                    <Ionicons name="trophy" size={18} color="#ff9f43" />
                  </StatItemIcon>
                  <StatItemLabel>Rank</StatItemLabel>
                  <StatItemValue>{driverData.rating}</StatItemValue>
                </StatItem>
              </StatsRow>
            )}
          </ModernChartContainer>

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

const MonthNavigator = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: #ffffff;
  padding: 12px 16px;
  border-radius: 25px;
  elevation: 2;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 8px;
  shadow-offset: 0px 2px;
  border: 1px solid #f1f2f4;
`;

const MonthNavButton = styled.TouchableOpacity`
  padding: 8px;
  border-radius: 20px;
  background-color: ${lightGreen};
`;

const MonthDisplayContainer = styled.View`
  align-items: center;
  margin-horizontal: 20px;
`;

const CurrentMonthText = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: ${primaryGreen};
  text-align: center;
  width: 120px;
  min-width: 120px;
  max-width: 120px;
`;

const MonthSubtext = styled.Text`
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
  margin-top: 2px;
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

const ModernChartContainer = styled.View`
  background-color: #ffffff;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 24px;
  elevation: 3;
  shadow-color: #000;
  shadow-opacity: 0.08;
  shadow-radius: 12px;
  shadow-offset: 0px 4px;
  width: 100%;
`;

const ChartHeader = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
`;
const IncomeCardGradient = styled(LinearGradient)`
  border-radius: 16px;
  padding: 24px;
  margin-top: 12px;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const IncomeIconContainer = styled.View`
  margin-bottom: 16px;
`;

const IncomeIconBackground = styled(LinearGradient)`
  width: 64px;
  height: 64px;
  border-radius: 32px;
  justify-content: center;
  align-items: center;
  elevation: 2;
  shadow-color: #000;
  shadow-opacity: 0.15;
  shadow-radius: 8px;
  shadow-offset: 0px 2px;
`;

const ModernIncomeAmount = styled.Text`
  font-size: 42px;
  font-weight: 800;
  color: #212529;
  margin-bottom: 8px;
  text-align: center;
`;

const IncomeDetailsRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 20px;
`;

const IncomeLabel = styled.Text`
  font-size: 16px;
  color: #6c757d;
  font-weight: 500;
`;

const IncomeStatus = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${(props) => (props.isPositive ? "#e7f9f0" : "#fff5f5")};
  padding: 6px 12px;
  border-radius: 20px;
`;

const StatusText = styled.Text`
  font-size: 14px;
  font-weight: 600;
  margin-left: 4px;
  color: ${(props) => (props.isPositive ? "#28c76f" : "#ff6b6b")};
`;

const ProgressContainer = styled.View`
  width: 100%;
  margin-top: 8px;
`;

const ProgressLabel = styled.Text`
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 8px;
  font-weight: 500;
`;

const ProgressBarContainer = styled.View`
  height: 6px;
  background-color: #f1f2f4;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
`;

const ProgressBar = styled.View`
  height: 100%;
  border-radius: 3px;
`;

const ProgressText = styled.Text`
  font-size: 12px;
  color: #6c757d;
  text-align: center;
`;

const EmptyStateContainer = styled.View`
  align-items: center;
  padding: 20px 0;
`;

const EmptyStateIcon = styled.View`
  margin-bottom: 12px;
  opacity: 0.6;
`;

const EmptyStateText = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #6c757d;
  margin-bottom: 4px;
  text-align: center;
`;

const EmptyStateSubtext = styled.Text`
  font-size: 14px;
  color: #9ca3af;
  text-align: center;
`;

const StatsRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
`;

const StatItem = styled.View`
  align-items: center;
  flex: 1;
`;

const StatItemIcon = styled.View`
  margin-bottom: 6px;
`;

const StatItemLabel = styled.Text`
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 2px;
  text-align: center;
`;

const StatItemValue = styled.Text`
  font-size: 14px;
  font-weight: 700;
  color: #212529;
  text-align: center;
`;

const StatDivider = styled.View`
  width: 1px;
  height: 40px;
  background-color: #e9ecef;
  margin: 0 8px;
`;
