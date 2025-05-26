import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const ActionModal = ({
  visible,
  onClose,
  userName,
  isFavorite,
  isArchived,
  onFavorite,
  onArchive,
}: any) => {
  const [scaleAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleOutsidePress = () => {
    onClose();
  };

  const handleFavoritePress = () => {
    onFavorite();
    onClose();
  };

  const handleArchivePress = () => {
    onArchive();
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={handleOutsidePress}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalContent,
                {
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{userName}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#8E8E93" />
                </TouchableOpacity>
              </View>

              {/* Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleFavoritePress}
                >
                  <View style={styles.actionIconContainer}>
                    <Ionicons
                      name={isFavorite ? "heart" : "heart-outline"}
                      size={24}
                      color={isFavorite ? "#FF6B6B" : "#007AFF"}
                    />
                  </View>
                  <Text style={styles.actionText}>
                    {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleArchivePress}
                >
                  <View style={styles.actionIconContainer}>
                    <Ionicons
                      name={isArchived ? "unarchive" : "archive"}
                      size={24}
                      color="#FF9500"
                    />
                  </View>
                  <Text style={styles.actionText}>
                    {isArchived ? "Unarchive" : "Archive"}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 0,
    width: width * 0.85,
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 25,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  closeButton: {
    padding: 4,
  },
  modalActions: {
    padding: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#F8F9FA",
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
  },
});

export default ActionModal;
