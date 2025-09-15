import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

export function LocationInfo() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity
            style={{
              height: 40,
              width: 40,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f1f3f5",
              marginTop: -13,
            }}
            onPress={() => router.push("/settings/privace")}
          >
            <Ionicons name="chevron-back" size={24} color="#212529" />
          </TouchableOpacity>
          <Text style={styles.title}>Location Information</Text>
          <Text style={{ opacity: 0 }}>back</Text>
        </View>

        <Text style={styles.sectionTitle}>1. Collection of Location Data</Text>
        <Text style={styles.text}>
          We collect your real-time location when you use TheVanApp:
        </Text>

        <Text style={styles.subTitle}>Customers:</Text>
        <Text style={styles.text}>
          To identify your pickup location, show nearby drivers, and provide
          accurate delivery tracking.
        </Text>

        <Text style={styles.subTitle}>Drivers/Partners:</Text>
        <Text style={styles.text}>
          To show availability, assign bookings, and provide navigation support.
        </Text>

        <Text style={styles.text}>Location may be collected through:</Text>
        <Text style={styles.bulletPoint}>
          • GPS, Wi-Fi, and mobile network signals.
        </Text>
        <Text style={styles.bulletPoint}>
          • Manual entry of pickup/drop-off addresses.
        </Text>

        <Text style={styles.sectionTitle}>2. Use of Location Data</Text>
        <Text style={styles.text}>We use location data to:</Text>
        <Text style={styles.bulletPoint}>
          • Match Customers with the nearest available Driver/Partner.
        </Text>
        <Text style={styles.bulletPoint}>
          • Provide live tracking and estimated arrival times.
        </Text>
        <Text style={styles.bulletPoint}>
          • Enhance safety, fraud prevention, and route optimization.
        </Text>
        <Text style={styles.bulletPoint}>
          • Improve our services through aggregated, anonymized analytics.
        </Text>

        <Text style={styles.sectionTitle}>3. Sharing of Location Data</Text>

        <Text style={styles.subTitle}>With Drivers/Partners:</Text>
        <Text style={styles.text}>
          Customers' pickup and drop-off points are shared only with assigned
          Drivers.
        </Text>

        <Text style={styles.subTitle}>With Customers:</Text>
        <Text style={styles.text}>
          Drivers' real-time location is shared with Customers during an active
          booking.
        </Text>

        <Text style={styles.subTitle}>With Third Parties:</Text>
        <Text style={styles.text}>
          Service providers such as map/navigation tools (e.g., Google Maps,
          Apple Maps).
        </Text>

        <Text style={styles.subTitle}>With Authorities:</Text>
        <Text style={styles.text}>Only if legally required.</Text>

        <Text style={styles.sectionTitle}>4. Storage & Retention</Text>
        <Text style={styles.text}>
          We retain precise location data only as long as necessary to provide
          the service (e.g., until a trip is completed).
        </Text>
        <Text style={styles.text}>
          Aggregated or anonymized location data may be kept longer for
          analytics, safety, or compliance reasons.
        </Text>

        <Text style={styles.sectionTitle}>5. Control & Consent</Text>
        <Text style={styles.bulletPoint}>
          • You may control location permissions in your device settings.
        </Text>
        <Text style={styles.bulletPoint}>
          • Disabling location may affect the functionality of TheVanApp (e.g.,
          we may not be able to assign a Driver or track deliveries).
        </Text>
        <Text style={styles.text}>
          By using the App, you consent to our collection and use of your
          location data as outlined in this policy.
        </Text>

        <Text style={styles.sectionTitle}>6. Security of Location Data</Text>
        <Text style={styles.bulletPoint}>
          • Location data is transmitted using secure encryption.
        </Text>
        <Text style={styles.bulletPoint}>
          • We limit access to location information to authorized personnel and
          drivers directly involved in fulfilling bookings.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 5,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  bulletPoint: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 5,
    marginLeft: 10,
  },
});

export default LocationInfo;
