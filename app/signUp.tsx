import React, { useState, useEffect, useRef } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../infrastructure/db/supabase";
import { Button, Input, Icon } from "@rneui/themed";
import styled from "styled-components/native";
import { RegistrationForm } from "@/components/register/RegistrationForm";
import { DocumentsScreen } from "@/components/register/DocumentsScreen";
import { ConfirmationScreen } from "@/components/register/ConfirmationScreen";
import { COUNTRIES } from "@/components/Countries";
import { VerificationScreen } from "@/components/register/ VerificationScreen";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/infrastructure/store/store";

export default function DriverSignUp() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [contactMethod, setContactMethod] = useState("phone");

  // Verification state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [isContactVerified, setIsContactVerified] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const otpInputRefs = useRef<(React.RefObject<any> | null)[]>([]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Session management
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  const [isProcessingRegistration, setIsProcessingRegistration] =
    useState(false);

  // Current registration step
  const [currentStep, setCurrentStep] = useState(1);

  // Form validation errors
  const [passwordError, setPasswordError] = useState("");
  const [nameError, setNameError] = useState("");
  const [surnameError, setSurnameError] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");

  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[12]);

  const router = useRouter();

  // Zustand store for session management
  const {
    setSession,
    setUser,
    loadSessionFromStorage,
    setName: setStoreName,
    setSurname: setStoreSurname,
  } = useAuthStore();

  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // ✅ VALIDATION FUNCTIONS
  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError("Password is required");
      return false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return false;
    } else if (password !== confirmPassword && confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const validateConfirmPassword = (confirmPass: string) => {
    if (!confirmPass) {
      setPasswordError("Please confirm your password");
      return false;
    } else if (password !== confirmPass) {
      setPasswordError("Passwords do not match");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const validateName = (name: string) => {
    if (!name) {
      setNameError("Name is required");
      return false;
    } else if (name.length < 2) {
      setNameError("Name must be at least 2 characters");
      return false;
    }
    setNameError("");
    return true;
  };

  const validateSurname = (surname: string) => {
    if (!surname) {
      setSurnameError("Surname is required");
      return false;
    } else if (surname.length < 2) {
      setSurnameError("Surname must be at least 2 characters");
      return false;
    }
    setSurnameError("");
    return true;
  };

  const validatePhoneNumber = (phone: string) => {
    if (contactMethod !== "phone") {
      setPhoneNumberError("");
      return true;
    }

    if (!phone) {
      setPhoneNumberError("Phone number is required");
      return false;
    }

    const cleanPhone = phone.replace(/[^\d+]/g, "");
    const phoneRegex = /^[+]?[\d]{8,15}$/;

    if (!phoneRegex.test(cleanPhone)) {
      setPhoneNumberError("Invalid phone number format (8-15 digits)");
      return false;
    }

    const digitsOnly = cleanPhone.replace(/[^\d]/g, "");
    if (digitsOnly.length < 8) {
      setPhoneNumberError("Phone number too short (minimum 8 digits)");
      return false;
    }

    if (digitsOnly.length > 15) {
      setPhoneNumberError("Phone number too long (maximum 15 digits)");
      return false;
    }

    setPhoneNumberError("");
    return true;
  };

  useEffect(() => {
    const load = async () => {
      await loadSessionFromStorage();
      setIsAuthLoading(false);
    };
    load();
  }, []);

  // ✅ SIMPLIFIED session check - No automatic navigation
  useEffect(() => {
    if (isAuthLoading) return;
    const checkExistingSession = async () => {
      const currentState = useAuthStore.getState();
      let status = null;
      if (currentState.user) {
        status =
          currentState.user.status || currentState.user.user_metadata?.status;
      }

      console.log("[signUp] session:", !!currentState.session);
      console.log("[signUp] user:", !!currentState.user);
      console.log("[signUp] status:", status);

      // Only redirect if BOTH session and user exist AND status is active
      if (
        currentState.session &&
        currentState.user &&
        (status === "active" || status === "complete")
      ) {
        console.log("[signUp] Redirecting to homepage");
        router.replace("/(tabs)/homepage");
      } else {
        console.log("[signUp] Staying on signUp");
      }
    };
    checkExistingSession();
  }, [isAuthLoading]);

  useEffect(() => {
    otpInputRefs.current = Array(6)
      .fill(null)
      .map(() => React.createRef());
  }, []);

  useEffect(() => {
    if (timer > 0 && isVerifying) {
      const timerId = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (timer === 0) {
      setCanResend(true);
    }
  }, [timer, isVerifying]);

  // ✅ DISABLED AUTH LISTENER - No automatic navigation
  useEffect(() => {
    console.log("Auth listener disabled to prevent automatic navigation");
    // No auth state change listener to avoid multiple navigations
    return;
  }, []);

  const handleOtpChange = (text: string, index: number) => {
    if (/^\d*$/.test(text)) {
      const newOtpDigits = [...otpDigits];
      newOtpDigits[index] = text;
      setOtpDigits(newOtpDigits);

      if (text && index < 5) {
        const nextRef = otpInputRefs.current[index + 1];
        if (nextRef?.current) {
          nextRef.current.focus();
        }
      }
    }
  };

  const handleOtpKeyPress = (event: any, index: number) => {
    if (
      event.nativeEvent.key === "Backspace" &&
      !otpDigits[index] &&
      index > 0
    ) {
      const prevRef = otpInputRefs.current[index - 1];
      if (prevRef?.current) {
        prevRef.current.focus();
      }
    }
  };

  // ✅ SEND VERIFICATION CODE
  const sendVerificationCode = async () => {
    console.log("=== STARTING sendVerificationCode ===");
    console.log("Contact method:", contactMethod);
    console.log("Phone:", phoneNumber);

    const isPhoneValid = validatePhoneNumber(phoneNumber);
    if (!isPhoneValid) {
      console.log("Phone validation failed");
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `${selectedCountry.dialCode}${phoneNumber}`;

      console.log("Sending OTP to phone:", formattedPhone);

      const { data, error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      console.log("Phone OTP response:", { data, error });
      if (error) throw error;

      setVerificationSent(true);
      setIsVerifying(true);
      setTimer(60);
      setCanResend(false);
    } catch (error) {
      console.error("OTP send error:", error);
      const errorMessage = (error as Error)?.message || "";

      if (errorMessage.includes("SMS provider not enabled")) {
        Alert.alert(
          "Configuration Error",
          "SMS provider is not enabled in Supabase. Please contact support."
        );
      } else if (errorMessage.includes("Signups not allowed for otp")) {
        Alert.alert(
          "Configuration Error",
          "OTP signups are not enabled in Supabase. Please contact support to enable this feature."
        );
      } else if (
        errorMessage.includes("rate limit") ||
        errorMessage.includes("too many requests")
      ) {
        Alert.alert(
          "Rate Limit Exceeded",
          "Too many attempts. Please wait a few minutes before trying again."
        );
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

  // ✅ VERIFY OTP - Updated flow
  const verifyOtp = async () => {
    console.log("=== STARTING OTP VERIFICATION ===");
    const otpValue = otpDigits.join("");
    console.log("OTP VALUE:", otpValue);

    if (otpValue.length !== 6) {
      console.log("OTP LENGTH INVALID");
      Alert.alert("Error", "Please enter the complete 6-digit code");
      return;
    }

    console.log("🔄 Starting verification process...");
    setLoading(true);
    setIsProcessingRegistration(true);

    try {
      const formattedPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `${selectedCountry.dialCode}${phoneNumber}`;

      console.log("Verifying phone OTP:", otpValue);
      const verificationResult = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otpValue,
        type: "sms",
      });

      console.log("Verification result:", verificationResult);

      if (verificationResult.error) {
        console.error("OTP verification failed:", verificationResult.error);
        throw verificationResult.error;
      }

      console.log("✅ OTP VERIFICATION SUCCESS");
      setIsContactVerified(true);
      setIsVerifying(false);
      setOtpDigits(["", "", "", "", "", ""]);

      // Session შენახვა
      if (verificationResult.data.session) {
        console.log("📦 Storing session after OTP verification");
        setSession(verificationResult.data.session);
        setUser(verificationResult.data.user);
      }

      // API call
      try {
        const res = await fetch(
          "https://api.thevanapp.com/api/driver-details",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${verificationResult.data.session?.access_token}`,
            },
            body: JSON.stringify({
              unique_id: verificationResult.data.session?.user?.id,
              name: name,
              last_name: surname,
              plate: "DSD-001",
              phone: phoneNumber || "123",
              email: "test",
            }),
          }
        );
        console.log("✅ API call completed");
      } catch (apiError) {
        console.error("API error:", apiError);
      }

      // ✅ NOW COMPLETE REGISTRATION WITH PASSWORD
      console.log("🔑 Starting password setting process...");
      await completeRegistrationInternal(verificationResult.data.session);
    } catch (error) {
      console.log("❌ VERIFICATION ERROR:", error);
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
      } else {
        Alert.alert("Error", `Failed to verify code: ${errorMessage}`);
      }

      setLoading(false);
      setIsProcessingRegistration(false);
    }
  };

  // ✅ INTERNAL COMPLETE REGISTRATION
  const completeRegistrationInternal = async (currentSession: any) => {
    try {
      console.log("=== STARTING PASSWORD SETTING ===");
      console.log("Session exists:", !!currentSession);
      console.log("Password length:", password?.length || 0);
      console.log("Name:", name, "Surname:", surname);

      // Validation
      if (!password || password.length < 6) {
        throw new Error(
          "Password is required and must be at least 6 characters"
        );
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      if (!name || !surname) {
        throw new Error("Name and surname are required");
      }

      if (!currentSession) {
        throw new Error("No active session found");
      }

      // ✅ PASSWORD SETTING
      console.log("🔑 Setting password...");
      const { data: passwordData, error: passwordError } =
        await supabase.auth.updateUser({
          password: password,
        });

      if (passwordError) {
        console.error("❌ Password update failed:", passwordError);
        throw new Error(`Password setting failed: ${passwordError.message}`);
      }

      console.log("✅ PASSWORD SET SUCCESSFULLY!");

      // ✅ USER METADATA UPDATE
      console.log("📝 Updating user metadata...");
      const userDataToUpdate = {
        first_name: name,
        last_name: surname,
        full_name: `${name} ${surname}`,
        phone: phoneNumber,
        user_type: "driver",
        status: "incomplete",
      };

      const { data: updateData, error: updateError } =
        await supabase.auth.updateUser({
          data: userDataToUpdate,
        });

      if (updateError) {
        console.log("⚠️ Metadata update error:", updateError);
      } else {
        console.log("✅ User metadata updated successfully!");
      }

      // ✅ PASSWORD TEST
      console.log("🧪 Testing password...");
      try {
        const testLogin = await supabase.auth.signInWithPassword({
          phone: currentSession.user.phone,
          password: password,
        });

        if (testLogin.error) {
          console.log("⚠️ Password test failed:", testLogin.error.message);
        } else {
          console.log("✅ Password test successful!");
        }
      } catch (testError) {
        console.log("⚠️ Password test exception:", testError);
      }

      // ✅ FINAL SUCCESS
      setIsRegistrationComplete(true);

      Alert.alert(
        "Registration Complete!",
        `Welcome ${name}!\n\nYour account has been created successfully.\nPhone: ${phoneNumber}\nPassword: Set ✅\n\nYou can now login with your phone number and password.`,
        [
          {
            text: "Continue",
            onPress: () => {
              console.log("🚀 Navigating to driverVerification...");
              router.replace("/driverVerification");
            },
          },
        ]
      );
    } catch (error) {
      console.error("❌ Complete registration error:", error);
      Alert.alert(
        "Registration Error",
        `Failed to complete registration: ${error.message}\n\nPlease try again.`
      );

      setIsVerifying(true);
      setIsContactVerified(false);
    } finally {
      console.log("🏁 Setting loading to false");
      setLoading(false);
      setIsProcessingRegistration(false);
    }
  };

  // ✅ MANUAL COMPLETE REGISTRATION
  const completeRegistration = async () => {
    console.log("=== MANUAL completeRegistration CALL ===");

    setLoading(true);

    try {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!currentSession) {
        throw new Error(
          "No active session found. Please verify your contact first."
        );
      }

      await completeRegistrationInternal(currentSession);
    } catch (error) {
      console.error("Manual complete registration error:", error);
      Alert.alert("Error", error.message);
      setLoading(false);
    }
  };

  const resendVerificationCode = async () => {
    console.log("=== STARTING resendVerificationCode ===");
    if (!canResend) return;

    setLoading(true);
    try {
      const formattedPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `${selectedCountry.dialCode}${phoneNumber}`;

      console.log("Resending OTP to phone:", formattedPhone);
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) throw error;

      setTimer(60);
      setCanResend(false);
      Alert.alert(
        "Code Resent",
        "A new verification code has been sent to your phone."
      );
    } catch (error) {
      console.error("OTP resend error:", error);
      const errorMessage = (error as Error)?.message || "";

      if (
        errorMessage.includes("rate limit") ||
        errorMessage.includes("too many requests")
      ) {
        Alert.alert(
          "Rate Limit Exceeded",
          "Too many resend attempts. Please wait a few minutes."
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

  const goBackToRegistration = () => {
    console.log("Going back to registration");
    setIsVerifying(false);
    setOtpDigits(["", "", "", "", "", ""]);
    setTimer(60);
    setCanResend(false);
  };

  const handleContactMethodChange = (method: string) => {
    console.log("Contact method changing from", contactMethod, "to", method);
    console.log("Clearing verification state");

    setContactMethod(method);
    setIsContactVerified(false);
    setIsVerifying(false);
    setOtpDigits(["", "", "", "", "", ""]);
    setTimer(60);
    setCanResend(false);

    if (method === "phone") {
      setPhoneNumberError("");
    } else {
      setPhoneNumberError("");
    }
  };

  if (isAuthLoading) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color="#10b981" />
      </KeyboardAvoidingView>
    );
  }

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
            {/* ✅ LOADING OVERLAY FOR REGISTRATION PROCESS */}
            {isProcessingRegistration && (
              <ProcessingOverlay>
                <ActivityIndicator size="large" color="#27ae60" />
                <ProcessingText>Completing registration...</ProcessingText>
                <ProcessingSubText>
                  Setting up your account and password
                </ProcessingSubText>
              </ProcessingOverlay>
            )}

            {isVerifying ? (
              <VerificationScreen
                contactMethod={contactMethod}
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
              <RegistrationForm
                name={name}
                surname={surname}
                phoneNumber={phoneNumber}
                COUNTRIES={COUNTRIES}
                selectedCountry={selectedCountry}
                setSelectedCountry={setSelectedCountry}
                password={password}
                confirmPassword={confirmPassword}
                contactMethod={contactMethod}
                loading={loading}
                showPassword={showPassword}
                showConfirmPassword={showConfirmPassword}
                nameError={nameError}
                surnameError={surnameError}
                phoneNumberError={phoneNumberError}
                passwordError={passwordError}
                isContactVerified={isContactVerified}
                setName={(text: any) => {
                  setName(text);
                  setStoreName(text);
                  validateName(text);
                }}
                setSurname={(text: any) => {
                  setSurname(text);
                  setStoreSurname(text);
                  validateSurname(text);
                }}
                setPhoneNumber={setPhoneNumber}
                setPassword={(text: any) => {
                  setPassword(text);
                  validatePassword(text);
                }}
                setConfirmPassword={(text: any) => {
                  setConfirmPassword(text);
                  validateConfirmPassword(text);
                }}
                setShowPassword={setShowPassword}
                setShowConfirmPassword={setShowConfirmPassword}
                validatePhoneNumber={validatePhoneNumber}
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
                loading={loading}
                setCurrentStep={setCurrentStep}
                Title={Title}
                RequirementItem={RequirementItem}
                StyledButton={StyledButton}
              />
            ) : (
              <ConfirmationScreen
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
  position: relative;
`;

const ProcessingOverlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.95);
  justify-content: center;
  align-items: center;
  z-index: 1000;
  border-radius: 15px;
`;

const ProcessingText = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #27ae60;
  margin-top: 15px;
  text-align: center;
`;

const ProcessingSubText = styled.Text`
  font-size: 14px;
  color: #7f8c8d;
  margin-top: 5px;
  text-align: center;
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
