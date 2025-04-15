import { StyleProp, ViewStyle } from "react-native";

export interface DriverModeButtonProps {
  mode: "active" | "off" | "break";
  selected: boolean;
  style?: StyleProp<ViewStyle>;
}

export interface JobSelectionButtonProps {
  selected: boolean;
  style?: StyleProp<ViewStyle>;
}

export interface ButtonTextProps {
  color?: string;
}

export interface AuthStoreState {
  mode: "active" | "off" | "break";
  setMode: (mode: "active" | "off" | "break") => void;
  setmyID?: any;
}

export interface StatusProps {
  active: boolean;
}

export interface ThemeProps {
  theme?: "error" | "success";
}

export interface DriverData {
  id: string;
  plate?: string;
  email?: string;
  [key: string]: any;
}

export interface OrderData {
  id: string;
  driver_id: string;
  status: string;
  live: boolean;
  order_status?: string;
  destination_name?: string;
  pickup_name?: string;
  price?: number;
  created_at: string;
  [key: string]: any;
}

export interface LocationData {
  latitude: number;
  longitude: number;
}

export interface TabItemType {
  key: string;
  route: string;
  title: string;
  icon: string;
  activeIcon?: string;
}
