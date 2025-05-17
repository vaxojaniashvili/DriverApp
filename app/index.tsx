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

export default function Auth() {
  const [identifier, setIdentifier] = useState(""); // Email ან Phone
  const [password, setPassword] = useState(""); // პაროლი იმეილისთვის
  const [otpCode, setOtpCode] = useState(""); // OTP კოდი ტელეფონისთვის
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [otpSent, setOtpSent] = useState(false); // OTP გაგზავნილია თუ არა

  const [identifierError, setIdentifierError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [identifierType, setIdentifierType] = useState(""); // "email" ან "phone"
  const [showPassword, setShowPassword] = useState(false);

  // იდენტიფიკატორის ვალიდაცია
  const validateIdentifier = (text) => {
    console.log("ვალიდაცია დაიწყო ტექსტისთვის:", text);

    if (!text) {
      console.log("იდენტიფიკატორი ცარიელია");
      setIdentifierError("Email or phone number is required");
      setIdentifierType("");
      return false;
    }

    // Email ვალიდაცია
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // ტელეფონის ნომრის ვალიდაცია
    const phoneRegex = /^\+?[0-9]{8,15}$/;

    if (emailRegex.test(text)) {
      console.log("იდენტიფიცირებულია როგორც იმეილი");
      setIdentifierType("email");
      setIdentifierError("");
      return true;
    } else if (phoneRegex.test(text)) {
      console.log("იდენტიფიცირებულია როგორც ტელეფონი");
      setIdentifierType("phone");
      setIdentifierError("");
      return true;
    } else {
      console.log("არ გაიარა ვალიდაცია: არც ტელეფონია, არც იმეილი");
      setIdentifierError("Invalid email or phone number format");
      setIdentifierType("");
      return false;
    }
  };

  // პაროლის ვალიდაცია იმეილისთვის
  const validatePassword = (password) => {
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
  const validateOtp = (otp) => {
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
    console.log("დაიწყო OTP-ის გაგზავნა");
    console.log("ტელეფონის ნომერი:", identifier);

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

      console.log("ვცდით OTP-ის გაგზავნას ნომერზე:", phoneToUse);

      const result = await supabase.auth.signInWithOtp({
        phone: phoneToUse,
        options: {
          shouldCreateUser: false, // არ შექმნას ახალი მომხმარებელი
        },
      });

      console.log(
        "OTP გაგზავნის შედეგი:",
        JSON.stringify(result || {}, null, 2)
      );

      const { data, error } = result || {};

      if (error) {
        console.error("OTP გაგზავნის შეცდომა:", error.message);

        if (
          error.message.includes("not found") ||
          error.message.includes("doesn't exist")
        ) {
          Alert.alert(
            "შეცდომა",
            "ეს ტელეფონის ნომერი არ არის რეგისტრირებული. გთხოვთ, შეამოწმოთ ან დარეგისტრირდეთ."
          );
        } else {
          Alert.alert("შეცდომა", `OTP გაგზავნა ვერ მოხერხდა: ${error.message}`);
        }
      } else {
        console.log("OTP წარმატებით გაიგზავნა");
        setOtpSent(true);
        Alert.alert(
          "კოდი გაიგზავნა",
          "გთხოვთ, შეამოწმოთ SMS და შეიყვანოთ მიღებული კოდი"
        );
      }
    } catch (error) {
      console.error("გაუთვალისწინებელი შეცდომა OTP გაგზავნისას:", error);
      Alert.alert("შეცდომა", "OTP გაგზავნისას მოხდა გაუთვალისწინებელი შეცდომა");
    } finally {
      setLoading(false);
    }
  }

  // OTP კოდის ვერიფიკაცია ტელეფონისთვის
  async function verifyOtp() {
    console.log("OTP კოდის ვერიფიკაცია");
    console.log("შეყვანილი კოდი:", otpCode);

    const isOtpValid = validateOtp(otpCode);

    if (!isOtpValid) {
      console.log("OTP კოდი არ არის ვალიდური");
      return;
    }

    setLoading(true);

    try {
      // ტელეფონის ფორმატირება, ზუსტად როგორც გაგზავნის დროს
      let phoneToUse = identifier.startsWith("+")
        ? identifier.substring(1)
        : identifier;

      console.log("ვერიფიკაცია ტელეფონით:", phoneToUse);
      console.log("შეყვანილი კოდი:", otpCode);

      const result = await supabase.auth.verifyOtp({
        phone: phoneToUse,
        token: otpCode,
        type: "sms",
      });

      console.log(
        "OTP ვერიფიკაციის შედეგი:",
        JSON.stringify(result || {}, null, 2)
      );

      const { data, error } = result || {};

      if (error) {
        console.error("OTP ვერიფიკაციის შეცდომა:", error.message);
        Alert.alert(
          "შეცდომა",
          `კოდის ვერიფიკაცია ვერ მოხერხდა: ${error.message}`
        );
      } else if (data?.user) {
        console.log(
          "წარმატებული OTP ავთენტიკაცია, მომხმარებლის ID:",
          data.user.id
        );
        router.push("/homepage");
      } else {
        console.log("უცნაური პასუხი - არც შეცდომა, არც მომხმარებელი");
        Alert.alert(
          "შეცდომა",
          "ვერიფიკაცია ვერ მოხერხდა. გთხოვთ, სცადოთ თავიდან."
        );
      }
    } catch (error) {
      console.error("გაუთვალისწინებელი შეცდომა OTP ვერიფიკაციისას:", error);
      Alert.alert(
        "შეცდომა",
        "კოდის ვერიფიკაციისას მოხდა გაუთვალისწინებელი შეცდომა"
      );
    } finally {
      setLoading(false);
    }
  }

  // იმეილით ავტორიზაცია (ძველი მეთოდით)
  async function signInWithEmail() {
    console.log("დაიწყო იმეილით ავტორიზაცია");
    console.log("იმეილი:", identifier);

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

      console.log(
        "იმეილით ავტორიზაციის შედეგი:",
        JSON.stringify(result || {}, null, 2)
      );

      const { data, error } = result || {};

      if (error) {
        console.error("ავთენტიკაციის შეცდომა:", error.message);
        Alert.alert("შეცდომა", `Authentication failed: ${error.message}`);
      } else if (data?.user) {
        console.log("წარმატებული ავტორიზაცია, მომხმარებლის ID:", data.user.id);
        router.push("/homepage");
      } else {
        console.log("უცნაური პასუხი - არც შეცდომა, არც მომხმარებელი");
        Alert.alert(
          "შეცდომა",
          "ავთენტიკაცია ვერ მოხერხდა. გთხოვთ, სცადოთ თავიდან."
        );
      }
    } catch (error) {
      console.error("გაუთვალისწინებელი შეცდომა:", error);
      Alert.alert("შეცდომა", "ავთენტიკაციისას მოხდა გაუთვალისწინებელი შეცდომა");
    } finally {
      setLoading(false);
    }
  }

  // დაბრუნება OTP შეყვანის ეკრანიდან
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
