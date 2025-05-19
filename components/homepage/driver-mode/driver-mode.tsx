import React, { useState, useEffect } from "react";
import styled from "styled-components/native";
import { StyleProp, ViewStyle, Platform, Alert } from "react-native";
import { useAuthStore } from "@/infrastructure/store/store";
import {
  FontAwesome5,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";
import { DriverModeColors } from "../../../constants/Colors";
import { supabase } from "@/infrastructure/db/supabase";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface DriverModeButtonProps {
  mode: "active" | "off" | "break";
  selected: boolean;
  style?: StyleProp<ViewStyle>;
}

interface JobSelectionButtonProps {
  selected: boolean;
  style?: StyleProp<ViewStyle>;
}

interface ButtonTextProps {
  color?: string;
}

interface AuthStoreState {
  mode: "active" | "off" | "break";
  setMode: (mode: "active" | "off" | "break") => void;
  setmyID?: (id: string) => void;
  isAutomatic: boolean;
  setIsAutomatic: (isAuto: boolean) => void;
}

const STORAGE_KEYS = {
  DRIVER_MODE: "DRIVER_MODE",
  JOB_SELECTION: "JOB_SELECTION",
};

const DriverModeComponent: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string>("");
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [apiToken, setApiToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const { setMode, mode, isAutomatic, setIsAutomatic } =
    useAuthStore() as unknown as AuthStoreState;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          throw error;
        }

        if (user) {
          setUserEmail(user?.email || "");

          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session?.access_token) {
            setApiToken(sessionData.session.access_token);
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // getting live location
  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.error("Location permission denied");
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
      } catch (error) {
        console.error("Error getting location:", error);
      }
    };

    getLocation();
  }, []);

  useEffect(() => {
    const saveMode = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.DRIVER_MODE, mode);
      } catch (error) {
        console.error("Error saving mode to storage:", error);
      }
    };

    if (!loading) {
      saveMode();
    }
  }, [mode, loading]);

  useEffect(() => {
    const loadSavedMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(STORAGE_KEYS.DRIVER_MODE);
        if (savedMode) {
          setMode(savedMode as "active" | "off" | "break");
        }
      } catch (error) {
        console.error("Error loading saved mode:", error);
      }
    };

    loadSavedMode();
  }, [setMode]);

  useEffect(() => {
    const saveJobSelection = async () => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEYS.JOB_SELECTION,
          isAutomatic ? "automatic" : "manual"
        );
      } catch (error) {
        console.error("Error saving job selection to storage:", error);
      }
    };

    saveJobSelection();
  }, [isAutomatic]);

  useEffect(() => {
    const loadSavedJobSelection = async () => {
      try {
        const savedSelection = await AsyncStorage.getItem(
          STORAGE_KEYS.JOB_SELECTION
        );
        if (savedSelection) {
          setIsAutomatic(savedSelection === "automatic");
        }
      } catch (error) {
        console.error("Error loading saved job selection:", error);
      }
    };

    loadSavedJobSelection();
  }, [setIsAutomatic]);

  const sendStatusToApi = async (currentMode: "active" | "off" | "break") => {
    if (!userEmail || !location || !apiToken) {
      return;
    }

    try {
      const payload = {
        email: userEmail,
        location: {
          lat: location.latitude,
          lng: location.longitude,
        },
        status: currentMode,
      };

      console.log("Sending status update to API:", payload);

      const response = await fetch("https://api.thevanapp.com/api/driver-loc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }
    } catch (error) {
      console.error("Error sending status to API:", error);
      Alert.alert(
        "Status Update Error",
        "Failed to update your status. Please check your connection.",
        [{ text: "OK" }]
      );
    }
  };

  const handleModeChange = async (newMode: "active" | "off" | "break") => {
    setMode(newMode);
    await sendStatusToApi(newMode);
  };

  return (
    <Container>
      <SectionTitle>Driver Mode</SectionTitle>
      <DriverModesContainer>
        <DriverModeButton
          mode="active"
          selected={mode === "active"}
          onPress={() => handleModeChange("active")}
          style={{ marginRight: 4 }}
          disabled={loading}
        >
          <ButtonContent>
            <FontAwesome5
              name="car"
              size={16}
              color={mode === "active" ? "white" : DriverModeColors.dark}
            />
            <ButtonText
              color={mode === "active" ? "white" : DriverModeColors.dark}
            >
              Active
            </ButtonText>
          </ButtonContent>
        </DriverModeButton>

        <DriverModeButton
          mode="off"
          selected={mode === "off"}
          onPress={() => handleModeChange("off")}
          disabled={loading}
          style={{ marginHorizontal: 4 }}
        >
          <ButtonContent>
            <MaterialCommunityIcons
              name="car-off"
              size={16}
              color={mode === "off" ? "white" : DriverModeColors.dark}
            />
            <ButtonText
              color={mode === "off" ? "white" : DriverModeColors.dark}
            >
              Offline
            </ButtonText>
          </ButtonContent>
        </DriverModeButton>

        <DriverModeButton
          mode="break"
          selected={mode === "break"}
          onPress={() => handleModeChange("break")}
          style={{ marginLeft: 4 }}
          disabled={loading}
        >
          <ButtonContent>
            <Ionicons
              name="cafe"
              size={16}
              color={mode === "break" ? "white" : DriverModeColors.dark}
            />
            <ButtonText
              color={mode === "break" ? "white" : DriverModeColors.dark}
            >
              Break
            </ButtonText>
          </ButtonContent>
        </DriverModeButton>
      </DriverModesContainer>
    </Container>
  );
};

export default DriverModeComponent;

const Container = styled.View`
  padding: 4px 0;
`;

const SectionTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: ${DriverModeColors.dark};
  letter-spacing: -0.2px;
`;

const DriverModesContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const DriverModeButton = styled.TouchableOpacity<DriverModeButtonProps>`
  flex: 1;
  padding: 10px 6px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  background-color: ${(props) =>
    props.selected && props.mode === "active"
      ? DriverModeColors.success
      : props.selected && props.mode === "off"
      ? DriverModeColors.danger
      : props.selected && props.mode === "break"
      ? DriverModeColors.warning
      : "rgba(240, 240, 240, 0.8)"};
  elevation: ${(props) =>
    Platform.OS === "android" ? (props.selected ? 3 : 1) : 0};
  shadow-opacity: ${(props) =>
    Platform.OS === "ios" ? (props.selected ? 0.15 : 0.05) : 0};
  shadow-radius: ${(props) =>
    Platform.OS === "ios" ? (props.selected ? 4 : 2) : 0}px;
  shadow-color: ${Platform.OS === "ios" ? "#000" : "transparent"};
  shadow-offset: 0px 1px;
  border-width: ${Platform.OS === "android" ? 0 : 0.5}px;
  border-color: ${(props) =>
    props.selected && props.mode === "active"
      ? DriverModeColors.success
      : props.selected && props.mode === "off"
      ? DriverModeColors.danger
      : props.selected && props.mode === "break"
      ? DriverModeColors.warning
      : "rgba(224, 224, 224, 0.8)"};
  min-height: 46px;
`;

const ButtonContent = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const ButtonText = styled.Text<ButtonTextProps>`
  font-size: 13px;
  font-weight: 500;
  color: ${(props) => props.color || DriverModeColors.dark};
  margin-left: 6px;
  letter-spacing: 0.1px;
`;
