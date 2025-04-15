/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};

export const DriverModeColors = {
  primary: "#5E72E4",
  secondary: "#11CDEF",
  success: "#2DCE89",
  danger: "#F5365C",
  warning: "#FB6340",
  info: "#1171EF",
  light: "#FAFBFE",
  dark: "#212B36",
  darkGray: "#8898AA",
  gradient1: "#5E72E4",
  gradient2: "#825EE4",
  cardBg: "rgba(255, 255, 255, 0.9)",
  statusBgOnline: "rgba(45, 206, 137, 0.2)",
  statusBgOffline: "rgba(245, 54, 92, 0.2)",
};
