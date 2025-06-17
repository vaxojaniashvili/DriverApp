// services/SocketService.js
import io from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.currentUser = null;
    this.messageListeners = new Map();
    this.statusListeners = new Map();
  }

  connect(serverUrl = "https://api.thevanapp.com") {
    if (this.socket) {
      this.disconnect();
    }

    console.log("Connecting to:", serverUrl);

    this.socket = io(serverUrl, {
      transports: ["websocket"],
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on("connect", () => {
      console.log("✅ Connected to server:", this.socket.id);
      this.isConnected = true;
      this.notifyStatusListeners("connected", true);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Disconnected from server:", reason);
      this.isConnected = false;
      this.notifyStatusListeners("connected", false);
    });

    this.socket.on("connect_error", (error) => {
      console.error("🔴 Connection error:", error);
      this.notifyStatusListeners("error", error);
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log("🔄 Reconnected after", attemptNumber, "attempts");
      this.isConnected = true;
      this.notifyStatusListeners("connected", true);
    });

    this.setupMessageListeners();
  }

  setupMessageListeners() {
    // Real-time message receipt
    this.socket.on("receive_message", (messageData) => {
      console.log("📨 New message received:", messageData);
      this.notifyMessageListeners("new_message", messageData);
    });

    // Chat history loaded
    this.socket.on("chat_history", (messages) => {
      console.log("📜 Chat history loaded:", messages.length, "messages");
      this.notifyMessageListeners("chat_history", messages);
    });

    // User joined/left
    this.socket.on("user_joined", (data) => {
      console.log("👋 User joined:", data);
      this.notifyMessageListeners("user_joined", data);
    });

    this.socket.on("user_left", (data) => {
      console.log("👋 User left:", data);
      this.notifyMessageListeners("user_left", data);
    });

    // Typing indicators
    this.socket.on("user_typing", (data) => {
      this.notifyMessageListeners("user_typing", data);
    });

    // Support events
    this.socket.on("support_connected", (data) => {
      console.log("🆘 Support connected:", data);
      this.notifyMessageListeners("support_connected", data);
    });

    this.socket.on("client_connected", (data) => {
      console.log("👤 Client connected:", data);
      this.notifyMessageListeners("client_connected", data);
    });

    this.socket.on("support_session_ended", (data) => {
      console.log("🔚 Support session ended:", data);
      this.notifyMessageListeners("support_ended", data);
    });

    this.socket.on("queue_joined", (data) => {
      console.log("📋 Queue joined:", data);
      this.notifyMessageListeners("queue_joined", data);
    });

    this.socket.on("queue_status", (data) => {
      console.log("📊 Queue status:", data);
      this.notifyMessageListeners("queue_status", data);
    });

    // Online users count
    this.socket.on("online_users_count", (count) => {
      console.log("👥 Online users:", count);
      this.notifyStatusListeners("online_users", count);
    });

    // Error handling
    this.socket.on("error", (error) => {
      console.error("🔴 Socket error:", error);
      this.notifyStatusListeners("error", error);
    });
  }

  // User registration as driver
  registerDriver(username, userInfo = {}) {
    if (!this.socket || !this.isConnected) {
      console.warn("⚠️ Socket not connected, cannot register driver");
      return;
    }

    this.currentUser = { username, role: "driver", ...userInfo };

    console.log("🚗 Registering driver:", username);
    this.socket.emit("register_user", {
      username,
      role: "driver",
      userInfo,
    });
  }

  // User registration as support agent
  registerAsSupport(username, userInfo = {}) {
    if (!this.socket || !this.isConnected) {
      console.warn("⚠️ Socket not connected, cannot register as support");
      return;
    }

    this.currentUser = { username, role: "support", ...userInfo };

    console.log("🆘 Registering as support agent:", username);
    this.socket.emit("register_user", {
      username,
      role: "support", // ✅ Support agent role
      userInfo,
    });
  }

  // Accept next client from queue
  acceptNextClient(queueType = "client-support") {
    if (!this.socket || !this.isConnected) {
      console.warn("⚠️ Socket not connected, cannot accept client");
      return;
    }

    console.log("✅ Accepting next client from queue:", queueType);
    this.socket.emit("accept_next_client", { queueType });
  }

  // Get queue status
  getQueueStatus() {
    if (!this.socket || !this.isConnected) return;

    // console.log("📊 Getting queue status");
    this.socket.emit("get_queue_status");
  }

  // Join a chat room
  joinRoom(username, room) {
    if (!this.socket || !this.isConnected) {
      console.warn("⚠️ Socket not connected, cannot join room");
      return;
    }

    console.log("🏠 Joining room:", room, "as", username);
    this.socket.emit("join", { username, room });

    // Load chat history when joining
    setTimeout(() => {
      this.loadChatHistory(room);
    }, 500);
  }

  // Load chat history for a room
  loadChatHistory(room, limit = 100) {
    if (!this.socket || !this.isConnected) {
      console.warn("⚠️ Socket not connected, cannot load history");
      return;
    }

    console.log("📜 Loading chat history for room:", room);
    this.socket.emit("load_chat_history", { room, limit });
  }

  // Send message to current room
  sendMessage(message, room) {
    if (!this.socket || !this.isConnected) {
      console.warn("⚠️ Socket not connected, cannot send message");
      return;
    }

    console.log("💬 Sending message to room:", room);
    this.socket.emit("send_message", { message, room });
  }

  // Send typing indicator
  sendTyping(isTyping, room) {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit("typing", { isTyping, room });
  }

  // Request support (driver requesting help)
  requestSupport(issue = "") {
    if (!this.socket || !this.isConnected) {
      console.warn("⚠️ Socket not connected, cannot request support");
      return;
    }

    console.log("🆘 Requesting support:", issue);
    this.socket.emit("request_support", {
      userType: "driver",
      priority: "normal",
      issue,
    });
  }

  // Get online users for a room
  getOnlineUsers(room) {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit("get_online_users", room);
  }

  // End support session
  endSupportSession() {
    if (!this.socket || !this.isConnected) return;

    console.log("🔚 Ending support session");
    this.socket.emit("end_support_session");
  }

  // Event listeners management
  addMessageListener(id, callback) {
    this.messageListeners.set(id, callback);
    console.log("📡 Added message listener:", id);
  }

  removeMessageListener(id) {
    this.messageListeners.delete(id);
    console.log("📡 Removed message listener:", id);
  }

  addStatusListener(id, callback) {
    this.statusListeners.set(id, callback);
    console.log("📡 Added status listener:", id);
  }

  removeStatusListener(id) {
    this.statusListeners.delete(id);
    console.log("📡 Removed status listener:", id);
  }

  notifyMessageListeners(type, data) {
    this.messageListeners.forEach((callback, id) => {
      try {
        callback(type, data);
      } catch (error) {
        console.error("🔴 Error in message listener", id, ":", error);
      }
    });
  }

  notifyStatusListeners(type, data) {
    this.statusListeners.forEach((callback, id) => {
      try {
        callback(type, data);
      } catch (error) {
        console.error("🔴 Error in status listener", id, ":", error);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      console.log("🔌 Disconnecting socket");
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.currentUser = null;
  }

  // Get available chat rooms
  getAvailableRooms() {
    return [
      {
        id: "general",
        name: "General Chat",
        description: "Talk with customers and drivers",
        type: "public",
      },
      {
        id: "customer-support",
        name: "Customer Support",
        description: "Help customers with their requests",
        type: "support",
      },
      {
        id: "drivers-only",
        name: "Drivers Only",
        description: "Private chat for drivers",
        type: "private",
      },
    ];
  }

  // Connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      currentUser: this.currentUser,
      socketId: this.socket?.id || null,
    };
  }
}

export default new SocketService();
