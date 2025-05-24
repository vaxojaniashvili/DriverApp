import React, { useState, useCallback, useEffect } from "react";
import { SafeAreaView, Platform, StatusBar } from "react-native";
import styled from "styled-components/native";
import {
  GiftedChat,
  Bubble,
  Send,
  InputToolbar,
  Avatar,
  IMessage,
  BubbleProps,
  SendProps,
  InputToolbarProps,
  AvatarProps,
} from "react-native-gifted-chat";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: #f8f9fa;
`;

const ContentContainer = styled.View`
  flex: 1;
  padding: 0 20px;
  padding-top: ${Platform.OS === "android" ? "20px" : "0"};
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 5px 0;
  margin-bottom: 16px;
`;

const BackButton = styled.TouchableOpacity`
  height: 40px;
  width: 40px;
  border-radius: 20px;
  align-items: center;
  justify-content: center;
  background-color: #f1f3f5;
`;

const OptionsButton = styled.TouchableOpacity`
  height: 40px;
  width: 40px;
`;

const Title = styled.Text`
  font-size: 20px;
  font-weight: 700;
  color: #212529;
`;

const SupportStatusCard = styled.View`
  background-color: #ffffff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  flex-direction: row;
  elevation: 2;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 8px;
`;

const IconContainer = styled.View`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  justify-content: center;
  align-items: center;
  margin-right: 14px;
  background-color: #e9f5ff;
`;

const StatusContent = styled.View`
  flex: 1;
`;

const StatusTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: #212529;
  margin-bottom: 4px;
`;

const StatusDescription = styled.Text`
  font-size: 14px;
  color: #6c757d;
  line-height: 20px;
`;

const ChatContainer = styled.View`
  flex: 1;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  overflow: hidden;
  margin: 0 -20px;
`;

// Define the user type
interface User {
  _id: number | string;
  name?: string;
  avatar?: string;
}

const SupportChat: React.FC = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const handleBack = (): void => {
    router.push("/(tabs)/Activity/activity");
  };

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: "Hello! How can I assist you today?",
        createdAt: new Date(),
        user: {
          _id: 2,
          name: "Support Agent",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=support",
        },
      },
    ]);

    setTimeout(() => setIsTyping(true), 1000);
    setTimeout(() => setIsTyping(false), 3500);
  }, []);

  const onSend = useCallback((newMessages: IMessage[] = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );

    if (newMessages.length > 0) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const botMessage: IMessage = {
          _id: Math.round(Math.random() * 1000000),
          text: "Thanks for reaching out. Our team will get back to you shortly.",
          createdAt: new Date(),
          user: {
            _id: 2,
            name: "Support Agent",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=support",
          },
        };
        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, [botMessage])
        );
      }, 2000);
    }
  }, []);

  const renderBubble = (props: BubbleProps<IMessage>) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#4361ee",
            borderBottomRightRadius: 0,
            borderBottomLeftRadius: 12,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            padding: 2,
          },
          left: {
            backgroundColor: "#f1f3f5",
            borderBottomRightRadius: 12,
            borderBottomLeftRadius: 0,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            padding: 2,
          },
        }}
        textStyle={{
          right: {
            color: "#ffffff",
          },
          left: {
            color: "#212529",
          },
        }}
      />
    );
  };

  const renderSend = (props: SendProps<IMessage>) => {
    return (
      <Send
        {...props}
        containerStyle={{
          height: 44,
          width: 44,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 4,
        }}
      >
        <IconContainer
          style={{ backgroundColor: "#e7f9f0", width: 38, height: 38 }}
        >
          <Ionicons name="send" size={18} color="#28c76f" />
        </IconContainer>
      </Send>
    );
  };

  const renderInputToolbar = (props: InputToolbarProps<IMessage>) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={{
          backgroundColor: "#ffffff",
          borderTopWidth: 0,
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}
        primaryStyle={{
          backgroundColor: "#f1f3f5",
          borderRadius: 20,
          paddingHorizontal: 12,
          marginRight: 4,
        }}
      />
    );
  };

  const renderAvatar = (props: AvatarProps<IMessage>) => {
    return (
      <Avatar
        {...props}
        containerStyle={{
          left: {
            marginRight: 0,
          },
        }}
        imageStyle={{
          left: {
            borderRadius: 12,
          },
          right: {
            borderRadius: 12,
          },
        }}
      />
    );
  };

  return (
    <Container>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <ContentContainer>
        <Header>
          <BackButton onPress={handleBack}>
            <Ionicons name="chevron-back" size={24} color="#212529" />
          </BackButton>
          <Title>Support Chat</Title>
          <OptionsButton />
        </Header>

        <SupportStatusCard>
          <IconContainer>
            <Ionicons name="headset" size={22} color="#4361ee" />
          </IconContainer>
          <StatusContent>
            <StatusTitle>Support Available</StatusTitle>
            <StatusDescription>
              Our support team typically responds within 5 minutes during
              business hours.
            </StatusDescription>
          </StatusContent>
        </SupportStatusCard>

        <ChatContainer>
          <GiftedChat
            messages={messages}
            onSend={(messages: IMessage[]) => onSend(messages)}
            user={{
              _id: 1,
            }}
            placeholder="Type your message..."
            renderBubble={renderBubble}
            renderSend={renderSend}
            renderInputToolbar={renderInputToolbar}
            renderAvatar={renderAvatar}
            isTyping={isTyping}
            alwaysShowSend
            scrollToBottom
            scrollToBottomStyle={{
              backgroundColor: "#f1f3f5",
              borderRadius: 20,
              padding: 8,
            }}
            scrollToBottomComponent={() => (
              <Ionicons name="chevron-down" size={16} color="#6c757d" />
            )}
            bottomOffset={Platform.OS === "ios" ? 30 : 0}
            minInputToolbarHeight={60}
            timeTextStyle={{
              right: { color: "rgba(255, 255, 255, 0.7)" },
              left: { color: "rgba(0, 0, 0, 0.4)" },
            }}
            keyboardShouldPersistTaps="handled"
          />
        </ChatContainer>
      </ContentContainer>
    </Container>
  );
};

export default SupportChat;
