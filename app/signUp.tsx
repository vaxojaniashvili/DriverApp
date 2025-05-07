import React, { useState, useEffect, useRef } from "react";
import {
  Alert,
  Platform,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  TextInput,
} from "react-native";
import { supabase } from "../infrastructure/db/supabase";
import { Button, Input, Icon } from "@rneui/themed";
import { router } from "expo-router";
import styled from "styled-components/native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DriverSignUp() {
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [city, setCity] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [contactMethod, setContactMethod] = useState("email");
  const [vanOption, setVanOption] = useState("");

  // Verification state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const otpInputRefs = useRef([]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Current registration step
  const [currentStep, setCurrentStep] = useState(1);

  // Form validation errors - Split full name errors
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [nameError, setNameError] = useState("");
  const [surnameError, setSurnameError] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [cityError, setCityError] = useState("");
  const [vanOptionError, setVanOptionError] = useState("");

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const isVerified = await AsyncStorage.getItem(
          "authentication_verified"
        );
        const nextStep = await AsyncStorage.getItem("next_step");

        if (isVerified === "true" && nextStep === "2") {
          setIsVerifying(false);
          setCurrentStep(2);

          // გავასუფთაოთ AsyncStorage, რომ არ მოხდეს ხელახლა ავტომატური გადასვლა
          await AsyncStorage.removeItem("authentication_verified");
          await AsyncStorage.removeItem("next_step");
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      }
    };

    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (otpInputRefs.current.length < 6) {
      otpInputRefs.current = Array(6)
        .fill()
        .map((_, i) => otpInputRefs.current[i] || React.createRef());
    }
  }, []);

  useEffect(() => {
    if (timer > 0 && isVerifying) {
      const timerId = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (timer === 0) {
      setCanResend(true);
    }
  }, [timer, isVerifying]);

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

  const validateConfirmPassword = (confirmPass) => {
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

  // Split validation for name and surname
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

  const validateVanOption = (option) => {
    if (!option) {
      setVanOptionError("Please select an option");
      return false;
    }
    setVanOptionError("");
    return true;
  };

  const handleOtpChange = (text, index) => {
    if (/^\d*$/.test(text)) {
      const newOtpDigits = [...otpDigits];
      newOtpDigits[index] = text;
      setOtpDigits(newOtpDigits);

      if (text && index < 5) {
        otpInputRefs.current[index + 1].focus();
      }
    }
  };

  const handleOtpKeyPress = (event, index) => {
    if (
      event.nativeEvent.key === "Backspace" &&
      !otpDigits[index] &&
      index > 0
    ) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  const sendVerificationCode = async () => {
    const isEmailValid = validateEmail(email);
    const isPhoneValid = validatePhoneNumber(phoneNumber);
    const isNameValid = validateName(name);
    const isSurnameValid = validateSurname(surname);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);
    const isVanOptionValid = validateVanOption(vanOption);

    if (
      !isEmailValid ||
      !isPhoneValid ||
      !isNameValid ||
      !isSurnameValid ||
      !isPasswordValid ||
      !isConfirmPasswordValid ||
      !isVanOptionValid
    ) {
      return;
    }

    setLoading(true);
    try {
      // პირველი შევამოწმოთ არსებობს თუ არა უკვე მომხმარებელი
      const { data: checkData } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: "dummy_password", // მცდარი პაროლი რომ მხოლოდ არსებობა შევამოწმოთ
      });

      if (checkData?.user) {
        // მომხმარებელი უკვე არსებობს
        Alert.alert("Error", "User already exists. Please sign in instead.");
        setLoading(false);
        return;
      }

      // ახალი მომხმარებლის შექმნა
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password: password,
          options: {
            data: {
              full_name: `${name} ${surname}`,
              phone: phoneNumber,
              van_option: vanOption,
              user_type: "driver",
              status: "incomplete",
            },
            emailRedirectTo:
              Platform.OS === "web"
                ? `${window.location.origin}/authentication`
                : "thevanapp://authentication/verify",
          },
        });

      if (signUpError) {
        console.error("SignUp Error:", signUpError);
        Alert.alert("Error", signUpError.message);
        setLoading(false);
        return;
      }

      // შევამოწმოთ მომხმარებელი შეიქმნა თუ არა
      if (signUpData?.user) {
        // თუ confirmation email არ გაიგზავნა ავტომატურად, ვცდით OTP-ს
        if (!signUpData.session) {
          console.log("No session, trying OTP method...");

          const { error: otpError } = await supabase.auth.signInWithOtp({
            email: email.trim().toLowerCase(),
            options: {
              shouldCreateUser: false,
              emailRedirectTo:
                Platform.OS === "web"
                  ? `${window.location.origin}/authentication`
                  : "thevanapp://authentication/verify",
            },
          });

          if (otpError) {
            console.error("OTP Error:", otpError);
            Alert.alert("Error", otpError.message);
            setLoading(false);
            return;
          }
        }

        setVerificationSent(true);
        setIsVerifying(true);
        setTimer(60);
        setCanResend(false);

        Alert.alert(
          "Verification Sent",
          "Verification email sent. Please check your inbox and spam folder."
        );
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      Alert.alert(
        "Error",
        "Failed to send verification email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  const verifyOtp = async () => {
    const otpValue = otpDigits.join("");
    if (otpValue.length !== 6) {
      Alert.alert("Error", "Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);
    try {
      setIsVerifying(false);
      setCurrentStep(2);
    } catch (error) {
      Alert.alert("Error", "Failed to verify code");
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationCode = async () => {
    if (!canResend) return;

    setLoading(true);
    try {
      // უბრალოდ ხელახლა ვაგზავნით ვერიფიკაციის იმეილს
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim().toLowerCase(),
      });

      if (error) {
        Alert.alert("Error", error.message);
        setLoading(false);
        return;
      }

      setTimer(60);
      setCanResend(false);
      Alert.alert(
        "Verification Resent",
        "A new verification email has been sent. Please check your inbox."
      );
    } catch (error) {
      Alert.alert("Error", "Failed to resend verification code");
    } finally {
      setLoading(false);
    }
  };

  const renderVerificationScreen = () => {
    return (
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
          Verify Your {contactMethod === "email" ? "Email" : "Phone Number"}
        </Text>

        <Text style={{ marginBottom: 20 }}>
          Enter the 6-digit code sent to you at{"\n"}
          {contactMethod === "email" ? email : phoneNumber}
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          {otpDigits.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (otpInputRefs.current[index] = ref)}
              style={{
                width: 48,
                height: 56,
                backgroundColor: "#ffffff",
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#ddd",
                fontSize: 20,
                fontWeight: "bold",
                color: "#2c3e50",
                textAlign: "center",
              }}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={(e) => handleOtpKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
            />
          ))}
        </View>

        <Button
          ViewComponent={LinearGradient}
          linearGradientProps={{
            colors: ["#27ae60", "#2ecc71"],
            start: { x: 0, y: 0 },
            end: { x: 1, y: 0 },
          }}
          title="Verify"
          disabled={loading}
          onPress={verifyOtp}
          loading={loading}
          buttonStyle={{
            borderRadius: 10,
            padding: 12,
            marginBottom: 20,
          }}
        />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 20,
          }}
        >
          <Text>Didn't receive code? </Text>
          <TouchableOpacity
            onPress={resendVerificationCode}
            disabled={!canResend || loading}
          >
            <Text
              style={{
                fontWeight: "bold",
                color: canResend ? "#27ae60" : "#95a5a6",
              }}
            >
              {canResend ? "Resend Code" : `Resend in ${timer}s`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderRegistrationForm = () => {
    return (
      <View style={{ width: "100%" }}>
        <Title>Welcome to TheVanApp driver</Title>
        <Title>Create account</Title>
        <Text style={{ marginBottom: 20, marginTop: -10, textAlign: "center" }}>
          We will require a number of documents from you to complete the
          process.
        </Text>

        <NameSurnameRow>
          <NameInput
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
            inputStyle={{ paddingTop: 5 }}
            value={name}
            placeholder="First name"
            autoCapitalize="words"
            errorMessage={nameError}
            onBlur={() => validateName(name)}
          />

          <SurnameInput
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
            inputStyle={{ paddingTop: 5 }}
            value={surname}
            placeholder="Last name"
            autoCapitalize="words"
            errorMessage={surnameError}
            onBlur={() => validateSurname(surname)}
          />
        </NameSurnameRow>

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
            inputStyle={{ paddingTop: 5 }}
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
            inputStyle={{ paddingTop: 5 }}
            value={phoneNumber}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            errorMessage={phoneNumberError}
            onBlur={() => validatePhoneNumber(phoneNumber)}
          />
        )}

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
            onPress: () => setShowPassword(!showPassword),
          }}
          inputStyle={{ paddingTop: 5 }}
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
          errorMessage={passwordError}
          onBlur={() => validatePassword(password)}
        />

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
            name: showConfirmPassword ? "eye-off-outline" : "eye-outline",
            size: 22,
            color: "#95a5a6",
            onPress: () => setShowConfirmPassword(!showConfirmPassword),
          }}
          inputStyle={{ paddingTop: 5 }}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (confirmPasswordError) validateConfirmPassword(text);
          }}
          value={confirmPassword}
          secureTextEntry={!showConfirmPassword}
          placeholder="Confirm your password"
          autoCapitalize="none"
          errorMessage={confirmPasswordError}
          onBlur={() => validateConfirmPassword(confirmPassword)}
        />

        {/* Van Option Selection */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              marginBottom: 10,
              color: "#2c3e50",
            }}
          >
            Select an option:
          </Text>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 15,
              backgroundColor: vanOption === "own" ? "#e8f8f0" : "#fff",
              borderWidth: 1,
              borderColor: vanOption === "own" ? "#27ae60" : "#ddd",
              borderRadius: 10,
              marginBottom: 10,
            }}
            onPress={() => {
              setVanOption("own");
              if (vanOptionError) validateVanOption("own");
            }}
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
              {vanOption === "own" && (
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
            <Text style={{ fontSize: 16, color: "#2c3e50" }}>
              I have my own van
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 15,
              backgroundColor: vanOption === "company" ? "#e8f8f0" : "#fff",
              borderWidth: 1,
              borderColor: vanOption === "company" ? "#27ae60" : "#ddd",
              borderRadius: 10,
            }}
            onPress={() => {
              setVanOption("company");
              if (vanOptionError) validateVanOption("company");
            }}
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
              {vanOption === "company" && (
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
            <Text style={{ fontSize: 16, color: "#2c3e50" }}>
              I want to drive your van
            </Text>
          </TouchableOpacity>

          {vanOptionError ? (
            <Text style={{ color: "#e74c3c", fontSize: 12, marginTop: 5 }}>
              {vanOptionError}
            </Text>
          ) : null}
        </View>

        {/* Contact Method Selection */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              marginBottom: 10,
              color: "#2c3e50",
            }}
          >
            Verification Method:
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
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
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

        <StyledButton
          ViewComponent={LinearGradient}
          linearGradientProps={{
            colors: ["#27ae60", "#2ecc71"],
            start: { x: 0, y: 0 },
            end: { x: 1, y: 0 },
          }}
          title="Create account"
          disabled={loading}
          onPress={sendVerificationCode}
          loading={loading}
          buttonStyle={{
            borderRadius: 10,
            padding: 12,
          }}
          titleStyle={{
            fontWeight: "bold",
            fontSize: 16,
          }}
        />

        <View style={{ marginTop: 10, alignItems: "center" }}>
          <View style={{ flexDirection: "row", gap: 5 }}>
            <Text
              style={{
                color: "#7f8c8d",
                fontSize: 14,
                marginBottom: 10,
              }}
            >
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => router.push("/")}>
              <Text
                style={{
                  color: "#27ae60",
                  fontSize: 15,
                  fontWeight: "bold",
                }}
              >
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderDocumentsScreen = () => {
    return (
      <View style={{ width: "100%" }}>
        <Title>
          {vanOption === "own" ? "I have my own van" : "Drive Our Van"}
        </Title>

        <Text style={{ marginBottom: 20, fontSize: 16 }}>
          You will need to send us the following documents before your account
          will be fully activated:
        </Text>

        {vanOption === "own" ? (
          <View>
            <RequirementItem>1. Minimum age 18+</RequirementItem>
            <RequirementItem>2. Valid driver's license</RequirementItem>
            <RequirementItem>
              3. Eligible vehicle (meets The Van App's standards for your area)
            </RequirementItem>
            <RequirementItem>
              4. Proof of insurance and registration
            </RequirementItem>
            <RequirementItem>5. Smartphone (iOS or Android)</RequirementItem>
          </View>
        ) : (
          <View>
            <RequirementItem>1. Minimum age 21+</RequirementItem>
            <RequirementItem>2. Valid driver's license</RequirementItem>
            <RequirementItem>3. Proof of ID</RequirementItem>
            <RequirementItem>4. Smartphone (iOS or Android)</RequirementItem>
          </View>
        )}

        <Text style={{ marginTop: 20, marginBottom: 20 }}>
          Email all documents to
          <Text style={{ color: "green" }}>driver@thevanapp.com</Text>
        </Text>

        <StyledButton
          ViewComponent={LinearGradient}
          linearGradientProps={{
            colors: ["#27ae60", "#2ecc71"],
            start: { x: 0, y: 0 },
            end: { x: 1, y: 0 },
          }}
          onPress={() => {
            setCurrentStep(3);
          }}
          title="Continue"
          loading={loading}
          buttonStyle={{
            borderRadius: 10,
            padding: 12,
          }}
          titleStyle={{
            fontWeight: "bold",
            fontSize: 16,
          }}
        />
      </View>
    );
  };

  const renderConfirmationScreen = () => {
    return (
      <View style={{ width: "100%" }}>
        <Title>
          {vanOption === "own" ? "I have my own van" : "Drive our van"}
        </Title>

        <Text style={{ fontSize: 16, textAlign: "center", marginBottom: 40 }}>
          Once all documents are approved and your background check clears,
          you'll get an email/text that your account is active.
        </Text>

        <Icon
          name="check-circle"
          type="material-community"
          color="#27ae60"
          size={80}
          containerStyle={{ marginBottom: 40 }}
        />

        <StyledButton
          ViewComponent={LinearGradient}
          linearGradientProps={{
            colors: ["#27ae60", "#2ecc71"],
            start: { x: 0, y: 0 },
            end: { x: 1, y: 0 },
          }}
          title="Back to Login"
          onPress={() => router.push("/")}
          buttonStyle={{
            borderRadius: 10,
            padding: 12,
          }}
          titleStyle={{
            fontWeight: "bold",
            fontSize: 16,
          }}
        />
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
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
            {isVerifying
              ? renderVerificationScreen()
              : currentStep === 1
              ? renderRegistrationForm()
              : currentStep === 2
              ? renderDocumentsScreen()
              : renderConfirmationScreen()}
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
  padding: 15px;
  padding-top: ${Platform.OS === "android" ? "20px" : "80px"};
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

const RequirementItem = styled.Text`
  font-size: 16px;
  margin-bottom: 10px;
  padding-left: 10px;
`;

const NameSurnameRow = styled.View`
  justify-content: space-between;
  margin-bottom: 10px;
`;

const NameInput = styled(Input)`
  width: 48%;
  margin-bottom: 5px;
`;

const SurnameInput = styled(Input)`
  width: 48%;
  margin-bottom: 5px;
`;
