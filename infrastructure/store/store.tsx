import { create } from "zustand";

interface AuthState {
  user: any | null;
  setUser: (user: any) => void;
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
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
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
}));
