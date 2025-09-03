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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ActionModal from "@/components/ActionModal";
import io from "socket.io-client";
import { supabase } from "@/infrastructure/db/supabase";

const tabs = [
  { id: "all", label: "All", icon: "chatbubbles" },
  { id: "orders", label: "Order Chats", icon: "car" }, // ← ახალი tab order chats-ისთვის
  { id: "unread", label: "Unread", icon: "radio-button-on" },
  { id: "archive", label: "Archive", icon: "archive" },
  { id: "favorites", label: "Favourites", icon: "heart" },
  { id: "groups", label: "Groups", icon: "people" },
];

export function Messages() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [messagesData, setMessagesData] = useState([]);
  const [orderChats, setOrderChats] = useState([]); // ← ახალი state order chats-ისთვის
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const [name, setName] = useState("");
  const [my_id, setMy_id] = useState(null);

  useEffect(() => {
    const fetchDriverUUID = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("Error fetching user:", userError);
          return;
        }

        const driverUUID = user?.id;
        setMy_id(driverUUID as any);
        setName(
          user?.user_metadata?.first_name ||
            user?.user_metadata?.full_name ||
            "Driver"
        );
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    };

    fetchDriverUUID();
  }, []);

  const currentDriver = {
    id: my_id,
    name: name || "testuser",
  };

  useEffect(() => {
    if (my_id) {
      initializeSocket();
    }
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [my_id]);

  const initializeSocket = () => {
    try {
      const SERVER_URL = __DEV__
        ? "http://localhost:8000"
        : "https://api.thevanapp.com";

      const newSocket = io(SERVER_URL, {
        transports: ["polling", "websocket"],
        timeout: 10000,
        query: {
          driverId: currentDriver.id,
          userType: "driver",
        },
      });

      newSocket.on("connect", () => {
        console.log("📱 Messages: Connected to server");
        setIsConnected(true);
        setIsLoading(false);

        // Register as driver
        newSocket.emit("register_user", {
          username: currentDriver.name,
          role: "driver",
          userInfo: { driverId: currentDriver.id },
        });

        // Load existing conversations
        loadDriverConversations();
      });

      newSocket.on("disconnect", () => {
        console.log("❌ Messages: Disconnected from server");
        setIsConnected(false);
      });

      newSocket.on("connect_error", (error) => {
        console.log("🚨 Messages: Connection error:", error);
        setIsConnected(false);
        setIsLoading(false);
      });

      // ← Regular chat message
      newSocket.on("receive_message", (data) => {
        console.log("📩 Regular message received:", data);
        updateConversationWithNewMessage(data, "regular");
      });

      // ← Order chat events
      newSocket.on("order_chat_joined", (data) => {
        console.log("✅ Order chat joined:", data);
        // Add to order chats list
        addOrderChatConversation(data);
      });

      newSocket.on("order_chat_history", (history) => {
        console.log("📜 Order chat history received:", history);
        // Handle order chat history if needed
      });

      // Regular conversation list
      newSocket.on("conversation_list", (conversations) => {
        console.log("📋 Conversation list received:", conversations);
        setMessagesData(conversations);
        setIsLoading(false);
      });

      setSocket(newSocket);
    } catch (error) {
      console.error("Socket initialization error:", error);
      setIsLoading(false);
    }
  };

  const loadDriverConversations = () => {
    if (socket && isConnected) {
      // Load regular conversations
      socket.emit("get_driver_conversations", {
        driverId: currentDriver.id,
      });

      // Load order chat conversations (if backend supports this)
      socket.emit("get_driver_order_chats", {
        driverId: currentDriver.id,
      });
    }
  };

  // ← ახალი ფუნქცია order chat conversation-ის დასამატებლად
  const addOrderChatConversation = (orderChatData) => {
    const newOrderChat = {
      id: `order_${orderChatData.orderId}_${Date.now()}`,
      name: orderChatData.customerName || "Customer",
      lastMessage: "Order chat started",
      time: formatTime(new Date().toISOString()),
      avatar: "https://avatars.githubusercontent.com/u/147712790?v=4",
      unreadCount: 0,
      isArchived: false,
      isFavorite: false,
      isGroup: false,
      isOrderChat: true, // ← მნიშვნელოვანი flag
      orderId: orderChatData.orderId,
      customerId: orderChatData.customerId,
      driverId: orderChatData.driverId,
      room: orderChatData.roomName,
      customerInfo: orderChatData.customerInfo || {
        name: orderChatData.customerName || "Customer",
      },
    };

    setOrderChats((prev) => {
      const exists = prev.find(
        (chat) =>
          chat.orderId === orderChatData.orderId &&
          chat.customerId === orderChatData.customerId
      );

      if (exists) return prev;
      return [newOrderChat, ...prev];
    });
  };

  const updateConversationWithNewMessage = (
    messageData,
    chatType = "regular"
  ) => {
    const updateFunction =
      chatType === "order" ? setOrderChats : setMessagesData;

    updateFunction((prevData) => {
      const updatedData = [...prevData];
      let conversationIndex = -1;

      if (chatType === "order") {
        // Order chat message
        conversationIndex = updatedData.findIndex(
          (conv) => conv.orderId === messageData.orderId
        );
      } else {
        // Regular chat message
        conversationIndex = updatedData.findIndex(
          (conv) => conv.room === messageData.room
        );
      }

      if (conversationIndex >= 0) {
        // Update existing conversation
        updatedData[conversationIndex] = {
          ...updatedData[conversationIndex],
          lastMessage: messageData.message,
          time: formatTime(messageData.timestamp),
          unreadCount:
            messageData.username !== currentDriver.name
              ? (updatedData[conversationIndex].unreadCount || 0) + 1
              : 0,
        };

        // Move to top
        const updatedConv = updatedData.splice(conversationIndex, 1)[0];
        updatedData.unshift(updatedConv);
      } else if (chatType === "order") {
        // New order chat conversation
        const newConversation = {
          id: `order_${messageData.orderId}_${Date.now()}`,
          name: messageData.customerName || messageData.username || "Customer",
          lastMessage: messageData.message,
          time: formatTime(messageData.timestamp),
          avatar: "https://avatars.githubusercontent.com/u/147712790?v=4",
          unreadCount: messageData.username !== currentDriver.name ? 1 : 0,
          isArchived: false,
          isFavorite: false,
          isGroup: false,
          isOrderChat: true,
          orderId: messageData.orderId,
          customerId: messageData.customerId,
          driverId: messageData.driverId,
          room: messageData.room,
          customerInfo: messageData.customerInfo,
        };
        updatedData.unshift(newConversation);
      } else {
        // New regular conversation
        const newConversation = {
          id: messageData.room || Date.now().toString(),
          name: messageData.customerName || messageData.username || "Customer",
          lastMessage: messageData.message,
          time: formatTime(messageData.timestamp),
          avatar: "https://avatars.githubusercontent.com/u/147712790?v=4",
          unreadCount: messageData.username !== currentDriver.name ? 1 : 0,
          isArchived: false,
          isFavorite: false,
          isGroup: false,
          orderId: messageData.orderId,
          room: messageData.room,
          customerInfo: messageData.customerInfo,
        };
        updatedData.unshift(newConversation);
      }

      return updatedData;
    });
  };

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();

      if (isToday) {
        return date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === yesterday.toDateString()) {
          return "Yesterday";
        } else {
          return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
        }
      }
    } catch (error) {
      return "";
    }
  };

  // ← განახლებული handleMessagePress ფუნქცია
  const handleMessagePress = (conversation) => {
    if (conversation.unreadCount > 0) {
      const updateFunction = conversation.isOrderChat
        ? setOrderChats
        : setMessagesData;
      updateFunction((prevData) =>
        prevData.map((item) =>
          item.id === conversation.id ? { ...item, unreadCount: 0 } : item
        )
      );
    }

    // Navigation parameters განსხვავდება order chat და regular chat-ისთვის
    const navigationParams = {
      messageId: conversation.id,
      userName: conversation.name,
      driverId: currentDriver.id,
      driverInfo: {
        name: currentDriver.name,
        id: currentDriver.id,
      },
      customerInfo: conversation.customerInfo || {
        name: conversation.name,
      },
    };

    // Order Chat-ისთვის დამატებითი parameters
    if (conversation.isOrderChat) {
      navigationParams.orderId = conversation.orderId;
      navigationParams.customerId = conversation.customerId;
      navigationParams.chatType = "order_chat"; // ← მთავარი parameter
    } else {
      // Regular chat parameters
      navigationParams.room = conversation.room;
    }

    console.log("Opening chat with params:", navigationParams);

    router.push({
      pathname: "/(tabs)/Activity/messages/chat/Chat",
      params: navigationParams,
    });
  };

  const toggleFavorite = (messageId) => {
    const message = [...messagesData, ...orderChats].find(
      (m) => m.id === messageId
    );
    const updateFunction = message?.isOrderChat
      ? setOrderChats
      : setMessagesData;

    updateFunction((prevMessages) =>
      prevMessages.map((message) =>
        message.id === messageId
          ? { ...message, isFavorite: !message.isFavorite }
          : message
      )
    );
  };

  const toggleArchive = (messageId) => {
    const message = [...messagesData, ...orderChats].find(
      (m) => m.id === messageId
    );
    const updateFunction = message?.isOrderChat
      ? setOrderChats
      : setMessagesData;

    updateFunction((prevMessages) =>
      prevMessages.map((message) =>
        message.id === messageId
          ? { ...message, isArchived: !message.isArchived }
          : message
      )
    );
  };

  const handleLongPress = (messageId, userName) => {
    const allMessages = [...messagesData, ...orderChats];
    const message = allMessages.find((m) => m.id === messageId);
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

  // ← განახლებული filtering logic order chats-ისთვის
  const getFilteredMessages = () => {
    let allMessages = [];

    switch (activeTab) {
      case "orders":
        allMessages = orderChats;
        break;
      case "all":
        allMessages = [...messagesData, ...orderChats];
        break;
      default:
        allMessages = [...messagesData, ...orderChats];
    }

    let filtered = allMessages;

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (message) =>
          message.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          message.lastMessage
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (message.orderId && message.orderId.toString().includes(searchQuery))
      );
    }

    switch (activeTab) {
      case "orders":
        return filtered.filter(
          (message) => message.isOrderChat && !message.isArchived
        );
      case "unread":
        return filtered.filter((message) => message.unreadCount > 0);
      case "archive":
        return filtered.filter((message) => message.isArchived);
      case "favorites":
        return filtered.filter((message) => message.isFavorite);
      case "groups":
        return filtered.filter((message) => message.isGroup);
      default:
        return filtered.filter((message) => !message.isArchived);
    }
  };

  const renderMessageItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.messageItem,
        item.isArchived && styles.archivedMessageItem,
        item.isOrderChat && styles.orderChatItem, // ← ახალი style order chats-ისთვის
      ]}
      onPress={() => handleMessagePress(item)}
      onLongPress={() => handleLongPress(item.id, item.name)}
      delayLongPress={500}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.isOrderChat && (
          <View style={styles.orderChatBadge}>
            <Ionicons name="car" size={12} color="#FFFFFF" />
          </View>
        )}
        {item.isGroup && (
          <View style={styles.groupBadge}>
            <Ionicons name="people" size={12} color="#FFFFFF" />
          </View>
        )}
        {item.isArchived && (
          <View style={styles.archiveBadge}>
            <Ionicons name="archive" size={10} color="#FFFFFF" />
          </View>
        )}
      </View>

      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <View style={styles.nameContainer}>
            <Text
              style={[styles.userName, item.isArchived && styles.archivedText]}
            >
              {item.name}
            </Text>
            {item.isOrderChat && (
              <View style={styles.orderChatLabel}>
                <Text style={styles.orderChatLabelText}>ORDER</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => toggleFavorite(item.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={item.isFavorite ? "heart" : "heart-outline"}
                size={16}
                color={item.isFavorite ? "#FF6B6B" : "#C7C7CC"}
              />
            </TouchableOpacity>
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
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>

        {item.orderId && (
          <Text style={styles.orderInfo}>
            {item.isOrderChat
              ? `🚗 Order #${item.orderId}`
              : `Order #${item.orderId}`}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const filteredMessages = getFilteredMessages();

  return (
    <SafeAreaView style={styles.container}>
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
            placeholder="Search messages..."
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
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Connection Status */}
      {!isConnected && (
        <View style={styles.connectionStatus}>
          <Text style={styles.connectionText}>
            Connecting to chat server...
          </Text>
        </View>
      )}

      {filteredMessages.length > 0 ? (
        <FlatList
          data={filteredMessages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={loadDriverConversations}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons
            name={
              activeTab === "orders" ? "car-outline" : "chatbubbles-outline"
            }
            size={64}
            color="#E0E0E0"
          />
          <Text style={styles.emptyText}>
            {searchQuery
              ? "No messages found"
              : activeTab === "orders"
              ? "No order chats"
              : `No ${activeTab} messages`}
          </Text>
          <Text style={styles.emptySubText}>
            {activeTab === "orders"
              ? "Order chats will appear when customers start conversations about their deliveries"
              : "Messages will appear when customers contact you"}
          </Text>
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
  placeholder: {
    width: 40,
  },
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
  connectionStatus: {
    backgroundColor: "#FFF3CD",
    paddingVertical: 8,
    alignItems: "center",
  },
  connectionText: {
    color: "#856404",
    fontSize: 12,
    fontWeight: "500",
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
  orderChatItem: {
    borderLeftWidth: 3,
    borderLeftColor: "#007AFF",
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
  orderChatBadge: {
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
  orderChatLabel: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  orderChatLabelText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#1976D2",
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
    paddingHorizontal: 32,
  },
  orderInfo: {
    fontSize: 11,
    color: "#007AFF",
    marginTop: 2,
    fontWeight: "500",
  },
});

export default Messages;
