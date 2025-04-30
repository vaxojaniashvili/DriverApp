import React, { useState } from "react";
import styled from "styled-components/native";
import { DriverModeColors } from "@/constants/Colors";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/infrastructure/store/store";

interface RadioButtonProps {
  selected: boolean;
}

interface RadioButtonLabelProps {
  selected: boolean;
}

interface DropdownProps {
  isOpen: boolean;
}

const PickupPreferencesSelector: React.FC = () => {
  const {
    isAutomatic,
    pickupRadius,
    setPickupRadius,
    pickupCount,
    setPickupCount,
  } = useAuthStore();
  const [radioVisible, setRadioVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
              <RadioButtonContainer key={`radius-${radius}`}>
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

          {/* Pickup Count Dropdown */}
          <SectionDivider />
          <SubTitle>Number of Pick Ups</SubTitle>

          <DropdownContainer>
            <DropdownHeader
              onPress={() => setDropdownOpen(!dropdownOpen)}
              isOpen={dropdownOpen}
            >
              <DropdownHeaderText>
                {pickupCount} {pickupCount === 1 ? "Pick Up" : "Pick Ups"}
              </DropdownHeaderText>
              <Ionicons
                name={dropdownOpen ? "chevron-up" : "chevron-down"}
                size={18}
                color="#555"
              />
            </DropdownHeader>

            {dropdownOpen && (
              <DropdownOptionsContainer>
                {[1, 2, 3, 4, 5].map((count) => (
                  <DropdownOption
                    key={`count-${count}`}
                    onPress={() => {
                      setPickupCount(count);
                      setDropdownOpen(false);
                    }}
                    selected={count === pickupCount}
                  >
                    <DropdownOptionText selected={count === pickupCount}>
                      {count} {count === 1 ? "Pick Up" : "Pick Ups"}
                    </DropdownOptionText>
                    {count === pickupCount && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={DriverModeColors.jobPrimary}
                      />
                    )}
                  </DropdownOption>
                ))}
              </DropdownOptionsContainer>
            )}
            <InfoText>
              System will allocate you {pickupCount}{" "}
              {pickupCount === 1 ? "order" : "orders"} within {pickupRadius} KM
              of your route
            </InfoText>
          </DropdownContainer>
        </>
      )}
    </Container>
  );
};

export default PickupPreferencesSelector;

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
  margin-top: 15px;
  font-weight: 500;
`;

const SectionDivider = styled.View`
  height: 1px;
  background-color: ${DriverModeColors.darkGray}20;
  margin: 16px 0;
`;

const DropdownContainer = styled.View`
  margin-bottom: 16px;
`;

const DropdownHeader = styled.TouchableOpacity<DropdownProps>`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  border-width: 1px;
  border-color: ${DriverModeColors.darkGray}40;
  background-color: #fff;
  border-bottom-left-radius: ${(props) => (props.isOpen ? "0" : "8px")};
  border-bottom-right-radius: ${(props) => (props.isOpen ? "0" : "8px")};
`;

const DropdownHeaderText = styled.Text`
  font-size: 14px;
  color: ${DriverModeColors.dark};
`;

const DropdownOptionsContainer = styled.View`
  border-width: 1px;
  border-top-width: 0;
  border-color: ${DriverModeColors.darkGray}40;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  overflow: hidden;
`;

const DropdownOption = styled.TouchableOpacity<RadioButtonProps>`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: ${(props) =>
    props.selected ? `${DriverModeColors.jobPrimary}10` : "#fff"};
  border-bottom-width: ${(props) => (props.selected ? "0" : "1px")};
  border-bottom-color: ${DriverModeColors.darkGray}20;
`;

const DropdownOptionText = styled.Text<RadioButtonProps>`
  font-size: 14px;
  color: ${(props) =>
    props.selected ? DriverModeColors.jobPrimary : DriverModeColors.dark};
  font-weight: ${(props) => (props.selected ? "600" : "normal")};
`;
