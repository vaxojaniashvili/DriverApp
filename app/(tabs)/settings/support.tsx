import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  SafeAreaView,
  Platform,
  StatusBar,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
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
import io, { Socket } from "socket.io-client";

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

const SupportStatusCard = styled.View<{ connected: boolean }>`
  background-color: #ffffff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  flex-direction: row;
  elevation: 2;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 8px;
  border-left-width: 4px;
  border-left-color: ${(props) => (props.connected ? "#28c76f" : "#ff6b6b")};
`;

const IconContainer = styled.View<{ connected?: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  justify-content: center;
  align-items: center;
  margin-right: 14px;
  background-color: ${(props) => (props.connected ? "#e7f9f0" : "#ffe6e6")};
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

const QueueStatusCard = styled.View`
  background-color: #fff3cd;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  border-left-width: 4px;
  border-left-color: #ffc107;
`;

const QueueText = styled.Text`
  font-size: 14px;
  color: #856404;
  font-weight: 500;
`;

// Debug Card for development
const DebugCard = styled.View`
  background-color: #e3f2fd;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  border-left-width: 4px;
  border-left-color: #2196f3;
`;

const DebugText = styled.Text`
  font-size: 12px;
  color: #1976d2;
  font-family: monospace;
`;

// Interface definitions
interface User {
  _id: number | string;
  name?: string;
  avatar?: string;
}

interface MessageData {
  message: string;
  username: string;
  timestamp: string;
  socketId: string;
  id?: string;
}

interface QueuePosition {
  position: number;
  queueType: string;
  estimatedWait: number;
}

interface SupportConnection {
  sessionRoom: string;
  supportAgent: string;
  message: string;
}

const SupportChat: React.FC = () => {
  // Chat state
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Socket state
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [queuePosition, setQueuePosition] = useState<QueuePosition | null>(
    null
  );
  const [supportSession, setSupportSession] = useState<string | null>(null);
  const [supportAgent, setSupportAgent] = useState<string | null>(null);

  // Debug state
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState<boolean>(__DEV__); // Only in development
  const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false);

  // User info - replace with actual user data from your auth/context
  const [userData] = useState({
    id: Math.random().toString(36).substr(2, 9), // Generate unique ID
    username: "Driver User", // Replace with actual username
    userType: "driver", // or "client"
    email: "driver@example.com", // Replace with actual email
  });

  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debugTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // Enhanced logging function
  const addDebugLog = (
    message: string,
    type: "info" | "success" | "error" | "warning" = "info"
  ) => {
    const timestamp = new Date().toLocaleTimeString();
    const emoji = {
      info: "ℹ️",
      success: "✅",
      error: "❌",
      warning: "⚠️",
    }[type];

    const logMessage = `${emoji} ${timestamp}: ${message}`;
    console.log(logMessage);

    setDebugLogs((prev) => {
      const newLogs = [logMessage, ...prev].slice(0, 10); // Keep last 10 logs
      return newLogs;
    });

    // Auto-hide debug after 30 seconds of inactivity
    if (debugTimeoutRef.current) {
      clearTimeout(debugTimeoutRef.current);
    }
    debugTimeoutRef.current = setTimeout(() => {
      setShowDebug(false);
    }, 30000);
  };

  const handleBack = (): void => {
    addDebugLog("User navigating back", "info");
    router.push("/(tabs)/Activity/activity");
  };

  // Initialize Socket connection
  useEffect(() => {
    addDebugLog("Initializing Socket connection...", "info");

    const newSocket = io("https://api.thevanapp.com", {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
      transports: ["websocket", "polling"],
      timeout: 10000,
      forceNew: true,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Log all socket events for debugging
    newSocket.onAny((eventName, ...args) => {
      addDebugLog(`Socket event: ${eventName}`, "info");
      console.log("📡 Socket event received:", eventName, args);
    });

    // Connection events
    newSocket.on("connect", () => {
      addDebugLog(`Connected! Socket ID: ${newSocket.id}`, "success");
      setIsConnected(true);

      // Register immediately with the new socket instance
      addDebugLog(
        `Auto-registering user: ${userData.username} as ${userData.userType}`,
        "info"
      );

      newSocket.emit("register_user", {
        username: userData.username,
        role: userData.userType === "driver" ? "driver" : "client",
        userInfo: {
          email: userData.email,
          userId: userData.id,
        },
      });

      setIsRegistered(true);
      addDebugLog("User registration sent successfully", "success");
    });

    newSocket.on("connect_error", (error) => {
      addDebugLog(`Connection failed: ${error.message}`, "error");
      setIsConnected(false);
    });

    newSocket.on("disconnect", (reason) => {
      addDebugLog(`Disconnected: ${reason}`, "warning");
      setIsConnected(false);
      setIsRegistered(false);
      setSupportSession(null);
      setSupportAgent(null);
      setQueuePosition(null);
    });

    // Support events
    newSocket.on("queue_joined", (data: QueuePosition) => {
      addDebugLog(`Joined queue! Position: ${data.position}`, "success");
      setQueuePosition(data);
    });

    newSocket.on("support_connected", (data: SupportConnection) => {
      addDebugLog(`Connected to agent: ${data.supportAgent}`, "success");
      setSupportSession(data.sessionRoom);
      setSupportAgent(data.supportAgent);
      setQueuePosition(null);

      // Add system message
      const systemMessage: IMessage = {
        _id: Math.round(Math.random() * 1000000),
        text: `Connected to support agent: ${data.supportAgent}`,
        createdAt: new Date(),
        system: true,
      };
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, [systemMessage])
      );
    });

    newSocket.on("receive_message", (data: MessageData) => {
      addDebugLog(
        `Message from ${data.username}: ${data.message.substring(0, 30)}...`,
        "info"
      );

      // Don't show our own messages again
      if (data.socketId === newSocket.id) {
        addDebugLog("Skipping own message", "info");
        return;
      }

      const newMessage: IMessage = {
        _id: data.id || Math.round(Math.random() * 1000000),
        text: data.message,
        createdAt: new Date(data.timestamp),
        user: {
          _id: data.username === "System" ? "system" : 2,
          name: data.username,
          avatar:
            data.username === "System"
              ? undefined
              : "https://api.dicebear.com/7.x/avataaars/svg?seed=support",
        },
        system: data.username === "System",
      };

      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, [newMessage])
      );
    });

    newSocket.on("support_session_ended", (data) => {
      addDebugLog(`Session ended: ${data?.reason || "No reason"}`, "warning");
      setSupportSession(null);
      setSupportAgent(null);

      const endMessage: IMessage = {
        _id: Math.round(Math.random() * 1000000),
        text: data?.reason || "Support session has ended",
        createdAt: new Date(),
        system: true,
      };
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, [endMessage])
      );
    });

    newSocket.on("user_typing", (data) => {
      if (data.username !== userData.username) {
        addDebugLog(
          `${data.username} is ${data.isTyping ? "typing" : "stopped typing"}`,
          "info"
        );
        setIsTyping(data.isTyping);
      }
    });

    newSocket.on("error", (error) => {
      addDebugLog(`Socket error: ${error.message}`, "error");
      Alert.alert("Error", error.message || "An error occurred");
    });

    return () => {
      addDebugLog("Cleaning up socket connection", "info");
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (debugTimeoutRef.current) {
        clearTimeout(debugTimeoutRef.current);
      }
      newSocket.close();
    };
  }, []);

  // Register user with socket - Updated to use current socket
  const registerUser = () => {
    const currentSocket = socketRef.current;
    if (!currentSocket || !currentSocket.connected) {
      addDebugLog("Cannot register: no socket or not connected", "error");
      return;
    }

    addDebugLog(
      `Registering user: ${userData.username} as ${userData.userType}`,
      "info"
    );

    currentSocket.emit("register_user", {
      username: userData.username,
      role: userData.userType === "driver" ? "driver" : "client",
      userInfo: {
        email: userData.email,
        userId: userData.id,
      },
    });

    setIsRegistered(true);
    addDebugLog("User registration sent", "success");
  };

  // Request support - Updated to use socketRef
  const requestSupport = () => {
    const currentSocket = socketRef.current;
    if (!currentSocket || !currentSocket.connected) {
      addDebugLog("Cannot request support: socket not connected", "error");
      Alert.alert("Error", "Not connected to support system");
      return;
    }

    addDebugLog(`Requesting ${userData.userType} support...`, "info");

    currentSocket.emit("request_support", {
      userType: userData.userType,
      priority: "normal",
      issue: "Need assistance with my order/delivery",
    });

    addDebugLog("Support request sent successfully", "success");
  };

  // Send message - Updated to use socketRef
  const onSend = useCallback(
    (newMessages: IMessage[] = []) => {
      const currentSocket = socketRef.current;
      if (
        !currentSocket ||
        !currentSocket.connected ||
        newMessages.length === 0
      ) {
        addDebugLog(
          "Cannot send message: socket not connected or no messages",
          "error"
        );
        Alert.alert("Error", "Not connected to support system");
        return;
      }

      const message = newMessages[0];
      addDebugLog(`Sending message: "${message.text}"`, "info");

      // Add message to local state immediately
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, newMessages)
      );

      // Send to socket
      if (supportSession) {
        addDebugLog(`Sending to session: ${supportSession}`, "info");
        currentSocket.emit("send_message", {
          message: message.text,
          room: supportSession,
        });
      } else {
        addDebugLog("No session found, requesting support first", "warning");
        requestSupport();
      }
    },
    [supportSession, userData]
  );

  // Handle typing - Updated to use socketRef
  const handleInputTextChanged = (text: string) => {
    const currentSocket = socketRef.current;
    if (!currentSocket || !supportSession) return;

    currentSocket.emit("typing", {
      room: supportSession,
      isTyping: text.length > 0,
    });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing
    if (text.length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        currentSocket.emit("typing", {
          room: supportSession,
          isTyping: false,
        });
      }, 1000);
    }
  };

  // Manual debug functions - Updated to use socketRef
  const testConnection = () => {
    const currentSocket = socketRef.current;
    addDebugLog("=== CONNECTION TEST ===", "info");
    addDebugLog(`Socket exists: ${!!currentSocket}`, "info");
    addDebugLog(`Socket connected: ${currentSocket?.connected}`, "info");
    addDebugLog(`Socket ID: ${currentSocket?.id}`, "info");
    addDebugLog(`Is registered: ${isRegistered}`, "info");
    addDebugLog(`User data: ${JSON.stringify(userData)}`, "info");

    if (currentSocket?.connected) {
      addDebugLog("Testing emit event...", "info");
      currentSocket.emit("test_connection", {
        from: "mobile_app",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const forceRequestSupport = () => {
    addDebugLog("=== FORCE SUPPORT REQUEST ===", "info");
    requestSupport();
  };

  const reconnectSocket = () => {
    const currentSocket = socketRef.current;
    addDebugLog("=== RECONNECTING SOCKET ===", "warning");
    if (currentSocket) {
      currentSocket.disconnect();
      currentSocket.connect();
    }
  };

  const forceRegister = () => {
    addDebugLog("=== FORCE REGISTER ===", "info");
    registerUser();
  };

  // Get status text - Updated to use socketRef
  const getStatusText = () => {
    const currentSocket = socketRef.current;
    if (!currentSocket || !currentSocket.connected)
      return "Connecting to support...";
    if (queuePosition)
      return `Position in queue: ${queuePosition.position} (Est. wait: ${queuePosition.estimatedWait} min)`;
    if (supportSession && supportAgent) return `Connected to ${supportAgent}`;
    return "Ready to connect to support";
  };

  const getStatusIcon = () => {
    const currentSocket = socketRef.current;
    if (!currentSocket || !currentSocket.connected) return "reload";
    if (queuePosition) return "time";
    if (supportSession) return "checkmark-circle";
    return "headset";
  };

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
          minHeight: 60,
        }}
        primaryStyle={{
          backgroundColor: "#f1f3f5",
          borderRadius: 20,
          paddingHorizontal: 12,
          marginRight: 4,
          alignItems: "center",
        }}
        onInputTextChanged={handleInputTextChanged}
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
          <OptionsButton onPress={() => setShowDebug(!showDebug)}>
            <Ionicons name="bug" size={20} color="#6c757d" />
          </OptionsButton>
        </Header>

        {/* Debug Panel - Only show in development or when toggled */}
        {showDebug && (
          <DebugCard>
            <DebugText>🔧 DEBUG MODE</DebugText>
            <DebugText>
              Socket:{" "}
              {socketRef.current?.connected
                ? "✅ Connected"
                : "❌ Disconnected"}
            </DebugText>
            <DebugText>Registered: {isRegistered ? "✅" : "❌"}</DebugText>
            <DebugText>Session: {supportSession || "None"}</DebugText>
            <DebugText>
              Queue: {queuePosition?.position || "Not in queue"}
            </DebugText>

            {/* Debug buttons */}
            <DebugText
              onPress={testConnection}
              style={{ marginTop: 8, textDecorationLine: "underline" }}
            >
              🧪 Test Connection
            </DebugText>
            <DebugText
              onPress={forceRequestSupport}
              style={{ textDecorationLine: "underline" }}
            >
              🆘 Force Support Request
            </DebugText>
            <DebugText
              onPress={forceRegister}
              style={{ textDecorationLine: "underline" }}
            >
              📝 Force Register
            </DebugText>
            <DebugText
              onPress={reconnectSocket}
              style={{ textDecorationLine: "underline" }}
            >
              🔄 Reconnect Socket
            </DebugText>

            {/* Recent logs */}
            {debugLogs.slice(0, 3).map((log, index) => (
              <DebugText key={index} style={{ fontSize: 10, marginTop: 2 }}>
                {log}
              </DebugText>
            ))}
          </DebugCard>
        )}

        <SupportStatusCard
          connected={
            socketRef.current?.connected &&
            (!!supportSession || !!queuePosition)
          }
        >
          <IconContainer connected={socketRef.current?.connected}>
            <Ionicons
              name={getStatusIcon()}
              size={22}
              color={socketRef.current?.connected ? "#28c76f" : "#ff6b6b"}
            />
          </IconContainer>
          <StatusContent>
            <StatusTitle>
              {socketRef.current?.connected
                ? "Support System"
                : "Connecting..."}
            </StatusTitle>
            <StatusDescription>{getStatusText()}</StatusDescription>
          </StatusContent>
        </SupportStatusCard>

        {queuePosition && (
          <QueueStatusCard>
            <QueueText>
              You are #{queuePosition.position} in the{" "}
              {queuePosition.queueType.replace("-", " ")} queue. Estimated wait
              time: {queuePosition.estimatedWait} minutes.
            </QueueText>
          </QueueStatusCard>
        )}

        <ChatContainer>
          <GiftedChat
            messages={messages}
            onSend={(messages: IMessage[]) => onSend(messages)}
            user={{
              _id: userData.id,
              name: userData.username,
            }}
            placeholder={
              supportSession
                ? "Type your message..."
                : queuePosition
                ? "Waiting for support agent..."
                : "Send a message to request support..."
            }
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
