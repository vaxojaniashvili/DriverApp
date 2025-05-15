import React, { useState, useEffect } from "react";
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
import { router } from "expo-router";
import { supabase } from "@/infrastructure/db/supabase";
import { Input } from "@rneui/themed";
import { AntDesign } from "@expo/vector-icons";

const MyToast = (message, duration = "short") => {
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
  const [firstEmail, setFirstEmail] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      setApiToken(session?.access_token as any);
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/authentication");
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (timer > 0 && showVerificationScreen) {
      const timerId = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (timer === 0) {
      setCanResend(true);
    }
  }, [timer, showVerificationScreen]);

  useEffect(() => {
    const isNameValid = name.trim() !== "";
    const hasAtLeastOneContact =
      (email.trim() !== "" && isEmailVerified) ||
      (phoneNumber.trim() !== "" && isMobileVerified);
    const isAddressValid =
      streetAddress1.trim() !== "" &&
      city.trim() !== "" &&
      stateProvince.trim() !== "" &&
      zipCode.trim() !== "" &&
      country.trim() !== "";
    const isLicensePlateValid = licensePlate.trim() !== "";

    setIsValid(
      isNameValid &&
        hasAtLeastOneContact &&
        isAddressValid &&
        isLicensePlateValid
    );
  }, [
    name,
    isMobileVerified,
    isEmailVerified,
    email,
    phoneNumber,
    streetAddress1,
    city,
    stateProvince,
    zipCode,
    country,
    licensePlate,
  ]);

  const sendEmailVerification = async () => {
    if (!email) {
      MyToast("Please enter a valid email address");
      return;
    }

    setIsVerificationLoading(true);
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        MyToast("Please enter a valid email format");
        return;
      }

      try {
        const redirectUrl =
          Platform.OS === "web"
            ? window.location.origin + "/authentication"
            : "thevanapp://authentication/verify";

        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim().toLowerCase(),
          options: {
            emailRedirectTo: redirectUrl,
          },
        });

        if (!error) {
          MyToast(
            "Verification email sent. Check your inbox or enter the code here."
          );
        } else {
          console.log("Supabase OTP error:", error);
          MyToast("Enter verification code,Code is:856135");
        }
      } catch (supabaseError) {
        console.log("OTP send error:", supabaseError);
        MyToast("Enter verification code");
      }

      setVerifyingEmail(true);
      setShowVerificationScreen(true);
      setTimer(60);
      setCanResend(false);
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

    const phoneRegex = /^\+?[0-9]{9,15}$/;
    if (!phoneRegex.test(phoneNumber)) {
      MyToast("Please enter a valid phone number");
      return;
    }

    setIsVerificationLoading(true);
    try {
      setTimeout(() => {
        setVerifyingMobile(true);
        setShowVerificationScreen(true);
        setTimer(60);
        setCanResend(false);
        MyToast("OTP sent to your mobile number,code is: 856135");
      }, 1500);
    } catch (err) {
      console.error("Mobile verification error:", err);
      setVerificationError("An error occurred while sending OTP");
      MyToast("An error occurred while sending OTP");
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
    try {
      if (otp !== "856135") {
        setVerificationError("Invalid OTP. Please try again.");
        MyToast("Invalid OTP. Please try again.");
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Failed to get user information");
      }

      if (verifyingEmail) {
        setIsEmailVerified(true);
      } else if (verifyingMobile) {
        setIsMobileVerified(true);
      }

      setShowVerificationScreen(false);
      setVerifyingEmail(false);
      setVerifyingMobile(false);
      setOtp("");

      MyToast(`${verifyingEmail ? "Email" : "Mobile"} verified successfully!`);
    } catch (err) {
      console.error("OTP verification error:", err);
      setVerificationError("An error occurred during verification");
      MyToast("An error occurred during verification");
    } finally {
      setIsVerificationLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!canResend) return;

    setIsVerificationLoading(true);
    try {
      if (verifyingEmail) {
        await sendEmailVerification();
      } else if (verifyingMobile) {
        await sendMobileVerification();
      }
    } finally {
      setIsVerificationLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!isValid) return;

    setIsLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("Failed to get user information");
      }

      const userId = user.id;

      const { error } = await supabase.auth.updateUser({
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
          status: "pending_verification",
        },
      });

      if (error) throw error;

      try {
        const response = await fetch(
          `https://api.thevanapp.com/api/driver-details/verify/${userId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiToken}`,
            },
            body: JSON.stringify({
              plate: licensePlate,
            }),
          }
        );

        if (!response.ok) {
          console.error("Failed to update driver details:", response.status);
          throw new Error("Failed to update driver details");
        }
      } catch (putError) {
        console.error("Error sending PUT request:", putError);
        throw putError;
      }

      setName("");
      setPhoneNumber("");
      setEmail("");
      setStreetAddress1("");
      setStreetAddress2("");
      setCity("");
      setStateProvince("");
      setZipCode("");
      setCountry("");
      setLicensePlate("");

      MyToast("Your verification request has been submitted successfully!");
    } catch (error) {
      console.error("Verification error:", error);
      MyToast("Error submitting verification");
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
          Verify Your {verifyingEmail ? "Email" : "Mobile"}
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
          <Text style={{ color: "#ef4444", marginBottom: 16 }}>
            {verificationError}
          </Text>
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
              Account Verification
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
              placeholder="Enter your first name"
              autoCapitalize="words"
              containerStyle={{ marginBottom: 5 }}
            />

            <View style={{ marginBottom: 20 }}>
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
                containerStyle={{ marginBottom: 0 }}
                rightIcon={
                  isEmailVerified ? (
                    <View
                      style={{
                        backgroundColor: "#dcfce7",
                        borderRadius: 12,
                        paddingHorizontal: 12,
                        paddingVertical: 4,
                      }}
                    >
                      <Text
                        style={{
                          color: "#15803d",
                          fontSize: 12,
                          fontWeight: "500",
                        }}
                      >
                        Verified
                      </Text>
                    </View>
                  ) : null
                }
              />
              {!isEmailVerified && email.trim() !== "" && (
                <TouchableOpacity
                  onPress={sendEmailVerification}
                  disabled={isVerificationLoading}
                  style={{
                    backgroundColor: "#10b981",
                    borderRadius: 8,
                    paddingVertical: 8,
                    marginHorizontal: 10,
                    alignItems: "center",
                  }}
                >
                  {isVerificationLoading && verifyingEmail ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={{ color: "white", fontWeight: "500" }}>
                      Verify Email
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>

            <View style={{ marginBottom: 20 }}>
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
                containerStyle={{ marginBottom: 0 }}
                rightIcon={
                  isMobileVerified ? (
                    <View
                      style={{
                        backgroundColor: "#dcfce7",
                        borderRadius: 12,
                        paddingHorizontal: 12,
                        paddingVertical: 4,
                      }}
                    >
                      <Text
                        style={{
                          color: "#15803d",
                          fontSize: 12,
                          fontWeight: "500",
                        }}
                      >
                        Verified
                      </Text>
                    </View>
                  ) : null
                }
              />
              {!isMobileVerified && phoneNumber.trim() !== "" && (
                <TouchableOpacity
                  onPress={sendMobileVerification}
                  disabled={isVerificationLoading}
                  style={{
                    backgroundColor: "#10b981",
                    borderRadius: 8,
                    paddingVertical: 8,
                    marginHorizontal: 10,
                    alignItems: "center",
                  }}
                >
                  {isVerificationLoading && verifyingMobile ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={{ color: "white", fontWeight: "500" }}>
                      Verify Phone
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>

            <Input
              label="Vehicle License Plate"
              leftIcon={{
                type: "material-community",
                name: "car",
                size: 22,
                color: "#27ae60",
              }}
              value={licensePlate}
              onChangeText={setLicensePlate}
              placeholder="Enter your vehicle license plate"
              autoCapitalize="characters"
              containerStyle={{ marginBottom: 5 }}
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
                backgroundColor: isValid && !isLoading ? "#27ae60" : "#e5e7eb",
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
                  Submit Verification
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
