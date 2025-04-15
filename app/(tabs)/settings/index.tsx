import React from "react";
import { Alert, Platform, SafeAreaView, StatusBar } from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/infrastructure/db/supabase";
import { router } from "expo-router";

const Settings = () => {
  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Logout Error", error.message);
    } else {
      router.replace("/");
    }
  }

  const handleDeactivateAccount = () => {
    Alert.alert(
      "Deactivate Account",
      "Are you sure you want to deactivate your account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Deactivate",
          style: "destructive",
          onPress: () => console.log("Account deactivated"),
        },
      ]
    );
  };

  const settingsOptions = [
    {
      label: "Edit Profile",
      icon: "person",
      color: "#4361ee",
      bgColor: "#e9f5ff",
      onPress: () => router.push("/settings/editprofile"),
    },
    {
      label: "Notifications",
      icon: "notifications",
      color: "#ff9f43",
      bgColor: "#fff4de",
      onPress: () => router.push("/settings/notifications"),
    },
    {
      label: "Privacy & Security",
      icon: "shield-checkmark",
      color: "#28c76f",
      bgColor: "#e7f9f0",
      onPress: () => router.push("settings/privace"),
    },
    {
      label: "Contact Support",
      icon: "headset",
      color: "#7367f0",
      bgColor: "#f0eeff",
      onPress: () => router.push("/settings/support"),
    },
    {
      label: "Deactivate Account",
      icon: "close-circle",
      color: "#ea5455",
      bgColor: "#fff2f2",
      onPress: handleDeactivateAccount,
    },
  ];

  return (
    <Container>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <ContentContainer>
        <Header>
          <Title>Settings</Title>
          <Subtitle>Manage your account preferences</Subtitle>
        </Header>

        <SectionTitle>Account Settings</SectionTitle>
        <OptionsContainer>
          {settingsOptions.map((option, index) => (
            <Option
              key={index}
              onPress={option.onPress}
              isLast={index === settingsOptions.length - 1}
            >
              <OptionInfo>
                <IconContainer style={{ backgroundColor: option.bgColor }}>
                  <Ionicons name={option.icon} size={22} color={option.color} />
                </IconContainer>
                <OptionText>{option.label}</OptionText>
              </OptionInfo>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Option>
          ))}
        </OptionsContainer>

        <BottomContainer>
          <LogoutButton onPress={handleLogout}>
            <Ionicons
              name="log-out-outline"
              size={20}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <LogoutText>Log Out</LogoutText>
          </LogoutButton>

          <FooterText>App Version 1.0.0</FooterText>
        </BottomContainer>
      </ContentContainer>
    </Container>
  );
};

export default Settings;

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: #f8f9fa;
`;

const ContentContainer = styled.View`
  flex: 1;
  padding-horizontal: 20px;
  padding-top: ${Platform.OS === "android" ? "20px" : "25"};
`;

const Header = styled.View`
  margin-bottom: 32px;
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

const SectionTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #6c757d;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const OptionsContainer = styled.View`
  background-color: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 24px;
  elevation: 2;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 8px;
`;

const Option = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom-width: ${(props) => (props.isLast ? "0" : "1px")};
  border-bottom-color: #f1f1f1;
`;

const OptionInfo = styled.View`
  flex-direction: row;
  align-items: center;
`;

const IconContainer = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
`;

const OptionText = styled.Text`
  font-size: 16px;
  font-weight: 500;
  color: #212529;
`;

const BottomContainer = styled.View`
  margin-top: auto;
  margin-bottom: 16px;
`;

const LogoutButton = styled.TouchableOpacity`
  background-color: #ea5455;
  padding: 16px;
  border-radius: 12px;
  align-items: center;
  flex-direction: row;
  justify-content: center;
  margin-bottom: 16px;
`;

const LogoutText = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: 600;
`;

const FooterText = styled.Text`
  color: #6c757d;
  font-size: 14px;
  text-align: center;
`;
