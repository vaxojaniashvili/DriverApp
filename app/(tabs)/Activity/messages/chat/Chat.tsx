import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  StatusBar,
  Keyboard,
  ActivityIndicator,
  Alert,
} from "react-native";
import io from "socket.io-client";

export function Chat({ route }) {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const flatListRef = useRef(null);
  const socketRef = useRef<any>(null);
  const typingTimeoutRef = useRef(null);

  const {
    messageId,
    userName,
    driverId,
    driverInfo,
    customerInfo,
    orderId,
    room: chatRoom,
  } = params;

  const ROOM_NAME = chatRoom || `order_${orderId}` || `chat_${messageId}`;
  const DRIVER_NAME = driverInfo?.name || `Driver_${driverId}`;

  useEffect(() => {
    initializeSocket();

    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setTimeout(() => {
          scrollToEnd();
        }, 100);
      }
    );

    return () => {
      cleanup();
      keyboardDidShowListener?.remove();
    };
  }, []);

  const cleanup = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  const initializeSocket = () => {
    try {
      socketRef.current = io("https://api.thevanapp.com", {
        transports: ["websocket", "polling"],
        timeout: 10000,
        forceNew: true,
        query: {
          driverId: driverId,
          orderId: orderId || "",
          userType: "driver",
        },
      });

      socketRef.current.on("connect", () => {
        console.log("📱 Chat: Connected to server:", socketRef.current.id);
        setIsConnected(true);
        setIsLoading(false);

        // Register user
        socketRef.current.emit("register_user", {
          username: DRIVER_NAME,
          role: "driver",
          userInfo: {
            driverId: driverId,
            orderId: orderId,
            customerInfo: customerInfo,
          },
        });

        // Join chat room
        socketRef.current.emit("join", {
          username: DRIVER_NAME,
          room: ROOM_NAME,
        });

        // Load chat history
        socketRef.current.emit("load_chat_history", {
          room: ROOM_NAME,
          limit: 50,
        });

        // Get online users
        socketRef.current.emit("get_online_users", ROOM_NAME);
      });

      socketRef.current.on("disconnect", (reason) => {
        console.log("❌ Chat: Disconnected:", reason);
        setIsConnected(false);
      });

      socketRef.current.on("connect_error", (error) => {
        console.log("🚨 Chat: Connection error:", error);
        setIsConnected(false);
        setIsLoading(false);
        Alert.alert("კავშირის შეცდომა", "ვერ მოხერხდა სერვერთან დაკავშირება");
      });

      // Message events
      socketRef.current.on("receive_message", (data) => {
        const newMessage = {
          id: data.id || Date.now().toString() + Math.random(),
          text: data.message,
          timestamp: formatTime(data.timestamp),
          isOwn: data.username === DRIVER_NAME,
          username: data.username,
          socketId: data.socketId,
        };

        setMessages((prevMessages) => {
          const exists = prevMessages.find((msg) => msg.id === newMessage.id);
          if (exists) return prevMessages;
          return [...prevMessages, newMessage];
        });

        setTimeout(() => scrollToEnd(), 100);
      });

      socketRef.current.on("chat_history", (history) => {
        if (Array.isArray(history)) {
          const formattedHistory = history.map((msg) => ({
            id: msg.id?.toString() || Date.now().toString() + Math.random(),
            text: msg.message,
            timestamp: formatTime(msg.timestamp),
            isOwn: msg.username === DRIVER_NAME,
            username: msg.username,
            isSystem: msg.username === "System",
          }));
          setMessages(formattedHistory);
          setTimeout(() => scrollToEnd(), 500);
        }
        setIsLoading(false);
      });

      socketRef.current.on("user_joined", (data) => {
        const systemMessage = {
          id: Date.now().toString() + "_join",
          text: data.message,
          timestamp: formatTime(data.timestamp),
          isSystem: true,
          username: "System",
        };
        setMessages((prev) => [...prev, systemMessage]);
        socketRef.current.emit("get_online_users", ROOM_NAME);
      });

      socketRef.current.on("user_left", (data) => {
        const systemMessage = {
          id: Date.now().toString() + "_left",
          text: data.message,
          timestamp: formatTime(data.timestamp),
          isSystem: true,
          username: "System",
        };
        setMessages((prev) => [...prev, systemMessage]);
        socketRef.current.emit("get_online_users", ROOM_NAME);
      });

      socketRef.current.on("user_typing", (data) => {
        if (data.username !== DRIVER_NAME) {
          if (data.isTyping) {
            setTypingUsers((prev) => {
              const filtered = prev.filter((u) => u !== data.username);
              return [...filtered, data.username];
            });
          } else {
            setTypingUsers((prev) => prev.filter((u) => u !== data.username));
          }

          setTimeout(() => {
            setTypingUsers((prev) => prev.filter((u) => u !== data.username));
          }, 3000);
        }
      });

      socketRef.current.on("online_users_count", (count) => {
        setOnlineCount(count);
      });

      socketRef.current.on("error", (error) => {
        console.log("Socket error:", error);
        Alert.alert("შეცდომა", error.message || "სოკეტის შეცდომა");
      });
    } catch (error) {
      console.error("Socket initialization error:", error);
      setIsLoading(false);
      Alert.alert("შეცდომა", "ჩატის ინიციალიზაციის შეცდომა");
    }
  };

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch (error) {
      return "";
    }
  };

  const scrollToEnd = () => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const handleBackPress = () => {
    router.push("/(tabs)/Activity/activity");
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || !isConnected || !socketRef.current) {
      return;
    }

    const messageText = inputText.trim();

    socketRef.current.emit("send_message", {
      message: messageText,
      room: ROOM_NAME,
    });

    setInputText("");

    // Stop typing indicator
    socketRef.current.emit("typing", {
      isTyping: false,
      room: ROOM_NAME,
    });
  };

  const handleTyping = (text) => {
    setInputText(text);

    if (!isConnected || !socketRef.current) return;

    // Send typing indicator
    socketRef.current.emit("typing", {
      isTyping: text.length > 0,
      room: ROOM_NAME,
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.emit("typing", {
          isTyping: false,
          room: ROOM_NAME,
        });
      }
    }, 2000);
  };

  const renderMessage = ({ item }) => {
    if (item.isSystem) {
      return (
        <View style={styles.systemMessage}>
          <Text style={styles.systemMessageText}>{item.text}</Text>
          <Text style={styles.systemTimestamp}>{item.timestamp}</Text>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.messageContainer,
          item.isOwn ? styles.ownMessage : styles.otherMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            item.isOwn ? styles.ownBubble : styles.otherBubble,
          ]}
        >
          {!item.isOwn && <Text style={styles.username}>{item.username}</Text>}
          <Text
            style={[
              styles.messageText,
              item.isOwn ? styles.ownText : styles.otherText,
            ]}
          >
            {item.text}
          </Text>
          <Text
            style={[
              styles.timestamp,
              item.isOwn ? styles.ownTimestamp : styles.otherTimestamp,
            ]}
          >
            {item.timestamp}
          </Text>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;

    const typingText =
      typingUsers.length === 1
        ? `${typingUsers[0]} აკრეფს...`
        : `${typingUsers.join(", ")} აკრეფენ...`;

    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingBubble}>
          <Text style={styles.typingText}>{typingText}</Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>ჩატის ჩატვირთვა...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Ionicons name="chevron-back" size={24} color="#212529" />
        </TouchableOpacity>

        <View style={styles.userInfo}>
          <Image
            source={{
              uri:
                customerInfo?.avatar ||
                "https://avatars.githubusercontent.com/u/147712790?v=4",
            }}
            style={styles.headerAvatar}
          />
          <View>
            <Text style={styles.headerUserName}>{userName}</Text>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isConnected ? "#4CAF50" : "#F44336" },
                ]}
              />
              <Text style={styles.onlineStatus}>
                {isConnected ? `ონლაინ (${onlineCount})` : "ოფლაინ"}
              </Text>
            </View>
            {orderId && (
              <Text style={styles.orderInfo}>შეკვეთა #{orderId}</Text>
            )}
          </View>
        </View>

        {/* Connection Status */}
        {!isConnected && (
          <View style={styles.connectionError}>
            <Ionicons name="wifi-outline" size={20} color="#F44336" />
          </View>
        )}
      </View>

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToEnd}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>ჩატი ცარიელია</Text>
              <Text style={styles.emptySubText}>
                დაწყებეთ საუბარი {userName}-თან
              </Text>
            </View>
          )}
        />

        {/* Typing Indicator */}
        {renderTypingIndicator()}

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.textInput, !isConnected && styles.textInputDisabled]}
            value={inputText}
            onChangeText={handleTyping}
            placeholder={
              isConnected ? "Type a message..." : "კავშირი გაწყვეტილია..."
            }
            placeholderTextColor={isConnected ? "#999" : "#CCC"}
            multiline
            maxLength={1000}
            editable={isConnected}
            returnKeyType="send"
            onSubmitEditing={handleSendMessage}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() || !isConnected
                ? styles.sendButtonInactive
                : styles.sendButtonActive,
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || !isConnected}
          >
            <Text style={styles.sendButtonText}>
              {isConnected ? "Send" : "📵"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ================================
// STYLES
// ================================

const styles = StyleSheet.create({
  // Common styles
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
  },
  connectionStatus: {
    backgroundColor: "#FFE6E6",
    paddingVertical: 8,
    alignItems: "center",
  },
  connectionText: {
    color: "#D32F2F",
    fontSize: 14,
    fontWeight: "600",
  },

  // Messages List Styles
  searchContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    marginTop: -15,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
    paddingVertical: 4,
  },
  tabsContainer: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  tabsScrollView: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
  },
  activeTabItem: {
    backgroundColor: "#28c76f",
  },
  tabLabel: {
    fontSize: 14,
    color: "#8E8E93",
    marginLeft: 6,
    fontWeight: "500",
  },
  activeTabLabel: {
    color: "white",
    fontWeight: "600",
  },
  messagesList: {
    flex: 1,
  },
  messageItem: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    backgroundColor: "#FFFFFF",
  },
  archivedMessageItem: {
    backgroundColor: "#F8F9FA",
    opacity: 0.7,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  groupBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#007AFF",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  archiveBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#8E8E93",
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  messageContent: {
    flex: 1,
    justifyContent: "center",
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  archivedText: {
    color: "#8E8E93",
  },
  favoriteButton: {
    marginLeft: 8,
    padding: 4,
  },
  time: {
    fontSize: 12,
    color: "#8E8E93",
  },
  messageFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMessage: {
    fontSize: 14,
    color: "#8E8E93",
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  orderInfo: {
    fontSize: 11,
    color: "#007AFF",
    marginTop: 2,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#8E8E93",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },

  // Chat Screen Styles
  chatContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingTop: Platform.OS === "android" ? 40 : 12,
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerUserName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  onlineStatus: {
    fontSize: 12,
    color: "#4CAF50",
  },
  connectionError: {
    padding: 8,
  },

  // Messages in Chat
  messagesContainer: {
    paddingVertical: 16,
    paddingBottom: Platform.OS === "android" ? 80 : 16,
  },
  messageContainer: {
    marginVertical: 4,
    marginHorizontal: 16,
  },
  ownMessage: {
    alignItems: "flex-end",
  },
  otherMessage: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 18,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  ownBubble: {
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  username: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    fontWeight: "600",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownText: {
    color: "#FFFFFF",
  },
  otherText: {
    color: "#000000",
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
  ownTimestamp: {
    color: "#FFFFFF",
    textAlign: "right",
  },
  otherTimestamp: {
    color: "#999999",
  },
  systemMessage: {
    alignSelf: "center",
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    marginVertical: 8,
    maxWidth: "80%",
  },
  systemMessageText: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
  },
  systemTimestamp: {
    fontSize: 10,
    color: "#999",
    textAlign: "center",
    marginTop: 4,
  },

  // Typing Indicator
  typingContainer: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  typingBubble: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderBottomLeftRadius: 5,
    alignSelf: "flex-start",
    maxWidth: "70%",
  },
  typingText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },

  // Input
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingBottom: Platform.OS === "android" ? 16 : 12,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: "#F8F9FA",
  },
  textInputDisabled: {
    backgroundColor: "#F0F0F0",
    color: "#999",
  },
  sendButton: {
    marginLeft: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  sendButtonActive: {
    backgroundColor: "#007AFF",
  },
  sendButtonInactive: {
    backgroundColor: "#CCCCCC",
    elevation: 0,
    shadowOpacity: 0,
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
export default Chat;
