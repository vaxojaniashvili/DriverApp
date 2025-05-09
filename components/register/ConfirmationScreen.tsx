import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { Button, Icon } from "@rneui/themed";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { supabase } from "@/infrastructure/db/supabase";

export const ConfirmationScreen = ({
  vanOption,
  Title,
  StyledButton,
  completeRegistration,
  loading,
}: any) => {
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          return;
        }

        if (data.session) {
          // Session exists
        } else {
          console.log("No active session");
        }
      } catch (e) {
        console.error("Exception checking session:", e);
      }
    };

    checkSession();
  }, []);

  return (
    <View style={{ width: "100%" }}>
      <Title>
        {vanOption === "own" ? "I have my own van" : "Drive our van"}
      </Title>

      <Text style={{ fontSize: 16, textAlign: "center", marginBottom: 40 }}>
        Your registration is complete! Click below to start using the app.
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
        title="Start Using the App"
        onPress={completeRegistration}
        loading={loading}
        disabled={loading}
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
