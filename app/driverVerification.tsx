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
import { LicensePlateInput } from "@/components/DriverPlate";
import { useAuthStore } from "@/infrastructure/store/store";

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
  const {
    completeVerification,
    setUserIndicator,
    setDriverData,
    session,
    user: storeUser,
  } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [licensePlate, setLicensePlate] = useState("");

  const [streetAddress1, setStreetAddress1] = useState("");
  const [streetAddress2, setStreetAddress2] = useState("");
  const [city, setCity] = useState("");
  const [stateProvince, setStateProvince] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");

  const [isValid, setIsValid] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showVerificationScreen, setShowVerificationScreen] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
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
  const [emailStep, setEmailStep] = useState<"input" | "otp" | "verified">(
    "input"
  );
  const [phone, setPhone] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setIsAuthLoading(true);
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      setApiToken(session?.access_token as any);
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/signUp");
      }
      setIsAuthLoading(false);
    };
    checkAuth();
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log("DriverVerification screen focused, refreshing data...");
      const refreshData = async () => {
        try {
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();
          if (!userError && user) {
            setUser(user as any);
          }
        } catch (error) {
          console.error("Error refreshing data:", error);
        }
      };

      refreshData();
    }, [])
  );

  useEffect(() => {
    if (user) {
      console.log("[driverVerification] user:", user);
      const userFullName =
        user.user_metadata?.full_name ||
        user.user_metadata?.fullname ||
        user.user_metadata?.first_name ||
        "";
      console.log("[driverVerification] resolved full name:", userFullName);
      setName(userFullName);
      setTimeout(() => {
        console.log("[driverVerification] name state after set:", userFullName);
      }, 0);
    }
  }, [user]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        setUser(user as any);

        console.log(user);

        if (user?.email && user?.email_confirmed_at) {
          setIsEmailVerified(true);
          setEmail(user.email);
        }

        if (user?.user_metadata?.email_verified) {
          setIsEmailVerified(true);
          setEmail(user.email || user.user_metadata.email || "");
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

        if (user?.email && user?.email_confirmed_at) {
          setIsEmailVerified(true);
          setEmail(user.email);
        }

        if (data[0]?.email === user?.email && user?.email) {
          setIsEmailVerified(true);
          setEmail(user.email);
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
    const hasEmail = email.trim() !== "";
    const hasAtLeastOneVerified = isEmailVerified;
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
        hasEmail &&
        hasAtLeastOneVerified &&
        isAddressValid &&
        isLicensePlateValid
    );
  }, [
    name,
    email,
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

  useEffect(() => {
    const fetchUserPhone = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const phoneFromUser =
        user?.phone ||
        user?.user_metadata?.phone ||
        user?.user_metadata?.temp_phone ||
        null;
      setPhone(phoneFromUser);
    };
    fetchUserPhone();
  }, []);

  useEffect(() => {
    const checkIfAlreadyVerified = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user?.id) return;
        const res = await fetch(
          `https://api.thevanapp.com/api/driver-details/${user.id}`
        );
        const data = await res.json();
        const indicator = data && data[0]?.indicator;
        if (indicator === "active") {
          router.replace("/(tabs)/homepage");
        }
      } catch (err) {
        console.error("Error checking driver indicator:", err);
      }
    };
    checkIfAlreadyVerified();
  }, []);

  const sendEmailVerification = async () => {
    if (!email) {
      MyToast("Please enter a valid email address");
      return;
    }

    if (!phone) {
      MyToast("Please enter a valid phone number");
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

      const cleanPhone = () => {
        let cleaned = phone;

        if (cleaned.startsWith("+")) {
          cleaned = cleaned.slice(1);
        }

        if (cleaned.startsWith("91")) {
          cleaned = cleaned.slice(2);
        } else if (cleaned.startsWith("356")) {
          cleaned = cleaned.slice(3);
        }

        return cleaned;
      };

      const cleanPhoneNumber = cleanPhone();

      const res = await fetch("https://api.thevanapp.com/api/verify/driver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhoneNumber, email }),
      });

      const text = await res.text();
      if (!res.ok) {
        console.error("Email verification error:", text);
        setVerificationError(text || "Failed to send verification code");
        throw new Error("Failed to send verification code: " + text);
      }

      MyToast("Verification code sent. Check your email for the code.");
      setEmailStep("otp");
      setTimer(60);
      setCanResend(false);
      setOtp("");
    } catch (err) {
      console.error("Email verification error:", err);
      setVerificationError((err as Error).message || "An error occurred");
      MyToast("An error occurred");
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
    setIsVerificationLoading(true);
    setVerificationError("");
    try {
      const res = await fetch(
        "https://api.thevanapp.com/api/verify/driver/confirm",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: otp, email }),
        }
      );
      if (!res.ok) {
        throw new Error("Failed to verify code");
      }
      setIsEmailVerified(true);
      setEmailStep("verified");
      setOtp("");
      MyToast("Email verified successfully!");
    } catch (err) {
      console.error("OTP verification error:", err);
      setVerificationError("Verification failed. Please try again.");
      MyToast("Verification failed. Please try again.");
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
      MyToast("ფორმა არ არის სრულად შევსებული");
      return;
    }

    console.log("[handleSubmit] Starting submission process...");
    setIsLoading(true);

    try {
      if (!user || !user.id) {
        console.error("[handleSubmit] No user found in state");
        MyToast("მომხმარებელი ვერ მოიძებნა");
        return;
      }

      const userId = user.id;
      const formData = {
        name,
        email,
        street_address_1: streetAddress1,
        street_address_2: streetAddress2,
        city,
        state_province: stateProvince,
        zip_code: zipCode,
        country,
        license_plate: `${plateLetters}${plateNumbers}`,
        phone: phone,
      };

      console.log("[handleSubmit] Form data:", formData);

      // API Verification
      let apiSuccess = false;
      try {
        const response = await fetch(
          `https://api.thevanapp.com/api/driver-details/verify/${userId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiToken}`,
            },
            body: JSON.stringify(formData),
          }
        );

        if (response.ok) {
          console.log("[handleSubmit] API verification successful");
          apiSuccess = true;
        } else {
          const errorText = await response.text();
          console.error(
            "[handleSubmit] API error:",
            response.status,
            errorText
          );
          MyToast(`API შეცდომა: ${errorText}`);
        }
      } catch (apiError) {
        console.error("[handleSubmit] API request failed:", apiError);
        MyToast(`API კავშირის შეცდომა: ${apiError.message}`);
      }

      // Supabase Update
      let supabaseSuccess = false;
      try {
        const { data: updatedUser, error: updateError } =
          await supabase.auth.updateUser({
            data: {
              address_line_1: streetAddress1,
              address_line_2: streetAddress2,
              city: city,
              state: stateProvince,
              postal_code: zipCode,
              country: country,
              license_plate: `${plateLetters}${plateNumbers}`,
              email: email,
              first_name: name.split(" ")[0] || name,
              last_name: name.split(" ").slice(1).join(" ") || "",
              full_name: name,
              phone: phone,
              status: "active", // ← ეს მნიშვნელოვანია
              email_verified: true,
            },
          });

        if (!updateError && updatedUser) {
          console.log("[handleSubmit] Supabase update successful");
          supabaseSuccess = true;
          setUser(updatedUser.user);
        } else {
          console.error("[handleSubmit] Supabase error:", updateError);
          MyToast(
            `Supabase შეცდომა: ${updateError?.message || "უცნობი შეცდომა"}`
          );
        }
      } catch (supabaseError) {
        console.error("[handleSubmit] Supabase request failed:", supabaseError);
        MyToast(`Supabase კავშირის შეცდომა: ${supabaseError.message}`);
      }

      // ✅ თუ ორივე წარმატებულია - Store-ს განახლება
      if (apiSuccess && supabaseSuccess) {
        MyToast("თქვენი ვერიფიკაციის მოთხოვნა წარმატებით გაიგზავნა!");

        // ✅ Store-ში verification-ის complete-ება
        const verificationData = {
          name,
          email,
          phone,
          license_plate: `${plateLetters}${plateNumbers}`,
          indicator: "active",
          id: userId,
          ...formData,
        };

        await completeVerification(verificationData);

        console.log("✅ Store updated, user is now verified");

        // Clear Form Data
        setName("");
        setEmail("");
        setStreetAddress1("");
        setStreetAddress2("");
        setCity("");
        setStateProvince("");
        setZipCode("");
        setCountry("");
        setLicensePlate("");
        setPlateLetters("");
        setPlateNumbers("");

        // ✅ Navigation homepage-ზე (Store-ის მეშვეობით homepage უკვე იცის რომ user verified არის)
        console.log(
          "[handleSubmit] Navigating to homepage - user verified in store"
        );
        router.replace("/(tabs)/homepage"); // replace იქნება უკეთესი
      } else {
        MyToast("ვერიფიკაცია ვერ დასრულდა სრულად");
      }
    } catch (generalError) {
      console.error("[handleSubmit] General error:", generalError);
      MyToast(`ზოგადი შეცდომა: ${generalError.message}`);
    } finally {
      console.log("[handleSubmit] Setting loading to false in finally block");
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

  if (isAuthLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

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
          Verify Your Email
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
          <Text style={{ fontWeight: "600" }}>{email}</Text>
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
                sendEmailVerification();
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

            <Input
              label="Email"
              leftIcon={{
                type: "material-community",
                name: "email-outline",
                size: 22,
                color: "#27ae60",
              }}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              containerStyle={{ marginBottom: 10 }}
              editable={emailStep !== "verified"}
            />

            {(isEmailVerified || emailStep === "verified") && (
              <Text
                style={{
                  color: "#27ae60",
                  textAlign: "center",
                  marginBottom: 10,
                }}
              >
                Email verified ✓
              </Text>
            )}

            {emailStep === "input" && (
              <TouchableOpacity
                onPress={sendEmailVerification}
                disabled={isVerificationLoading || !email || isEmailVerified}
                style={{
                  backgroundColor: isEmailVerified ? "#27ae60" : "#10b981",
                  borderRadius: 8,
                  paddingVertical: 12,
                  marginHorizontal: 10,
                  marginBottom: 10,
                  alignItems: "center",
                }}
              >
                {isVerificationLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text
                    style={{ color: "white", fontWeight: "600", fontSize: 16 }}
                  >
                    {isEmailVerified ? "Verified" : "Verify"}
                  </Text>
                )}
              </TouchableOpacity>
            )}
            {emailStep === "otp" && (
              <View style={{ marginBottom: 10 }}>
                <Text
                  style={{
                    textAlign: "center",
                    color: "#6b7280",
                    marginBottom: 8,
                  }}
                >
                  Enter the 6-digit code sent to {email}
                </Text>
                <TextInput
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                  style={{
                    borderWidth: 1,
                    borderColor: "#10b981",
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 18,
                    letterSpacing: 8,
                    textAlign: "center",
                    marginBottom: 8,
                    backgroundColor: "#fff",
                  }}
                  placeholder="------"
                  autoFocus
                />
                {verificationError ? (
                  <Text
                    style={{
                      color: "#ef4444",
                      textAlign: "center",
                      marginBottom: 8,
                    }}
                  >
                    {verificationError}
                  </Text>
                ) : null}
                <TouchableOpacity
                  onPress={verifyOtp}
                  disabled={isVerificationLoading || otp.length !== 6}
                  style={{
                    backgroundColor: "#10b981",
                    borderRadius: 8,
                    paddingVertical: 12,
                    marginHorizontal: 10,
                    alignItems: "center",
                  }}
                >
                  {isVerificationLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text
                      style={{
                        color: "white",
                        fontWeight: "600",
                        fontSize: 16,
                      }}
                    >
                      Confirm
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            <LicensePlateInput
              plateLetters={plateLetters}
              setPlateLetters={setPlateLetters}
              plateNumbers={plateNumbers}
              setPlateNumbers={setPlateNumbers}
            />

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
              disabled={!isValid || isLoading || !isEmailVerified}
              style={{
                backgroundColor:
                  isValid && isEmailVerified ? "#27ae60" : "#cccccc",
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
