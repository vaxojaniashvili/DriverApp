import React, { useState } from "react";
import styled from "styled-components/native";
import { DriverModeColors } from "@/constants/Colors";
import { AuthStoreState } from "@/types/common";
import { useAuthStore } from "@/infrastructure/store/store";
import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface RadioButtonProps {
  selected: boolean;
}

interface RadioButtonLabelProps {
  selected: boolean;
}

const PickupRadiusSelector: React.FC = () => {
  const { isAutomatic, pickupRadius, setPickupRadius } =
    useAuthStore() as unknown as AuthStoreState;
  const [radioVisible, setRadioVisible] = useState(false);

  if (!isAutomatic) return null;

  return (
    <Container>
      <TouchableOpacity
        onPress={() => {
          setRadioVisible(!radioVisible);
        }}
        style={{ flexDirection: "row", justifyContent: "space-between" }}
      >
        <SectionTitle>Pickup Radius Selection</SectionTitle>
        <Ionicons
          name={radioVisible ? "chevron-up" : "chevron-down"}
          size={20}
          color="#555"
        />
      </TouchableOpacity>
      <SubTitle>Select maximum pickup distance</SubTitle>
      {radioVisible && (
        <>
          <RadioButtonsRow>
            {[1, 2, 3, 4, 5].map((radius) => (
              <RadioButtonContainer key={radius}>
                <RadioButton
                  selected={pickupRadius === radius}
                  onPress={() => setPickupRadius(radius)}
                >
                  {pickupRadius === radius && <RadioButtonDot />}
                </RadioButton>
                <RadioButtonLabel selected={pickupRadius === radius}>
                  {radius} KM
                </RadioButtonLabel>
              </RadioButtonContainer>
            ))}
          </RadioButtonsRow>
          <InfoText>
            System will allocate you orders within {pickupRadius} KM of your
            route
          </InfoText>
        </>
      )}
    </Container>
  );
};

export default PickupRadiusSelector;

const Container = styled.View``;

const SectionTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${DriverModeColors.dark};
  letter-spacing: -0.2px;
  margin-bottom: 6px;
`;

const SubTitle = styled.Text`
  font-size: 13px;
  color: ${DriverModeColors.darkGray};
  margin-bottom: 14px;
`;

const RadioButtonsRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const RadioButtonContainer = styled.View`
  align-items: center;
`;

const RadioButton = styled.TouchableOpacity<RadioButtonProps>`
  width: 22px;
  height: 22px;
  border-radius: 12px;
  border-width: 2px;
  border-color: ${(props) =>
    props.selected ? DriverModeColors.jobPrimary : DriverModeColors.darkGray};
  justify-content: center;
  align-items: center;
  margin-bottom: 4px;
`;

const RadioButtonDot = styled.View`
  width: 10px;
  height: 10px;
  border-radius: 6px;
  background-color: ${DriverModeColors.jobPrimary};
`;

const RadioButtonLabel = styled.Text<RadioButtonLabelProps>`
  font-size: 12px;
  font-weight: ${(props) => (props.selected ? "600" : "500")};
  color: ${(props) =>
    props.selected ? DriverModeColors.jobPrimary : DriverModeColors.darkGray};
`;

const InfoText = styled.Text`
  font-size: 13px;
  color: ${DriverModeColors.jobPrimary};
  text-align: center;
  margin-top: 8px;
  font-weight: 500;
`;
