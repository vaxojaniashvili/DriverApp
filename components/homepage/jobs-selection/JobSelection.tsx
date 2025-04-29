import React from "react";
import styled from "styled-components/native";
import { StyleProp, ViewStyle, Platform } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { DriverModeColors } from "@/constants/Colors";
import { AuthStoreState } from "@/types/common";
import { useAuthStore } from "@/infrastructure/store/store";
import PickupRadiusSelector from "../pickup-radius/PickupRadiusSelector";

interface JobSelectionButtonProps {
  selected: boolean;
  style?: StyleProp<ViewStyle>;
}

interface ButtonTextProps {
  color?: string;
}

const JobSelectionComponent: React.FC = () => {
  const { isAutomatic, setIsAutomatic } =
    useAuthStore() as unknown as AuthStoreState;

  return (
    <Container>
      <SectionTitle>Job Selection</SectionTitle>
      <JobSelectionContainer>
        <JobSelectionButton
          selected={isAutomatic}
          onPress={() => setIsAutomatic(true)}
          style={{ marginRight: 5 }}
        >
          <ButtonContent>
            <MaterialCommunityIcons
              name="robot"
              size={16}
              color={isAutomatic ? "white" : DriverModeColors.dark}
            />
            <ButtonText color={isAutomatic ? "white" : DriverModeColors.dark}>
              Automatic
            </ButtonText>
          </ButtonContent>
        </JobSelectionButton>

        <JobSelectionButton
          selected={!isAutomatic}
          onPress={() => setIsAutomatic(false)}
          style={{ marginLeft: 5 }}
        >
          <ButtonContent>
            <MaterialCommunityIcons
              name="account-edit"
              size={16}
              color={!isAutomatic ? "white" : DriverModeColors.dark}
            />
            <ButtonText color={!isAutomatic ? "white" : DriverModeColors.dark}>
              Manual
            </ButtonText>
          </ButtonContent>
        </JobSelectionButton>
      </JobSelectionContainer>
    </Container>
  );
};

export default JobSelectionComponent;

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

const ButtonContent = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const JobSelectionContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

const JobSelectionButton = styled.TouchableOpacity<JobSelectionButtonProps>`
  flex: 1;
  padding: 10px 8px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  background-color: ${(props) =>
    props.selected ? DriverModeColors.jobPrimary : "rgba(240, 240, 240, 0.8)"};
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
    props.selected ? DriverModeColors.jobPrimary : "rgba(224, 224, 224, 0.8)"};
  min-height: 46px;
`;

const ButtonText = styled.Text<ButtonTextProps>`
  font-size: 13px;
  font-weight: 500;
  color: ${(props) => props.color || DriverModeColors.dark};
  margin-left: 6px;
  letter-spacing: 0.1px;
`;
