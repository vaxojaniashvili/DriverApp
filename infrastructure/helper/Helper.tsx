import { ToastAndroid, Platform, Alert } from "react-native";

/**
 * Display a toast message or alert based on platform
 * @param {string} message - The message to display
 * @param {string} duration - Duration of toast (short or long)
 */
export const MyToast = (message, duration = "short") => {
  if (Platform.OS === "android") {
    // For Android, use ToastAndroid
    ToastAndroid.show(
      message,
      duration === "short" ? ToastAndroid.SHORT : ToastAndroid.LONG
    );
  } else {
    // For iOS, use Alert since iOS doesn't have native toast
    Alert.alert("Notification", message, [{ text: "OK" }], {
      cancelable: true,
    });
  }
};
