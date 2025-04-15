import React from "react";
import { ScrollView, SafeAreaView, StatusBar, Platform } from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const PrivacyAndSecurity = () => {
  const handleBack = () => {
    router.push("/settings");
  };

  const sections = [
    {
      id: 1,
      title: "Privacy Policy",
      description: "Learn how we protect your personal data and information.",
      icon: "shield-checkmark",
      iconColor: "#28c76f",
      bgColor: "#e7f9f0",
    },
    {
      id: 2,
      title: "Data Security",
      description: "Understand how we keep your data secure and encrypted.",
      icon: "lock-closed",
      iconColor: "#4361ee",
      bgColor: "#e9f5ff",
    },
    {
      id: 3,
      title: "Terms of Service",
      description: "Read our terms of use and legal conditions.",
      icon: "document-text",
      iconColor: "#ff9f43",
      bgColor: "#fff4de",
    },
    {
      id: 4,
      title: "Account Settings",
      description: "Manage your account preferences and security options.",
      icon: "settings",
      iconColor: "#7367f0",
      bgColor: "#f0eeff",
    },
    {
      id: 5,
      title: "Data Deletion Request",
      description: "Request to delete your account and personal data.",
      icon: "trash",
      iconColor: "#ea5455",
      bgColor: "#fff2f2",
    },
  ];

  const handleSectionPress = (id) => {
    const links = {
      1: "https://www.thevanapp.com/privacy",
      2: "https://www.thevanapp.com/security",
      3: "https://www.thevanapp.com/terms",
      4: "https://www.thevanapp.com/account",
      5: "https://www.thevanapp.com/delete-account",
    };
  };

  return (
    <Container>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <ContentContainer>
        <Header>
          <BackButton onPress={handleBack}>
            <Ionicons name="chevron-back" size={24} color="#212529" />
          </BackButton>
          <Title>Privacy & Security</Title>
          <OptionsButton></OptionsButton>
        </Header>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {sections.map((section) => (
            <SectionCard
              key={section.id}
              activeOpacity={0.7}
              onPress={() => handleSectionPress(section.id)}
            >
              <IconContainer style={{ backgroundColor: section.bgColor }}>
                <Ionicons
                  name={section.icon}
                  size={22}
                  color={section.iconColor}
                />
              </IconContainer>
              <SectionContent>
                <SectionHeader>
                  <SectionTitle>{section.title}</SectionTitle>
                  <ChevronIcon>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#6c757d"
                    />
                  </ChevronIcon>
                </SectionHeader>
                <SectionDescription>{section.description}</SectionDescription>
              </SectionContent>
            </SectionCard>
          ))}

          <EmptySpace />
        </ScrollView>
      </ContentContainer>
    </Container>
  );
};

export default PrivacyAndSecurity;

const Container = styled.View`
  flex: 1;
  background-color: #f8f9fa;
  padding-top: ${Platform.OS === "android" ? "0px" : "63"};
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

const SectionCard = styled.TouchableOpacity`
  background-color: #ffffff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  flex-direction: row;
  elevation: 2;
  shadow-color: #000;
  shadow-radius: 1px;
`;

const IconContainer = styled.View`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  justify-content: center;
  align-items: center;
  margin-right: 14px;
`;

const SectionContent = styled.View`
  flex: 1;
`;

const SectionHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

const SectionTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #212529;
  flex: 1;
  margin-right: 8px;
`;

const ChevronIcon = styled.View`
  align-items: center;
  justify-content: center;
`;

const SectionDescription = styled.Text`
  font-size: 14px;
  color: #6c757d;
  line-height: 20px;
`;

const EmptySpace = styled.View`
  height: 20px;
`;
