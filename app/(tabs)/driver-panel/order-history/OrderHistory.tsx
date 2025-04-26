import { supabase } from "@/infrastructure/db/supabase";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFocusEffect } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import { OrderItem, OrderHistoryType } from "../../../../types/common";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  RefreshControl,
  SafeAreaView,
} from "react-native";

export function OrderHistory() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<OrderHistoryType[]>([]);
  const [groupedOrders, setGroupedOrders] = useState<
    Record<string, OrderHistoryType[]>
  >({});
  const [driverId, setDriverId] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [apiToken, setApiToken] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          throw error;
        }
        if (user) {
          setUserEmail(user?.email || "");
        }
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.access_token) {
          setApiToken(sessionData.session.access_token);
        }
      } catch (error) {
        console.log("Error fetching token:", error);
      }
    };

    fetchToken();
  }, []);

  useEffect(() => {
    if (!userEmail) return;

    const fetchDriverData = async () => {
      try {
        const response = await fetch(
          `https://api.thevanapp.com/api/driver-loc`
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const currentDriver = data.find(
          (driver: any) => driver.email === userEmail
        );

        if (!currentDriver) {
          console.log("No driver data found for email:", userEmail);
          return;
        }

        if (currentDriver.id) {
          setDriverId(currentDriver.id);
        } else {
          console.error("Driver data missing ID field");
        }
      } catch (error) {
        console.error("Error fetching driver data:", error);
      }
    };

    fetchDriverData();
  }, [userEmail]);

  useFocusEffect(
    useCallback(() => {
      if (driverId && apiToken) {
        console.log("Screen focused, fetching order history...");
        fetchOrderHistory();
      }

      return () => {
        console.log("Screen blurred");
      };
    }, [driverId, apiToken])
  );

  useEffect(() => {
    if (orders.length > 0) {
      const grouped = groupOrdersByMonth(orders);
      setGroupedOrders(grouped);
      setLoading(false);
    }
  }, [orders]);

  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://api.thevanapp.com/api/history/driver/${driverId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiToken}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        console.error("Unexpected API response format:", data);
        setOrders([]);
      }
    } catch (error) {
      console.log("Error fetching order history:", error);
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (Platform.OS === "ios") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    await fetchOrderHistory();
  };

  const groupOrdersByMonth = (ordersList: OrderHistoryType[]) => {
    return ordersList.reduce(
      (groups: Record<string, OrderHistoryType[]>, order) => {
        const date = new Date(order.created_at);
        const monthYear = `${date.toLocaleString("default", {
          month: "long",
        })} ${date.getFullYear()}`;

        if (!groups[monthYear]) {
          groups[monthYear] = [];
        }

        groups[monthYear].push(order);
        return groups;
      },
      {}
    );
  };

  const handleBack = () => {
    router.push("/driver-panel/driver-panel");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ka-GE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("ka-GE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: string | number) => {
    const numericAmount =
      typeof amount === "string" ? parseFloat(amount) : amount;
    return `₾${numericAmount.toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();

    if (statusLower === "paid" || statusLower === "completed") {
      return {
        background: "#d8f3dc",
        text: "#2d6a4f",
      };
    } else if (statusLower === "canceled" || statusLower === "declined") {
      return {
        background: "#ffe3e3",
        text: "#c92a2a",
      };
    } else if (statusLower === "pending") {
      return {
        background: "#fff3bf",
        text: "#8d6e00",
      };
    } else {
      return {
        background: "#e9ecef",
        text: "#495057",
      };
    }
  };

  const toggleOrderExpand = (orderId: number) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const calculateTotalItems = (items: OrderItem[]) => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const renderOrderItem = (order: OrderHistoryType) => {
    const statusColors = getStatusColor(order.status);
    const isExpanded = expandedOrders[order.id] || false;
    const totalItems = order.items ? calculateTotalItems(order.items) : 0;

    return (
      <View key={order.id} style={styles.orderItem}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>Order #{order.id.toString()}</Text>
          <Text style={styles.orderAmount}>{formatAmount(order.price)}</Text>
        </View>

        <View style={styles.orderStatusRow}>
          <View
            style={[
              styles.orderStatusBadge,
              { backgroundColor: statusColors.background },
            ]}
          >
            <Text
              style={[styles.orderStatusText, { color: statusColors.text }]}
            >
              {order.status}
            </Text>
          </View>

          {order.order_status && order.order_status !== order.status && (
            <View
              style={[
                styles.orderStatusBadge,
                {
                  backgroundColor: getStatusColor(order.order_status)
                    .background,
                  marginLeft: 8,
                },
              ]}
            >
              <Text
                style={[
                  styles.orderStatusText,
                  { color: getStatusColor(order.order_status).text },
                ]}
              >
                {order.order_status}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.orderDetailRow}>
            <Ionicons name="time-outline" size={16} color="#6c757d" />
            <Text style={styles.orderDate}>
              {formatDate(order.created_at)} at {formatTime(order.created_at)}
            </Text>
          </View>

          <View style={styles.orderDetailRow}>
            <Ionicons name="location-outline" size={16} color="#6c757d" />
            <Text
              style={styles.orderDestination}
              numberOfLines={isExpanded ? 0 : 1}
            >
              {order.destination_name}
            </Text>
          </View>
        </View>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.divider} />

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Route Details</Text>

              <View style={styles.locationContainer}>
                <View style={styles.locationIconContainer}>
                  <View style={styles.pickupDot} />
                </View>
                <View style={styles.locationTextContainer}>
                  <Text style={styles.locationLabel}>Pickup</Text>
                  <Text style={styles.locationText}>{order.pickup_name}</Text>
                </View>
              </View>

              <View style={styles.routeLine} />

              <View style={styles.locationContainer}>
                <View style={styles.locationIconContainer}>
                  <View style={styles.destinationDot} />
                </View>
                <View style={styles.locationTextContainer}>
                  <Text style={styles.locationLabel}>Destination</Text>
                  <Text style={styles.locationText}>
                    {order.destination_name}
                  </Text>
                </View>
              </View>

              {order.distance && (
                <View style={styles.distanceContainer}>
                  <Ionicons name="navigate-outline" size={14} color="#6c757d" />
                  <Text style={styles.distanceText}>{order.distance}</Text>
                </View>
              )}
            </View>

            {order.items && order.items.length > 0 && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Items ({totalItems})</Text>

                {order.items.map((item, index) => (
                  <View
                    key={`${item.id}-${index}`}
                    style={styles.itemContainer}
                  >
                    <View style={styles.itemIconContainer}>
                      <FontAwesome5
                        name={getCategoryIcon(item.category)}
                        size={16}
                        color="#4caf50"
                      />
                    </View>

                    <View style={styles.itemDetails}>
                      <View style={styles.itemHeaderRow}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemPrice}>
                          {formatAmount(item.price)}
                        </Text>
                      </View>

                      <View style={styles.itemMetaRow}>
                        <Text style={styles.itemCategory}>
                          {item.category}{" "}
                          {item.sub_category ? `• ${item.sub_category}` : ""}
                        </Text>
                        <Text style={styles.itemQuantity}>
                          Quantity: {item.quantity}
                        </Text>
                      </View>

                      {item.size && (
                        <View style={styles.sizeTag}>
                          <Text style={styles.sizeText}>{item.size}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Additional Information</Text>

              {order.email && (
                <View style={styles.infoRow}>
                  <Ionicons name="mail-outline" size={16} color="#6c757d" />
                  <Text style={styles.infoText}>Customer:</Text>
                  <Text style={styles.infoTextValue}>{order.email}</Text>
                </View>
              )}

              {order.driver_id && (
                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={16} color="#6c757d" />
                  <Text style={styles.infoText}>Driver ID:</Text>
                  <Text style={styles.infoTextValue}>{order.driver_id}</Text>
                </View>
              )}

              {order.live !== undefined && (
                <View style={styles.infoRow}>
                  <Ionicons
                    name={
                      order.live ? "radio-outline" : "radio-button-off-outline"
                    }
                    size={16}
                    color="#6c757d"
                  />
                  <Text style={styles.infoText}>Live Tracking:</Text>
                  <Text style={styles.infoTextValue}>
                    {order.live ? "Enabled" : "Disabled"}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.expandButton}
          onPress={() => toggleOrderExpand(order.id)}
        >
          <Text style={styles.expandButtonText}>
            {isExpanded ? "Show Less" : "Show More"}
          </Text>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={16}
            color="gray"
          />
        </TouchableOpacity>
      </View>
    );
  };

  const getCategoryIcon = (category: string): string => {
    const categoryLower = category.toLowerCase();

    if (
      categoryLower.includes("furniture") ||
      categoryLower.includes("household")
    ) {
      return "couch";
    } else if (categoryLower.includes("electronics")) {
      return "laptop";
    } else if (
      categoryLower.includes("clothes") ||
      categoryLower.includes("clothing")
    ) {
      return "tshirt";
    } else if (categoryLower.includes("food")) {
      return "utensils";
    } else if (categoryLower.includes("book")) {
      return "book";
    } else {
      return "box";
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerStyle}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color="#212529" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
        <View style={styles.optionsButton} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4361ee" />
          <Text style={styles.loadingText}>Loading order history...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#28c76f"]}
              tintColor="#28c76f"
            />
          }
        >
          <View style={styles.ordersContainer}>
            {Object.keys(groupedOrders).length > 0 ? (
              Object.entries(groupedOrders).map(([month, monthOrders]) => (
                <View key={month} style={styles.monthSection}>
                  <View style={styles.monthHeaderContainer}>
                    <Text style={styles.monthHeader}>{month}</Text>
                    <View style={styles.orderCountBadge}>
                      <Text style={styles.orderCountText}>
                        {monthOrders.length}
                      </Text>
                    </View>
                  </View>

                  {monthOrders.map((order) => renderOrderItem(order))}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="document-outline" size={60} color="#adb5bd" />
                <Text style={styles.emptyStateText}>
                  No order history found
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  Your completed orders will appear here
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

export default OrderHistory;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingTop: Platform.OS === "ios" ? 0 : 20,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  headerStyle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 5,
    marginBottom: 16,
  },
  backButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f3f5",
  },
  optionsButton: {
    height: 40,
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#212529",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6c757d",
  },
  ordersContainer: {
    paddingBottom: 20,
  },
  monthSection: {
    marginBottom: 24,
  },
  monthHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  monthHeader: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212529",
  },
  orderCountBadge: {
    backgroundColor: "#e9ecef",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  orderCountText: {
    fontSize: 14,
    color: "#495057",
    fontWeight: "600",
  },
  orderItem: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "700",
    color: "#212529",
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4caf50",
  },
  orderStatusRow: {
    flexDirection: "row",
    marginBottom: 14,
  },
  orderStatusContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 12,
  },
  orderStatusBadge: {
    backgroundColor: "#d8f3dc",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  orderStatusText: {
    fontSize: 12,
    textTransform: "uppercase",
    fontWeight: "600",
    color: "#2d6a4f",
  },
  orderDetails: {
    marginBottom: 12,
  },
  orderDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  orderDestination: {
    fontSize: 15,
    color: "#495057",
    marginLeft: 8,
    flex: 1,
  },
  orderDate: {
    fontSize: 15,
    color: "#6c757d",
    marginLeft: 8,
  },
  expandButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    marginTop: 6,
  },
  expandButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "gray",
    marginRight: 4,
  },
  expandedContent: {
    marginTop: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "#e9ecef",
    marginBottom: 16,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#343a40",
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  locationIconContainer: {
    width: 24,
    alignItems: "center",
    marginRight: 12,
  },
  pickupDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4361ee",
  },
  destinationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#f03e3e",
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: "#dee2e6",
    marginLeft: 12,
    marginBottom: 10,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6c757d",
    marginBottom: 2,
  },
  locationText: {
    fontSize: 14,
    color: "#343a40",
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 36,
    marginTop: 8,
  },
  distanceText: {
    fontSize: 13,
    color: "#6c757d",
    marginLeft: 4,
  },
  itemContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    marginBottom: 10,
  },
  itemIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e7f5ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#343a40",
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4caf50",
  },
  itemMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemCategory: {
    fontSize: 13,
    color: "#6c757d",
  },
  itemQuantity: {
    fontSize: 13,
    color: "#495057",
    fontWeight: "500",
  },
  sizeTag: {
    backgroundColor: "#e9ecef",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  sizeText: {
    fontSize: 12,
    color: "#495057",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#495057",
    marginLeft: 8,
  },
  infoTextValue: {
    fontSize: 14,
    color: "#4caf50",
    marginLeft: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#495057",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 15,
    color: "#6c757d",
    marginTop: 8,
  },
});
