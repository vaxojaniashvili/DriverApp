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

export function AccountInfo() {
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
              marginTop: -20,
            }}
            onPress={() => router.push("/settings/privace")}
          >
            <Ionicons name="chevron-back" size={24} color="#212529" />
          </TouchableOpacity>
          <Text style={styles.title}>Risk Acknowledgement</Text>
          <Text style={{ opacity: 0 }}>back</Text>
        </View>

        <Text style={styles.sectionTitle}>1.1 Acknowledgement of Risk</Text>
        <Text style={styles.text}>
          By using TheVanApp, Customers acknowledge and accept that:
        </Text>
        <Text style={styles.bulletPoint}>
          • Transportation of goods inherently involves risks of loss, theft,
          damage, or delay.
        </Text>
        <Text style={styles.bulletPoint}>
          • Neither TheVanApp nor its Partners can guarantee the absolute safety
          of items during pickup, transit, or delivery.
        </Text>
        <Text style={styles.bulletPoint}>
          • Estimated times of collection and delivery are approximate and may
          be affected by factors beyond our control such as traffic, accidents,
          weather conditions, or operational disruptions.
        </Text>

        <Text style={styles.sectionTitle}>1.2 Packaging Responsibilities</Text>
        <Text style={styles.text}>
          Customers are solely responsible for ensuring that all items are:
        </Text>
        <Text style={styles.bulletPoint}>
          • Properly packaged and secured to withstand handling and transport.
        </Text>
        <Text style={styles.bulletPoint}>
          • Packed in a manner suitable for the item's nature, fragility, and
          value.
        </Text>
        <Text style={styles.bulletPoint}>
          • Clearly labelled with accurate pickup and delivery details.
        </Text>
        <Text style={styles.text}>
          TheVanApp and its Partners reserve the right to refuse or cancel a
          booking where items are inadequately packaged or pose a safety risk.
        </Text>

        <Text style={styles.sectionTitle}>1.3 Declaration of Items</Text>
        <Text style={styles.text}>
          Customers must provide truthful and accurate descriptions of all items
          to be transported.
        </Text>
        <Text style={styles.text}>
          Customers warrant that items do not contain:
        </Text>
        <Text style={styles.bulletPoint}>
          • Illegal substances or contraband.
        </Text>
        <Text style={styles.bulletPoint}>
          • Prohibited or restricted goods as listed in Section 3.2 (Prohibited
          Items Disclaimer).
        </Text>
        <Text style={styles.bulletPoint}>
          • Items requiring special licenses or regulatory approval unless such
          authorization is provided.
        </Text>
        <Text style={styles.text}>
          Any misrepresentation, concealment, or false declaration of items is
          entirely at the Customer's risk and may result in cancellation,
          reporting to authorities, or legal action.
        </Text>

        <Text style={styles.sectionTitle}>1.4 Compliance with Laws</Text>
        <Text style={styles.text}>
          Customers agree that their use of TheVanApp shall comply with all
          applicable local, national, and international laws and regulations.
        </Text>
        <Text style={styles.text}>
          Customers must not request services for unlawful purposes, including
          but not limited to transporting stolen goods or contraband.
        </Text>

        <Text style={styles.sectionTitle}>
          1.5 Liability for Costs & Losses
        </Text>
        <Text style={styles.text}>
          Customers shall be liable for any costs, damages, fines, or losses
          incurred by TheVanApp or its Partners resulting from:
        </Text>
        <Text style={styles.bulletPoint}>
          • Transporting prohibited, misdeclared, or improperly packaged items.
        </Text>
        <Text style={styles.bulletPoint}>
          • Violations of applicable laws or regulations.
        </Text>
        <Text style={styles.bulletPoint}>• Misuse of the App or services.</Text>
        <Text style={styles.text}>
          Customers agree to indemnify and hold harmless TheVanApp against all
          such claims, costs, or liabilities.
        </Text>

        <Text style={styles.sectionTitle}>
          1.6 Responsibility for Receipt of Items
        </Text>
        <Text style={styles.text}>
          Customers must ensure that a responsible recipient is available at the
          delivery location to accept the items.
        </Text>
        <Text style={styles.text}>
          If no recipient is available, items may be returned or rescheduled at
          the Customer's expense.
        </Text>
        <Text style={styles.text}>
          TheVanApp is not responsible for losses or delays arising from failed
          or missed deliveries due to recipient unavailability.
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

export default AccountInfo;
