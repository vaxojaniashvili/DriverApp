import React from "react";
import { View, Text } from "react-native";
import { Button } from "@rneui/themed";
import { LinearGradient } from "expo-linear-gradient";
import styled from "styled-components/native";

export const DocumentsScreen = ({
  vanOption,
  loading,
  setCurrentStep,
  Title,
  RequirementItem,
  StyledButton,
}: any) => {
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
        <Text style={{ color: "green" }}> driver@thevanapp.com</Text>
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
