import React from "react";
import { View, Text } from "react-native";
import { Button, Icon } from "@rneui/themed";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

export const ConfirmationScreen = ({ vanOption, Title, StyledButton }: any) => {
  return (
    <View style={{ width: "100%" }}>
      <Title>
        {vanOption === "own" ? "I have my own van" : "Drive our van"}
      </Title>

      <Text style={{ fontSize: 16, textAlign: "center", marginBottom: 40 }}>
        Once all documents are approved and your background check clears, you'll
        get an email/text that your account is active.
      </Text>

      <Icon
        name="check-circle"
        type="material-community"
        color="#27ae60"
        size={80}
        containerStyle={{ marginBottom: 40 }}
      />

      <StyledButton
        ViewComponent={LinearGradient}
        linearGradientProps={{
          colors: ["#27ae60", "#2ecc71"],
          start: { x: 0, y: 0 },
          end: { x: 1, y: 0 },
        }}
        title="Back to Login"
        onPress={() => router.push("/")}
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
