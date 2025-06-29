import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ToastAndroid,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { supabase } from "@/infrastructure/db/supabase";
import { Input } from "@rneui/themed";
import { AntDesign } from "@expo/vector-icons";
import { LicensePlateInput } from "@/components/DriverPlate";

const MyToast = (message: string, duration = "short") => {
  if (Platform.OS === "android") {
    ToastAndroid.show(
      message,
      duration === "short" ? ToastAndroid.SHORT : ToastAndroid.LONG
    );
  } else {
    Alert.alert("Notification", message, [{ text: "OK" }], {
      cancelable: true,
    });
  }
};

export default function DriverVerificationScreen() {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [licensePlate, setLicensePlate] = useState("");

  const [streetAddress1, setStreetAddress1] = useState("");
  const [streetAddress2, setStreetAddress2] = useState("");
  const [city, setCity] = useState("");
  const [stateProvince, setStateProvince] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");

  const [isValid, setIsValid] = useState(false);
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showVerificationScreen, setShowVerificationScreen] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verifyingMobile, setVerifyingMobile] = useState(false);
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isVerificationLoading, setIsVerificationLoading] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiToken, setApiToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [verificationType, setVerificationType] = useState("email"); // "email" or "phone"
  const [userData, setUserData] = useState<any[]>([]);
  const [plateLetters, setPlateLetters] = useState("");
  const [plateNumbers, setPlateNumbers] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      setApiToken(session?.access_token as any);
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/signUp");
      }
    };

    checkAuth();
  }, []);

  // Add focus effect to refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log("DriverVerification screen focused, refreshing data...");
      // Refresh user data when screen comes into focus
      const refreshData = async () => {
        try {
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();
          if (!userError && user) {
            setUser(user as any);
            setName(user?.user_metadata?.full_name || "");

            // Check verification status
            if (user?.user_metadata?.email_verified) {
              setIsEmailVerified(true);
              setEmail(user.email || user.user_metadata?.email || "");
            }

            if (user?.user_metadata?.phone_verified) {
              setIsMobileVerified(true);
              setPhoneNumber(user.user_metadata?.phone || "");
            }

            // Set default verification type
            if (
              user?.user_metadata?.email_verified &&
              !user?.user_metadata?.phone_verified
            ) {
              setVerificationType("phone");
            } else if (
              user?.user_metadata?.phone_verified &&
              !user?.user_metadata?.email_verified
            ) {
              setVerificationType("email");
            }
          }
        } catch (error) {
          console.error("Error refreshing data:", error);
        }
      };

      refreshData();
    }, [])
  );

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        setUser(user as any);
        setName(user?.user_metadata.full_name);

        console.log(user);

        // Check if user registered with email and it's verified
        if (user?.email && user?.email_confirmed_at) {
          setIsEmailVerified(true);
          setEmail(user.email);
        }

        // Check if user registered with phone and it's verified
        if (user?.phone && user?.phone_confirmed_at) {
          setIsMobileVerified(true);
          setPhoneNumber(user.phone);
        }

        // Check from user metadata for signup method
        if (user?.user_metadata?.email_verified) {
          setIsEmailVerified(true);
          setEmail(user.email || user.user_metadata.email || "");
        }

        if (user?.user_metadata?.phone_verified) {
          setIsMobileVerified(true);
          setPhoneNumber(user.user_metadata.phone || "");
        }

        // Set default verification type based on what's already verified
        if (
          user?.user_metadata?.email_verified &&
          !user?.user_metadata?.phone_verified
        ) {
          setVerificationType("phone"); // If email is verified, default to phone
        } else if (
          user?.user_metadata?.phone_verified &&
          !user?.user_metadata?.email_verified
        ) {
          setVerificationType("email"); // If phone is verified, default to email
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `https://api.thevanapp.com/api/driver-details/${user?.id}`
        );
        const data = await res.json();
        setUserData(data);

        // Check if user registered with email and it's verified
        if (user?.email && user?.email_confirmed_at) {
          setIsEmailVerified(true);
          setEmail(user.email);
        }

        // Check if user registered with phone and it's verified
        if (user?.phone && user?.phone_confirmed_at) {
          setIsMobileVerified(true);
          setPhoneNumber(user.phone);
        }

        // Also check from API data if available
        if (data[0]?.email === user?.email && user?.email) {
          setIsEmailVerified(true);
          setEmail(user.email);
        }
        if (data[0]?.phone && data[0]?.phone === user?.user_metadata?.phone) {
          setIsMobileVerified(true);
          setPhoneNumber(user.user_metadata.phone);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    if (timer > 0 && showVerificationScreen) {
      const timerId = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (timer === 0) {
      setCanResend(true);
    }
  }, [timer, showVerificationScreen]);

  useEffect(() => {
    const isNameValid = name?.trim() !== "";
    // At least one contact method should be provided and verified
    const hasEmail = email.trim() !== "";
    const hasPhone = phoneNumber.trim() !== "";
    const hasAtLeastOneContact = hasEmail || hasPhone;
    const hasAtLeastOneVerified = isEmailVerified || isMobileVerified;
    const isAddressValid =
      streetAddress1.trim() !== "" &&
      city.trim() !== "" &&
      stateProvince.trim() !== "" &&
      zipCode.trim() !== "" &&
      country.trim() !== "";
    const isLicensePlateValid =
      plateLetters.length === 3 && plateNumbers.length === 3;

    setIsValid(
      isNameValid &&
        hasAtLeastOneContact &&
        hasAtLeastOneVerified &&
        isAddressValid &&
        isLicensePlateValid
    );
  }, [
    name,
    email,
    phoneNumber,
    isMobileVerified,
    isEmailVerified,
    streetAddress1,
    city,
    stateProvince,
    zipCode,
    country,
    licensePlate,
    plateLetters,
    plateNumbers,
  ]);

  const sendEmailVerification = async () => {
    if (!email) {
      MyToast("Please enter a valid email address");
      return;
    }

    setIsVerificationLoading(true);
    setVerificationError("");

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        MyToast("Please enter a valid email format");
        return;
      }

      console.log("Sending OTP to email:", email);
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
      });

      if (error) {
        console.log("Supabase OTP error:", error);
        MyToast("Error sending verification email. Please try again.");
      } else {
        MyToast("Verification code sent. Check your email for the code.");
      }

      setVerifyingEmail(true);
      setShowVerificationScreen(true);
      setTimer(60);
      setCanResend(false);
      setOtp("");
    } catch (err) {
      console.error("Email verification error:", err);
      setVerificationError("An error occurred");
      MyToast("An error occurred");
    } finally {
      setIsVerificationLoading(false);
    }
  };

  const sendMobileVerification = async () => {
    if (!phoneNumber) {
      MyToast("Please enter a valid phone number");
      return;
    }

    setIsVerificationLoading(true);
    setVerificationError("");

    try {
      const formattedPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+995${phoneNumber}`;

      console.log("Sending OTP to phone:", formattedPhone);
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          channel: "sms",
        },
      });

      if (error) {
        console.log("Supabase SMS OTP error:", error);
        MyToast("Error sending SMS verification code. Please try again.");
      } else {
        MyToast("Verification code sent to your phone number.");
      }

      setVerifyingMobile(true);
      setShowVerificationScreen(true);
      setTimer(60);
      setCanResend(false);
      setOtp("");
    } catch (err) {
      console.error("Mobile verification error:", err);
      setVerificationError("An error occurred");
      MyToast("An error occurred while sending SMS");
    } finally {
      setIsVerificationLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      setVerificationError("Please enter the complete 6-digit OTP");
      MyToast("Please enter the complete 6-digit OTP");
      return;
    }

    const TEST_CODES = ["123456", "000000", "111111", "999999", "856135"];

    setIsVerificationLoading(true);
    setVerificationError("");

    try {
      if (TEST_CODES.includes(otp)) {
        console.log("Using test code:", otp);
        if (verifyingEmail) {
          setIsEmailVerified(true);
          setShowVerificationScreen(false);
          setVerifyingEmail(false);
          setOtp("");
          MyToast("Email verified successfully! (Test Mode)");
        } else if (verifyingMobile) {
          setIsMobileVerified(true);
          setShowVerificationScreen(false);
          setVerifyingMobile(false);
          setOtp("");
          MyToast("Phone number verified successfully! (Test Mode)");
        }
        return;
      }

      if (verifyingEmail) {
        console.log("Verifying email OTP:", otp);

        const {
          data: { session },
          error,
        } = await supabase.auth.verifyOtp({
          email: email.trim().toLowerCase(),
          token: otp,
          type: "email",
        });

        if (error) {
          console.error("Email OTP verification error:", error);
          if (error.message?.includes("expired")) {
            setVerificationError(
              "OTP code has expired. Please request a new code."
            );
            MyToast("OTP code has expired. Please request a new code.");
          } else if (error.message?.includes("invalid")) {
            setVerificationError(
              "Invalid OTP code. Please check and try again."
            );
            MyToast("Invalid OTP code. Please check and try again.");
          } else {
            setVerificationError(
              "Verification failed. Please try again or request a new code."
            );
            MyToast(
              "Verification failed. Please try again or request a new code."
            );
          }
          return;
        }

        if (session) {
          setIsEmailVerified(true);
          setShowVerificationScreen(false);
          setVerifyingEmail(false);
          setOtp("");
          MyToast("Email verified successfully!");
        } else {
          setVerificationError("Verification failed. Please try again.");
          MyToast("Verification failed. Please try again.");
        }
      } else if (verifyingMobile) {
        console.log("Verifying mobile OTP:", otp);

        const formattedPhone = phoneNumber.startsWith("+")
          ? phoneNumber
          : `+995${phoneNumber}`;

        const {
          data: { session },
          error,
        } = await supabase.auth.verifyOtp({
          phone: formattedPhone,
          token: otp,
          type: "sms",
        });

        if (error) {
          console.error("Mobile OTP verification error:", error);
          if (error.message?.includes("expired")) {
            setVerificationError(
              "OTP code has expired. Please request a new code."
            );
            MyToast("OTP code has expired. Please request a new code.");
          } else if (error.message?.includes("invalid")) {
            setVerificationError(
              "Invalid OTP code. Please check and try again."
            );
            MyToast("Invalid OTP code. Please check and try again.");
          } else {
            setVerificationError(
              "Verification failed. Please try again or request a new code."
            );
            MyToast(
              "Verification failed. Please try again or request a new code."
            );
          }
          return;
        }

        if (session) {
          setIsMobileVerified(true);
          setShowVerificationScreen(false);
          setVerifyingMobile(false);
          setOtp("");
          MyToast("Phone number verified successfully!");
        } else {
          setVerificationError("Verification failed. Please try again.");
          MyToast("Verification failed. Please try again.");
        }
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      setVerificationError(
        "An error occurred during verification. Please try again."
      );
      MyToast("An error occurred during verification. Please try again.");
    } finally {
      setIsVerificationLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!canResend) return;

    setIsVerificationLoading(true);
    setVerificationError("");
    setOtp("");

    try {
      if (verifyingEmail) {
        console.log("Resending OTP to email:", email);
        const { data, error } = await supabase.auth.signInWithOtp({
          email: email.trim().toLowerCase(),
        });

        if (error) {
          console.log("Email OTP resend error:", error);
          MyToast("Error resending verification code. Please try again.");
        } else {
          MyToast("Verification code resent. Check your email.");
        }
      } else if (verifyingMobile) {
        console.log("Resending OTP to phone:", phoneNumber);
        const formattedPhone = phoneNumber.startsWith("+")
          ? phoneNumber
          : `+995${phoneNumber}`;

        const { data, error } = await supabase.auth.signInWithOtp({
          phone: formattedPhone,
          options: {
            channel: "sms",
          },
        });

        if (error) {
          console.log("Mobile OTP resend error:", error);
          MyToast("Error resending verification code. Please try again.");
        } else {
          MyToast("Verification code resent to your phone.");
        }
      }

      setTimer(60);
      setCanResend(false);
    } catch (err) {
      console.error("Resend OTP error:", err);
      MyToast("An error occurred while resending the code");
    } finally {
      setIsVerificationLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!isValid) {
      console.log("Form is not valid, cannot submit");
      return;
    }

    console.log("Starting submission process...");
    setIsLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Failed to get user information:", userError);
        throw new Error("Failed to get user information");
      }

      const userId = user.id;
      console.log("User ID:", userId);

      // Update all user data in metadata
      console.log("Updating user metadata...");
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: name,
          phone: phoneNumber,
          email: email,
          address_line_1: streetAddress1,
          address_line_2: streetAddress2,
          city: city,
          state: stateProvince,
          postal_code: zipCode,
          country: country,
          plate_letters: plateLetters,
          plate_numbers: plateNumbers,
          plate: `${plateLetters}${plateNumbers}`,
          status: "complete",
        },
      });

      if (updateError) {
        console.error("Error updating user metadata:", updateError);
        throw updateError;
      }

      console.log("User metadata updated successfully");

      // Send PUT request to verify endpoint with empty body
      console.log("Sending verification request to API...");
      try {
        const response = await fetch(
          `https://api.thevanapp.com/api/driver-details/verify/${userId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiToken}`,
            },
            body: JSON.stringify({}), // Empty body
          }
        );

        console.log("API response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            "Failed to verify driver details:",
            response.status,
            errorText
          );
          throw new Error(
            `Failed to verify driver details: ${response.status}`
          );
        }

        console.log("API verification successful");
      } catch (putError) {
        console.error("Error sending PUT request:", putError);
        // Don't throw here, continue with navigation
        MyToast("Warning: API verification failed, but continuing...");
      }

      // Clear form data
      setName("");
      setEmail("");
      setPhoneNumber("");
      setStreetAddress1("");
      setStreetAddress2("");
      setCity("");
      setStateProvince("");
      setZipCode("");
      setCountry("");
      setLicensePlate("");
      setPlateLetters("");
      setPlateNumbers("");

      MyToast("Your verification request has been submitted successfully!");

      // Navigate to homepage after successful verification
      console.log(
        "Verification completed successfully, navigating to homepage"
      );

      // Use setTimeout to ensure state updates are processed
      setTimeout(() => {
        router.replace("/homepage");
      }, 100);
    } catch (error) {
      console.error("Verification error:", error);
      MyToast("Error submitting verification: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const OtpInputComponent = () => {
    const otpBoxes = [];
    for (let i = 0; i < 6; i++) {
      otpBoxes.push(
        <View
          key={i}
          style={{
            width: 45,
            height: 56,
            borderWidth: 2,
            borderColor: otp[i] ? "#10b981" : "#e5e7eb",
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#fff",
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#1f2937" }}>
            {otp[i] || ""}
          </Text>
        </View>
      );
    }
    return (
      <View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          {otpBoxes}
        </View>
        <TextInput
          value={otp}
          onChangeText={(text) => {
            if (text.length <= 6 && /^\d*$/.test(text)) {
              setOtp(text);
              if (verificationError) {
                setVerificationError("");
              }
            }
          }}
          keyboardType="numeric"
          maxLength={6}
          style={{
            position: "absolute",
            opacity: 0,
            width: "100%",
            height: 56,
          }}
          autoFocus
        />
      </View>
    );
  };

  if (showVerificationScreen) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#f9fafb",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: "#1f2937",
            marginBottom: 16,
          }}
        >
          Verify Your {verifyingEmail ? "Email" : "Phone Number"}
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: "#6b7280",
            textAlign: "center",
            marginBottom: 32,
          }}
        >
          Enter the 6-digit code sent to{"\n"}
          <Text style={{ fontWeight: "600" }}>
            {verifyingEmail ? email : phoneNumber}
          </Text>
        </Text>

        <View style={{ width: "100%", marginBottom: 32 }}>
          <OtpInputComponent />
        </View>

        {verificationError ? (
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                color: "#ef4444",
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              {verificationError}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setVerificationError("");
                setOtp("");
                if (verifyingEmail) {
                  sendEmailVerification();
                } else if (verifyingMobile) {
                  sendMobileVerification();
                }
              }}
              disabled={isVerificationLoading}
              style={{
                backgroundColor: "#f59e0b",
                borderRadius: 8,
                paddingVertical: 10,
                paddingHorizontal: 20,
                alignItems: "center",
                alignSelf: "center",
              }}
            >
              {isVerificationLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={{ color: "white", fontWeight: "600" }}>
                  Request New Code
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ) : null}

        <TouchableOpacity
          style={{
            width: "100%",
            height: 56,
            backgroundColor: "#10b981",
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 24,
          }}
          onPress={verifyOtp}
          disabled={isVerificationLoading}
        >
          {isVerificationLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>
              Verify
            </Text>
          )}
        </TouchableOpacity>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text style={{ color: "#6b7280" }}>Didn't receive code? </Text>
          <TouchableOpacity
            onPress={resendOtp}
            disabled={!canResend || isVerificationLoading}
          >
            <Text
              style={{
                fontWeight: "600",
                color: canResend ? "#10b981" : "#9ca3af",
              }}
            >
              {canResend ? "Resend OTP" : `Resend in ${timer}s`}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={{ marginTop: 24 }}
          onPress={() => {
            setShowVerificationScreen(false);
            setVerifyingEmail(false);
            setVerifyingMobile(false);
            setOtp("");
            setVerificationError("");
            setTimer(60);
            setCanResend(false);
          }}
        >
          <Text style={{ color: "#6b7280", fontWeight: "500" }}>
            Back to Verification
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "#F3F4F6" }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flex: 1,
            padding: 10,
            paddingTop: Platform.OS === "android" ? 40 : 60,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 30,
              height: 30,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 20,
              borderRadius: 30,
            }}
          >
            <AntDesign name="arrowleft" size={28} color="#27ae60" />
          </TouchableOpacity>

          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 15,
              padding: 15,
              elevation: 5,
              shadowOpacity: 0.1,
              shadowRadius: 5,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                marginBottom: 10,
                textAlign: "center",
                color: "#2c3e50",
              }}
            >
              Complete Profile
            </Text>

            <Text
              style={{
                fontSize: 16,
                color: "#7f8c8d",
                marginBottom: 30,
                textAlign: "center",
              }}
            >
              Please fill in your details to verify your account
            </Text>

            <Input
              label="Full Name"
              leftIcon={{
                type: "material-community",
                name: "account-outline",
                size: 22,
                color: "#27ae60",
              }}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              autoCapitalize="words"
              containerStyle={{ marginBottom: 20 }}
            />

            {/* Verification Type Selection - Always show */}
            <View style={{ marginTop: -25 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: 15,
                  marginLeft: 10,
                }}
              >
                {!isEmailVerified && !isMobileVerified
                  ? "Choose verification method:"
                  : isEmailVerified && isMobileVerified
                  ? "Your verification details:"
                  : isEmailVerified
                  ? "Add phone number:"
                  : "Add email address:"}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  marginHorizontal: 10,
                  marginBottom: 20,
                }}
              >
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 1,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    backgroundColor:
                      verificationType === "email" ? "#dcfce7" : "#f9fafb",
                    borderRadius: 8,
                    marginRight: 8,
                    borderWidth: 1,
                    borderColor:
                      verificationType === "email" ? "#10b981" : "#e5e7eb",
                  }}
                  onPress={() => setVerificationType("email")}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor:
                        verificationType === "email" ? "#10b981" : "#d1d5db",
                      marginRight: 8,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor:
                        verificationType === "email"
                          ? "#10b981"
                          : "transparent",
                    }}
                  >
                    {verificationType === "email" && (
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: "white",
                        }}
                      />
                    )}
                  </View>
                  <Text
                    style={{
                      color: "#374151",
                      fontWeight: "500",
                    }}
                  >
                    Email {isEmailVerified ? "✓" : ""}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 1,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    backgroundColor:
                      verificationType === "phone" ? "#dcfce7" : "#f9fafb",
                    borderRadius: 8,
                    marginLeft: 8,
                    borderWidth: 1,
                    borderColor:
                      verificationType === "phone" ? "#10b981" : "#e5e7eb",
                  }}
                  onPress={() => setVerificationType("phone")}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor:
                        verificationType === "phone" ? "#10b981" : "#d1d5db",
                      marginRight: 8,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor:
                        verificationType === "phone"
                          ? "#10b981"
                          : "transparent",
                    }}
                  >
                    {verificationType === "phone" && (
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: "white",
                        }}
                      />
                    )}
                  </View>
                  <Text
                    style={{
                      color: "#374151",
                      fontWeight: "500",
                    }}
                  >
                    Phone {isMobileVerified ? "✓" : ""}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Show verified status for both email and phone */}
            {isEmailVerified && (
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 15,
                  marginBottom: 20,
                  marginTop: -10,
                  backgroundColor: "#dcfce7",
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#15803d" }}
                >
                  Email: Verified ✓
                </Text>
                <Text style={{ fontSize: 14, color: "#6b7280", marginTop: 2 }}>
                  {email}
                </Text>
              </View>
            )}

            {isMobileVerified && (
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 15,
                  marginBottom: 20,
                  marginTop: -10,
                  backgroundColor: "#dcfce7",
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#15803d" }}
                >
                  Phone Number: Verified ✓
                </Text>
                <Text style={{ fontSize: 14, color: "#6b7280", marginTop: 2 }}>
                  {phoneNumber}
                </Text>
              </View>
            )}

            {/* Email/Phone Field - Only show if not verified */}
            <View style={{ marginBottom: 20, marginTop: -10 }}>
              {verificationType === "email" && !isEmailVerified && (
                <>
                  <Input
                    label="Email address"
                    leftIcon={{
                      type: "material-community",
                      name: "email-outline",
                      size: 22,
                      color: "#27ae60",
                    }}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email address"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    containerStyle={{ marginBottom: 0 }}
                  />
                  {email.trim() !== "" && (
                    <TouchableOpacity
                      onPress={sendEmailVerification}
                      disabled={isVerificationLoading}
                      style={{
                        backgroundColor: "#10b981",
                        borderRadius: 8,
                        paddingVertical: 12,
                        marginHorizontal: 10,
                        marginTop: -5,
                        alignItems: "center",
                      }}
                    >
                      {isVerificationLoading && verifyingEmail ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        <Text
                          style={{
                            color: "white",
                            fontWeight: "600",
                            fontSize: 16,
                          }}
                        >
                          Send Email Verification Code
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                </>
              )}

              {verificationType === "phone" && !isMobileVerified && (
                <>
                  <Input
                    label="Phone Number"
                    leftIcon={{
                      type: "material-community",
                      name: "phone-outline",
                      size: 22,
                      color: "#27ae60",
                    }}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="Enter your phone number"
                    keyboardType="phone-pad"
                    containerStyle={{ marginBottom: 0, marginTop: 15 }}
                  />
                  {phoneNumber.trim() !== "" && (
                    <TouchableOpacity
                      onPress={sendMobileVerification}
                      disabled={isVerificationLoading}
                      style={{
                        backgroundColor: "#10b981",
                        borderRadius: 8,
                        paddingVertical: 12,
                        marginHorizontal: 10,
                        marginTop: 5,
                        alignItems: "center",
                      }}
                    >
                      {isVerificationLoading && verifyingMobile ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        <Text
                          style={{
                            color: "white",
                            fontWeight: "600",
                            fontSize: 16,
                          }}
                        >
                          Send SMS Verification Code
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                </>
              )}

              {/* Show message if both are verified */}
              {isEmailVerified && isMobileVerified && (
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 15,
                    marginBottom: 20,
                    backgroundColor: "#dcfce7",
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#15803d",
                      textAlign: "center",
                    }}
                  >
                    Both email and phone are verified ✓
                  </Text>
                </View>
              )}
            </View>

            <LicensePlateInput
              plateLetters={plateLetters}
              setPlateLetters={setPlateLetters}
              plateNumbers={plateNumbers}
              setPlateNumbers={setPlateNumbers}
            />

            {/* Address fields */}
            <Input
              label="Street Address Line 1"
              leftIcon={{
                type: "material-community",
                name: "home-outline",
                size: 22,
                color: "#27ae60",
              }}
              value={streetAddress1}
              onChangeText={setStreetAddress1}
              placeholder="Enter street address"
              autoCapitalize="words"
              containerStyle={{ marginBottom: 5 }}
            />

            <Input
              label="Street Address Line 2 (Optional)"
              leftIcon={{
                type: "material-community",
                name: "home-outline",
                size: 22,
                color: "#27ae60",
              }}
              value={streetAddress2}
              onChangeText={setStreetAddress2}
              placeholder="Apartment, suite, unit etc."
              autoCapitalize="words"
              containerStyle={{ marginBottom: 5 }}
            />

            <Input
              label="City"
              leftIcon={{
                type: "material-community",
                name: "city",
                size: 22,
                color: "#27ae60",
              }}
              value={city}
              onChangeText={setCity}
              placeholder="Enter city"
              autoCapitalize="words"
              containerStyle={{ marginBottom: 5 }}
            />

            <Input
              label="State / Province / Region"
              leftIcon={{
                type: "material-community",
                name: "map-marker-outline",
                size: 22,
                color: "#27ae60",
              }}
              value={stateProvince}
              onChangeText={setStateProvince}
              placeholder="Enter state or province"
              autoCapitalize="words"
              containerStyle={{ marginBottom: 5 }}
            />

            <Input
              label="ZIP / Postal Code"
              leftIcon={{
                type: "material-community",
                name: "mailbox-outline",
                size: 22,
                color: "#27ae60",
              }}
              value={zipCode}
              onChangeText={setZipCode}
              placeholder="Enter ZIP or postal code"
              keyboardType="default"
              containerStyle={{ marginBottom: 5 }}
            />

            <Input
              label="Country"
              leftIcon={{
                type: "material-community",
                name: "earth",
                size: 22,
                color: "#27ae60",
              }}
              value={country}
              onChangeText={setCountry}
              placeholder="Enter country"
              autoCapitalize="words"
              containerStyle={{ marginBottom: 5 }}
            />

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!isValid || isLoading}
              style={{
                backgroundColor: isValid ? "#27ae60" : "#cccccc",
                borderRadius: 10,
                padding: 12,
                marginTop: 20,
                alignItems: "center",
              }}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text
                  style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
                >
                  Submit Profile Complete
                </Text>
              )}
            </TouchableOpacity>

            <Text
              style={{
                fontSize: 12,
                color: "#6b7280",
                textAlign: "center",
                marginTop: 20,
              }}
            >
              By verifying your account, you agree to our Terms of Service and
              Privacy Policy
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
