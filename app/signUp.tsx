import React, { useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
} from "react-native";
import { supabase } from "../infrastructure/db/supabase";
import { Button, Input, Icon } from "@rneui/themed";
import { router } from "expo-router";
import styled from "styled-components/native";
import { KeyboardAvoidingView, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [fullNameError, setFullNameError] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");

  const validateEmail = (email: string) => {
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

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError("Password is required");
      return false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const validateConfirmPassword = (confirmPass: string) => {
    if (!confirmPass) {
      setConfirmPasswordError("Please confirm your password");
      return false;
    } else if (confirmPass !== password) {
      setConfirmPasswordError("Passwords do not match");
      return false;
    }
    setConfirmPasswordError("");
    return true;
  };

  const validateFullName = (name: string) => {
    if (!name.trim()) {
      setFullNameError("Full name is required");
      return false;
    }
    setFullNameError("");
    return true;
  };

  const validatePhoneNumber = (phone: string) => {
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

  async function signUpWithEmail() {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);
    const isFullNameValid = validateFullName(fullName);
    const isPhoneNumberValid = validatePhoneNumber(phoneNumber);

    if (
      !isEmailValid ||
      !isPasswordValid ||
      !isConfirmPasswordValid ||
      !isFullNameValid ||
      !isPhoneNumberValid
    ) {
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName,
            phone: phoneNumber,
          },
        },
      });

      if (error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert(
          "Registration Successful",
          "Your account has been created. Please check your email for verification instructions.",
          [
            {
              text: "OK",
              onPress: () => router.push("/"),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert("Error", "Registration error occurred");
    } finally {
      setLoading(false);
    }
  }

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const navigateToSignIn = () => {
    router.push("/");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : null}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      enabled={Platform.OS === "ios"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        <Container>
          <LogoContainer>
            <Icon
              name="truck-delivery"
              type="material-community"
              color="#fff"
              size={50}
            />
          </LogoContainer>
          <FormContainer>
            {loading ? (
              <ActivityIndicator size="large" color="#27ae60" />
            ) : (
              <>
                <Title>Create New Account</Title>

                <StyledInput
                  label="Full Name"
                  leftIcon={{
                    type: "material-community",
                    name: "account-outline",
                    size: 22,
                    color: "#27ae60",
                  }}
                  onChangeText={(text) => {
                    setFullName(text);
                    if (fullNameError) validateFullName(text);
                  }}
                  value={fullName}
                  placeholder="Enter your full name"
                  autoCapitalize="words"
                  inputStyle={{ paddingLeft: 10 }}
                  labelStyle={{ color: "#2c3e50", fontWeight: "normal" }}
                  inputContainerStyle={{
                    borderColor: fullNameError ? "#e74c3c" : "#ddd",
                    borderBottomWidth: 1,
                  }}
                  onBlur={() => validateFullName(fullName)}
                />
                {fullNameError ? <ErrorText>{fullNameError}</ErrorText> : null}

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
                  autoCapitalize="none"
                  keyboardType="email-address"
                  inputStyle={{ paddingLeft: 10 }}
                  labelStyle={{ color: "#2c3e50", fontWeight: "normal" }}
                  inputContainerStyle={{
                    borderColor: emailError ? "#e74c3c" : "#ddd",
                    borderBottomWidth: 1,
                  }}
                  onBlur={() => validateEmail(email)}
                />
                {emailError ? <ErrorText>{emailError}</ErrorText> : null}

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
                  inputStyle={{ paddingLeft: 10 }}
                  labelStyle={{ color: "#2c3e50", fontWeight: "normal" }}
                  inputContainerStyle={{
                    borderColor: phoneNumberError ? "#e74c3c" : "#ddd",
                    borderBottomWidth: 1,
                  }}
                  onBlur={() => validatePhoneNumber(phoneNumber)}
                />
                {phoneNumberError ? (
                  <ErrorText>{phoneNumberError}</ErrorText>
                ) : null}

                <StyledInput
                  label="Password"
                  leftIcon={{
                    type: "material-community",
                    name: "lock-outline",
                    size: 22,
                    color: "#27ae60",
                  }}
                  rightIcon={{
                    type: "material-community",
                    name: showPassword ? "eye-off-outline" : "eye-outline",
                    size: 22,
                    color: "#95a5a6",
                    onPress: toggleShowPassword,
                  }}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) validatePassword(text);
                    if (confirmPassword && confirmPasswordError)
                      validateConfirmPassword(confirmPassword);
                  }}
                  value={password}
                  secureTextEntry={!showPassword}
                  placeholder="Create a password"
                  autoCapitalize="none"
                  inputStyle={{ paddingLeft: 10 }}
                  labelStyle={{ color: "#2c3e50", fontWeight: "normal" }}
                  inputContainerStyle={{
                    borderColor: passwordError ? "#e74c3c" : "#ddd",
                    borderBottomWidth: 1,
                  }}
                  onBlur={() => validatePassword(password)}
                />
                {passwordError ? <ErrorText>{passwordError}</ErrorText> : null}

                <StyledInput
                  label="Confirm Password"
                  leftIcon={{
                    type: "material-community",
                    name: "lock-outline",
                    size: 22,
                    color: "#27ae60",
                  }}
                  rightIcon={{
                    type: "material-community",
                    name: showConfirmPassword
                      ? "eye-off-outline"
                      : "eye-outline",
                    size: 22,
                    color: "#95a5a6",
                    onPress: toggleShowConfirmPassword,
                  }}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (confirmPasswordError) validateConfirmPassword(text);
                  }}
                  value={confirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  placeholder="Confirm your password"
                  autoCapitalize="none"
                  inputStyle={{ paddingLeft: 10 }}
                  labelStyle={{ color: "#2c3e50", fontWeight: "normal" }}
                  inputContainerStyle={{
                    borderColor: confirmPasswordError ? "#e74c3c" : "#ddd",
                    borderBottomWidth: 1,
                  }}
                  onBlur={() => validateConfirmPassword(confirmPassword)}
                />
                {confirmPasswordError ? (
                  <ErrorText>{confirmPasswordError}</ErrorText>
                ) : null}

                <StyledButton
                  ViewComponent={LinearGradient}
                  linearGradientProps={{
                    colors: ["#27ae60", "#2ecc71"],
                    start: { x: 0, y: 0 },
                    end: { x: 1, y: 0 },
                  }}
                  title="Sign Up"
                  disabled={loading}
                  onPress={() => signUpWithEmail()}
                  icon={{
                    name: "account-plus",
                    type: "material-community",
                    size: 20,
                    color: "white",
                  }}
                  iconRight
                  buttonStyle={{
                    borderRadius: 10,
                    padding: 12,
                  }}
                  titleStyle={{
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                />

                <SignInContainer>
                  <SignInText>Already have an account?</SignInText>
                  <TouchableOpacity onPress={navigateToSignIn}>
                    <SignInButtonText>Sign In</SignInButtonText>
                  </TouchableOpacity>
                </SignInContainer>
              </>
            )}
          </FormContainer>
        </Container>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 20px;
  padding-top: ${Platform.OS === "android" ? "" : "80px"};
`;

const FormContainer = styled.View`
  width: 100%;
  max-width: 420px;
  padding: 25px;
  background-color: #fff;
  border-radius: 15px;
  elevation: 5;
  shadow-opacity: 0.3;
  shadow-radius: 5px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  margin-bottom: 20px;
`;

const StyledInput = styled(Input)`
  margin-bottom: 5px;
`;

const StyledButton = styled(Button).attrs({
  containerStyle: {
    marginTop: 15,
    marginBottom: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
})``;

const Title = styled.Text`
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
  color: #2c3e50;
`;

const AppName = styled.Text`
  font-size: 32px;
  font-weight: bold;
  color: #27ae60;
  margin-bottom: 30px;
  text-align: center;
  letter-spacing: 1px;
`;

const LogoContainer = styled.View`
  width: 100px;
  height: 100px;
  background-color: #27ae60;
  border-radius: 50px;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  elevation: 5;
  shadow-opacity: 0.3;
  shadow-radius: 5px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
`;

const ErrorText = styled.Text`
  color: #e74c3c;
  font-size: 12px;
  margin-left: 10px;
  margin-top: -5px;
  margin-bottom: 5px;
`;

const SignInContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: 15px;
`;

const SignInText = styled.Text`
  color: #7f8c8d;
  font-size: 14px;
  margin-right: 5px;
`;

const SignInButtonText = styled.Text`
  color: #27ae60;
  font-size: 15px;
  font-weight: bold;
`;
