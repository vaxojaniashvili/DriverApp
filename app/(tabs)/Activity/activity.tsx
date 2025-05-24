import React from "react";
import { Platform, StatusBar, View } from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Activity = () => {
  const insets = useSafeAreaInsets();

  const activityTabs = [
    {
      label: "Notifications",
      icon: "notifications",
      color: "#ffffff",
      bgColor: "#3498db",
      onPress: () => router.push("/settings/notifications"),
    },
    {
      label: "Messages",
      icon: "chatbubble",
      color: "#ffffff",
      bgColor: "#9b59b6",
      onPress: () => router.push("/(tabs)/Activity/messages/Messages"),
    },
    {
      label: "Contact Support",
      icon: "help-circle",
      color: "#ffffff",
      bgColor: "#f39c12",
      onPress: () => router.push("/settings/support"),
    },
  ];

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
        <TabsContainer>
          {activityTabs.map((tab, index) => (
            <TabOption
              key={index}
              onPress={tab.onPress}
              style={{
                marginBottom: index === activityTabs.length - 1 ? 0 : 16,
              }}
            >
              <TabInfo>
                <IconContainer style={{ backgroundColor: tab.bgColor }}>
                  <Ionicons name={tab.icon} size={22} color={tab.color} />
                </IconContainer>
                <TabTextContainer>
                  <TabText>{tab.label}</TabText>
                  <TabSubtext>
                    {tab.label === "Notifications"
                      ? "View all your notifications and alerts"
                      : tab.label === "Messages"
                      ? "Check your recent messages and conversations"
                      : "Get help and contact support team"}
                  </TabSubtext>
                </TabTextContainer>
              </TabInfo>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TabOption>
          ))}
        </TabsContainer>

        <FooterContainer>
          <FooterText>Stay updated with your latest activity</FooterText>
        </FooterContainer>
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
  padding-bottom: 30px;
`;

const Header = styled.View`
  padding-top: ${Platform.OS === "android" ? "24px" : "0"};
`;

const ContentContainer = styled.View`
  flex: 1;
  padding-horizontal: 20px;
  padding-top: 24px;
  background-color: #f5f9f7;
  margin-top: -20px;
  border-top-right-radius: 20px;
  border-top-left-radius: 20px;
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

const TabsContainer = styled.View`
  margin-bottom: 24px;
`;

const TabOption = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #ffffff;
  border-radius: 16px;
  elevation: 2;
  shadow-color: #000;
  shadow-opacity: 0.08;
  shadow-radius: 8px;
  shadow-offset: 0px 2px;
`;

const TabInfo = styled.View`
  flex-direction: row;
  align-items: center;
  flex: 1;
`;

const IconContainer = styled.View`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  justify-content: center;
  align-items: center;
  margin-right: 16px;
`;

const TabTextContainer = styled.View`
  flex: 1;
`;

const TabText = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const TabSubtext = styled.Text`
  font-size: 13px;
  color: #888;
  margin-top: 2px;
`;

const FooterContainer = styled.View`
  margin-top: auto;
  margin-bottom: 24px;
  align-items: center;
`;

const FooterText = styled.Text`
  color: #6c757d;
  font-size: 14px;
  text-align: center;
`;
