import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Button } from "@rneui/themed";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

export const VerificationScreen = ({
  contactMethod,
  email,
  phoneNumber,
  otpDigits,
  otpInputRefs,
  loading,
  timer,
  canResend,
  handleOtpChange,
  handleOtpKeyPress,
  verifyOtp,
  resendVerificationCode,
}: any) => {
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
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 5,
        }}
      >
        <Text>Back to </Text>
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
        >
          <Text
            style={{
              color: "#27ae60",
            }}
          >
            register
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
