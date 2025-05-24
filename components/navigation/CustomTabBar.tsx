import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { TabItemType } from "@/types/common";

const TAB_ITEMS: TabItemType[] = [
  {
    key: "home",
    route: "homepage",
    title: "Home",
    icon: "home-outline",
    activeIcon: "home",
  },
  {
    key: "current",
    route: "current/current",
    title: "Current",
    icon: "logo-ionic",
    activeIcon: "logo-ionic",
  },
  {
    key: "Activity",
    route: "Activity/activity",
    title: "Activity",
    icon: "notifications",
    activeIcon: "notifications",
  },
  {
    key: "settings",
    route: "settings/index",
    title: "View",
    icon: "settings-outline",
    activeIcon: "settings",
  },
];

type CustomTabBarProps = {
  state: any;
  navigation: any;
};

export function CustomTabBar({ state, navigation }: CustomTabBarProps) {
  const colorScheme = useColorScheme();

  // პირდაპირ განსაზღვრეთ აქტიური ფერი როგორც ლურჯი
  const activeColor = "#007AFF"; // iOS ლურჯი ფერი (შეგიძლიათ შეცვალოთ სასურველი ლურჯი ფერით)

  // ან შეამოწმეთ Colors კონსტანტა ლოგით
  console.log("Colors:", Colors);
  console.log("Current colorScheme:", colorScheme);
  console.log(
    "Active color from constants:",
    Colors[colorScheme ?? "light"].tint
  );

  const inactiveColor = "#999";

  return (
    <View style={styles.container}>
      {TAB_ITEMS.map((item, index) => {
        const isFocused = state.index === index;
        const color = isFocused ? activeColor : inactiveColor;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: item.route,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(item.route);
          }
        };

        return (
          <TouchableOpacity
            key={item.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={styles.tabButton}
          >
            <Ionicons
              name={isFocused ? item.activeIcon || item.icon : item.icon}
              size={24}
              color={color}
              style={styles.icon}
            />
            <Text style={[styles.label, { color }]}>{item.title}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "white",
    height: 85,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 20,
  },
  icon: {
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    textAlign: "center",
  },
});
