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

export function UserDataDelete() {
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
              marginTop: -5,
            }}
            onPress={() => router.push("/settings/privace")}
          >
            <Ionicons name="chevron-back" size={24} color="#212529" />
          </TouchableOpacity>
          <Text style={styles.title}>Trademark</Text>
          <Text style={{ opacity: 0 }}>back</Text>
        </View>
        <Text style={styles.sectionTitle}>1. Ownership of Trademarks</Text>
        <Text style={styles.subTitle}>1.1</Text>
        <Text style={styles.text}>
          TheVanApp name, logo, slogans, designs, and other brand identifiers
          (collectively, the "Marks") are registered or unregistered trademarks
          owned and controlled by Asergis Operations Limited.
        </Text>

        <Text style={styles.subTitle}>1.2</Text>
        <Text style={styles.text}>
          All goodwill arising from the use of our Marks shall inure exclusively
          to our benefit. Unauthorized use of our Marks is strictly prohibited
          and may constitute trademark infringement.
        </Text>

        <Text style={styles.sectionTitle}>2. Authorized Use of Marks</Text>
        <Text style={styles.subTitle}>2.1 Partners & Drivers</Text>
        <Text style={styles.text}>
          Approved drivers or delivery partners may use TheVanApp Marks solely
          for the purpose of identifying themselves as participants in our
          platform. Such use must strictly comply with these Guidelines and any
          additional instructions provided by us.
        </Text>

        <Text style={styles.subTitle}>2.2 Third Parties</Text>
        <Text style={styles.text}>
          Businesses, media, affiliates, and other third parties must obtain
          written permission from TheVanApp before using our Marks. All requests
          for use must be sent to: info@thevanapp.com.
        </Text>

        <Text style={styles.subTitle}>2.3 Prohibited Uses</Text>
        <Text style={styles.bulletPoint}>
          • No one may use the Marks in a way that suggests sponsorship,
          endorsement, or partnership with TheVanApp unless explicitly
          authorized.
        </Text>
        <Text style={styles.bulletPoint}>
          • The Marks must not be used in any unlawful, misleading, defamatory,
          or harmful manner.
        </Text>

        <Text style={styles.sectionTitle}>3. Visual Standards</Text>
        <Text style={styles.text}>
          To protect the integrity of our brand, the Marks must be used
          consistently and correctly:
        </Text>
        <Text style={styles.bulletPoint}>
          • Do not alter, distort, rotate, stretch, or modify the logo in any
          way.
        </Text>
        <Text style={styles.bulletPoint}>
          • Do not change the colours, typography, or proportions of the Marks.
        </Text>
        <Text style={styles.bulletPoint}>
          • Always use high-resolution, approved logo files provided by
          TheVanApp.
        </Text>
        <Text style={styles.bulletPoint}>
          • Maintain clear space around the logo (at least the height of the "V"
          in "Van").
        </Text>
        <Text style={styles.bulletPoint}>
          • Do not combine the Marks with other logos, words, or graphics
          without written approval.
        </Text>

        <Text style={styles.sectionTitle}>
          4. Naming & Imitation Restrictions
        </Text>
        <Text style={styles.bulletPoint}>
          • You must not register or use a business name, domain name, app name,
          or social media handle that includes or is confusingly similar to
          TheVanApp.
        </Text>
        <Text style={styles.bulletPoint}>
          • You must not imitate the look and feel ("trade dress") of
          TheVanApp's platform, including logos, colour schemes, or design
          elements, in a way that may mislead users.
        </Text>

        <Text style={styles.sectionTitle}>
          5. Merchandising & Promotional Use
        </Text>
        <Text style={styles.bulletPoint}>
          • Use of the Marks on merchandise (e.g., clothing, signage, printed
          materials) requires prior written consent.
        </Text>
        <Text style={styles.bulletPoint}>
          • Approved marketing or promotional materials must follow our brand
          guidelines and may be subject to review.
        </Text>
        <Text style={styles.bulletPoint}>
          • Partners and drivers may only display decals, signs, or branding
          materials provided or authorized by TheVanApp.
        </Text>

        <Text style={styles.sectionTitle}>6. Media & Press Use</Text>
        <Text style={styles.bulletPoint}>
          • Journalists and media outlets may use the Marks solely for editorial
          or informational purposes when referencing TheVanApp.
        </Text>
        <Text style={styles.bulletPoint}>
          • Marks must not be used in a way that suggests editorial content is
          sponsored or endorsed by us.
        </Text>

        <Text style={styles.sectionTitle}>7. Enforcement & Monitoring</Text>
        <Text style={styles.bulletPoint}>
          • We reserve the right to monitor the use of our Marks and enforce
          compliance with these Guidelines.
        </Text>
        <Text style={styles.bulletPoint}>
          • Unauthorized use may result in account suspension, termination of
          contracts, or legal action.
        </Text>
        <Text style={styles.bulletPoint}>
          • We may demand immediate removal or correction of any improper use of
          our Marks.
        </Text>

        <Text style={styles.sectionTitle}>8. No Transfer of Rights</Text>
        <Text style={styles.text}>
          Nothing in these Guidelines grants users ownership or exclusive rights
          to our Marks. The Marks remain the sole property of Asergis Operations
          Limited at all times.
        </Text>

        <Text style={styles.sectionTitle}>9. Reporting Misuse</Text>
        <Text style={styles.text}>
          If you become aware of unauthorized, improper, or confusing use of
          TheVanApp Marks, please notify us immediately at:
        </Text>
        <Text style={styles.contactText}>
          Brand Protection Team{"\n"}
          Asergis Operations Limited{"\n"}
          Suite 17. Stonegate{"\n"}
          20, Triq Bernadette{"\n"}
          San Gwann{"\n"}
          SGN 1467{"\n"}
          Malta{"\n"}
          Email: info@thevanapp.com
        </Text>

        <Text style={styles.sectionTitle}>10. Updates to Guidelines</Text>
        <Text style={styles.text}>
          We may update or revise these Guidelines periodically. Continued use
          of our Marks after changes indicates acceptance of the revised
          Guidelines.
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
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 5,
  },
});

export default UserDataDelete;
