import React, { useState, useEffect } from "react";
import {
  Alert,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import { supabase } from "../infrastructure/db/supabase";
import { Button, Input, Icon } from "@rneui/themed";
import { router } from "expo-router";
import styled from "styled-components/native";
import { KeyboardAvoidingView, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Session } from "@supabase/supabase-js";
import { useAuthStore } from "@/infrastructure/store/store";

export default function Auth() {
  const [identifier, setIdentifier] = useState(""); // Email ან Phone
  const [password, setPassword] = useState(""); // პაროლი
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  const [identifierError, setIdentifierError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [identifierType, setIdentifierType] = useState(""); // "email" ან "phone"
  const [showPassword, setShowPassword] = useState(false);

  // Zustand store for session management
  const {
    loadSessionFromStorage,
    setSession: setStoreSession,
    setUser: setStoreUser,
    userIndicator,
    setUserIndicator,
    userStatus,
  } = useAuthStore();

  // იდენტიფიკატორის ვალიდაცია
  const validateIdentifier = (text: string) => {
    if (!text) {
      setIdentifierError("Email or phone number is required");
      setIdentifierType("");
      return false;
    }

    // Email ვალიდაცია
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // ტელეფონის ნომრის ვალიდაცია
    const phoneRegex = /^\+?[0-9]{8,15}$/;

    if (emailRegex.test(text)) {
      setIdentifierType("email");
      setIdentifierError("");
      return true;
    } else if (phoneRegex.test(text)) {
      setIdentifierType("phone");
      setIdentifierError("");
      return true;
    } else {
      setIdentifierError("Invalid email or phone number format");
      setIdentifierType("");
      return false;
    }
  };

  // პაროლის ვალიდაცია
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

  const navigateBasedOnUserStatus = async (user: any) => {
    console.log("🔄 Checking user status for navigation...");

    // Store-იდან status check
    if (userIndicator === "active" || userStatus === "active") {
      console.log("✅ User verified in store, going to homepage");
      router.push("/(tabs)/homepage");
      return;
    }

    // User metadata-დან status check
    const userMetadataStatus = user?.user_metadata?.status;
    if (userMetadataStatus === "active" || userMetadataStatus === "complete") {
      console.log("✅ User verified in metadata, going to homepage");
      setUserIndicator("active"); // Store-ში განახლება
      router.push("/(tabs)/homepage");
    } else {
      console.log("❌ User not verified, going to verification");
      setUserIndicator("inactive"); // Store-ში განახლება
      router.push("/driverVerification");
    }
  };

  // ✅ ერთიანი Sign In function - email ან phone + password
  // ✅ Auth component-ში signIn function-ის განახლება

  async function signIn() {
    const isIdentifierValid = validateIdentifier(identifier);
    const isPasswordValid = validatePassword(password);

    if (!isIdentifierValid || !isPasswordValid) {
      console.log("ვალიდაცია ვერ გაიარა, ავტორიზაცია შეწყდა");
      return;
    }

    setLoading(true);

    try {
      console.log("=== LOGIN ATTEMPT ===");
      console.log("Input identifier:", identifier);
      console.log("Identifier type:", identifierType);

      let result;

      if (identifierType === "email") {
        result = await supabase.auth.signInWithPassword({
          email: identifier,
          password: password,
        });
      } else if (identifierType === "phone") {
        // ✅ Smart phone format matching
        let phonesToTry = [];

        // Remove all non-digit characters except +
        let cleanPhone = identifier.replace(/[^\d+]/g, "");

        // Generate all possible formats
        if (cleanPhone.startsWith("+")) {
          // Input has +, try with and without
          phonesToTry = [
            cleanPhone, // +918683815829
            cleanPhone.substring(1), // 918683815829
          ];
        } else {
          // Input doesn't have +, try both ways
          phonesToTry = [
            cleanPhone, // 918683815829
            "+" + cleanPhone, // +918683815829
          ];
        }

        // ✅ Try each format until one works
        let loginSuccess = false;

        for (let phoneToTry of phonesToTry) {
          console.log(`Trying phone format: "${phoneToTry}"`);

          try {
            result = await supabase.auth.signInWithPassword({
              phone: phoneToTry,
              password: password,
            });

            if (!result.error) {
              console.log(`✅ Login successful with format: "${phoneToTry}"`);
              loginSuccess = true;
              break;
            } else {
              console.log(
                `❌ Failed with format: "${phoneToTry}" - ${result.error.message}`
              );
            }
          } catch (tryError) {
            console.log(
              `❌ Exception with format: "${phoneToTry}" - ${tryError.message}`
            );
          }
        }

        // If all formats failed, use the last result for error handling
        if (!loginSuccess && result?.error) {
          console.log("All phone formats failed");
        }
      }

      const { data, error } = result || {};

      if (error) {
        console.error("Authentication error:", error.message);

        if (error.message.includes("Invalid login credentials")) {
          Alert.alert(
            "Login Failed",
            `Credentials don't match.\n\nTrying with phone: ${identifier}\nStored in database: 918683815829\n\nPlease try:\n• 918683815829\n• +918683815829`
          );
        } else if (error.message.includes("Email not confirmed")) {
          Alert.alert(
            "Email Not Verified",
            "Please check your email and click the verification link before signing in."
          );
        } else {
          Alert.alert("Error", `Authentication failed: ${error.message}`);
        }
      } else if (data?.user) {
        console.log("Authentication successful:", data.user.id);

        // Store session in Zustand store and AsyncStorage
        if (data.session) {
          console.log("Storing session after authentication");
          await setStoreSession(data.session);
          await setStoreUser(data.user);
          console.log("Session stored successfully after authentication");
        }

        // ✅ Store-ის მეშვეობით navigation
        await navigateBasedOnUserStatus(data.user);
      } else {
        Alert.alert("Error", "Authentication failed");
      }
    } catch (error) {
      console.error("Unexpected authentication error:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    setLoading(true);

    const checkSession = async () => {
      try {
        // ✅ პირველ რიგში Store-იდან შევამოწმოთ
        await loadSessionFromStorage();

        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Session retrieval error:", error);
          return;
        }

        if (!data.session) {
          console.log("No active session found");
          return;
        }

        console.log("Active session found:", data.session.user?.id);

        // Store-ში შენახვა
        await setStoreSession(data.session);
        await setStoreUser(data.session.user);

        // ✅ Store-ის მეშვეობით navigation
        await navigateBasedOnUserStatus(data.session.user);
      } catch (e) {
        console.error("Exception checking session:", e);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // ✅ Auth state change listener-ი
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);

      if (session) {
        console.log("Session detected in auth state change");

        // Store-ში შენახვა
        await setStoreSession(session);
        await setStoreUser(session.user);

        // ✅ Store-ის მეშვეობით navigation
        await navigateBasedOnUserStatus(session.user);
      } else {
        console.log("No session in auth state change");
      }
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const navigateToSignUp = () => {
    router.push("/signUp");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
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
          <AppName>TheVanApp Driver</AppName>
          <FormContainer>
            {loading ? (
              <ActivityIndicator size="large" color="#27ae60" />
            ) : (
              <>
                <Title>Welcome Back</Title>

                <StyledInput
                  label="Email or Phone Number"
                  leftIcon={{
                    type: "material-community",
                    name:
                      identifierType === "phone"
                        ? "phone-outline"
                        : "email-outline",
                    size: 22,
                    color: "#27ae60",
                  }}
                  onChangeText={(text) => {
                    setIdentifier(text);
                    validateIdentifier(text); // ყოველ ცვლილებაზე ვალიდაცია
                  }}
                  value={identifier}
                  placeholder="Enter email or phone number"
                  autoCapitalize="none"
                  inputStyle={{ paddingLeft: 10, paddingTop: 5 }}
                  labelStyle={{ color: "#2c3e50", fontWeight: "normal" }}
                  inputContainerStyle={{
                    borderColor: identifierError ? "#e74c3c" : "#ddd",
                    borderBottomWidth: 1,
                  }}
                />
                {identifierError ? (
                  <ErrorText>{identifierError}</ErrorText>
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
                  }}
                  value={password}
                  secureTextEntry={!showPassword}
                  placeholder="Enter your password"
                  autoCapitalize="none"
                  inputStyle={{ paddingLeft: 10, paddingTop: 5 }}
                  labelStyle={{
                    color: "#2c3e50",
                    fontWeight: "normal",
                  }}
                  inputContainerStyle={{
                    borderColor: passwordError ? "#e74c3c" : "#ddd",
                    borderBottomWidth: 1,
                  }}
                  onBlur={() => validatePassword(password)}
                />
                {passwordError ? <ErrorText>{passwordError}</ErrorText> : null}

                <TouchableOpacity
                  onPress={() =>
                    Alert.alert(
                      "Contact Us",
                      "Please contact administration to reset your password"
                    )
                  }
                >
                  <ForgotPasswordText>Forgot Password?</ForgotPasswordText>
                </TouchableOpacity>

                <StyledButton
                  ViewComponent={LinearGradient}
                  linearGradientProps={{
                    colors: ["#27ae60", "#2ecc71"],
                    start: { x: 0, y: 0 },
                    end: { x: 1, y: 0 },
                  }}
                  title="Sign In"
                  disabled={loading}
                  onPress={signIn}
                  icon={{
                    name: "login",
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

                <SignUpContainer>
                  <SignUpText>Don't have an account?</SignUpText>
                  <TouchableOpacity onPress={navigateToSignUp}>
                    <SignUpButtonText>Sign Up</SignUpButtonText>
                  </TouchableOpacity>
                </SignUpContainer>
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

const ForgotPasswordText = styled.Text`
  color: #3498db;
  text-align: right;
  margin-top: -5px;
  margin-bottom: 10px;
  font-size: 14px;
`;

const SignUpContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: 15px;
`;

const SignUpText = styled.Text`
  color: #7f8c8d;
  font-size: 14px;
  margin-right: 5px;
`;

const SignUpButtonText = styled.Text`
  color: #27ae60;
  font-size: 15px;
  font-weight: bold;
`;
