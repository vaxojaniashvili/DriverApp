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
  const [password, setPassword] = useState(""); // პაროლი იმეილისთვის
  const [otpCode, setOtpCode] = useState(""); // OTP კოდი ტელეფონისთვის
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [otpSent, setOtpSent] = useState(false); // OTP გაგზავნილია თუ არა

  const [identifierError, setIdentifierError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [identifierType, setIdentifierType] = useState(""); // "email" ან "phone"
  const [showPassword, setShowPassword] = useState(false);

  // Zustand store for session management
  const {
    loadSessionFromStorage,
    setSession: setStoreSession,
    setUser: setStoreUser,
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

  // პაროლის ვალიდაცია იმეილისთვის
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

  // OTP კოდის ვალიდაცია ტელეფონისთვის
  const validateOtp = (otp: string) => {
    if (!otp) {
      setOtpError("OTP code is required");
      return false;
    } else if (otp.length < 6) {
      setOtpError("Please enter the complete OTP code");
      return false;
    }
    setOtpError("");
    return true;
  };

  // OTP კოდის გაგზავნა
  async function sendOtp() {
    const isIdentifierValid = validateIdentifier(identifier);

    if (!isIdentifierValid || identifierType !== "phone") {
      console.log("ვალიდაცია ვერ გაიარა, OTP ვერ გაიგზავნა");
      return;
    }

    setLoading(true);

    try {
      // ტელეფონის ფორმატირება - Supabase-ში ინახება + გარეშე
      let phoneToUse = identifier.startsWith("+")
        ? identifier.substring(1)
        : identifier;

      const result = await supabase.auth.signInWithOtp({
        phone: phoneToUse,
        options: {
          shouldCreateUser: false, // არ შექმნას ახალი მომხმარებელი
        },
      });

      const { data, error } = result || {};

      if (error) {
        // console.error("OTP sending error:", error.message);

        if (
          error.message.includes("not found") ||
          error.message.includes("doesn't exist")
        ) {
          Alert.alert(
            "error",
            "This phone number is not registered. Please check or register."
          );
        } else {
          Alert.alert("error", `OTP can not sended: ${error.message}`);
        }
      } else {
        setOtpSent(true);
        Alert.alert(
          "Code sent",
          "Please check your SMS and enter the code you received"
        );
      }
    } catch (error) {
      console.error("Unexpected error while sending OTP:", error);
      Alert.alert("error", "OTP Unexpected error while sending OTP:");
    } finally {
      setLoading(false);
    }
  }

  // OTP კოდის ვერიფიკაცია ტელეფონისთვის
  async function verifyOtp() {
    const isOtpValid = validateOtp(otpCode);

    if (!isOtpValid) {
      console.log("OTP კოდი არ არის ვალიდური");
      return;
    }

    setLoading(true);

    try {
      let phoneToUse = identifier.startsWith("+")
        ? identifier.substring(1)
        : identifier;

      const result = await supabase.auth.verifyOtp({
        phone: phoneToUse,
        token: otpCode,
        type: "sms",
      });

      const { data, error } = result || {};

      if (error) {
        console.error("OTP error:", error.message);
        Alert.alert("error", `error: ${error.message}`);
      } else if (data?.user) {
        console.log("success", data.user.id);

        // Store session in Zustand store and AsyncStorage
        if (data.session) {
          console.log("Storing session after OTP verification");
          await setStoreSession(data.session);
          await setStoreUser(data.user);
          console.log("Session stored successfully after OTP verification");
        }

        router.push("/homepage");
      } else {
        Alert.alert("error", "error");
      }
    } catch (error) {
      console.error("unexpected error:", error);
      Alert.alert("error", "error");
    } finally {
      setLoading(false);
    }
  }

  // იმეილით ავტორიზაცია (ძველი მეთოდით)
  async function signInWithEmail() {
    const isIdentifierValid = validateIdentifier(identifier);
    const isPasswordValid = validatePassword(password);

    if (!isIdentifierValid || !isPasswordValid || identifierType !== "email") {
      console.log("ვალიდაცია ვერ გაიარა, ავტორიზაცია შეწყდა");
      return;
    }

    setLoading(true);

    try {
      console.log("იმეილით ავტორიზაციის მცდელობა:", identifier);

      const result = await supabase.auth.signInWithPassword({
        email: identifier,
        password: password,
      });

      const { data, error } = result || {};

      if (error) {
        Alert.alert("error", `Authentication failed: ${error.message}`);
      } else if (data?.user) {
        console.log("success", data.user.id);

        // Store session in Zustand store and AsyncStorage
        if (data.session) {
          console.log("Storing session after email sign in");
          await setStoreSession(data.session);
          await setStoreUser(data.user);
          console.log("Session stored successfully after email sign in");
        }

        router.push("/homepage");
      } else {
        Alert.alert("error", "error");
      }
    } catch (error) {
      console.error("error:", error);
      Alert.alert("error", "error");
    } finally {
      setLoading(false);
    }
  }

  const goBack = () => {
    setOtpSent(false);
    setOtpCode("");
    setOtpError("");
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    setLoading(true);

    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Session retrieval error:", error);
          return;
        }

        if (!data.session) {
          console.log("No active session found");
          // router.push("/signUp");
          return;
        }

        console.log("Active session found:", data.session.user?.id);
        setSession(data.session);

        // Fetch user and check status
        const { data: userData } = await supabase.auth.getUser();
        const status = userData?.user?.user_metadata?.status;
        console.log("User status:", status);

        // if (status === "active" || status === "complete") {
        //   console.log("Redirecting to homepage - user is active/complete");
        //   router.push("/homepage");
        // } else {
        //   console.log(
        //     "Redirecting to driverVerification - user is incomplete or no status"
        //   );
        //   router.push("/(tabs)/driverVerification");
        // }
      } catch (e) {
        console.error("Exception checking session:", e);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);

      if (session) {
        console.log("Session detected in auth state change");
        setSession(session);

        // Fetch user and check status
        const { data: userData } = await supabase.auth.getUser();
        const status = userData?.user?.user_metadata?.status;
        console.log("User status in auth state change:", status);

        if (status === "active" || status === "complete") {
          console.log("Redirecting to homepage from auth state change");
          router.push("/homepage");
        } else {
          console.log(
            "Redirecting to driverVerification from auth state change"
          );
          router.push("/driverVerification");
        }
      } else {
        console.log("No session in auth state change");
        // router.push("/signUp");
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

  // ღილაკი იმეილით ან ტელეფონით ავტორიზაციისთვის
  // ღილაკი იმეილით ან ტელეფონით ავტორიზაციისთვის
  const renderSignInButton = () => {
    if (identifierType === "email") {
      return (
        <StyledButton
          ViewComponent={LinearGradient}
          linearGradientProps={{
            colors: ["#27ae60", "#2ecc71"],
            start: { x: 0, y: 0 },
            end: { x: 1, y: 0 },
          }}
          title="Sign In with Email"
          disabled={loading}
          onPress={() => signInWithEmail()}
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
      );
    } else if (identifierType === "phone") {
      return (
        <StyledButton
          ViewComponent={LinearGradient}
          linearGradientProps={{
            colors: ["#27ae60", "#2ecc71"],
            start: { x: 0, y: 0 },
            end: { x: 1, y: 0 },
          }}
          title="Get SMS Code"
          disabled={loading}
          onPress={() => sendOtp()}
          icon={{
            name: "message-text-outline",
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
      );
    } else {
      // იმ შემთხვევაში თუ ჯერ არავითარი ტიპი არ არის იდენტიფიცირებული
      return (
        <StyledButton
          ViewComponent={LinearGradient}
          linearGradientProps={{
            colors: ["#27ae60", "#2ecc71"],
            start: { x: 0, y: 0 },
            end: { x: 1, y: 0 },
          }}
          title="Continue"
          disabled={!identifier} // გააქტიურდება თუ იდენტიფიკატორი ცარიელი არ არის
          onPress={() => {
            // თუ დააკლიკებენ Continue-ზე, გავუშვებთ ვალიდაციას
            const isValid = validateIdentifier(identifier);
            if (isValid && identifierType === "email") {
              signInWithEmail();
            } else if (isValid && identifierType === "phone") {
              sendOtp();
            }
          }}
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
      );
    }
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
                {!otpSent ? (
                  // პირველი ეკრანი - იმეილით ან ტელეფონით ავთენტიკაცია
                  <>
                    <Title>Please enter your credentials</Title>

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

                    {/* პაროლის ველი მხოლოდ იმეილისთვის */}
                    {identifierType === "email" && (
                      <>
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
                            name: showPassword
                              ? "eye-off-outline"
                              : "eye-outline",
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
                          placeholder="Enter a password"
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
                        {passwordError ? (
                          <ErrorText>{passwordError}</ErrorText>
                        ) : null}

                        <TouchableOpacity
                          onPress={() =>
                            Alert.alert(
                              "Contact Us",
                              "Please contact administration to reset your password"
                            )
                          }
                        >
                          <ForgotPasswordText>
                            Forgot Password?
                          </ForgotPasswordText>
                        </TouchableOpacity>
                      </>
                    )}

                    {/* დინამიური ღილაკი */}
                    {renderSignInButton()}
                  </>
                ) : (
                  // მეორე ეკრანი - OTP კოდის შეყვანა (მხოლოდ ტელეფონისთვის)
                  <>
                    <Title>Enter verification code</Title>
                    <Text
                      style={{
                        textAlign: "center",
                        marginBottom: 20,
                        color: "#7f8c8d",
                      }}
                    >
                      Enter the 6-digit code sent to {identifier}
                    </Text>

                    <StyledInput
                      label="Verification Code"
                      leftIcon={{
                        type: "material-community",
                        name: "numeric",
                        size: 22,
                        color: "#27ae60",
                      }}
                      onChangeText={(text) => {
                        setOtpCode(text);
                        if (otpError) validateOtp(text);
                      }}
                      value={otpCode}
                      placeholder="Enter verification code"
                      keyboardType="number-pad"
                      inputStyle={{
                        paddingLeft: 10,
                        paddingTop: 5,
                        letterSpacing: 2,
                      }}
                      labelStyle={{ color: "#2c3e50", fontWeight: "normal" }}
                      inputContainerStyle={{
                        borderColor: otpError ? "#e74c3c" : "#ddd",
                        borderBottomWidth: 1,
                      }}
                    />
                    {otpError ? <ErrorText>{otpError}</ErrorText> : null}

                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginTop: 10,
                      }}
                    >
                      <TouchableOpacity onPress={goBack}>
                        <Text style={{ color: "#7f8c8d", fontSize: 15 }}>
                          Change number
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={sendOtp}>
                        <Text style={{ color: "#3498db", fontSize: 15 }}>
                          Resend code
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <StyledButton
                      ViewComponent={LinearGradient}
                      linearGradientProps={{
                        colors: ["#27ae60", "#2ecc71"],
                        start: { x: 0, y: 0 },
                        end: { x: 1, y: 0 },
                      }}
                      title="Verify & Log In"
                      disabled={loading}
                      onPress={() => verifyOtp()}
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
                        marginTop: 20,
                      }}
                      titleStyle={{
                        fontWeight: "bold",
                        fontSize: 16,
                      }}
                    />
                  </>
                )}

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
