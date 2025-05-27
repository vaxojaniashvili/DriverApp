import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
  TextInput,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ActionModal from "@/components/ActionModal";

const initialMessagesData = [
  {
    id: "1",
    name: "Vaxo Janiashvili",
    lastMessage: "Hello, how are you?",
    time: "14:30",
    avatar: "https://avatars.githubusercontent.com/u/147712790?v=4",
    unreadCount: 2,
    isArchived: false,
    isFavorite: true,
    isGroup: false,
  },
  {
    id: "2",
    name: "Leri Ugulava",
    lastMessage: "Do you have a meeting tomorrow?",
    time: "12:15",
    avatar: "https://avatars.githubusercontent.com/u/147712790?v=4",
    unreadCount: 0,
    isArchived: false,
    isFavorite: false,
    isGroup: false,
  },
  {
    id: "3",
    name: "Team Project Group",
    lastMessage: "Send me the document",
    time: "Yesterday",
    avatar: "https://avatars.githubusercontent.com/u/147712790?v=4",
    unreadCount: 1,
    isArchived: false,
    isFavorite: false,
    isGroup: true,
  },
  {
    id: "4",
    name: "David Meskhi",
    lastMessage: "Ok, thanks for information",
    time: "Yesterday",
    avatar: "https://avatars.githubusercontent.com/u/147712790?v=4",
    unreadCount: 0,
    isArchived: true,
    isFavorite: true,
    isGroup: false,
  },
  {
    id: "5",
    name: "Giorgi Bachidze",
    lastMessage: "Did you download the photos?",
    time: "Monday",
    avatar: "https://avatars.githubusercontent.com/u/147712790?v=4",
    unreadCount: 3,
    isArchived: false,
    isFavorite: false,
    isGroup: false,
  },
  {
    id: "6",
    name: "Marketing Team",
    lastMessage: "New campaign ideas ready for review",
    time: "Monday",
    avatar: "https://avatars.githubusercontent.com/u/147712790?v=4",
    unreadCount: 5,
    isArchived: false,
    isFavorite: true,
    isGroup: true,
  },
  {
    id: "7",
    name: "Archived Contact",
    lastMessage: "This is an archived message",
    time: "Last week",
    avatar: "https://avatars.githubusercontent.com/u/147712790?v=4",
    unreadCount: 0,
    isArchived: true,
    isFavorite: false,
    isGroup: false,
  },
];

const tabs = [
  { id: "all", label: "All", icon: "chatbubbles" },
  { id: "unread", label: "Unread", icon: "radio-button-on" },
  { id: "archive", label: "Archive", icon: "archive" },
  { id: "favorites", label: "Favourites", icon: "heart" },
  { id: "groups", label: "Groups", icon: "people" },
];

export function Messages() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [messagesData, setMessagesData] = useState(initialMessagesData);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const handleMessagePress = (messageId, userName) => {
    router.push({
      pathname: "/(tabs)/Activity/messages/chat/Chat",
      params: {
        messageId: messageId,
        userName: userName,
      },
    });
  };

  const toggleFavorite = (messageId) => {
    setMessagesData((prevMessages) =>
      prevMessages.map((message) =>
        message.id === messageId
          ? { ...message, isFavorite: !message.isFavorite }
          : message
      )
    );
  };

  const toggleArchive = (messageId) => {
    setMessagesData((prevMessages) =>
      prevMessages.map((message) =>
        message.id === messageId
          ? { ...message, isArchived: !message.isArchived }
          : message
      )
    );
  };

  const handleLongPress = (messageId, userName) => {
    const message = messagesData.find((m) => m.id === messageId);
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
    let filtered = messagesData;

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (message) =>
          message.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          message.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (activeTab) {
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
      ]}
      onPress={() => handleMessagePress(item.id, item.name)}
      onLongPress={() => handleLongPress(item.id, item.name)}
      delayLongPress={500}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
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
            <View
              style={styles.favoriteButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
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
            <View style={styles.unreadBadge}>
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
                color={activeTab === tab.id ? "#007AFF" : "#8E8E93"}
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
            {searchQuery ? "No messages found" : `No ${activeTab} messages`}
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
    backgroundColor: "#E3F2FD",
  },
  tabLabel: {
    fontSize: 14,
    color: "#8E8E93",
    marginLeft: 6,
    fontWeight: "500",
  },
  activeTabLabel: {
    color: "#007AFF",
    fontWeight: "600",
  },
  messagesList: {
    flex: 1,
  },
  messageItem: {
    flexDirection: "row",
    paddingVertical: 12,
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
});

export default Messages;
