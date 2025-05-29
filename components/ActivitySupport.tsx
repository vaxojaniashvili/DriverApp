import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import styled from "styled-components";

const ActivitySupport = () => {
  const router = useRouter();
  return (
    <SupportContainer>
      <SupportCard>
        <Ionicons name="headset-outline" size={48} color="#28c76f" />
        <SupportTitle>Need Help?</SupportTitle>
        <SupportText>
          Our support team is available 24/7 to assist you
        </SupportText>
        <SupportButton
          onPress={() => {
            router.push("/(tabs)/settings/support");
          }}
        >
          <SupportButtonText>Contact Support</SupportButtonText>
        </SupportButton>
      </SupportCard>
    </SupportContainer>
  );
};

export default ActivitySupport;

const SupportContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const SupportCard = styled.View`
  border-radius: 16px;
  padding: 32px;
  align-items: center;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.1;
  shadow-radius: 12px;
  elevation: 4;
  width: 100%;
  max-width: 300px;
  margin-top: -90px;
`;

const SupportTitle = styled.Text`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-top: 16px;
  margin-bottom: 8px;
`;

const SupportText = styled.Text`
  font-size: 14px;
  color: #666;
  text-align: center;
  line-height: 20px;
  margin-bottom: 24px;
`;

const SupportButton = styled.TouchableOpacity`
  background-color: #28c76f;
  padding: 12px 24px;
  border-radius: 8px;
`;

const SupportButtonText = styled.Text`
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
`;
