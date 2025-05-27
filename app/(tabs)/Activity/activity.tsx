import React, { useState } from "react";
import { Platform, StatusBar, View, FlatList } from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Messages from "./messages/Messages";

const Activity = () => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("notifications");

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
    },
  ];

  const mainTabs = [
    {
      id: "notifications",
      label: "Notifications",
      icon: "notifications-outline",
      onPress: () => {
        setActiveTab("notifications");
      },
    },
    {
      id: "messages",
      label: "Messages",
      icon: "chatbubbles-outline",
      onPress: () => {
        setActiveTab("messages");
      },
    },
    {
      id: "support",
      label: "Support",
      icon: "help-circle-outline",
      onPress: () => {
        setActiveTab("support");
      },
    },
  ];

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
        <ContentArea>
          {activeTab === "notifications" && (
            <NotificationsContainer>
              <SectionHeader>
                <SectionTitle>Recent Notifications</SectionTitle>
                <NotificationCount>
                  {notifications.filter((n) => n.unread).length} unread
                </NotificationCount>
              </SectionHeader>
              <FlatList
                data={notifications}
                renderItem={renderNotificationItem}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            </NotificationsContainer>
          )}

          {activeTab === "messages" && <Messages />}

          {activeTab === "support" && (
            <SupportContainer>
              <SupportCard>
                <Ionicons name="headset-outline" size={48} color="#28c76f" />
                <SupportTitle>Need Help?</SupportTitle>
                <SupportText>
                  Our support team is available 24/7 to assist you
                </SupportText>
                <SupportButton>
                  <SupportButtonText
                    onPress={() => {
                      router.push("/(tabs)/settings/support");
                    }}
                  >
                    Contact Support
                  </SupportButtonText>
                </SupportButton>
              </SupportCard>
            </SupportContainer>
          )}
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

const MessageCard = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 16px 0;
  border-bottom-width: 1px;
  border-bottom-color: #f0f0f0;
`;

const MessageAvatarContainer = styled.View`
  position: relative;
  margin-right: 16px;
`;

const MessageAvatar = styled.Image`
  width: 50px;
  height: 50px;
  border-radius: 25px;
`;

const GroupBadge = styled.View`
  position: absolute;
  bottom: -2px;
  right: -2px;
  background-color: #007aff;
  border-radius: 10px;
  width: 20px;
  height: 20px;
  justify-content: center;
  align-items: center;
  border-width: 2px;
  border-color: #ffffff;
`;

const MessageContent = styled.View`
  flex: 1;
`;

const MessageHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

const MessageName = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  flex: 1;
  margin-right: 8px;
`;

const MessageTime = styled.Text`
  font-size: 12px;
  color: #888;
`;

const MessageFooter = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const LastMessage = styled.Text`
  font-size: 14px;
  color: #666;
  flex: 1;
  margin-right: 8px;
`;

const UnreadBadge = styled.View`
  background-color: #28c76f;
  border-radius: 10px;
  min-width: 20px;
  height: 20px;
  justify-content: center;
  align-items: center;
  padding-horizontal: 6px;
`;

const UnreadText = styled.Text`
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
`;

const FavoriteIcon = styled.View`
  margin-left: 8px;
  padding: 4px;
`;

const SupportContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const SupportCard = styled.View`
  background-color: #ffffff;
  border-radius: 16px;
  padding: 32px;
  align-items: center;
  border-width: 1px;
  border-color: #f0f0f0;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.1;
  shadow-radius: 12px;
  elevation: 4;
  width: 100%;
  max-width: 300px;
`;

const SupportTitle = styled.Text`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-top: 16px;
  margin-bottom: 8px;
`;

const SupportText = styled.Text`
  font-size: 14px;
  color: #666;
  text-align: center;
  line-height: 20px;
  margin-bottom: 24px;
`;

const SupportButton = styled.TouchableOpacity`
  background-color: #28c76f;
  padding: 12px 24px;
  border-radius: 8px;
`;

const SupportButtonText = styled.Text`
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
`;
