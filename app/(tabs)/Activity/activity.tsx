import React, { useState } from "react";
import { Platform, StatusBar, View, FlatList } from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Messages from "./messages/Messages";
import ActivitySupport from "@/components/ActivitySupport";

const Activity = ({ route }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("notifications");
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const notifications = [
    {
      id: 1,
      type: "trip_request",
      title: "New Trip Request",
      message: "Passenger waiting at Tbilisi Mall",
      time: "2 min ago",
      icon: "car-outline",
      color: "#28c76f",
      unread: true,
      isGroup: false,
    },
    {
      id: 2,
      type: "payment",
      title: "Payment Received",
      message: "25₾ - Trip #1234",
      time: "15 min ago",
      icon: "card-outline",
      color: "#00a8ff",
      unread: true,
      isGroup: false,
    },
    {
      id: 3,
      type: "rating",
      title: "New Rating",
      message: "5 stars - 'Excellent driver!'",
      time: "1 hour ago",
      icon: "star-outline",
      color: "#ffa502",
      unread: false,
      isGroup: false,
    },
    {
      id: 4,
      type: "system",
      title: "System Update",
      message: "New app version available",
      time: "3 hours ago",
      icon: "download-outline",
      color: "#8854d0",
      unread: false,
      isGroup: true,
    },
    {
      id: 5,
      type: "promo",
      title: "Special Offer",
      message: "Get 20% bonus on weekends",
      time: "1 day ago",
      icon: "gift-outline",
      color: "#ff6b6b",
      unread: false,
      isGroup: true,
    },
  ];

  const mainTabs = [
    {
      id: "notifications",
      label: "Notifications",
      icon: "notifications-outline",
      onPress: () => {
        setActiveTab("notifications");
        setActiveFilter("all");
      },
    },
    {
      id: "messages",
      label: "Messages",
      icon: "chatbubbles-outline",
      onPress: () => {
        setActiveTab("messages");
        setActiveFilter("all");
      },
    },
    {
      id: "support",
      label: "Support",
      icon: "help-circle-outline",
      onPress: () => {
        setActiveTab("support");
        setActiveFilter("all");
      },
    },
  ];

  const filterTabs = [
    {
      id: "all",
      label: "All",
    },
    {
      id: "unread",
      label: "Unread",
    },
    {
      id: "groups",
      label: "Groups",
    },
  ];

  const getFilteredData = () => {
    let filteredData = notifications;

    switch (activeFilter) {
      case "unread":
        filteredData = notifications.filter((item) => item.unread);
        break;
      case "groups":
        filteredData = notifications.filter((item) => item.isGroup);
        break;
      default:
        filteredData = notifications;
    }

    if (searchQuery.trim()) {
      filteredData = filteredData.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filteredData;
  };

  const renderNotificationItem = ({ item }) => (
    <NotificationCard>
      <NotificationIconContainer color={item.color}>
        <Ionicons name={item.icon} size={20} color="#ffffff" />
      </NotificationIconContainer>

      <NotificationContent>
        <NotificationHeader>
          <NotificationTitle numberOfLines={1}>{item.title}</NotificationTitle>
          <NotificationTime>{item.time}</NotificationTime>
        </NotificationHeader>
        <NotificationMessage numberOfLines={2}>
          {item.message}
        </NotificationMessage>
      </NotificationContent>

      {item.unread && <UnreadDot />}
      {item.isGroup && (
        <GroupBadge>
          <Ionicons name="people-outline" size={12} color="#ffffff" />
        </GroupBadge>
      )}
    </NotificationCard>
  );

  return (
    <Container>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1e8449"
        translucent
      />

      <HeaderGradient
        colors={["#28c76f", "#18ad50"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          paddingTop: insets.top,
        }}
      >
        <Header>
          <Title>Activity</Title>
          <Subtitle>View your recent activity and updates</Subtitle>
        </Header>
      </HeaderGradient>

      <ContentContainer>
        <MainTabsContainer>
          {mainTabs.map((tab) => (
            <MainTab
              key={tab.id}
              onPress={tab.onPress}
              isActive={activeTab === tab.id}
            >
              <Ionicons
                name={tab.icon}
                size={20}
                color={activeTab === tab.id ? "#28c76f" : "#666"}
              />
              <MainTabText isActive={activeTab === tab.id}>
                {tab.label}
              </MainTabText>
            </MainTab>
          ))}
        </MainTabsContainer>

        {activeTab === "notifications" && (
          <>
            <SearchContainer>
              <SearchInputContainer>
                <Ionicons name="search-outline" size={20} color="#666" />
                <SearchInput
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor="#999"
                />
                {searchQuery.length > 0 && (
                  <ClearButton onPress={() => setSearchQuery("")}>
                    <Ionicons name="close-circle" size={20} color="#666" />
                  </ClearButton>
                )}
              </SearchInputContainer>
            </SearchContainer>

            <FilterTabsContainer>
              {filterTabs.map((tab) => (
                <FilterTab
                  key={tab.id}
                  onPress={() => setActiveFilter(tab.id)}
                  isActive={activeFilter === tab.id}
                >
                  <FilterTabText isActive={activeFilter === tab.id}>
                    {tab.label}
                  </FilterTabText>
                </FilterTab>
              ))}
            </FilterTabsContainer>
          </>
        )}

        <ContentArea>
          {activeTab === "notifications" && (
            <NotificationsContainer>
              <SectionHeader>
                <SectionTitle>
                  {activeFilter === "all" && "All Notifications"}
                  {activeFilter === "unread" && "Unread Notifications"}
                  {activeFilter === "groups" && "Group Notifications"}
                </SectionTitle>
                <NotificationCount>
                  {getFilteredData().length} items
                </NotificationCount>
              </SectionHeader>
              {getFilteredData().length === 0 ? (
                <EmptyState>
                  <Ionicons
                    name="notifications-outline"
                    size={48}
                    color="#ccc"
                  />
                  <EmptyStateText>No notifications found</EmptyStateText>
                </EmptyState>
              ) : (
                <FlatList
                  data={getFilteredData()}
                  renderItem={renderNotificationItem}
                  keyExtractor={(item) => item.id.toString()}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 20 }}
                />
              )}
            </NotificationsContainer>
          )}

          {activeTab === "messages" && <Messages />}

          {activeTab === "support" && <ActivitySupport />}
        </ContentArea>
      </ContentContainer>
    </Container>
  );
};

export default Activity;

const Container = styled(View)`
  flex: 1;
  background-color: #f5f9f7;
`;

const HeaderGradient = styled(LinearGradient)`
  padding-horizontal: 20px;
  padding-bottom: 20px;
  background-color: red;
  height: 149px;
`;

const Header = styled.View`
  padding-top: ${Platform.OS === "android" ? "24px" : "0"};
`;

const ContentContainer = styled.View`
  flex: 1;
  background-color: #ffffff;
  margin-top: -10px;
  border-top-right-radius: 20px;
  border-top-left-radius: 20px;
  margin-top: -20px;
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

const MainTabsContainer = styled.View`
  flex-direction: row;
  padding: 20px 20px 0 20px;
  border-bottom-width: 1px;
  border-bottom-color: #f0f0f0;
`;

const MainTab = styled.TouchableOpacity`
  flex: 1;
  padding: 12px 8px;
  align-items: center;
  border-bottom-width: 2px;
  border-bottom-color: ${(props) =>
    props.isActive ? "#28c76f" : "transparent"};
  gap: 4px;
`;

const MainTabText = styled.Text`
  font-size: 14px;
  font-weight: ${(props) => (props.isActive ? "600" : "400")};
  color: ${(props) => (props.isActive ? "#28c76f" : "#666")};
`;

const FilterTabsContainer = styled.View`
  flex-direction: row;
  padding: 16px 20px 12px 20px;
  gap: 8px;
`;

const FilterTab = styled.TouchableOpacity`
  padding: 8px 16px;
  border-radius: 20px;
  border-width: 1px;
  border-color: ${(props) => (props.isActive ? "#28c76f" : "#e0e0e0")};
  background-color: ${(props) => (props.isActive ? "#28c76f" : "transparent")};
`;

const FilterTabText = styled.Text`
  font-size: 14px;
  font-weight: 500;
  color: ${(props) => (props.isActive ? "#ffffff" : "#666")};
`;

const SearchContainer = styled.View`
  padding: 16px 20px 0 20px;
`;

const SearchInputContainer = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 12px 16px;
`;

const SearchInput = styled.TextInput`
  flex: 1;
  margin-left: 12px;
  font-size: 16px;
  color: #333;
`;

const ClearButton = styled.TouchableOpacity`
  padding: 4px;
`;

const ContentArea = styled.View`
  flex: 1;
  padding: 20px;
`;

const NotificationsContainer = styled.View`
  flex: 1;
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
  color: #333;
`;

const NotificationCount = styled.Text`
  font-size: 14px;
  color: #28c76f;
  font-weight: 500;
`;

const NotificationCard = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 16px;
  background-color: #ffffff;
  border-radius: 12px;
  margin-bottom: 12px;
  border-width: 1px;
  border-color: #f0f0f0;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.05;
  shadow-radius: 8px;
  elevation: 2;
  position: relative;
`;

const NotificationIconContainer = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${(props) => props.color};
  justify-content: center;
  align-items: center;
  margin-right: 16px;
`;

const NotificationContent = styled.View`
  flex: 1;
`;

const NotificationHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
`;

const NotificationTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  flex: 1;
  margin-right: 8px;
`;

const NotificationTime = styled.Text`
  font-size: 12px;
  color: #888;
`;

const NotificationMessage = styled.Text`
  font-size: 14px;
  color: #666;
  line-height: 20px;
`;

const UnreadDot = styled.View`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: #28c76f;
  margin-left: 8px;
`;

const GroupBadge = styled.View`
  position: absolute;
  bottom: 10;
  right: 12px;
  background-color: #007aff;
  border-radius: 10px;
  width: 20px;
  height: 20px;
  justify-content: center;
  align-items: center;
  border-width: 2px;
  border-color: #ffffff;
`;

const EmptyState = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
`;

const EmptyStateText = styled.Text`
  font-size: 16px;
  color: #888;
  margin-top: 16px;
  text-align: center;
`;
