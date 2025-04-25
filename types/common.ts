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
  isAutomatic: boolean;
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
  isActive?: any;
  status: string;
  live: boolean;
  order_status?: any;
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

export interface OrderItem {
  id: number;
  name: string;
  size: string;
  price: number;
  category: string;
  quantity: number;
  created_at: string;
  sub_category: string;
}

export interface OrderHistoryType {
  id: number;
  created_at: string;
  pickup_name: string;
  destination_name: string;
  pickup_lat: string;
  pickup_lng: string;
  destination_lat: string;
  destination_lng: string;
  email: string;
  items: OrderItem[];
  price: string;
  distance: string;
  status: string;
  driver_id: number;
  order_status: string;
  live: boolean;
  assigned_driver: string;
}
