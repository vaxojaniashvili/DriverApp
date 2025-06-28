import React, { useState, useEffect, useCallback } from "react";
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
import { router, useFocusEffect } from "expo-router";
import { supabase } from "@/infrastructure/db/supabase";

const EditProfile = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");

  // Address fields
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [apiToken, setApiToken] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error("No active session found");
        router.replace("/authentication" as any);
        return;
      }

      setApiToken(session.access_token);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Error fetching user:", userError);
        return;
      }

      const metadata = user.user_metadata;

      setUserId(user.id);
      setEmail(user.email || "");

      setName(metadata.full_name || metadata.fullname || "");
      setPhoneNumber(metadata.phone || "");
      setAddressLine1(metadata.address_line_1 || "");
      setAddressLine2(metadata.address_line_2 || "");
      setCity(metadata.city || "");
      setState(metadata.state || "");
      setPostalCode(metadata.postal_code || "");
      setCountry(metadata.country || "");
      const { data: driverData, error: driverError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (driverError) {
        console.log("No driver data found or error:", driverError);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    setLoading(true);
    try {
      const fullAddress = [
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
      ]
        .filter(Boolean)
        .join(", ");

      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: name,
          fullname: name,
          first_name: name.split(" ")[0] || name,
          last_name: name.split(" ").slice(1).join(" ") || "",
          phone: phoneNumber,
          address: fullAddress,
          address_line_1: addressLine1,
          address_line_2: addressLine2,
          city: city,
          state: state,
          postal_code: postalCode,
          country: country,
        },
      });

      if (error) {
        throw error;
      }

      Alert.alert("Success", "Profile updated successfully");
      router.push("/settings");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [apiToken])
  );

  console.log("dataa", userId);

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
              <BackButton onPress={() => router.push("/settings")}>
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
                  editable={false}
                  style={{ backgroundColor: "#f1f3f5" }}
                />
              </InputGroup>

              <InputGroup>
                <InputLabel>Phone Number</InputLabel>
                <Input
                  placeholder="Phone number"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
              </InputGroup>

              <SectionTitle>Address Information</SectionTitle>

              <InputGroup>
                <InputLabel>Street Address</InputLabel>
                <Input
                  placeholder="Street address"
                  value={addressLine1}
                  onChangeText={setAddressLine1}
                />
              </InputGroup>

              <InputGroup>
                <InputLabel>Apartment, Suite, etc. (Optional)</InputLabel>
                <Input
                  placeholder="Apartment, suite, unit, etc."
                  value={addressLine2}
                  onChangeText={setAddressLine2}
                />
              </InputGroup>

              <RowContainer>
                <HalfInputGroup>
                  <InputLabel>City</InputLabel>
                  <Input
                    placeholder="City"
                    value={city}
                    onChangeText={setCity}
                  />
                </HalfInputGroup>

                <HalfInputGroup>
                  <InputLabel>State/Province</InputLabel>
                  <Input
                    placeholder="State"
                    value={state}
                    onChangeText={setState}
                  />
                </HalfInputGroup>
              </RowContainer>

              <RowContainer>
                <HalfInputGroup>
                  <InputLabel>ZIP/Postal Code</InputLabel>
                  <Input
                    placeholder="Postal Code"
                    value={postalCode}
                    onChangeText={setPostalCode}
                    keyboardType="number-pad"
                  />
                </HalfInputGroup>

                <HalfInputGroup>
                  <InputLabel>Country</InputLabel>
                  <Input
                    placeholder="Country"
                    value={country}
                    onChangeText={setCountry}
                  />
                </HalfInputGroup>
              </RowContainer>

              <SaveButton onPress={handleSubmit} disabled={loading}>
                <SaveButtonText>
                  {loading ? "Saving..." : "Save Changes"}
                </SaveButtonText>
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

const RowContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 0;
`;

const HalfInputGroup = styled.View`
  flex: 0.48;
  margin-bottom: 20px;
`;

const SaveButton = styled.TouchableOpacity`
  background-color: #4caf50;
  padding: 16px;
  border-radius: 12px;
  align-items: center;
  margin-top: 8px;
  margin-bottom: 24px;
  opacity: ${(props) => (props.disabled ? 0.6 : 1)};
`;

const SaveButtonText = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: 600;
`;
