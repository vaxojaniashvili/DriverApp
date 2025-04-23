import { supabase } from "@/infrastructure/db/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";

const orderHistoryData = [
  {
    id: "ord001",
    date: "2025-04-15",
    destination: "Tbilisi Mall",
    amount: 15.5,
    status: "completed",
  },
  {
    id: "ord002",
    date: "2025-04-10",
    destination: "East Point",
    amount: 12.75,
    status: "completed",
  },
  {
    id: "ord003",
    date: "2025-04-05",
    destination: "Rustaveli Avenue",
    amount: 8.3,
    status: "completed",
  },
  {
    id: "ord004",
    date: "2025-03-28",
    destination: "Vake Park",
    amount: 10.2,
    status: "completed",
  },
  {
    id: "ord005",
    date: "2025-03-15",
    destination: "Lisi Lake",
    amount: 18.9,
    status: "completed",
  },
  {
    id: "ord006",
    date: "2025-03-10",
    destination: "Old Tbilisi",
    amount: 7.5,
    status: "completed",
  },
  {
    id: "ord007",
    date: "2025-02-25",
    destination: "Mtskheta",
    amount: 22.0,
    status: "completed",
  },
  {
    id: "ord008",
    date: "2025-02-18",
    destination: "Saburtalo",
    amount: 9.0,
    status: "completed",
  },
  {
    id: "ord009",
    date: "2025-02-05",
    destination: "Tbilisi Airport",
    amount: 25.5,
    status: "completed",
  },
  {
    id: "ord010",
    date: "2025-01-30",
    destination: "Gldani",
    amount: 11.25,
    status: "completed",
  },
  {
    id: "ord011",
    date: "2025-01-15",
    destination: "Varketili",
    amount: 13.8,
    status: "completed",
  },
];

export function OrderHistory() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [groupedOrders, setGroupedOrders] = useState({});
  const [apiToken, setApiToken] = useState(null);
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.access_token) {
          setApiToken(sessionData.session.access_token as any);
        }
      } catch (error) {
        console.log("Error fetching token:", error);
      }
    };

    fetchToken();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://api.thevanapp.com/api/history/10", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiToken}`,
          },
        });
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.log("error", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      const grouped = groupOrdersByMonth(orderHistoryData);
      setGroupedOrders(grouped);
      setLoading(false);
    }, 800);
  }, []);

  const groupOrdersByMonth = (orders) => {
    return orders.reduce((groups, order) => {
      const date = new Date(order.date);
      const monthYear = `${date.toLocaleString("default", {
        month: "long",
      })} ${date.getFullYear()}`;

      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }

      groups[monthYear].push(order);
      return groups;
    }, {});
  };

  const handleBack = () => {
    router.push("/driver-panel/driver-panel");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ka-GE", {
      day: "numeric",
      month: "short",
    });
  };

  const formatAmount = (amount) => {
    return `₾${amount.toFixed(2)}`;
  };

  console.log("dataa", orders);

  const renderOrderItem = (order) => (
    <View key={order.id} style={styles.orderItem}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{order.id.slice(-3)}</Text>
        <Text style={styles.orderAmount}>{formatAmount(order.amount)}</Text>
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.orderDetailRow}>
          <Ionicons name="location" size={16} color="#6c757d" />
          <Text style={styles.orderDestination}>{order.destination}</Text>
        </View>

        <View style={styles.orderDetailRow}>
          <Ionicons name="calendar" size={16} color="#6c757d" />
          <Text style={styles.orderDate}>{formatDate(order.date)}</Text>
        </View>
      </View>

      <View style={styles.orderStatusContainer}>
        <View style={styles.orderStatusBadge}>
          <Text style={styles.orderStatusText}>{order.status}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
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
        <View style={styles.ordersContainer}>
          {Object.keys(groupedOrders).length > 0 ? (
            Object.entries(groupedOrders).map(([month, orders]) => (
              <View key={month} style={styles.monthSection}>
                <View style={styles.monthHeaderContainer}>
                  <Text style={styles.monthHeader}>{month}</Text>
                  <View style={styles.orderCountBadge}>
                    <Text style={styles.orderCountText}>{orders.length}</Text>
                  </View>
                </View>

                {orders.map((order) => renderOrderItem(order))}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={60} color="#adb5bd" />
              <Text style={styles.emptyStateText}>No order history found</Text>
              <Text style={styles.emptyStateSubtext}>
                Your completed orders will appear here
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

export default OrderHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingHorizontal: 20,
  },
  headerStyle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 5,
    marginBottom: 24,
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
    paddingBottom: 30,
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212529",
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4361ee",
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
  },
  orderDate: {
    fontSize: 15,
    color: "#6c757d",
    marginLeft: 8,
  },
  orderStatusContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  orderStatusBadge: {
    backgroundColor: "#d8f3dc",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  orderStatusText: {
    fontSize: 14,
    color: "#2d6a4f",
    fontWeight: "500",
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
