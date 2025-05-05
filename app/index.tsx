import React, { useState, useEffect } from "react";
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

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

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

  async function signInWithEmail() {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        Alert.alert("Error", error.message);
      } else {
        router.push("/homepage");
      }
    } catch (error) {
      Alert.alert("Error", "Authentication error occurred");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);

    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          // console.error("Session retrieval error:", error);
          return;
        }

        if (data.session) {
          setSession(data.session);
          router.push("/homepage");
        } else {
          console.log("No active session");
        }
      } catch (e) {
        console.error("Exception checking session:", e);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      setSession(session);

      if (session) {
        router.push("/homepage");
      }
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
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
          <AppName>Thevanapp Driver</AppName>
          <FormContainer>
            {loading ? (
              <ActivityIndicator size="large" color="#27ae60" />
            ) : (
              <>
                <Title>Please enter your credentials</Title>

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
                  placeholder="email@address.com"
                  autoCapitalize="none"
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
                  placeholder="Password"
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
              </>
            )}
          </FormContainer>
        </Container>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
