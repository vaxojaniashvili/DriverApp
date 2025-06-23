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
import { RegistrationForm } from "@/components/register/RegistrationForm";
import { DocumentsScreen } from "@/components/register/DocumentsScreen";
import { ConfirmationScreen } from "@/components/register/ConfirmationScreen";
import { COUNTRIES } from "@/components/Countries";
import { VerificationScreen } from "@/components/register/ VerificationScreen";

export default function DriverSignUp() {
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [contactMethod, setContactMethod] = useState("email");
  const [vanOption, setVanOption] = useState("");

  // Verification state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [isContactVerified, setIsContactVerified] = useState(false); // ახალი state
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
  const [vanOptionError, setVanOptionError] = useState("");

  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[12]);

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

    const phoneRegex = /^[+]?[\d\s()-]{6,20}$/;
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

  // ვერიფიკაციის კოდის გაგზავნა (მხოლოდ OTP-ს ავგზავნით)
  const sendVerificationCode = async () => {
    console.log("=== STARTING sendVerificationCode ===");

    // ვალიდაცია მხოლოდ კონტაქტის მეთოდისთვის
    if (contactMethod === "email") {
      const isEmailValid = validateEmail(email);
      if (!isEmailValid) return;
    } else {
      const isPhoneValid = validatePhoneNumber(phoneNumber);
      if (!isPhoneValid) return;
    }

    setLoading(true);
    try {
      if (contactMethod === "phone") {
        const formattedPhone = phoneNumber.startsWith("+")
          ? phoneNumber
          : `${selectedCountry.dialCode}${phoneNumber}`;

        console.log("Sending OTP to phone:", formattedPhone);
        const { data, error } = await supabase.auth.signInWithOtp({
          phone: formattedPhone,
        });

        if (error) throw error;
      } else {
        console.log("Sending OTP to email:", email);
        const { data, error } = await supabase.auth.signInWithOtp({
          email: email.trim().toLowerCase(),
          options: {
            channel: "email",
            type: "otp",
          },
        });

        if (error) throw error;
      }

      setVerificationSent(true);
      setIsVerifying(true);
      setTimer(60);
      setCanResend(false);

      Alert.alert(
        "Success",
        contactMethod === "phone"
          ? "Verification code sent successfully!"
          : "Verification code sent successfully! Check your email for the code."
      );
    } catch (error) {
      console.error("OTP send error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to send verification code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // OTP-ს ვერიფიკაცია (უკან ბრუნდება რეგისტრაციის ფორმზე)
  const verifyOtp = async () => {
    const otpValue = otpDigits.join("");

    if (otpValue.length !== 6) {
      Alert.alert("Error", "Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);
    try {
      if (contactMethod === "phone") {
        const formattedPhone = phoneNumber.startsWith("+")
          ? phoneNumber
          : `${selectedCountry.dialCode}${phoneNumber}`;

        console.log("Verifying phone OTP:", otpValue);
        const {
          data: { session },
          error,
        } = await supabase.auth.verifyOtp({
          phone: formattedPhone,
          token: otpValue,
          type: "sms",
        });

        if (error) throw error;

        if (session) {
          console.log("Phone OTP verified successfully");
          setIsContactVerified(true);
          setIsVerifying(false);
          setOtpDigits(["", "", "", "", "", ""]);
          Alert.alert("Success", "Phone number verified successfully!");
        } else {
          Alert.alert("Error", "Verification failed. Please try again.");
        }
      } else {
        console.log("Verifying email OTP:", otpValue);
        const {
          data: { session },
          error,
        } = await supabase.auth.verifyOtp({
          email: email.trim().toLowerCase(),
          token: otpValue,
          type: "email",
        });

        if (error) throw error;

        if (session) {
          console.log("Email OTP verified successfully");
          setIsContactVerified(true);
          setIsVerifying(false);
          setOtpDigits(["", "", "", "", "", ""]);
          Alert.alert("Success", "Email verified successfully!");
        } else {
          Alert.alert("Error", "Verification failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      Alert.alert("Error", error.message || "Failed to verify code");
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationCode = async () => {
    console.log("=== STARTING resendVerificationCode ===");
    if (!canResend) return;

    setLoading(true);
    try {
      if (contactMethod === "phone") {
        const formattedPhone = phoneNumber.startsWith("+")
          ? phoneNumber
          : `${selectedCountry.dialCode}${phoneNumber}`;

        console.log("Resending OTP to phone:", formattedPhone);
        const { data, error } = await supabase.auth.signInWithOtp({
          phone: formattedPhone,
        });

        if (error) throw error;
      } else {
        console.log("Resending OTP to email:", email);
        const { data, error } = await supabase.auth.signInWithOtp({
          email: email.trim().toLowerCase(),
          options: {
            channel: "email",
            type: "otp",
          },
        });

        if (error) throw error;
      }

      setTimer(60);
      setCanResend(false);
      Alert.alert(
        "Code Resent",
        contactMethod === "phone"
          ? "A new verification code has been sent to your phone."
          : "A new verification code has been sent to your email."
      );
    } catch (error) {
      console.error("OTP resend error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to resend verification code"
      );
    } finally {
      setLoading(false);
    }
  };

  // მთავარი რეგისტრაცია (ყველა ფილდის ვალიდაციის შემდეგ)
  const completeRegistration = async () => {
    console.log("=== STARTING completeRegistration ===");

    // ყველა ფილდის ვალიდაცია
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
      Alert.alert("Error", "Please fill all required fields correctly.");
      return;
    }

    // კონტაქტის ვერიფიკაციის შემოწმება
    if (!isContactVerified) {
      Alert.alert("Error", `Please verify your ${contactMethod} first.`);
      return;
    }

    setLoading(true);
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error(
          "Invalid session. Please verify your information again."
        );
      }

      // მომხმარებლის მონაცემების განახლება
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          first_name: name,
          last_name: surname,
          full_name: `${name} ${surname}`,
          phone: phoneNumber,
          email: email.trim().toLowerCase(),
          van_option: vanOption,
          user_type: "driver",
          status: "incomplete",
        },
      });

      if (updateError) throw updateError;

      console.log("Registration completed successfully");
      Alert.alert("Success", "Registration completed successfully!");

      // გადასვლა შემდეგ ნაბიჯზე
      setCurrentStep(2);
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

  // კონტაქტის მეთოდის შეცვლისას ვერიფიკაციის გაუქმება
  const handleContactMethodChange = (method) => {
    setContactMethod(method);
    setIsContactVerified(false);
    setIsVerifying(false);
    setOtpDigits(["", "", "", "", "", ""]);
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
                COUNTRIES={COUNTRIES}
                selectedCountry={selectedCountry}
                setSelectedCountry={setSelectedCountry}
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
                isContactVerified={isContactVerified}
                setName={setName}
                setSurname={setSurname}
                setEmail={setEmail}
                setPhoneNumber={setPhoneNumber}
                setPassword={setPassword}
                setConfirmPassword={setConfirmPassword}
                setShowPassword={setShowPassword}
                setShowConfirmPassword={setShowConfirmPassword}
                setVanOption={setVanOption}
                setContactMethod={handleContactMethodChange}
                validateName={validateName}
                validateSurname={validateSurname}
                validateEmail={validateEmail}
                validatePhoneNumber={validatePhoneNumber}
                validatePassword={validatePassword}
                validateConfirmPassword={validateConfirmPassword}
                validateVanOption={validateVanOption}
                sendVerificationCode={sendVerificationCode}
                completeRegistration={completeRegistration}
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
