import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Input, Button } from "@rneui/themed";
import { LinearGradient } from "expo-linear-gradient";
import styled from "styled-components/native";
import { router } from "expo-router";
import { supabase } from "@/infrastructure/db/supabase";

const DriverVerificationScreen = () => {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [contactMethod, setContactMethod] = useState("email");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const [nameError, setNameError] = useState("");
  const [surnameError, setSurnameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");

  const validateName = (name) => {
    if (!name.trim()) {
      setNameError("Name is required");
      return false;
    }
    setNameError("");
    return true;
  };

  const validateSurname = (surname) => {
    if (!surname.trim()) {
      setSurnameError("Surname is required");
      return false;
    }
    setSurnameError("");
    return true;
  };

  const validateEmail = (email) => {
    if (contactMethod === "phone") {
      setEmailError("");
      return true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email is required");
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Invalid email format");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePhoneNumber = (phone) => {
    if (contactMethod === "email") {
      setPhoneNumberError("");
      return true;
    }

    const phoneRegex = /^\+?[0-9]{9,15}$/;
    if (!phone) {
      setPhoneNumberError("Phone number is required");
      return false;
    } else if (!phoneRegex.test(phone)) {
      setPhoneNumberError("Invalid phone number format");
      return false;
    }
    setPhoneNumberError("");
    return true;
  };

  const handleSubmit = async () => {
    const isNameValid = validateName(name);
    const isSurnameValid = validateSurname(surname);
    const isEmailValid = validateEmail(email);
    const isPhoneValid = validatePhoneNumber(phoneNumber);

    if (!isNameValid || !isSurnameValid || !isEmailValid || !isPhoneValid) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: name,
          last_name: surname,
          phone: phoneNumber,
          status: "pending_verification",
        },
      });

      if (error) throw error;

      Alert.alert(
        "Success",
        "Your verification request has been submitted. We will review it and get back to you soon."
      );
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "#F3F4F6" }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Container>
          <BackButton onPress={() => router.back()}>
            <Text style={{ fontSize: 24 }}>←</Text>
          </BackButton>

          <FormContainer>
            <Title>Account Verification</Title>
            <Subtitle>
              Please fill in your details to verify your account
            </Subtitle>

            <StyledInput
              label="Name"
              leftIcon={{
                type: "material-community",
                name: "account-outline",
                size: 22,
                color: "#27ae60",
              }}
              onChangeText={(text) => {
                setName(text);
                if (nameError) validateName(text);
              }}
              value={name}
              placeholder="Enter your first name"
              autoCapitalize="words"
              errorMessage={nameError}
              onBlur={() => validateName(name)}
            />

            <StyledInput
              label="Surname"
              leftIcon={{
                type: "material-community",
                name: "account-outline",
                size: 22,
                color: "#27ae60",
              }}
              onChangeText={(text) => {
                setSurname(text);
                if (surnameError) validateSurname(text);
              }}
              value={surname}
              placeholder="Enter your last name"
              autoCapitalize="words"
              errorMessage={surnameError}
              onBlur={() => validateSurname(surname)}
            />

            <View style={{ marginBottom: 20, marginLeft: 10 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "500",
                  marginBottom: 10,
                  color: "#2c3e50",
                }}
              >
                Contact Method:
              </Text>
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginRight: 20,
                  }}
                  onPress={() => setContactMethod("email")}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: "#27ae60",
                      marginRight: 10,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {contactMethod === "email" && (
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: "#27ae60",
                        }}
                      />
                    )}
                  </View>
                  <Text style={{ fontSize: 16, color: "#2c3e50" }}>Email</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ flexDirection: "row", alignItems: "center" }}
                  onPress={() => setContactMethod("phone")}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: "#27ae60",
                      marginRight: 10,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {contactMethod === "phone" && (
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: "#27ae60",
                        }}
                      />
                    )}
                  </View>
                  <Text style={{ fontSize: 16, color: "#2c3e50" }}>Phone</Text>
                </TouchableOpacity>
              </View>
            </View>

            {contactMethod === "email" && (
              <StyledInput
                label="Email"
                leftIcon={{
                  type: "material-community",
                  name: "email-outline",
                  size: 22,
                  color: "#27ae60",
                }}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) validateEmail(text);
                }}
                value={email}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                errorMessage={emailError}
                onBlur={() => validateEmail(email)}
              />
            )}

            {contactMethod === "phone" && (
              <StyledInput
                label="Phone Number"
                leftIcon={{
                  type: "material-community",
                  name: "phone-outline",
                  size: 22,
                  color: "#27ae60",
                }}
                onChangeText={(text) => {
                  setPhoneNumber(text);
                  if (phoneNumberError) validatePhoneNumber(text);
                }}
                value={phoneNumber}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                errorMessage={phoneNumberError}
                onBlur={() => validatePhoneNumber(phoneNumber)}
              />
            )}

            <StyledButton
              ViewComponent={LinearGradient}
              linearGradientProps={{
                colors: ["#27ae60", "#2ecc71"],
                start: { x: 0, y: 0 },
                end: { x: 1, y: 0 },
              }}
              title="Submit Verification"
              disabled={loading}
              onPress={handleSubmit}
              loading={loading}
              buttonStyle={{
                borderRadius: 10,
                padding: 12,
                marginTop: 20,
              }}
              titleStyle={{
                fontWeight: "bold",
                fontSize: 16,
              }}
            />
          </FormContainer>
        </Container>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const Container = styled.View`
  flex: 1;
  padding: 10px;
  padding-top: ${Platform.OS === "android" ? "40px" : "60px"};
`;

const BackButton = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
`;

const FormContainer = styled.View`
  background-color: #fff;
  border-radius: 15px;
  padding: 15px;
  elevation: 5;
  shadow-opacity: 0.1;
  shadow-radius: 5px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
  color: #2c3e50;
`;

const Subtitle = styled.Text`
  font-size: 16px;
  color: #7f8c8d;
  margin-bottom: 30px;
  text-align: center;
`;

const StyledInput = styled(Input)`
  margin-bottom: 5px;
`;

const StyledButton = styled(Button).attrs({
  containerStyle: {
    marginTop: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
})``;

export default DriverVerificationScreen;
