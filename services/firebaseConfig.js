import { Platform } from "react-native";
import "@react-native-firebase/app";

if (Platform.OS === "android") {
  const firebase = require("@react-native-firebase/app").default;

  console.log("🔥 Firebase Apps:", firebase.apps.length);

  if (!firebase.apps.length) {
    try {
      firebase.initializeApp({
        // google-services.json-ის მიხედვით (thevanapp-a4a59)
        apiKey: "AIzaSyDPzHRUiN-me8EDuWG9whoGFCvonIS2L0M",
        authDomain: "thevanapp-a4a59.firebaseapp.com",
        projectId: "thevanapp-a4a59", // ← შეცვლილი
        storageBucket: "thevanapp-a4a59.firebasestorage.app", // ← შეცვლილი
        messagingSenderId: "991708575200", // ← შეცვლილი
        appId: "1:991708575200:android:df4e92994d0277bd576785", // ← შეცვლილი
      });
      console.log("✅ Firebase initialized manually for Android");
    } catch (error) {
      if (error.code === "app/duplicate-app") {
        console.log("✅ Firebase already initialized");
      } else {
        console.error("❌ Firebase initialization error:", error);
      }
    }
  } else {
    console.log("✅ Firebase already initialized");
  }
}

console.log("🔥 Firebase setup completed");
