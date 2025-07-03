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

  // Session management - ამოღებული tempSession logic
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);

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

  useEffect(() => {
    // Load session from AsyncStorage on component mount
    const load = async () => {
      await loadSessionFromStorage();
      setIsAuthLoading(false);
    };
    load();
  }, []);

  // Check if user is already authenticated and redirect to driverVerification
  useEffect(() => {
    if (isAuthLoading) return;
    const checkExistingSession = async () => {
      const currentState = useAuthStore.getState();
      let indicator = null;
      let status = null;
      if (currentState.user) {
        indicator =
          currentState.user.indicator ||
          currentState.user.user_metadata?.indicator;
        status =
          currentState.user.status || currentState.user.user_metadata?.status;
      }
      console.log("[signUp] session:", currentState.session);
      console.log("[signUp] user:", currentState.user);
      console.log("[signUp] status:", status);
      // Only redirect if BOTH session and user exist
      if (currentState.session && currentState.user) {
        if (status === "active" || status === "complete") {
          console.log("[signUp] Redirecting to homepage");
          router.replace("/(tabs)/homepage");
        } else {
          console.log("[signUp] Redirecting to driverVerification");
          router.replace("/driverVerification");
        }
      } else {
        console.log("[signUp] No session or user, staying on signUp");
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

  // Session listener - სრულიად გამორთული ვერიფიკაციის დროს
  useEffect(() => {
    // ✅ ვერიფიკაციის დროს Auth Listener სრულიად გამორთული
    if (isVerifying) {
      console.log(
        "Auth listener completely disabled - verification in progress"
      );
      return;
    }

    console.log("Auth listener active");
    console.log("Current state - isContactVerified:", isContactVerified);
    console.log("Current state - isVerifying:", isVerifying);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      console.log("isRegistrationComplete:", isRegistrationComplete);

      // ✅ Session-ის შენახვა Zustand store-ში USER_UPDATED event-ის დროს
      if (session && event === "USER_UPDATED") {
        console.log(
          "USER_UPDATED event detected, storing session in Zustand store"
        );
        setSession(session);
        setUser(session.user);
        console.log("Session stored in Zustand store from auth state change");

        // ✅ ტესტი რომ დავრწმუნდეთ რომ session შენახულია
        const testStore = useAuthStore.getState();
        console.log("Zustand store test from auth state change:", {
          hasSession: !!testStore.session,
          hasUser: !!testStore.user,
          userId: testStore.user?.id,
        });
      }

      // ✅ USER_UPDATED event-ის დამატება რეგისტრაციის დასრულებისთვის
      if (session && (isRegistrationComplete || event === "USER_UPDATED")) {
        console.log(
          "Registration complete or user updated, but navigation handled in completeRegistration"
        );
        console.log(
          "Event:",
          event,
          "isRegistrationComplete:",
          isRegistrationComplete
        );
        // ✅ Navigation მოხდება completeRegistration-ში params-ით
        // router.replace("/homepage");
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [isRegistrationComplete, isVerifying, isContactVerified]);

  // ✅ Track isContactVerified state changes
  useEffect(() => {
    console.log("isContactVerified state changed to:", isContactVerified);
  }, [isContactVerified]);

  const validatePhoneNumber = (phone: string) => {
    if (contactMethod === "phone") {
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

  // ვერიფიკაციის კოდის გაგზავნა
  const sendVerificationCode = async () => {
    console.log("=== STARTING sendVerificationCode ===");
    console.log("Contact method:", contactMethod);
    console.log("Phone:", phoneNumber);

    // ვალიდაცია
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

  // OTP-ს ვერიფიკაცია - სრული ლოგიკით
  const verifyOtp = async () => {
    console.log("VERIFYOTP START");
    const otpValue = otpDigits.join("");
    console.log("OTP VALUE:", otpValue);

    if (otpValue.length !== 6) {
      console.log("OTP LENGTH INVALID");
      Alert.alert("Error", "Please enter the complete 6-digit code");
      return;
    }

    console.log("SETTING LOADING TRUE");
    setLoading(true);

    try {
      console.log("IN TRY BLOCK - STARTING REAL VERIFICATION");
      let verificationResult;

      const formattedPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `${selectedCountry.dialCode}${phoneNumber}`;

      console.log("Verifying phone OTP:", otpValue);
      verificationResult = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otpValue,
        type: "sms",
      });

      console.log("Verification result:", verificationResult);

      if (verificationResult.error) {
        console.error("OTP verification failed:", verificationResult.error);
        throw verificationResult.error;
      }

      console.log("REAL VERIFICATION SUCCESS, SETTING STATES");
      console.log("Setting isContactVerified to true");
      setIsContactVerified(true);
      console.log("Setting isVerifying to false");
      setIsVerifying(false);
      console.log("Clearing OTP digits");
      setOtpDigits(["", "", "", "", "", ""]);

      // ✅ Session-ის შენახვა Zustand store-ში OTP verification-ის შემდეგ
      if (verificationResult.data.session) {
        console.log("Storing session in Zustand store after OTP verification");
        setSession(verificationResult.data.session);
        setUser(verificationResult.data.user);
        console.log("Session stored in Zustand store after OTP verification");

        // ✅ ტესტი რომ დავრწმუნდეთ რომ session შენახულია
        const testStore = useAuthStore.getState();
        console.log("Zustand store test after OTP verification:", {
          hasSession: !!testStore.session,
          hasUser: !!testStore.user,
          userId: testStore.user?.id,
        });
      }

      // ✅ აღარ ვაკეთებთ signOut - იუზერი რჩება ავტორიზებული
      console.log("User verified successfully, staying logged in");
      console.log("isContactVerified should now be true");

      console.log("SHOWING ALERT");
      Alert.alert(
        "Success",
        "Phone number verified successfully! Now you can complete your registration."
      );

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
        if (!res.ok && res.status !== 409) {
          throw new Error(`driver-details API error: ${res.status}`);
        }
        if (res.ok) {
          console.log("driver-details API registration successful");
        } else if (res.status === 409) {
          console.log("driver-details API: user already exists (409)");
        }
      } catch (apiError) {
        console.error("driver-details API registration error:", apiError);
      }
      // === END POST ===
    } catch (error) {
      console.log("IN CATCH BLOCK:", error);
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
    } finally {
      console.log("IN FINALLY - SETTING LOADING FALSE");
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

  // ვერიფიკაციის გვერდიდან დაბრუნება
  const goBackToRegistration = () => {
    console.log("Going back to registration");
    setIsVerifying(false);
    setOtpDigits(["", "", "", "", "", ""]);
    setTimer(60);
    setCanResend(false);
  };

  // ✅ ახალი მარტივი რეგისტრაცია - ნავიგაცია პირველად
  const completeRegistration = async () => {
    console.log(
      "=== STARTING completeRegistration (Navigate First Version) ==="
    );
    console.log("isContactVerified:", isContactVerified);
    console.log("Current step:", currentStep);
    console.log("Loading state:", loading);

    // Add logging before validation
    console.log("phoneNumber before validation:", phoneNumber);
    let finalPhoneNumber = phoneNumber;
    if (!finalPhoneNumber) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        finalPhoneNumber =
          user?.phone ||
          user?.user_metadata?.phone ||
          user?.user_metadata?.temp_phone ||
          "";
        console.log("Fetched phone from Supabase user:", finalPhoneNumber);
      } catch (err) {
        console.error("Error fetching user for phone fallback:", err);
      }
    }

    // Use finalPhoneNumber for validation and update
    const isPhoneValid = validatePhoneNumber(finalPhoneNumber);
    if (!isPhoneValid) {
      console.log("Validation failed, showing alert");
      Alert.alert("Error", "Please fill all required fields correctly.");
      return;
    }

    // კონტაქტის ვერიფიკაციის შემოწმება
    if (!isContactVerified) {
      console.log("Contact not verified, showing alert");
      Alert.alert("Error", `Please verify your ${contactMethod} first.`);
      return;
    }

    console.log("COMPLETE REGISTRATION - SETTING LOADING TRUE");
    setLoading(true);

    try {
      console.log("STEP 1: Getting current session...");
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!currentSession) {
        throw new Error("No active session found");
      }

      console.log("STEP 2: Current session found:", {
        userId: currentSession?.user?.id,
      });

      // ✅ პირველად ნავიგაცია
      console.log("STEP 3: Navigating to driverVerification FIRST...");
      router.replace("/driverVerification");
      console.log("STEP 4: Navigation command sent!");

      // ✅ შემდეგ მონაცემების განახლება background-ში
      console.log("STEP 5: Now updating user data in background...");

      const userDataToUpdate = {
        first_name: name,
        last_name: surname,
        full_name: `${name} ${surname}`,
        phone: finalPhoneNumber,
        user_type: "driver",
        status: "incomplete",
      };

      console.log("STEP 6: Sending user data to updateUser...");
      const { data: updateData, error: updateError } =
        await supabase.auth.updateUser({
          data: userDataToUpdate,
        });

      console.log("STEP 7: UpdateUser response:", { updateData, updateError });

      if (updateError) {
        console.error("User update error:", updateError);
        // Don't throw, just log the error
      } else {
        console.log("STEP 8: User data updated successfully!");
      }

      // ✅ Session-ის შენახვა Zustand store-ში
      console.log("STEP 9: Storing session in Zustand store...");
      setSession(currentSession);
      setUser(currentSession.user);
      console.log("Session stored in Zustand store successfully");

      // ✅ რეგისტრაცია დასრულებულია
      console.log("STEP 10: Setting isRegistrationComplete to true");
      setIsRegistrationComplete(true);

      console.log("STEP 11: All background tasks completed!");
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = (error as Error)?.message || "";

      if (
        errorMessage.includes("JWT expired") ||
        errorMessage.includes("Invalid JWT")
      ) {
        Alert.alert(
          "Session Expired",
          "Your verification session has expired. Please verify your contact method again."
        );
        setIsContactVerified(false);
        setIsVerifying(true);
      } else {
        Alert.alert(
          "Registration Error",
          errorMessage || "Failed to complete registration. Please try again."
        );
      }
    } finally {
      console.log("COMPLETE REGISTRATION - SETTING LOADING FALSE");
      setLoading(false);
    }
  };

  // კონტაქტის მეთოდის შეცვლისას ვერიფიკაციის გაუქმება
  const handleContactMethodChange = (method: string) => {
    console.log("Contact method changing from", contactMethod, "to", method);
    console.log("Clearing verification state");

    setContactMethod(method);
    setIsContactVerified(false);
    setIsVerifying(false);
    setOtpDigits(["", "", "", "", "", ""]);
    setTimer(60);
    setCanResend(false);

    // შესაბამისი ველების გასუფთავება
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
              (() => {
                return (
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
                    }}
                    setSurname={(text: any) => {
                      setSurname(text);
                      setStoreSurname(text);
                    }}
                    setPhoneNumber={setPhoneNumber}
                    setPassword={setPassword}
                    setConfirmPassword={setConfirmPassword}
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
                );
              })()
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
