import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ActionModal from "@/components/ActionModal";
import SocketService from "../../../services/SocketService";

const tabs = [
  { id: "all", label: "All", icon: "chatbubbles" },
  { id: "active", label: "Active", icon: "radio-button-on" },
  { id: "customers", label: "Customers", icon: "people" },
  { id: "support", label: "Support", icon: "help-circle" },
  { id: "favorites", label: "Favourites", icon: "heart" },
];

export function Messages() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [queueStatus, setQueueStatus] = useState({
    clientQueue: 0,
    driverQueue: 0,
  });

  // Generate unique driver name
  const driverUsername = `Driver_${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    initializeSocket();
    return () => {
      SocketService.removeMessageListener("messages_screen");
      SocketService.removeStatusListener("messages_screen");
    };
  }, []);

  const initializeSocket = () => {
    // Connect to backend
    SocketService.connect();

    // ✅ Register as DRIVER (არა support)
    SocketService.registerDriver(driverUsername, {
      driverId: "driver_" + Date.now(),
      location: "Tbilisi",
      vehicle: "Van",
      isAvailable: true,
    });

    setCurrentUser({ username: driverUsername, role: "driver" });

    // Setup listeners
    SocketService.addMessageListener("messages_screen", handleSocketMessage);
    SocketService.addStatusListener("messages_screen", handleSocketStatus);

    // Load initial conversations
    setTimeout(() => {
      loadInitialConversations();
      SocketService.getQueueStatus();
    }, 1000);

    // Check queue status every 10 seconds
    setInterval(() => {
      if (SocketService.isConnected) {
        SocketService.getQueueStatus();
      }
    }, 10000);
  };

  const handleSocketMessage = (type, data) => {
    console.log("📨 Driver received message:", type, data);

    switch (type) {
      case "new_message":
        updateConversationWithNewMessage(data);
        break;
      case "client_connected":
        // 🎯 Customer მომწერს!
        addCustomerConversation(data);
        break;
      case "support_ended":
        removeCustomerConversation(data);
        break;
      case "queue_status":
        setQueueStatus(data);
        break;
      case "chat_history":
        // Handle chat history if needed
        break;
      default:
        break;
    }
  };

  const handleSocketStatus = (type, data) => {
    console.log("🔌 Driver socket status:", type, data);

    switch (type) {
      case "connected":
        setIsConnected(data);
        if (data) {
          setTimeout(() => {
            loadInitialConversations();
            SocketService.getQueueStatus();
          }, 500);
        }
        break;
      case "error":
        console.error("❌ Socket error:", data);
        Alert.alert("Connection Error", "Failed to connect to server");
        break;
      default:
        break;
    }
  };

  const loadInitialConversations = () => {
    const initialConversations = [
      {
        id: "general",
        name: "🗨️ General Chat",
        lastMessage: "Chat with other drivers",
        time: "Always",
        avatar:
          "https://ui-avatars.com/api/?name=General&background=007AFF&color=fff",
        unreadCount: 0,
        isArchived: false,
        isFavorite: false,
        isGroup: true,
        roomType: "general",
        isActive: false,
      },
      {
        id: "drivers-only",
        name: "🚗 Drivers Only",
        lastMessage: "Private driver discussions",
        time: "Always",
        avatar:
          "https://ui-avatars.com/api/?name=Drivers&background=28c76f&color=fff",
        unreadCount: 0,
        isArchived: false,
        isFavorite: false,
        isGroup: true,
        roomType: "drivers",
        isActive: false,
      },
    ];

    setConversations(initialConversations);
  };

  const addCustomerConversation = (data) => {
    const customerConv = {
      id: data.sessionRoom,
      name: `👤 Customer: ${data.client.username}`,
      lastMessage: data.client.issue || "Customer wants to chat",
      time: "Now",
      avatar: `https://ui-avatars.com/api/?name=${data.client.username}&background=FF9500&color=fff`,
      unreadCount: 1,
      isArchived: false,
      isFavorite: false,
      isGroup: false,
      roomType: "customer_chat",
      isActive: true,
      customerInfo: data.client,
    };

    setConversations((prev) => [customerConv, ...prev]);

    // Show notification
    Alert.alert(
      "📱 New Customer Message!",
      `Customer "${data.client.username}" wants to chat!\n\nReason: ${
        data.client.issue || "General inquiry"
      }`,
      [
        { text: "Ignore", style: "cancel" },
        {
          text: "Chat with Customer",
          onPress: () =>
            handleMessagePress(
              data.sessionRoom,
              `Customer: ${data.client.username}`,
              "customer_chat"
            ),
        },
      ]
    );
  };

  const removeCustomerConversation = (data) => {
    setConversations((prev) =>
      prev.filter((conv) => conv.roomType !== "customer_chat")
    );
  };

  const updateConversationWithNewMessage = (messageData) => {
    const roomId = messageData.room || messageData.sessionRoom;

    setConversations((prev) => {
      const existingConvIndex = prev.findIndex((conv) => conv.id === roomId);

      if (existingConvIndex !== -1) {
        const updatedConversations = [...prev];
        updatedConversations[existingConvIndex] = {
          ...updatedConversations[existingConvIndex],
          lastMessage: messageData.message,
          time: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          unreadCount:
            messageData.username !== driverUsername
              ? updatedConversations[existingConvIndex].unreadCount + 1
              : 0,
          isActive: true,
        };

        const updatedConv = updatedConversations.splice(
          existingConvIndex,
          1
        )[0];
        return [updatedConv, ...updatedConversations];
      }

      return prev;
    });
  };

  const handleMessagePress = (conversationId, conversationName, roomType) => {
    // Mark as read
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      )
    );

    // Navigate to chat
    router.push({
      pathname: "/(tabs)/Activity/messages/chat/Chat",
      params: {
        roomId: conversationId,
        roomName: conversationName,
        roomType: roomType || "general",
        username: driverUsername,
      },
    });
  };

  const handleRequestSupport = () => {
    Alert.alert("🆘 Request Support", "What type of support do you need?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Technical Help",
        onPress: () => requestSupport("technical_help"),
      },
      {
        text: "Customer Issue",
        onPress: () => requestSupport("customer_issue"),
      },
      { text: "General Help", onPress: () => requestSupport("general_help") },
    ]);
  };

  const requestSupport = (issueType) => {
    SocketService.requestSupport(`Driver needs help with: ${issueType}`);
    Alert.alert(
      "Support Requested",
      "Your support request has been submitted. Please wait for an agent.",
      [{ text: "OK" }]
    );
  };

  const toggleFavorite = (messageId) => {
    setConversations((prevMessages) =>
      prevMessages.map((message) =>
        message.id === messageId
          ? { ...message, isFavorite: !message.isFavorite }
          : message
      )
    );
  };

  const toggleArchive = (messageId) => {
    setConversations((prevMessages) =>
      prevMessages.map((message) =>
        message.id === messageId
          ? { ...message, isArchived: !message.isArchived }
          : message
      )
    );
  };

  const handleLongPress = (messageId, userName) => {
    const message = conversations.find((m) => m.id === messageId);
    setSelectedMessage(message);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedMessage(null);
  };

  const handleModalFavorite = () => {
    if (selectedMessage) {
      toggleFavorite(selectedMessage.id);
    }
  };

  const handleModalArchive = () => {
    if (selectedMessage) {
      toggleArchive(selectedMessage.id);
    }
  };

  const getFilteredMessages = () => {
    let filtered = conversations;

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (conversation) =>
          conversation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conversation.lastMessage
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    switch (activeTab) {
      case "active":
        return filtered.filter(
          (conversation) =>
            conversation.unreadCount > 0 || conversation.isActive
        );
      case "customers":
        return filtered.filter(
          (conversation) => conversation.roomType === "customer_chat"
        );
      case "support":
        return filtered.filter(
          (conversation) => conversation.roomType === "support_session"
        );
      case "favorites":
        return filtered.filter((conversation) => conversation.isFavorite);
      default:
        return filtered.filter((conversation) => !conversation.isArchived);
    }
  };

  const renderMessageItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.messageItem,
        item.isArchived && styles.archivedMessageItem,
        item.isActive && styles.activeMessageItem,
        item.roomType === "customer_chat" && styles.customerSession,
      ]}
      onPress={() => handleMessagePress(item.id, item.name, item.roomType)}
      onLongPress={() => handleLongPress(item.id, item.name)}
      delayLongPress={500}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.roomType === "customer_chat" && (
          <View style={styles.customerBadge}>
            <Ionicons name="person" size={12} color="#FFFFFF" />
          </View>
        )}
        {item.isActive && item.roomType === "customer_chat" && (
          <View style={styles.activeBadge}>
            <Ionicons name="radio-button-on" size={10} color="#FFFFFF" />
          </View>
        )}
      </View>

      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <View style={styles.nameContainer}>
            <Text
              style={[
                styles.userName,
                item.isArchived && styles.archivedText,
                item.roomType === "customer_chat" && styles.customerText,
              ]}
            >
              {item.name}
            </Text>
            <View style={styles.favoriteButton}>
              <Ionicons
                name={item.isFavorite ? "heart" : "heart-outline"}
                size={16}
                color={item.isFavorite ? "#FF6B6B" : "#C7C7CC"}
              />
            </View>
          </View>
          <Text style={[styles.time, item.isArchived && styles.archivedText]}>
            {item.time}
          </Text>
        </View>

        <View style={styles.messageFooter}>
          <Text
            style={[styles.lastMessage, item.isArchived && styles.archivedText]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View
              style={[
                styles.unreadBadge,
                item.roomType === "customer_chat" && styles.customerUnreadBadge,
              ]}
            >
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const filteredMessages = getFilteredMessages();

  return (
    <SafeAreaView style={styles.container}>
      {/* Driver Status */}
      <View style={styles.statusBar}>
        <View style={styles.connectionStatus}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isConnected ? "#4CAF50" : "#F44336" },
            ]}
          />
          <Text style={styles.statusText}>
            {isConnected ? `🚗 Driver Available for Messages` : "Connecting..."}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleRequestSupport}
          style={styles.supportButton}
        >
          <Ionicons name="help-circle" size={20} color="#007AFF" />
          <Text style={styles.supportButtonText}>Support</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons
            name="search"
            size={20}
            color="#8E8E93"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollView}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabItem,
                activeTab === tab.id && styles.activeTabItem,
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons
                name={tab.icon}
                size={18}
                color={activeTab === tab.id ? "white" : "#8E8E93"}
              />
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === tab.id && styles.activeTabLabel,
                ]}
              >
                {tab.label}
              </Text>
              {tab.id === "customers" &&
                conversations.filter((c) => c.roomType === "customer_chat")
                  .length > 0 && (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>
                      {
                        conversations.filter(
                          (c) => c.roomType === "customer_chat"
                        ).length
                      }
                    </Text>
                  </View>
                )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {filteredMessages.length > 0 ? (
        <FlatList
          data={filteredMessages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color="#E0E0E0" />
          <Text style={styles.emptyText}>
            {activeTab === "customers"
              ? "No customer messages yet"
              : searchQuery
              ? "No conversations found"
              : `No ${activeTab} conversations`}
          </Text>
          {!isConnected && (
            <Text style={styles.emptySubText}>Connecting to server...</Text>
          )}
          {activeTab === "customers" && isConnected && (
            <Text style={styles.emptySubText}>
              Customers will appear here when they start a chat
            </Text>
          )}
        </View>
      )}

      <ActionModal
        visible={modalVisible}
        onClose={handleModalClose}
        userName={selectedMessage?.name || ""}
        isFavorite={selectedMessage?.isFavorite || false}
        isArchived={selectedMessage?.isArchived || false}
        onFavorite={handleModalFavorite}
        onArchive={handleModalArchive}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F8F9FA",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  connectionStatus: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: "#666",
  },
  supportButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  supportButtonText: {
    fontSize: 12,
    color: "#007AFF",
    marginLeft: 4,
    fontWeight: "500",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    position: "relative",
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
  tabBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  tabBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
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
  activeMessageItem: {
    backgroundColor: "#F0F8FF",
  },
  customerSession: {
    backgroundColor: "#FFF9E6",
    borderLeftWidth: 4,
    borderLeftColor: "#FF9500",
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
  customerBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#FF9500",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  activeBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#4CAF50",
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
  customerText: {
    color: "#FF9500",
    fontWeight: "700",
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
  customerUnreadBadge: {
    backgroundColor: "#FF9500",
  },
  unreadText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
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
  },
  emptySubText: {
    fontSize: 14,
    color: "#C7C7CC",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});

export default Messages;
