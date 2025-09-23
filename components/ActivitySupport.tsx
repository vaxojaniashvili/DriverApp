import React, { useState } from "react";
import { FlatList, Alert, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import styled from "styled-components/native";

const ActivitySupport = () => {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("All");

  const driverUpdates = {
    All: [
      //   {
      //     id: 2,
      //     type: "order_completed",
      //     title: "Order Completed Successfully",
      //     message: "Trip #1234 completed. Payment received: 25€",
      //     time: "15 min ago",
      //     priority: "medium",
      //     status: "completed",
      //     unread: true,
      //     earning: "25€",
      //     rating: 5,
      //   },
      //   {
      //     id: 3,
      //     type: "peak_hours",
      //     title: "Peak Hours Active",
      //     message: "Surge pricing active in Saburtalo area (+40%)",
      //     time: "1 hour ago",
      //     priority: "medium",
      //     status: "active",
      //     unread: false,
      //     isGroup: true,
      //     bonus: "+40%",
      //   },
      //   {
      //     id: 4,
      //     type: "weekly_summary",
      //     title: "Weekly Performance",
      //     message: "Great week! 47 trips completed, 4.9★ rating",
      //     time: "1 day ago",
      //     priority: "low",
      //     status: "info",
      //     unread: false,
      //     isGroup: true,
      //     trips: 47,
      //     rating: 4.9,
      //   },
      //   {
      //     id: 5,
      //     type: "system_alert",
      //     title: "Navigation Update",
      //     message: "New route optimization available for better earnings",
      //     time: "2 days ago",
      //     priority: "low",
      //     status: "info",
      //     unread: false,
      //     isGroup: true,
      //   },
    ],
    Unread: [],
    Groups: [],
  };

  driverUpdates.Unread = driverUpdates.All.filter((n) => n.unread);
  driverUpdates.Groups = driverUpdates.All.filter((n) => n.isGroup);

  const filterTabs = ["All", "Unread", "Groups"];

  const getTypeIcon = (type) => {
    switch (type) {
      case "new_order":
        return "car-outline";
      case "order_completed":
        return "checkmark-circle";
      case "peak_hours":
        return "trending-up";
      case "weekly_summary":
        return "stats-chart";
      case "system_alert":
        return "information-circle";
      default:
        return "notifications";
    }
  };

  const handleNotificationPress = (item) => {
    if (item.type === "new_order") {
      Alert.alert(
        "New Order",
        `${item.location}\nEarning: ${item.earning}\n\nAccept this order?`,
        [
          { text: "Decline", style: "cancel" },
          {
            text: "Accept",
            style: "default",
            onPress: () => {
              Alert.alert("Order Accepted", "Navigate to pickup location?");
            },
          },
        ]
      );
    } else {
      Alert.alert(item.title, item.message);
    }
  };

  const renderDriverUpdateItem = ({ item }) => (
    <UpdateCard onPress={() => handleNotificationPress(item)}>
      <CardHeader>
        <TypeIndicator type={item.type}>
          <Ionicons name={getTypeIcon(item.type)} size={20} color="green" />
        </TypeIndicator>

        <CardMeta>
          <UpdateTime>{item.time}</UpdateTime>
          {item.unread && <UnreadDot />}
          {item.isGroup && (
            <GroupBadge>
              <Ionicons name="people" size={10} color="#ffffff" />
            </GroupBadge>
          )}
        </CardMeta>
      </CardHeader>

      <CardBody>
        <UpdateTitle unread={item.unread}>{item.title}</UpdateTitle>
        <UpdateMessage>{item.message}</UpdateMessage>

        <CardFooter>
          {item.earning && (
            <EarningBadge>
              <Ionicons name="wallet" size={12} color="#28c76f" />
              <EarningText>{item.earning}</EarningText>
            </EarningBadge>
          )}

          {item.rating && (
            <RatingBadge>
              <Ionicons name="star" size={12} color="#ffa502" />
              <RatingText>{item.rating}★</RatingText>
            </RatingBadge>
          )}

          {item.bonus && (
            <BonusBadge>
              <Ionicons name="flash" size={12} color="#ff4757" />
              <BonusText>{item.bonus}</BonusText>
            </BonusBadge>
          )}

          {item.trips && (
            <TripsBadge>
              <Ionicons name="car" size={12} color="#3742fa" />
              <TripsText>{item.trips} trips</TripsText>
            </TripsBadge>
          )}
        </CardFooter>
      </CardBody>
    </UpdateCard>
  );

  const currentUpdates = driverUpdates[activeFilter] || [];

  return (
    <Container>
      <HeaderSection>
        <HeaderGradient
          colors={["#28c76f", "#20bf6b"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <HeaderContent>
            <DriverIconContainer>
              <Ionicons name="car-sport" size={28} color="#ffffff" />
            </DriverIconContainer>
            <HeaderText>
              <HeaderTitle>Driver Support</HeaderTitle>
            </HeaderText>
            <StatusContainer>
              <OnlineStatus>
                <StatusDot />
                <StatusText>Online</StatusText>
              </OnlineStatus>
            </StatusContainer>
          </HeaderContent>
        </HeaderGradient>
      </HeaderSection>

      <FilterSection>
        <FilterContainer>
          {filterTabs.map((tab) => (
            <FilterTab
              key={tab}
              active={tab === activeFilter}
              onPress={() => setActiveFilter(tab)}
            >
              <FilterTabText active={tab === activeFilter}>{tab}</FilterTabText>
              {tab === "Unread" && driverUpdates.Unread.length > 0 && (
                <FilterBadge>
                  <FilterBadgeText>
                    {driverUpdates.Unread.length}
                  </FilterBadgeText>
                </FilterBadge>
              )}
            </FilterTab>
          ))}
        </FilterContainer>
      </FilterSection>

      <UpdatesSection>
        <SectionHeader>
          <SectionTitle>Recent Updates</SectionTitle>
          <UpdateCount>{currentUpdates.length} items</UpdateCount>
        </SectionHeader>

        {currentUpdates.length === 0 ? (
          <EmptyStateContainer>
            <EmptyStateIcon>
              <Ionicons name="car-outline" size={64} color="#ccc" />
            </EmptyStateIcon>
            <EmptyStateTitle>No updates</EmptyStateTitle>
            <EmptyStateText>
              {activeFilter === "All" && "No driver updates available"}
              {activeFilter === "Unread" && "All updates have been read"}
              {activeFilter === "Groups" && "No group updates found"}
            </EmptyStateText>
          </EmptyStateContainer>
        ) : (
          <FlatList
            data={currentUpdates}
            renderItem={renderDriverUpdateItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </UpdatesSection>

      <ActionSection>
        <SecondaryActionsRow>
          <SecondaryActionButton
            onPress={() => router.push("/(tabs)/settings/support")}
          >
            <Ionicons name="headset" size={18} color="white" />
            <SecondaryButtonText>Support</SecondaryButtonText>
          </SecondaryActionButton>
        </SecondaryActionsRow>
      </ActionSection>
    </Container>
  );
};

export default ActivitySupport;

const Container = styled.View`
  flex: 1;
  width: 105%;
  margin-left: -11px;
  margin-bottom: -20px;
`;

const HeaderSection = styled.View`
  margin-bottom: 16px;
`;

const HeaderGradient = styled(LinearGradient)`
  border-radius: 20px;
  margin: 0 16px;
  overflow: hidden;
`;

const HeaderContent = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 10px 15px;
`;

const DriverIconContainer = styled.View`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: rgba(255, 255, 255, 0.2);
  align-items: center;
  justify-content: center;
  margin-right: 12px;
`;

const HeaderText = styled.View`
  flex: 1;
`;

const HeaderTitle = styled.Text`
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 2px;
`;

const StatusContainer = styled.View``;

const OnlineStatus = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 6px 12px;
  border-radius: 16px;
`;

const StatusDot = styled.View`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: #ffffff;
  margin-right: 6px;
`;

const StatusText = styled.Text`
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
`;

const FilterSection = styled.View`
  margin-bottom: 16px;
`;

const FilterContainer = styled.View`
  flex-direction: row;
  padding: 0 16px;
  gap: 8px;
`;

const FilterTab = styled.TouchableOpacity`
  flex: 1;
  padding: 10px 12px;
  border-radius: 20px;
  background-color: ${(props) => (props.active ? "#28c76f" : "#ffffff")};
  flex-direction: row;
  align-items: center;
  justify-content: center;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.05;
  shadow-radius: 4px;
  elevation: 2;
`;

const FilterTabText = styled.Text`
  font-size: 13px;
  font-weight: 600;
  color: ${(props) => (props.active ? "#ffffff" : "#666")};
`;

const FilterBadge = styled.View`
  background-color: #ff4757;
  border-radius: 8px;
  min-width: 16px;
  height: 16px;
  align-items: center;
  justify-content: center;
  margin-left: 6px;
`;

const FilterBadgeText = styled.Text`
  color: #ffffff;
  font-size: 10px;
  font-weight: 600;
`;

const UpdatesSection = styled.View`
  flex: 1;
  padding: 0 16px;
`;

const SectionHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const SectionTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const UpdateCount = styled.Text`
  font-size: 12px;
  color: #28c76f;
  font-weight: 500;
`;

const UpdateCard = styled.TouchableOpacity`
  background-color: #ffffff;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 8px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.05;
  shadow-radius: 4px;
  elevation: 2;
  border-width: 0.2px;
  border-color: gray;
`;

const CardHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const TypeIndicator = styled.View`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  align-items: center;
  justify-content: center;
`;

const CardMeta = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;

const UpdateTime = styled.Text`
  font-size: 11px;
  color: #888;
`;

const UnreadDot = styled.View`
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: #28c76f;
`;

const GroupBadge = styled.View`
  background-color: #3742fa;
  border-radius: 8px;
  width: 16px;
  height: 16px;
  align-items: center;
  justify-content: center;
`;

const CardBody = styled.View``;

const UpdateTitle = styled.Text`
  font-size: 14px;
  font-weight: ${(props) => (props.unread ? "600" : "500")};
  color: ${(props) => (props.unread ? "#333" : "#666")};
  margin-bottom: 4px;
`;

const UpdateMessage = styled.Text`
  font-size: 13px;
  color: #666;
  line-height: 18px;
  margin-bottom: 10px;
`;

const CardFooter = styled.View`
  flex-direction: row;
  gap: 8px;
`;

const BadgeBase = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 4px 8px;
  border-radius: 10px;
  gap: 4px;
`;

const EarningBadge = styled(BadgeBase)`
  background-color: rgba(40, 199, 111, 0.1);
`;

const EarningText = styled.Text`
  font-size: 11px;
  font-weight: 600;
  color: #28c76f;
`;

const RatingBadge = styled(BadgeBase)`
  background-color: rgba(255, 165, 2, 0.1);
`;

const RatingText = styled.Text`
  font-size: 11px;
  font-weight: 600;
  color: #ffa502;
`;

const BonusBadge = styled(BadgeBase)`
  background-color: rgba(255, 71, 87, 0.1);
`;

const BonusText = styled.Text`
  font-size: 11px;
  font-weight: 600;
  color: #ff4757;
`;

const TripsBadge = styled(BadgeBase)`
  background-color: rgba(55, 66, 250, 0.1);
`;

const TripsText = styled.Text`
  font-size: 11px;
  font-weight: 600;
  color: #3742fa;
`;

const EmptyStateContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
`;

const EmptyStateIcon = styled.View`
  margin-bottom: 16px;
`;

const EmptyStateTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #666;
  margin-bottom: 6px;
`;

const EmptyStateText = styled.Text`
  font-size: 13px;
  color: #888;
  text-align: center;
  line-height: 18px;
`;

const ActionSection = styled.View`
  padding: 10px;
  gap: 12px;
  background-color: transparent;
`;

const SecondaryActionsRow = styled.View`
  flex-direction: row;
  gap: 12px;
`;

const SecondaryActionButton = styled.TouchableOpacity`
  flex: 1;
  background-color: #34b56e;
  border-radius: 15px;
  padding: 14px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.05;
  shadow-radius: 4px;
  elevation: 2;
`;

const SecondaryButtonText = styled.Text`
  color: white;
  font-size: 14px;
  font-weight: 500;
`;
