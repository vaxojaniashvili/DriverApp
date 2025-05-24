import React from "react";
import { ScrollView, SafeAreaView, StatusBar, Platform } from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const Notifications = () => {
  const handleBack = () => {
    router.push("/(tabs)/Activity/activity");
  };

  const dummyNotifications = [
    {
      id: 1,
      title: "Welcome to the App!",
      description: "Thank you for joining us. Enjoy your experience!",
      icon: "checkmark-circle",
      iconColor: "#28c76f",
      bgColor: "#e7f9f0",
      time: "2 min ago",
    },
    {
      id: 2,
      title: "Profile Updated",
      description: "Your profile information was successfully updated.",
      icon: "person",
      iconColor: "#4361ee",
      bgColor: "#e9f5ff",
      time: "1 hour ago",
    },
    {
      id: 3,
      title: "New Feature Released!",
      description: "Check out our brand new feature in the latest app update.",
      icon: "star",
      iconColor: "#ff9f43",
      bgColor: "#fff4de",
      time: "5 hours ago",
    },
    {
      id: 4,
      title: "Reminder: Meeting Tomorrow",
      description:
        "Dont forget about your meeting scheduled for tomorrow at 10 AM.",
      icon: "calendar",
      iconColor: "#7367f0",
      bgColor: "#f0eeff",
      time: "Yesterday",
    },
    {
      id: 5,
      title: "Security Alert",
      description:
        "A new device logged into your account. If this was not you, please check your security settings.",
      icon: "warning",
      iconColor: "#ea5455",
      bgColor: "#fff2f2",
      time: "2 days ago",
    },
  ];

  return (
    <Container>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <ContentContainer>
        <Header>
          <BackButton onPress={handleBack}>
            <Ionicons name="chevron-back" size={24} color="#212529" />
          </BackButton>
          <Title>Notifications</Title>
          <OptionsButton></OptionsButton>
        </Header>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {dummyNotifications.map((notification) => (
            <NotificationCard key={notification.id}>
              <IconContainer style={{ backgroundColor: notification.bgColor }}>
                <Ionicons
                  name={notification.icon}
                  size={22}
                  color={notification.iconColor}
                />
              </IconContainer>
              <NotificationContent>
                <NotificationHeader>
                  <NotificationTitle>{notification.title}</NotificationTitle>
                  <NotificationTime>{notification.time}</NotificationTime>
                </NotificationHeader>
                <NotificationDescription>
                  {notification.description}
                </NotificationDescription>
              </NotificationContent>
            </NotificationCard>
          ))}

          <EmptySpace />
        </ScrollView>
      </ContentContainer>
    </Container>
  );
};

export default Notifications;

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: #f8f9fa;
`;

const ContentContainer = styled.View`
  flex: 1;
  padding: 0 20px;
  padding-top: ${Platform.OS === "android" ? "20px" : "0"};
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 5px 0;
  margin-bottom: 16px;
`;

const BackButton = styled.TouchableOpacity`
  height: 40px;
  width: 40px;
  border-radius: 20px;
  align-items: center;
  justify-content: center;
  background-color: #f1f3f5;
`;

const OptionsButton = styled.TouchableOpacity`
  height: 40px;
  width: 40px;
`;

const Title = styled.Text`
  font-size: 20px;
  font-weight: 700;
  color: #212529;
`;

const NotificationCard = styled.TouchableOpacity`
  background-color: #ffffff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  flex-direction: row;
  elevation: 2;
  shadow-color: #000;
  shadow-radius: 8px;
`;

const IconContainer = styled.View`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  justify-content: center;
  align-items: center;
  margin-right: 14px;
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
  color: #212529;
  flex: 1;
  margin-right: 8px;
`;

const NotificationTime = styled.Text`
  font-size: 12px;
  color: #6c757d;
`;

const NotificationDescription = styled.Text`
  font-size: 14px;
  color: #6c757d;
  line-height: 20px;
`;

const EmptySpace = styled.View`
  height: 20px;
`;
