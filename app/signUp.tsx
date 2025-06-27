import React, { useState, useEffect, useRef } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Text,
} from "react-native";
import { supabase } from "../infrastructure/db/supabase";
import { Button, Input, Icon } from "@rneui/themed";
import styled from "styled-components/native";
import { RegistrationForm } from "@/components/register/RegistrationForm";
import { DocumentsScreen } from "@/components/register/DocumentsScreen";
import { ConfirmationScreen } from "@/components/register/ConfirmationScreen";
import { COUNTRIES } from "@/components/Countries";
import { VerificationScreen } from "@/components/register/ VerificationScreen";
import { Session } from "@supabase/supabase-js";
import { useRouter } from "expo-router";

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
  const [isContactVerified, setIsContactVerified] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const otpInputRefs = useRef<React.RefObject<any>[]>([]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Session management
  const [tempSession, setTempSession] = useState<Session | null>(null);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);

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

  const router = useRouter();

  useEffect(() => {
    if (otpInputRefs.current.length < 6) {
      otpInputRefs.current = Array(6)
        .fill(null)
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

  // Session listener to prevent automatic navigation
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);

      // თუ ვერიფიკაცია მიმდინარეობს და რეგისტრაცია არ არის დასრულებული
      if (session && !isRegistrationComplete) {
        console.log("Storing temporary session during verification");
        setTempSession(session);

        // გავაუქმოთ სესია რომ არ გადავიდეს homepage-ზე
        await supabase.auth.signOut();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [isRegistrationComplete]);

  const validateEmail = (email: string) => {
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

  const validateName = (name: string) => {
    if (!name.trim()) {
      setNameError("Name is required");
      return false;
    }
    setNameError("");
    return true;
  };

  const validateSurname = (surname: string) => {
    if (!surname.trim()) {
      setSurnameError("Surname is required");
      return false;
    }
    setSurnameError("");
    return true;
  };

  const validatePhoneNumber = (phone: string) => {
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

  const validateVanOption = (option: string) => {
    if (!option) {
      setVanOptionError("Please select an option");
      return false;
    }
    setVanOptionError("");
    return true;
  };

  const handleOtpChange = (text: string, index: number) => {
    if (/^\d*$/.test(text)) {
      const newOtpDigits = [...otpDigits];
      newOtpDigits[index] = text;
      setOtpDigits(newOtpDigits);

      if (text && index < 5) {
        otpInputRefs.current[index + 1]?.focus(); // .current-ის გარეშე
      }
    }
  };

  const handleOtpKeyPress = (event: any, index: number) => {
    if (
      event.nativeEvent.key === "Backspace" &&
      !otpDigits[index] &&
      index > 0
    ) {
      otpInputRefs.current[index - 1]?.focus(); // .current-ის გარეშე
    }
  };

  // ვერიფიკაციის კოდის გაგზავნა
  const sendVerificationCode = async () => {
    console.log("=== STARTING sendVerificationCode ===");
    console.log("Contact method:", contactMethod);
    console.log("Email:", email);
    console.log("Phone:", phoneNumber);
    console.log("Selected country:", selectedCountry);

    // ვალიდაცია მხოლოდ კონტაქტის მეთოდისთვის
    if (contactMethod === "email") {
      const isEmailValid = validateEmail(email);
      if (!isEmailValid) {
        console.log("Email validation failed");
        return;
      }
    } else {
      const isPhoneValid = validatePhoneNumber(phoneNumber);
      if (!isPhoneValid) {
        console.log("Phone validation failed");
        return;
      }
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

        console.log("Phone OTP response data:", data);
        console.log("Phone OTP response error:", error);

        if (error) throw error;
      } else {
        console.log("Sending OTP to email:", email);

        const { data, error } = await supabase.auth.signInWithOtp({
          email: email.trim().toLowerCase(),
          options: {
            shouldCreateUser: true, // ნება ვაძლოთ ახალი მომხმარებლების რეგისტრაციას
          },
        });

        console.log("Email OTP response data:", data);
        console.log("Email OTP response error:", error);

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
      console.error("Error details:", {
        message: (error as Error)?.message,
        name: (error as Error)?.name,
        stack: (error as Error)?.stack,
      });

      // კონკრეტული შეცდომების შემოწმება
      const errorMessage = (error as Error)?.message || "";

      if (errorMessage.includes("Email provider not enabled")) {
        Alert.alert(
          "Configuration Error",
          "Email provider is not enabled in Supabase. Please contact support."
        );
      } else if (errorMessage.includes("SMS provider not enabled")) {
        Alert.alert(
          "Configuration Error",
          "SMS provider is not enabled in Supabase. Please contact support."
        );
      } else if (errorMessage.includes("Signups not allowed for otp")) {
        Alert.alert(
          "Configuration Error",
          "OTP signups are not enabled in Supabase. Please contact support to enable this feature."
        );
      } else if (errorMessage.includes("Invalid email")) {
        Alert.alert("Invalid Email", "Please enter a valid email address.");
      } else if (errorMessage.includes("Invalid phone")) {
        Alert.alert("Invalid Phone", "Please enter a valid phone number.");
      } else if (
        errorMessage.includes("rate limit") ||
        errorMessage.includes("too many requests")
      ) {
        Alert.alert(
          "Rate Limit Exceeded",
          "Too many attempts. Please wait a few minutes before trying again."
        );
      } else if (
        errorMessage.includes("network") ||
        errorMessage.includes("fetch")
      ) {
        Alert.alert(
          "Network Error",
          "Please check your internet connection and try again."
        );
      } else if (errorMessage.includes("timeout")) {
        Alert.alert("Timeout Error", "Request timed out. Please try again.");
      } else {
        Alert.alert(
          "Error",
          `Failed to send verification code: ${errorMessage}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // OTP-ს ვერიფიკაცია
  const verifyOtp = async () => {
    const otpValue = otpDigits.join("");

    if (otpValue.length !== 6) {
      Alert.alert("Error", "Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);
    try {
      let verificationResult;

      if (contactMethod === "phone") {
        const formattedPhone = phoneNumber.startsWith("+")
          ? phoneNumber
          : `${selectedCountry.dialCode}${phoneNumber}`;

        console.log("Verifying phone OTP:", otpValue);
        verificationResult = await supabase.auth.verifyOtp({
          phone: formattedPhone,
          token: otpValue,
          type: "sms",
        });
      } else {
        console.log("Verifying email OTP:", otpValue);
        verificationResult = await supabase.auth.verifyOtp({
          email: email.trim().toLowerCase(),
          token: otpValue,
          type: "email",
        });
      }

      if (verificationResult.error) throw verificationResult.error;

      // ვერიფიკაცია წარმატებულია
      console.log("OTP verified successfully");
      setIsContactVerified(true);
      setIsVerifying(false);
      setOtpDigits(["", "", "", "", "", ""]);

      // დავარეგისტრიროთ session თუ არსებობს
      if (verificationResult.data?.session) {
        console.log(
          "Session received from OTP verification:",
          verificationResult.data.session
        );
        setTempSession(verificationResult.data.session);
        await supabase.auth.signOut();
      } else {
        console.log("No session received from OTP verification");
      }

      Alert.alert(
        "Success",
        `${
          contactMethod === "phone" ? "Phone number" : "Email"
        } verified successfully! Now you can complete your registration.`
      );
    } catch (error) {
      console.error("OTP verification error:", error);
      console.error("Verification error details:", {
        message: (error as Error)?.message,
        name: (error as Error)?.name,
        stack: (error as Error)?.stack,
      });

      const errorMessage = (error as Error)?.message || "";

      if (
        errorMessage.includes("Invalid OTP") ||
        errorMessage.includes("invalid token")
      ) {
        Alert.alert(
          "Invalid Code",
          "The verification code you entered is incorrect. Please try again."
        );
      } else if (errorMessage.includes("expired")) {
        Alert.alert(
          "Code Expired",
          "The verification code has expired. Please request a new one."
        );
      } else if (
        errorMessage.includes("network") ||
        errorMessage.includes("fetch")
      ) {
        Alert.alert(
          "Network Error",
          "Please check your internet connection and try again."
        );
      } else {
        Alert.alert("Error", `Failed to verify code: ${errorMessage}`);
      }
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
            shouldCreateUser: true, // ნება ვაძლოთ ახალი მომხმარებლების რეგისტრაციას
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
      console.error("Resend error details:", {
        message: (error as Error)?.message,
        name: (error as Error)?.name,
        stack: (error as Error)?.stack,
      });

      const errorMessage = (error as Error)?.message || "";

      if (
        errorMessage.includes("rate limit") ||
        errorMessage.includes("too many requests")
      ) {
        Alert.alert(
          "Rate Limit Exceeded",
          "Too many resend attempts. Please wait a few minutes."
        );
      } else if (
        errorMessage.includes("network") ||
        errorMessage.includes("fetch")
      ) {
        Alert.alert(
          "Network Error",
          "Please check your internet connection and try again."
        );
      } else {
        Alert.alert(
          "Error",
          `Failed to resend verification code: ${errorMessage}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ვერიფიკაციის გვერდიდან დაბრუნება
  const goBackToRegistration = () => {
    setIsVerifying(false);
    setOtpDigits(["", "", "", "", "", ""]);
    setTimer(60);
    setCanResend(false);
  };

  // მთავარი რეგისტრაცია
  const completeRegistration = async () => {
    console.log("=== STARTING completeRegistration ===");
    console.log("tempSession at start:", tempSession);

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
      // Check for session, restore from tempSession if needed
      let session = (await supabase.auth.getSession()).data.session;
      console.log("Session from getSession before restore:", session);
      if (!session && tempSession) {
        console.log("Restoring session from tempSession:", tempSession);
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: tempSession.access_token,
          refresh_token: tempSession.refresh_token,
        });
        if (sessionError) throw sessionError;
        session = (await supabase.auth.getSession()).data.session;
        console.log("Session after setSession:", session);
      }
      if (!session) {
        console.log("No session available after restore attempt");
        Alert.alert(
          "Session Error",
          "Session expired or missing. Please verify your contact again."
        );
        setIsContactVerified(false);
        setIsVerifying(true);
        setTempSession(null);
        return;
      }

      // განაახლე იუზერის მონაცემები
      const { error: updateError } = await supabase.auth.updateUser({
        password: password, // პაროლის დაყენება
        data: {
          first_name: name,
          last_name: surname,
          full_name: `${name} ${surname}`,
          phone: phoneNumber,
          van_option: vanOption,
          user_type: "driver",
          status: "incomplete",
        },
      });

      if (updateError) throw updateError;

      setIsRegistrationComplete(true);
      setTempSession(null);
      router.replace("/homepage");
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert(
        "Error",
        (error as Error)?.message ||
          "Failed to complete registration. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // კონტაქტის მეთოდის შეცვლისას ვერიფიკაციის გაუქმება
  const handleContactMethodChange = (method: string) => {
    setContactMethod(method);
    setIsContactVerified(false);
    setIsVerifying(false);
    setOtpDigits(["", "", "", "", "", ""]);
    setTempSession(null); // temp session-ის გასუფთავება
  };

  // Supabase კონფიგურაციის შემოწმება
  const testSupabaseConnection = async () => {
    try {
      console.log("Testing Supabase connection...");
      const { data, error } = await supabase.auth.getSession();
      console.log("Session test result:", { data, error });

      if (error) {
        console.error("Supabase connection error:", error);
      } else {
        console.log("Supabase connection successful");
      }
    } catch (error) {
      console.error("Supabase test failed:", error);
    }
  };

  // შევამოწმოთ რომ ემაილი/ტელეფონი უკვე არსებობული
  const checkIfUserExists = async () => {
    try {
      if (contactMethod === "email" && email) {
        console.log("Checking if email exists:", email);
        const { data, error } = await supabase.auth.signInWithOtp({
          email: email.trim().toLowerCase(),
          options: {
            shouldCreateUser: true, // ნება ვაძლოთ ახალი მომხმარებლების რეგისტრაციას
          },
        });
        console.log("Email check result:", { data, error });
        return { exists: !error, data, error };
      } else if (contactMethod === "phone" && phoneNumber) {
        const formattedPhone = phoneNumber.startsWith("+")
          ? phoneNumber
          : `${selectedCountry.dialCode}${phoneNumber}`;
        console.log("Checking if phone exists:", formattedPhone);
        const { data, error } = await supabase.auth.signInWithOtp({
          phone: formattedPhone,
        });
        console.log("Phone check result:", { data, error });
        return { exists: !error, data, error };
      }
    } catch (error) {
      console.error("User existence check failed:", error);
      return { exists: false, error };
    }
    return { exists: false };
  };

  // ტესტური OTP გაგზავნა (მხოლოდ development-ში)
  const testOtpSend = async () => {
    try {
      console.log("=== TESTING OTP SEND ===");
      const testEmail = "test@example.com";

      console.log("Sending test OTP to:", testEmail);
      const { data, error } = await supabase.auth.signInWithOtp({
        email: testEmail,
        options: {
          shouldCreateUser: true, // ნება ვაძლოთ ახალი მომხმარებლების რეგისტრაციას
        },
      });

      console.log("Test OTP result:", { data, error });

      if (error) {
        console.error("Test OTP failed:", error);
        Alert.alert("Test Failed", `Error: ${error.message}`);
      } else {
        console.log("Test OTP successful");
        Alert.alert("Test Success", "OTP sent successfully to test email");
      }
    } catch (error) {
      console.error("Test OTP error:", error);
      Alert.alert(
        "Test Error",
        `Unexpected error: ${(error as Error)?.message}`
      );
    }
  };

  // კომპონენტის მონტაჟისას შევამოწმოთ კონფიგურაცია
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("=== INITIALIZING APP ===");
        await testSupabaseConnection();
        console.log("App initialization completed");
      } catch (error) {
        console.error("App initialization failed:", error);
      }
    };

    initializeApp();
  }, []);

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
                goBackToRegistration={goBackToRegistration}
              />
            ) : currentStep === 1 ? (
              <>
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

                {/* Debug ღილაკი - მხოლოდ development-ში */}
                {__DEV__ && (
                  <>
                    <TouchableOpacity
                      style={{
                        backgroundColor: "#ff6b6b",
                        padding: 10,
                        borderRadius: 5,
                        marginTop: 10,
                        alignItems: "center",
                      }}
                      onPress={async () => {
                        console.log("=== DEBUG INFO ===");
                        console.log("Email:", email);
                        console.log("Phone:", phoneNumber);
                        console.log("Contact method:", contactMethod);
                        console.log("Selected country:", selectedCountry);

                        // კონფიგურაციის შემოწმება
                        await testSupabaseConnection();

                        // მომხმარებლის არსებობის შემოწმება
                        if (email || phoneNumber) {
                          console.log("Checking if user exists...");
                          const userCheck = await checkIfUserExists();
                          console.log("User existence check:", userCheck);
                        }

                        // ვალიდაციის შემოწმება
                        if (contactMethod === "email") {
                          const isEmailValid = validateEmail(email);
                          console.log("Email validation result:", isEmailValid);
                        } else {
                          const isPhoneValid = validatePhoneNumber(phoneNumber);
                          console.log("Phone validation result:", isPhoneValid);
                        }
                      }}
                    >
                      <Text style={{ color: "white", fontWeight: "bold" }}>
                        Debug Info
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{
                        backgroundColor: "#4ecdc4",
                        padding: 10,
                        borderRadius: 5,
                        marginTop: 5,
                        alignItems: "center",
                      }}
                      onPress={testOtpSend}
                    >
                      <Text style={{ color: "white", fontWeight: "bold" }}>
                        Test OTP Send
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
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
