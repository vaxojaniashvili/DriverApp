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

export function PrivacyPolicy() {
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
              marginTop: -10,
            }}
            onPress={() => router.push("/settings/privace")}
          >
            <Ionicons name="chevron-back" size={24} color="#212529" />
          </TouchableOpacity>
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={{ opacity: 0 }}>back</Text>
        </View>
        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.text}>
          This Privacy Policy explains how we collect, use, store, and protect
          your personal information when you use TheVanApp. We are committed to
          safeguarding your privacy and complying with applicable data
          protection laws.
        </Text>

        <Text style={styles.sectionTitle}>2. Information We Collect</Text>
        <Text style={styles.subTitle}>Personal Information:</Text>
        <Text style={styles.text}>
          Name, phone number, email, and payment details.
        </Text>
        <Text style={styles.subTitle}>Location Data:</Text>
        <Text style={styles.text}>
          Pickup and drop-off points, real-time tracking during bookings.
        </Text>
        <Text style={styles.subTitle}>Transaction Data:</Text>
        <Text style={styles.text}>Booking history, payment records.</Text>
        <Text style={styles.subTitle}>Technical Data:</Text>
        <Text style={styles.text}>
          Device type, IP address, app usage analytics.
        </Text>

        <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
        <Text style={styles.text}>We use data to:</Text>
        <Text style={styles.bulletPoint}>• Process bookings and payments.</Text>
        <Text style={styles.bulletPoint}>
          • Share relevant information with Partners to complete your delivery.
        </Text>
        <Text style={styles.bulletPoint}>• Provide customer support.</Text>
        <Text style={styles.bulletPoint}>• Improve our App and services.</Text>
        <Text style={styles.bulletPoint}>• Comply with legal obligations.</Text>

        <Text style={styles.sectionTitle}>4. Sharing of Information</Text>
        <Text style={styles.text}>We may share your data with:</Text>
        <Text style={styles.subTitle}>Partners:</Text>
        <Text style={styles.text}>To fulfill your booking.</Text>
        <Text style={styles.subTitle}>Payment Processors:</Text>
        <Text style={styles.text}>To process transactions securely.</Text>
        <Text style={styles.subTitle}>Legal Authorities:</Text>
        <Text style={styles.text}>
          If required by law or to protect rights and safety.
        </Text>
        <Text style={styles.subTitle}>Service Providers:</Text>
        <Text style={styles.text}>
          For app hosting, analytics, and technical support.
        </Text>
        <Text style={styles.text}>
          We do not sell or rent your personal information to third parties.
        </Text>

        <Text style={styles.sectionTitle}>5. Data Security</Text>
        <Text style={styles.text}>
          We use encryption, secure servers, and strict access controls. Despite
          these measures, no system is completely secure. Users accept the risk
          of data transmission online.
        </Text>

        <Text style={styles.sectionTitle}>6. Data Retention</Text>
        <Text style={styles.text}>
          We retain your personal data for as long as necessary to provide
          services, comply with legal obligations, and resolve disputes. Data
          may be anonymized and retained for analytical purposes.
        </Text>

        <Text style={styles.sectionTitle}>7. Your Rights</Text>
        <Text style={styles.text}>
          Depending on your jurisdiction, you may have the right to:
        </Text>
        <Text style={styles.bulletPoint}>
          • Access, correct, or delete your data.
        </Text>
        <Text style={styles.bulletPoint}>
          • Request restriction or objection to processing.
        </Text>
        <Text style={styles.bulletPoint}>• Request data portability.</Text>
        <Text style={styles.bulletPoint}>
          • Withdraw consent at any time (may affect service availability).
        </Text>
        <Text style={styles.text}>
          Requests can be made by contacting us at info@thevanapp.com.
        </Text>

        <Text style={styles.sectionTitle}>8. Cookies & Tracking</Text>
        <Text style={styles.text}>
          The App may use cookies and similar technologies for functionality and
          analytics. You can disable cookies in your device settings, but this
          may limit features.
        </Text>

        <Text style={styles.sectionTitle}>9. Children's Privacy</Text>
        <Text style={styles.text}>
          The App is not intended for users under 18 years old. We do not
          knowingly collect data from children.
        </Text>

        <Text style={styles.sectionTitle}>10. Changes to Privacy Policy</Text>
        <Text style={styles.text}>
          We may update this Policy periodically. Significant changes will be
          notified via the App or email.
        </Text>

        <Text style={styles.sectionTitle}>11. Contact</Text>
        <Text style={styles.text}>For privacy-related inquiries:</Text>
        <Text style={styles.contactText}>
          Suite 17. Stonegate 20, Triq Bernadette{"\n"}
          San Gwann SGN 1467{"\n"}
          Malta{"\n"}
          Email: info@thevanapp.com{"\n"}
          Phone Number: +356 7707 2071
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
    marginTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
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
  contactText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
    fontFamily: "monospace",
  },
  // backButton: {
  //   height: 40,
  //   width: 40,
  //   borderRadius: 20,
  //   alignItems: "center",
  //   justifyContent: "center",
  //   backgroundColor: "#f1f3f5",
  // },
});

export default PrivacyPolicy;
