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

  // ✅ surname-ის ტიპის დაზუსტება
  surname: string | null;
  setSurname: (surname: string | null) => void;

  // ✅ ახალი fields user verification-ისთვის
  userStatus: "inactive" | "pending" | "active";
  setUserStatus: (status: "inactive" | "pending" | "active") => void;
  driverData: any | null;
  setDriverData: (data: any) => void;
  userIndicator: string | null;
  setUserIndicator: (indicator: string | null) => void;

  // AsyncStorage methods
  loadSessionFromStorage: () => Promise<void>;
  clearSessionFromStorage: () => Promise<void>;
  logout: () => Promise<void>;
  uuid: string | null;
  setUUID: (uuid: string | null) => void;
  name: string | null;
  setName: (name: string | null) => void;
  phone: string | null;
  setPhone: (phone: string | null) => void;
  vanOption: string | null;
  setVanOption: (vanOption: string | null) => void;
  email: string | null;
  setEmail: (email: string | null) => void;

  // ✅ ახალი method - complete verification და navigation-ის მართვისთვის
  completeVerification: (userData: any) => Promise<void>;

  // ✅ დამატებული: არჩეული ქვეყნის დროშის შესანახად
  selectedCountryFlag: string | null;
  setSelectedCountryFlag: (flag: string | null) => void;
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

  // ✅ surname-ის ინიციალიზაცია
  surname: null,
  setSurname: (surname: string | null) => set({ surname }),

  // ✅ ახალი state fields
  userStatus: "inactive",
  setUserStatus: (status) => {
    console.log("🔄 Setting user status in store:", status);
    set({ userStatus: status });
  },
  driverData: null,
  setDriverData: (data) => {
    console.log("🔄 Setting driver data in store:", data);
    set({ driverData: data });
  },
  userIndicator: null,
  setUserIndicator: (indicator) => {
    console.log("🔄 Setting user indicator in store:", indicator);
    set({ userIndicator: indicator });
  },

  // ✅ ახალი method - complete verification
  completeVerification: async (userData) => {
    console.log("✅ Completing verification in store with data:", userData);

    // Update all relevant state
    set({
      userStatus: "active",
      userIndicator: "active",
      driverData: userData,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      surname: userData.last_name, // ✅ გვარის განახლებაც
    });

    // Update user metadata in session as well
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        user_metadata: {
          ...currentUser.user_metadata,
          status: "active",
          full_name: userData.name,
          email_verified: true,
          last_name: userData.last_name, // ✅ გვარის დამატება user_metadata-ში
        },
      };
      set({ user: updatedUser });
    }

    console.log("✅ Store updated successfully for verified user");
  },

  // Load session from AsyncStorage
  loadSessionFromStorage: async () => {
    try {
      const sessionData = await AsyncStorage.getItem("user_session");
      const userData = await AsyncStorage.getItem("user_data");
      // ✅ ასევე ვცდილობთ დროშის ჩატვირთვას
      const storedCountryFlag = await AsyncStorage.getItem(
        "selected_country_flag"
      );

      if (sessionData && userData) {
        const session = JSON.parse(sessionData);
        const user = JSON.parse(userData);
        set({ session, user });
      } else {
        console.log("No session found in AsyncStorage");
      }
      // ✅ დროშის ჩატვირთვა
      if (storedCountryFlag) {
        set({ selectedCountryFlag: storedCountryFlag });
      }
    } catch (error) {
      console.error("Error loading session from AsyncStorage:", error);
    }
  },

  clearSessionFromStorage: async () => {
    try {
      await AsyncStorage.removeItem("user_session");
      await AsyncStorage.removeItem("user_data");
      // ✅ დროშის გასუფთავებაც
      await AsyncStorage.removeItem("selected_country_flag");
      set({
        session: null,
        user: null,
        userStatus: "inactive",
        userIndicator: null,
        driverData: null,
        selectedCountryFlag: null, // ✅ მდგომარეობის გასუფთავება
        name: null, // ✅ სახელის გასუფთავება
        surname: null, // ✅ გვარის გასუფთავება
        phone: null, // ✅ ტელეფონის გასუფთავება
        email: null, // ✅ მეილის გასუფთავება
      });
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
      // ✅ დროშის გასუფთავებაც
      await AsyncStorage.removeItem("selected_country_flag");
      set({
        session: null,
        user: null,
        mode: "off",
        my_id: null,
        isAutomatic: true,
        pickupRadius: 1,
        pickupCount: 1,
        userStatus: "inactive",
        userIndicator: null,
        driverData: null,
        selectedCountryFlag: null, // ✅ მდგომარეობის გასუფთავება
        name: null, // ✅ სახელის გასუფთავება
        surname: null, // ✅ გვარის გასუფთავება
        phone: null, // ✅ ტელეფონის გასუფთავება
        email: null, // ✅ მეილის გასუფთავება
      });
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  },

  uuid: null,
  setUUID: (uuid: string | null) => set({ uuid }),
  name: null,
  setName: (name: string | null) => set({ name }),
  phone: null,
  setPhone: (phone: string | null) => set({ phone }),
  vanOption: null,
  setVanOption: (vanOption: string | null) => set({ vanOption }),
  email: null,
  setEmail: (email: string | null) => set({ email }),

  // ✅ დამატებული: დროშის შენახვა Zustand-ში და AsyncStorage-ში
  selectedCountryFlag: null,
  setSelectedCountryFlag: async (flag: string | null) => {
    set({ selectedCountryFlag: flag });
    if (flag) {
      await AsyncStorage.setItem("selected_country_flag", flag);
    } else {
      await AsyncStorage.removeItem("selected_country_flag");
    }
  },
}));
