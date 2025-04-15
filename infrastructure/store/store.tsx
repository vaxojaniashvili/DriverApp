import { create } from 'zustand';

interface AuthState {
  user: any | null;
  setUser: (user: any) => void;
  mode: any,
  my_id: any,
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  mode: "off",
  setMode: (mode:any) => set({mode}),
  my_id: null,
  setmyID: (my_id:any) => set({my_id}),

}));
