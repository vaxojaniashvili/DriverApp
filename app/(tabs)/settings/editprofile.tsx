import React, { useState, useEffect } from "react";
import {
  ScrollView,
  SafeAreaView,
  StatusBar,
  View,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const EditProfile = () => {
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@example.com");
  const [bio, setBio] = useState("");
  const [address, setAddress] = useState("");
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const savedData = await AsyncStorage.getItem("profileData");
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setName(parsedData.name || "");
          setEmail(parsedData.email || "");
          setBio(parsedData.bio || "");
          setAddress(parsedData.address || "");
          setProfileImage(
            parsedData.profileImage || "https://via.placeholder.com/150"
          );
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
      }
    };

    loadProfileData();
  }, []);

  const handleSubmit = async () => {
    try {
      const profileData = {
        name,
        email,
        bio,
        address,
        profileImage,
      };
      await AsyncStorage.setItem("profileData", JSON.stringify(profileData));
      router.push("/settings");
    } catch (error) {
      Alert.alert("Error", "Failed to save profile data");
      console.error("Error saving profile data:", error);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
      console.error("Image picker error:", error);
    }
  };

  const navigation = useNavigation();

  return (
    <Container>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ContentContainer showsVerticalScrollIndicator={false}>
            <Header>
              <BackButton onPress={handleSubmit}>
                <Ionicons name="chevron-back" size={24} color="#212529" />
              </BackButton>
              <Title>Edit Profile</Title>
              <View style={{ width: 24 }} />
            </Header>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 120 }}
              keyboardShouldPersistTaps="handled"
            >
              <ProfileImageSection>
                <ProfileImageContainer>
                  <ProfileImage
                    source={
                      profileImage
                        ? { uri: profileImage }
                        : require("../../../assets/images/profileDefaultImage.png")
                    }
                  />
                  <EditIconButton onPress={pickImage}>
                    <Ionicons name="camera" size={18} color="#fff" />
                  </EditIconButton>
                </ProfileImageContainer>
                <ProfileName>{name}</ProfileName>
              </ProfileImageSection>

              <SectionTitle>Personal Information</SectionTitle>

              <InputGroup>
                <InputLabel>Full Name</InputLabel>
                <Input
                  placeholder="Enter your full name"
                  value={name}
                  onChangeText={setName}
                />
              </InputGroup>

              <InputGroup>
                <InputLabel>Email Address</InputLabel>
                <Input
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </InputGroup>
              <SectionTitle>Additional Information</SectionTitle>

              <InputGroup>
                <InputLabel>Bio</InputLabel>
                <TextArea
                  placeholder="Tell us about yourself"
                  value={bio}
                  onChangeText={setBio}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </InputGroup>

              <InputGroup>
                <InputLabel>Address</InputLabel>
                <Input
                  placeholder="Enter your address"
                  value={address}
                  onChangeText={setAddress}
                />
              </InputGroup>

              <SaveButton onPress={handleSubmit}>
                <SaveButtonText>Save Changes</SaveButtonText>
              </SaveButton>
            </ScrollView>
          </ContentContainer>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Container>
  );
};

export default EditProfile;

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: #f8f9fa;
`;

const ContentContainer = styled.ScrollView`
  flex: 1;
  padding: 0 20px;
  padding-top: ${Platform.OS === "android" ? "30px" : "0"};
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0;
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

const Title = styled.Text`
  font-size: 20px;
  font-weight: 700;
  color: #212529;
`;

const ProfileImageSection = styled.View`
  align-items: center;
  margin-bottom: 32px;
`;

const ProfileImageContainer = styled.View`
  position: relative;
  margin-bottom: 12px;
`;

const ProfileImage = styled.Image`
  width: 100px;
  height: 100px;
  border-radius: 50px;
  background-color: #e9ecef;
`;

const EditIconButton = styled.TouchableOpacity`
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: #4361ee;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
`;

const ProfileName = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: #212529;
`;

const SectionTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #6c757d;
  margin-bottom: 16px;
  margin-top: 8px;
`;

const InputGroup = styled.View`
  margin-bottom: 20px;
`;

const InputLabel = styled.Text`
  font-size: 14px;
  color: #495057;
  margin-bottom: 8px;
  font-weight: 500;
`;

const Input = styled.TextInput`
  height: 50px;
  background-color: #fff;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  padding: 0 16px;
  font-size: 16px;
  color: #212529;
`;

const TextArea = styled.TextInput`
  min-height: 120px;
  background-color: #fff;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  color: #212529;
`;

const SaveButton = styled.TouchableOpacity`
  background-color: #4caf50;
  padding: 16px;
  border-radius: 12px;
  align-items: center;
  margin-top: 8px;
  margin-bottom: 24px;
`;

const SaveButtonText = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: 600;
`;
