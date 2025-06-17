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
  Alert,
} from "react-native";
import SocketService from "../../../../services/SocketService";

export function Chat({ route }) {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const flatListRef = useRef(null);

  const roomId = params.roomId;
  const roomName = params.roomName || "Chat";
  const roomType = params.roomType || "public";
  const username = params.username;

  useEffect(() => {
    console.log("🚀 Chat initialized with username:", username);
    console.log("📍 Room ID:", roomId);

    initializeChat();
    setupKeyboardListeners();

    return () => {
      SocketService.removeMessageListener("chat_screen");
      SocketService.removeStatusListener("chat_screen");
      handleStopTyping();
    };
  }, []);

  const initializeChat = () => {
    SocketService.addMessageListener("chat_screen", handleSocketMessage);
    SocketService.addStatusListener("chat_screen", handleSocketStatus);

    if (roomType !== "support_session" && roomType !== "client_session") {
      console.log("🏠 Joining room:", roomId, "as:", username);
      SocketService.joinRoom(username, roomId);
    }

    setTimeout(() => {
      SocketService.loadChatHistory(roomId, 100);
    }, 500);

    SocketService.getOnlineUsers(roomId);
  };

  const setupKeyboardListeners = () => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setTimeout(() => {
          scrollToEnd();
        }, 100);
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
    };
  };

  const handleSocketMessage = (type, data) => {
    console.log("📨 Socket message:", type, data);

    switch (type) {
      case "new_message":
        const messageRoom = data.room || data.sessionRoom;
        if (messageRoom === roomId || !messageRoom) {
          addNewMessage(data);
        }
        break;
      case "chat_history":
        console.log("📜 Loading chat history:", data.length, "messages");
        setMessages(formatHistoryMessages(data));
        setTimeout(() => scrollToEnd(), 100);
        break;
      case "user_typing":
        if (data.room === roomId || !data.room) {
          handleUserTyping(data);
        }
        break;
      case "user_joined":
        if (data.room === roomId || !data.room) {
          addSystemMessage(`${data.username || "Someone"} joined the chat`);
        }
        break;
      case "user_left":
        if (data.room === roomId || !data.room) {
          addSystemMessage(`${data.username || "Someone"} left the chat`);
        }
        break;
      case "support_ended":
        addSystemMessage("Support session ended");
        setTimeout(() => {
          Alert.alert("Session Ended", "The support session has been ended.", [
            {
              text: "OK",
              onPress: () => router.push("/(tabs)/Activity/activity"),
            },
          ]);
        }, 1000);
        break;
      default:
        break;
    }
  };

  const handleSocketStatus = (type, data) => {
    switch (type) {
      case "connected":
        setIsConnected(data);
        if (data) {
          setTimeout(() => {
            SocketService.loadChatHistory(roomId, 100);
          }, 500);
        }
        break;
      case "online_users":
        setOnlineUsers(data);
        break;
      default:
        break;
    }
  };

  const formatHistoryMessages = (historyMessages) => {
    return historyMessages.map((msg, index) => {
      const messageUsername = msg.username || msg.author || "Unknown";
      // Clean and normalize usernames for comparison
      const cleanMessageUsername = messageUsername.trim().toLowerCase();
      const cleanCurrentUsername = username.trim().toLowerCase();
      const isOwn = cleanMessageUsername === cleanCurrentUsername;

      console.log(
        `📝 History Message ${index}: "${
          msg.message || msg.text
        }" by "${messageUsername}" - isOwn: ${isOwn}`
      );
      console.log(
        `🔍 Comparison: "${cleanMessageUsername}" === "${cleanCurrentUsername}"`
      );

      return {
        id: msg.id || `history_${index}`,
        text: msg.message || msg.text,
        timestamp: formatTimestamp(msg.timestamp || msg.created_at),
        isOwn: isOwn,
        username: messageUsername,
        socketId: msg.socketId || msg.author_id,
      };
    });
  };

  const addNewMessage = (messageData) => {
    const messageUsername = messageData.username || "Unknown";
    // Clean and normalize usernames for comparison
    const cleanMessageUsername = messageUsername.trim().toLowerCase();
    const cleanCurrentUsername = username.trim().toLowerCase();
    const isOwn = cleanMessageUsername === cleanCurrentUsername;

    console.log(
      `💬 New message: "${messageData.message}" by "${messageUsername}" - isOwn: ${isOwn}`
    );

    const newMessage = {
      id: messageData.id || `msg_${Date.now()}`,
      text: messageData.message,
      timestamp: formatTimestamp(messageData.timestamp),
      isOwn: isOwn,
      username: messageUsername,
      socketId: messageData.socketId,
    };

    setMessages((prev) => {
      // Check for duplicates
      const isDuplicate = prev.some((msg) => {
        // Check by ID
        if (msg.id === newMessage.id) return true;

        // Check by content and timing
        const isSameContent = msg.text.trim() === newMessage.text.trim();
        const isSameUser =
          msg.username.trim().toLowerCase() ===
          messageUsername.trim().toLowerCase();
        const isRecent =
          Math.abs(
            new Date(msg.timestamp).getTime() -
              new Date(newMessage.timestamp).getTime()
          ) < 5000; // 5 seconds window

        return isSameContent && isSameUser && isRecent;
      });

      if (isDuplicate) {
        console.log("⚠️ Duplicate message detected, skipping");
        return prev;
      }

      console.log("✅ Adding new message to chat");
      return [...prev, newMessage];
    });

    setTimeout(() => scrollToEnd(), 100);
  };

  const addSystemMessage = (text) => {
    const systemMessage = {
      id: `system_${Date.now()}`,
      text: text,
      timestamp: formatTimestamp(new Date().toISOString()),
      isOwn: false,
      username: "System",
      socketId: "system",
      isSystem: true,
    };

    setMessages((prev) => [...prev, systemMessage]);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp)
      return new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const handleUserTyping = (data) => {
    if (data.username === username) return;

    if (data.isTyping) {
      setTypingUsers((prev) => {
        if (!prev.includes(data.username)) {
          return [...prev, data.username];
        }
        return prev;
      });

      setTimeout(() => {
        setTypingUsers((prev) => prev.filter((user) => user !== data.username));
      }, 3000);
    } else {
      setTypingUsers((prev) => prev.filter((user) => user !== data.username));
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
    if (inputText.trim()) {
      const messageText = inputText.trim();
      const timestamp = new Date().toISOString();
      const tempId = `optimistic_${Date.now()}_${Math.random()}`;

      console.log("📤 Sending message:", messageText, "to room:", roomId);

      // 🎯 OPTIMISTIC UI: Add message immediately as "own message"
      const optimisticMessage = {
        id: tempId,
        text: messageText,
        timestamp: formatTimestamp(timestamp),
        isOwn: true, // ✅ ყოველთვის true - ეს შენი message-ია
        username: username,
        socketId: "optimistic",
        isOptimistic: true, // Flag to identify optimistic messages
        optimisticId: tempId, // Special ID for tracking
      };

      // Add to UI immediately
      setMessages((prev) => [...prev, optimisticMessage]);
      setTimeout(() => scrollToEnd(), 50);

      // Send to backend
      SocketService.sendMessage(messageText, roomId);

      // Clear input and stop typing
      setInputText("");
      handleStopTyping();
    }
  };

  const handleStartTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      SocketService.sendTyping(true, roomId);
    }
  };

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      SocketService.sendTyping(false, roomId);
    }
  };

  const handleInputChange = (text) => {
    setInputText(text);

    if (text.trim() && !isTyping) {
      handleStartTyping();
    } else if (!text.trim() && isTyping) {
      handleStopTyping();
    }
  };

  const handleEndSession = () => {
    if (roomType === "support_session" || roomType === "client_session") {
      Alert.alert(
        "End Session",
        "Are you sure you want to end this support session?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "End Session",
            style: "destructive",
            onPress: () => SocketService.endSupportSession(),
          },
        ]
      );
    }
  };

  const renderMessage = ({ item }) => {
    // Debug each message render
    console.log(
      `🖼️ Rendering: "${item.text}" - isOwn: ${item.isOwn} ${
        item.isOptimistic ? "(optimistic)" : ""
      }`
    );

    return (
      <View
        style={[
          styles.messageContainer,
          item.isOwn ? styles.ownMessage : styles.otherMessage,
          item.isSystem && styles.systemMessage,
        ]}
      >
        {!item.isOwn && !item.isSystem && (
          <Text style={styles.senderName}>{item.username}</Text>
        )}
        <View
          style={[
            styles.messageBubble,
            item.isOwn ? styles.ownBubble : styles.otherBubble,
            item.isSystem && styles.systemBubble,
            item.isOptimistic && styles.optimisticBubble, // Slightly different style for optimistic
          ]}
        >
          <Text
            style={[
              styles.messageText,
              item.isOwn ? styles.ownText : styles.otherText,
              item.isSystem && styles.systemText,
            ]}
          >
            {item.text}
          </Text>
          <Text
            style={[
              styles.timestamp,
              item.isOwn ? styles.ownTimestamp : styles.otherTimestamp,
              item.isSystem && styles.systemTimestamp,
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

    return (
      <View style={styles.typingContainer}>
        <Text style={styles.typingText}>
          {typingUsers.length === 1
            ? `${typingUsers[0]} is typing...`
            : `${typingUsers.length} people are typing...`}
        </Text>
      </View>
    );
  };

  const getRoomHeaderInfo = () => {
    switch (roomType) {
      case "support_session":
      case "client_session":
        return {
          title: roomName,
          subtitle: "Support Session",
          color: "#28c76f",
        };
      case "support":
        return {
          title: roomName,
          subtitle: "Support Channel",
          color: "#ff6b6b",
        };
      default:
        return {
          title: roomName,
          subtitle: onlineUsers > 0 ? `${onlineUsers} online` : "Chat Room",
          color: "#007AFF",
        };
    }
  };

  const headerInfo = getRoomHeaderInfo();

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
              uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                roomName
              )}&background=${headerInfo.color.substring(1)}&color=fff`,
            }}
            style={styles.headerAvatar}
          />
          <View>
            <Text style={styles.headerUserName}>{headerInfo.title}</Text>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.connectionDot,
                  { backgroundColor: isConnected ? "#4CAF50" : "#F44336" },
                ]}
              />
              <Text style={styles.onlineStatus}>{headerInfo.subtitle}</Text>
            </View>
          </View>
        </View>

        {/* Debug Info */}
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>You: {username}</Text>
        </View>

        {(roomType === "support_session" || roomType === "client_session") && (
          <TouchableOpacity onPress={handleEndSession} style={styles.endButton}>
            <Ionicons name="close-circle" size={24} color="#ff6b6b" />
          </TouchableOpacity>
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
        />

        {renderTypingIndicator()}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={handleInputChange}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            multiline
            maxLength={1000}
            onBlur={handleStopTyping}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              inputText.trim()
                ? styles.sendButtonActive
                : styles.sendButtonInactive,
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() ? "#FFFFFF" : "#999"}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: Platform.OS === "android" ? 30 : 0,
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
  },
  chatContainer: {
    flex: 1,
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
  connectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  onlineStatus: {
    fontSize: 12,
    color: "#666",
  },
  debugInfo: {
    alignItems: "flex-end",
  },
  debugText: {
    fontSize: 10,
    color: "#999",
  },
  endButton: {
    padding: 8,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingVertical: 16,
    paddingBottom: Platform.OS === "android" ? 80 : 16,
  },
  messageContainer: {
    marginVertical: 4,
    marginHorizontal: 16,
  },
  ownMessage: {
    alignItems: "flex-end", // 🔵 შენი - მარჯვნივ
  },
  otherMessage: {
    alignItems: "flex-start", // ⚪ სხვისი - მარცხნივ
  },
  systemMessage: {
    alignItems: "center",
  },
  senderName: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
    marginHorizontal: 4,
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  ownBubble: {
    backgroundColor: "#007AFF", // 🔵 შენი - ლურჯი
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: "#FFFFFF", // ⚪ სხვისი - თეთრი
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  optimisticBubble: {
    opacity: 0.9, // Slightly transparent for optimistic messages
  },
  systemBubble: {
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownText: {
    color: "#FFFFFF", // 🔵 შენი text - თეთრი
  },
  otherText: {
    color: "#000000", // ⚪ სხვისი text - შავი
  },
  systemText: {
    color: "#666",
    fontStyle: "italic",
    fontSize: 14,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  ownTimestamp: {
    color: "#FFFFFF80",
    textAlign: "right",
  },
  otherTimestamp: {
    color: "#999999",
  },
  systemTimestamp: {
    color: "#999",
    textAlign: "center",
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F8F9FA",
  },
  typingText: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingBottom: Platform.OS === "android" ? 16 : 12,
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
  sendButton: {
    marginLeft: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonActive: {
    backgroundColor: "#007AFF",
  },
  sendButtonInactive: {
    backgroundColor: "#CCCCCC",
  },
});

export default Chat;
