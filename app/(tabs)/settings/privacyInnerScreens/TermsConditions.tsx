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

export function TermsConditions() {
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
          <Text style={styles.title}>Terms & Conditions</Text>
          <Text style={{ opacity: 0 }}>back</Text>
        </View>
        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.text}>
          By downloading, accessing, or using TheVanApp (the "App"), you
          ("User", "Customer", or "you") agree to be bound by these Terms and
          Conditions ("Terms"). If you do not agree, you must not use the App.
        </Text>

        <Text style={styles.sectionTitle}>2. Our Services</Text>
        <Text style={styles.text}>
          TheVanApp provides a digital platform that connects Customers with
          independent drivers and transport providers ("Partners") for the
          collection and delivery of items. We are not a courier, freight
          company, or common carrier. We do not directly transport goods. Our
          role is limited to facilitating bookings and payments through the App.
        </Text>

        <Text style={styles.sectionTitle}>3. User Eligibility</Text>
        <Text style={styles.bulletPoint}>
          • You must be at least 18 years old and legally capable of entering
          into contracts.
        </Text>
        <Text style={styles.bulletPoint}>
          • You must create an account with accurate details.
        </Text>
        <Text style={styles.bulletPoint}>
          • You are responsible for safeguarding your account login information.
        </Text>

        <Text style={styles.sectionTitle}>4. Booking & Payments</Text>
        <Text style={styles.bulletPoint}>
          • Bookings are made exclusively through the App.
        </Text>
        <Text style={styles.bulletPoint}>
          • Fares are calculated based on distance, time, and other applicable
          fees (including tolls, waiting time, or surcharges).
        </Text>
        <Text style={styles.bulletPoint}>
          • Payments are processed electronically via third-party providers.
        </Text>
        <Text style={styles.bulletPoint}>
          • We do not store payment card details.
        </Text>
        <Text style={styles.bulletPoint}>
          • All charges are final unless otherwise required by law.
        </Text>

        <Text style={styles.sectionTitle}>5. Cancellations & Refunds</Text>
        <Text style={styles.subTitle}>Customer cancellations:</Text>
        <Text style={styles.text}>
          Fees may apply if cancellation occurs after a Partner has accepted the
          booking.
        </Text>
        <Text style={styles.subTitle}>Partner cancellations:</Text>
        <Text style={styles.text}>
          If a Partner cancels, we will attempt to reassign another Partner.
        </Text>
        <Text style={styles.text}>
          Refunds (if applicable) are at our discretion and subject to review.
        </Text>

        <Text style={styles.sectionTitle}>6. Prohibited Items</Text>
        <Text style={styles.text}>
          Customers must not request transport of:
        </Text>
        <Text style={styles.bulletPoint}>
          • Hazardous, illegal, stolen, or dangerous goods.
        </Text>
        <Text style={styles.bulletPoint}>
          • Weapons, explosives, flammable items, or drugs.
        </Text>
        <Text style={styles.bulletPoint}>
          • Cash, high-value securities, or items requiring specialist licenses.
        </Text>
        <Text style={styles.bulletPoint}>
          • Live animals or perishable goods.
        </Text>
        <Text style={styles.text}>
          If a Customer breaches this clause, they are solely liable for
          consequences, including legal action.
        </Text>

        <Text style={styles.sectionTitle}>7. Packaging & Handling</Text>
        <Text style={styles.bulletPoint}>
          • Customers must ensure items are securely packaged to withstand
          transit.
        </Text>
        <Text style={styles.bulletPoint}>
          • Partners may refuse improperly packaged or dangerous items.
        </Text>
        <Text style={styles.bulletPoint}>
          • We are not responsible for damage caused by inadequate packaging.
        </Text>

        <Text style={styles.sectionTitle}>8. Liability & Insurance</Text>
        <Text style={styles.text}>
          TheVanApp does not provide insurance coverage for items unless
          explicitly stated.
        </Text>
        <Text style={styles.text}>
          Our liability for loss, theft, or damage is limited to the lower of:
        </Text>
        <Text style={styles.bulletPoint}>
          1. The value of the booking fee, or
        </Text>
        <Text style={styles.bulletPoint}>
          2. [Insert Currency & Amount] (per booking).
        </Text>
        <Text style={styles.text}>
          Customers are encouraged to arrange their own insurance for valuable
          items.
        </Text>

        <Text style={styles.sectionTitle}>9. User Conduct</Text>
        <Text style={styles.text}>You agree not to:</Text>
        <Text style={styles.bulletPoint}>
          • Misuse the App or attempt to disrupt its operation.
        </Text>
        <Text style={styles.bulletPoint}>
          • Harass, abuse, or harm Partners or other users.
        </Text>
        <Text style={styles.bulletPoint}>
          • Use the App for unlawful purposes.
        </Text>
        <Text style={styles.text}>
          We may suspend or terminate your account for violations.
        </Text>

        <Text style={styles.sectionTitle}>10. Partner Independence</Text>
        <Text style={styles.bulletPoint}>
          • Partners are independent contractors, not employees or agents of
          TheVanApp.
        </Text>
        <Text style={styles.bulletPoint}>
          • We do not control Partner schedules, vehicle conditions, or service
          quality.
        </Text>
        <Text style={styles.bulletPoint}>
          • We are not liable for Partner conduct, delays, or cancellations.
        </Text>

        <Text style={styles.sectionTitle}>11. Dispute Resolution</Text>
        <Text style={styles.text}>
          In the first instance, disputes should be raised with our customer
          support team at support@thevanapp.com. If unresolved, disputes will be
          subject to Malta courts or arbitration if required by law.
        </Text>

        <Text style={styles.sectionTitle}>12. Amendments</Text>
        <Text style={styles.text}>
          We may update these Terms at any time. Continued use of the App after
          updates constitutes acceptance of revised Terms.
        </Text>

        <Text style={styles.sectionTitle}>13. Contact</Text>
        <Text style={styles.text}>For inquiries:</Text>
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
});

export default TermsConditions;
