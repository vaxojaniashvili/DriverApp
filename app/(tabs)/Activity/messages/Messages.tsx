import React from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const messagesData = [
  {
    id: "1",
    name: "Vaxo Janiashvili",
    lastMessage: "Hello, how are you?",
    time: "14:30",
    avatar: "https://avatars.githubusercontent.com/u/147712790?v=4",
    unreadCount: 2,
  },
  {
    id: "2",
    name: "Leri Ugulava",
    lastMessage: "Do you have a meeting tomorrow?",
    time: "12:15",
    avatar: "https://avatars.githubusercontent.com/u/147712790?v=4",
    unreadCount: 0,
  },
  {
    id: "3",
    name: "Valeri Shurgaia",
    lastMessage: "Send me the document",
    time: "Yesterday",
    avatar: "https://avatars.githubusercontent.com/u/147712790?v=4",
    unreadCount: 1,
  },
  {
    id: "4",
    name: "David Meskhi",
    lastMessage: "Ok, thanks for information",
    time: "Yesterday",
    avatar: "https://avatars.githubusercontent.com/u/147712790?v=4",
    unreadCount: 0,
  },
  {
    id: "5",
    name: "Giorgi Bachidze",
    lastMessage: "Did you download the photos?",
    time: "Monday",
    avatar: "https://avatars.githubusercontent.com/u/147712790?v=4",
    unreadCount: 3,
  },
];

export function Messages() {
  const router = useRouter();

  const handleMessagePress = (messageId, userName) => {
    router.push({
      pathname: "/(tabs)/Activity/messages/chat/Chat",
      params: {
        messageId: messageId,
        userName: userName,
      },
    });
  };

  const handleBackPress = () => {
    router.push("/(tabs)/Activity/activity");
  };

  const renderMessageItem = ({ item }) => (
    <TouchableOpacity
      style={styles.messageItem}
      onPress={() => handleMessagePress(item.id, item.name)}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />

      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>

        <View style={styles.messageFooter}>
          <Text style={styles.lastMessage} numberOfLines={1}>
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Ionicons name="chevron-back" size={24} color="#212529" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={messagesData}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: "#007AFF",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
  },
  placeholder: {
    width: 40,
  },
  messagesList: {
    flex: 1,
  },
  messageItem: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    backgroundColor: "#FFFFFF",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
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
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
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
});

export default Messages;
