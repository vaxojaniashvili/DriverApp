import React, { useState, useEffect, useRef } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { supabase } from "../infrastructure/db/supabase";
import { Button, Input, Icon } from "@rneui/themed";
import styled from "styled-components/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { RegistrationForm } from "@/components/register/RegistrationForm";
import { DocumentsScreen } from "@/components/register/DocumentsScreen";
import { ConfirmationScreen } from "@/components/register/ConfirmationScreen";
import { VerificationScreen } from "@/components/register/ VerificationScreen";

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

  // Form validation errors
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [nameError, setNameError] = useState("");
  const [surnameError, setSurnameError] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [cityError, setCityError] = useState("");
  const [vanOptionError, setVanOptionError] = useState("");
  const [apiToken, setApiToken] = useState<string | null>(null);

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
      // Just simulate OTP sending without actual Supabase call
      setVerificationSent(true);
      setIsVerifying(true);
      setTimer(60);
      setCanResend(false);

      // Simulate delay for realistic feel
      setTimeout(() => {
        Alert.alert(
          "Success",
          "Verification code sent successfully! Use 123456"
        );
      }, 500);
    } catch (error) {
      console.error("Unexpected error:", error);
      Alert.alert(
        "Error",
        "Failed to send verification code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    const otpValue = otpDigits.join("");
    const TEST_OTP = "123456";

    if (otpValue.length !== 6) {
      Alert.alert("Error", "Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);
    try {
      if (otpValue === TEST_OTP) {
        setIsVerifying(false);
        setCurrentStep(2);
        setOtpDigits(["", "", "", "", "", ""]);
      } else {
        Alert.alert("Error", "Invalid OTP code. Use 123456 for testing.");
      }
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
      // Just simulate resending without actual email
      setTimer(60);
      setCanResend(false);
      Alert.alert(
        "Code Resent",
        "A new verification code has been sent. Use 123456"
      );
    } catch (error) {
      Alert.alert("Error", "Failed to resend verification code");
    } finally {
      setLoading(false);
    }
  };

  const completeRegistration = async () => {
    setLoading(true);
    try {
      // Create new user
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password: password,
          options: {
            data: {
              first_name: name,
              last_name: surname,
              full_name: `${name} ${surname}`,
              phone: phoneNumber,
              van_option: vanOption,
              user_type: "driver",
              status: "complete",
            },
            emailRedirectTo:
              Platform.OS === "web"
                ? `${window.location.origin}/authentication`
                : "myapp://auth/callback",
          },
        });

      if (signUpError) throw signUpError;

      // Sign in immediately after registration
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: password,
        });

      if (signInError) throw signInError;

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      const driverUUID = user?.id;

      if (userError || !user) {
        throw new Error("Failed to get user data");
      }

      // Create or update user profile in the profiles table
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        email: email.trim().toLowerCase(),
        first_name: name,
        last_name: surname,
        full_name: `${name} ${surname}`,
        phone: phoneNumber,
        van_option: vanOption,
        user_type: "driver",
        status: "complete",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // if (profileError) {
      //   console.error("Profile creation error:", profileError);
      // }

      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      setApiToken(sessionData?.session?.access_token as any);

      if (sessionError || !sessionData.session) {
        throw new Error("Failed to establish session");
      }
      setTimeout(async () => {
        try {
          const res = await fetch(
            "https://api.thevanapp.com/api/driver-details",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiToken}`,
              },
              body: JSON.stringify({
                unique_id: driverUUID,
                name: name,
                last_name: surname,
                email: email,
              }),
            }
          );
          const data = await res.json();
          console.log("Data", data);
          await AsyncStorage.setItem(
            "supabase_session",
            JSON.stringify(sessionData.session)
          );
          await AsyncStorage.setItem("user_id", user.id);

          if (!res.ok) {
            console.log("errror");
          }
        } catch (error) {
          console.log(error);
        }
      }, 3000);
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to complete registration. Please try again."
      );
    } finally {
      setLoading(false);
    }
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
            {isVerifying ? (
              <VerificationScreen
                contactMethod={contactMethod}
                email={email}
                phoneNumber={phoneNumber}
                otpDigits={otpDigits}
                otpInputRefs={otpInputRefs}
                loading={loading}
                timer={timer}
                canResend={canResend}
                handleOtpChange={handleOtpChange}
                handleOtpKeyPress={handleOtpKeyPress}
                verifyOtp={verifyOtp}
                resendVerificationCode={resendVerificationCode}
              />
            ) : currentStep === 1 ? (
              <RegistrationForm
                name={name}
                surname={surname}
                email={email}
                phoneNumber={phoneNumber}
                password={password}
                confirmPassword={confirmPassword}
                vanOption={vanOption}
                contactMethod={contactMethod}
                loading={loading}
                showPassword={showPassword}
                showConfirmPassword={showConfirmPassword}
                nameError={nameError}
                surnameError={surnameError}
                emailError={emailError}
                phoneNumberError={phoneNumberError}
                passwordError={passwordError}
                confirmPasswordError={confirmPasswordError}
                vanOptionError={vanOptionError}
                setName={setName}
                setSurname={setSurname}
                setEmail={setEmail}
                setPhoneNumber={setPhoneNumber}
                setPassword={setPassword}
                setConfirmPassword={setConfirmPassword}
                setShowPassword={setShowPassword}
                setShowConfirmPassword={setShowConfirmPassword}
                setVanOption={setVanOption}
                setContactMethod={setContactMethod}
                validateName={validateName}
                validateSurname={validateSurname}
                validateEmail={validateEmail}
                validatePhoneNumber={validatePhoneNumber}
                validatePassword={validatePassword}
                validateConfirmPassword={validateConfirmPassword}
                validateVanOption={validateVanOption}
                sendVerificationCode={sendVerificationCode}
                Title={Title}
                NameSurnameRow={NameSurnameRow}
                NameInput={NameInput}
                SurnameInput={SurnameInput}
                StyledInput={StyledInput}
                StyledButton={StyledButton}
              />
            ) : currentStep === 2 ? (
              <DocumentsScreen
                vanOption={vanOption}
                loading={loading}
                setCurrentStep={setCurrentStep}
                Title={Title}
                RequirementItem={RequirementItem}
                StyledButton={StyledButton}
              />
            ) : (
              <ConfirmationScreen
                vanOption={vanOption}
                Title={Title}
                StyledButton={StyledButton}
                completeRegistration={completeRegistration}
                loading={loading}
              />
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
