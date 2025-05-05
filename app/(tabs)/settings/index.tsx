import React from "react";
import { Alert, Platform, SafeAreaView, StatusBar, View } from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/infrastructure/db/supabase";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Settings = () => {
  const insets = useSafeAreaInsets();

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
      color: "#ffffff",
      bgColor: "#2ecc71",
      onPress: () => router.push("/settings/editprofile"),
    },
    {
      label: "Notifications",
      icon: "notifications",
      color: "#ffffff",
      bgColor: "#27ae60",
      onPress: () => router.push("/settings/notifications"),
    },
    {
      label: "Privacy & Security",
      icon: "shield-checkmark",
      color: "#ffffff",
      bgColor: "#2ecc71",
      onPress: () => router.push("settings/privace"),
    },
    {
      label: "Contact Support",
      icon: "headset",
      color: "#ffffff",
      bgColor: "#27ae60",
      onPress: () => router.push("/settings/support"),
    },
    {
      label: "Deactivate Account",
      icon: "close-circle",
      color: "#ffffff",
      bgColor: "#e74c3c",
      onPress: handleDeactivateAccount,
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
          <Title>Settings</Title>
          <Subtitle>Manage your account preferences</Subtitle>
        </Header>
      </HeaderGradient>

      <ContentContainer>
        <OptionsContainer>
          {settingsOptions.map((option, index) => (
            <Option
              key={index}
              onPress={option.onPress}
              style={{
                marginBottom: index === settingsOptions.length - 1 ? 0 : 16,
              }}
            >
              <OptionInfo>
                <IconContainer style={{ backgroundColor: option.bgColor }}>
                  <Ionicons name={option.icon} size={22} color={option.color} />
                </IconContainer>
                <OptionTextContainer>
                  <OptionText>{option.label}</OptionText>
                  <OptionSubtext>
                    {option.label === "Edit Profile"
                      ? "Update your personal information"
                      : option.label === "Notifications"
                      ? "Manage push notifications"
                      : option.label === "Privacy & Security"
                      ? "Control data usage and privacy"
                      : option.label === "Contact Support"
                      ? "Get help with any issues"
                      : "Remove your account permanently"}
                  </OptionSubtext>
                </OptionTextContainer>
              </OptionInfo>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Option>
          ))}
        </OptionsContainer>

        <BottomContainer>
          <LogoutButtonGradient
            colors={["#e74c3c", "#c0392b"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <LogoutButton onPress={handleLogout}>
              <Ionicons
                name="log-out-outline"
                size={20}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <LogoutText>Log Out</LogoutText>
            </LogoutButton>
          </LogoutButtonGradient>

          <FooterText>App Version 3.0.5</FooterText>
        </BottomContainer>
      </ContentContainer>
    </Container>
  );
};

export default Settings;

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

const OptionsContainer = styled.View`
  margin-bottom: 24px;
`;

const Option = styled.TouchableOpacity`
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

const OptionInfo = styled.View`
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

const OptionTextContainer = styled.View`
  flex: 1;
`;

const OptionText = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const OptionSubtext = styled.Text`
  font-size: 13px;
  color: #888;
  margin-top: 2px;
`;

const BottomContainer = styled.View`
  margin-top: auto;
  margin-bottom: 24px;
`;

const LogoutButtonGradient = styled(LinearGradient)`
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 16px;
`;

const LogoutButton = styled.TouchableOpacity`
  padding: 16px;
  align-items: center;
  flex-direction: row;
  justify-content: center;
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
