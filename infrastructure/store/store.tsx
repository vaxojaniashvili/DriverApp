import { create } from "zustand";
import { Session } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthState {
  user: any | null;
  setUser: (user: any) => void;
  session: Session | null;
  setSession: (session: Session | null) => void;
  mode: any;
  setMode: (mode: any) => void;
  my_id: any;
  setmyID: (my_id: any) => void;
  isAutomatic: boolean;
  setIsAutomatic: (isAuto: boolean) => void;
  pickupRadius: number;
  setPickupRadius: (radius: number) => void;
  pickupCount: number;
  setPickupCount: (count: number) => void;
  // AsyncStorage methods
  loadSessionFromStorage: () => Promise<void>;
  clearSessionFromStorage: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  session: null,
  setSession: async (session) => {
    set({ session });
    // Save to AsyncStorage
    if (session) {
      try {
        await AsyncStorage.setItem("user_session", JSON.stringify(session));
        await AsyncStorage.setItem("user_data", JSON.stringify(session.user));
        console.log("Session saved to AsyncStorage");
      } catch (error) {
        console.error("Error saving session to AsyncStorage:", error);
      }
    } else {
      try {
        await AsyncStorage.removeItem("user_session");
        await AsyncStorage.removeItem("user_data");
        console.log("Session removed from AsyncStorage");
      } catch (error) {
        console.error("Error removing session from AsyncStorage:", error);
      }
    }
  },
  mode: "off",
  setMode: (mode: any) => set({ mode }),
  my_id: null,
  setmyID: (my_id: any) => set({ my_id }),
  isAutomatic: true,
  setIsAutomatic: (isAuto) => set({ isAutomatic: isAuto }),
  pickupRadius: 1,
  setPickupRadius: (radius) => set({ pickupRadius: radius }),
  pickupCount: 1,
  setPickupCount: (count) => set({ pickupCount: count }),

  // Load session from AsyncStorage
  loadSessionFromStorage: async () => {
    try {
      const sessionData = await AsyncStorage.getItem("user_session");
      const userData = await AsyncStorage.getItem("user_data");

      if (sessionData && userData) {
        const session = JSON.parse(sessionData);
        const user = JSON.parse(userData);
        set({ session, user });
      } else {
        console.log("No session found in AsyncStorage");
      }
    } catch (error) {
      console.error("Error loading session from AsyncStorage:", error);
    }
  },

  clearSessionFromStorage: async () => {
    try {
      await AsyncStorage.removeItem("user_session");
      await AsyncStorage.removeItem("user_data");
      set({ session: null, user: null });
      console.log("Session cleared from AsyncStorage");
    } catch (error) {
      console.error("Error clearing session from AsyncStorage:", error);
    }
  },

  // Logout function
  logout: async () => {
    try {
      await AsyncStorage.removeItem("user_session");
      await AsyncStorage.removeItem("user_data");
      set({
        session: null,
        user: null,
        mode: "off",
        my_id: null,
        isAutomatic: true,
        pickupRadius: 1,
        pickupCount: 1,
      });
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  },
}));
