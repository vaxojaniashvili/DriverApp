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

export function CopyRight() {
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
          <Text style={styles.title}>CopyRight</Text>
          <Text style={{ opacity: 0 }}>back</Text>
        </View>
        <Text style={styles.sectionTitle}>
          1. Ownership of Intellectual Property
        </Text>
        <Text style={styles.subTitle}>1.1</Text>
        <Text style={styles.text}>
          All rights, title, and interest in and to TheVanApp, including but not
          limited to software, mobile applications, website, logos, trademarks,
          service marks, trade names, designs, text, graphics, databases,
          photographs, videos, and all other content (collectively, the
          "Intellectual Property"), are owned or licensed by Asergis Operations
          Limited.
        </Text>

        <Text style={styles.subTitle}>1.2</Text>
        <Text style={styles.text}>
          Except as expressly permitted in writing by us, no part of TheVanApp
          or its content may be copied, reproduced, modified, distributed, sold,
          licensed, published, or otherwise exploited for any commercial purpose
          without our prior written consent.
        </Text>

        <Text style={styles.subTitle}>1.3</Text>
        <Text style={styles.text}>
          We reserve all rights not expressly granted to users under this Policy
          or our Terms & Conditions.
        </Text>

        <Text style={styles.sectionTitle}>2. Limited License to Users</Text>
        <Text style={styles.subTitle}>2.1</Text>
        <Text style={styles.text}>
          Subject to compliance with our Terms & Conditions, we grant users a
          limited, non-exclusive, non-transferable, revocable license to access
          and use TheVanApp solely for lawful purposes.
        </Text>

        <Text style={styles.subTitle}>2.2</Text>
        <Text style={styles.text}>This license does not allow users to:</Text>
        <Text style={styles.bulletPoint}>
          • Reverse engineer, decompile, or modify the App.
        </Text>
        <Text style={styles.bulletPoint}>
          • Copy or distribute any part of the App without authorization.
        </Text>
        <Text style={styles.bulletPoint}>
          • Use our Intellectual Property in a misleading, defamatory, or
          unauthorized manner.
        </Text>

        <Text style={styles.sectionTitle}>3. User Content</Text>
        <Text style={styles.subTitle}>3.1</Text>
        <Text style={styles.text}>
          Users may provide or upload content to TheVanApp (e.g., item
          descriptions, reviews, feedback, photos). By submitting content, you
          represent and warrant that you own or have the necessary rights and
          permissions to share such content.
        </Text>

        <Text style={styles.subTitle}>3.2</Text>
        <Text style={styles.text}>
          By submitting content, you grant TheVanApp a worldwide, royalty-free,
          non-exclusive, sub licensable license to use, reproduce, display, and
          distribute such content in connection with providing and improving our
          services.
        </Text>

        <Text style={styles.subTitle}>3.3</Text>
        <Text style={styles.text}>
          You retain ownership of your content, subject to the license granted
          above.
        </Text>

        <Text style={styles.sectionTitle}>
          4. Prohibited Use of Copyrighted Material
        </Text>
        <Text style={styles.subTitle}>4.1</Text>
        <Text style={styles.text}>
          Users must not upload, share, or transmit any content that:
        </Text>
        <Text style={styles.bulletPoint}>
          • Infringes upon the copyrights, trademarks, patents, trade secrets,
          or other proprietary rights of any third party.
        </Text>
        <Text style={styles.bulletPoint}>
          • Misuses TheVanApp branding, logos, or trademarks without written
          authorization.
        </Text>
        <Text style={styles.bulletPoint}>
          • Is unlawful, offensive, or misleading.
        </Text>

        <Text style={styles.subTitle}>4.2</Text>
        <Text style={styles.text}>
          We reserve the right to remove or disable access to any content that
          allegedly infringes intellectual property rights.
        </Text>

        <Text style={styles.sectionTitle}>
          5. Copyright Infringement Complaints (DMCA Procedure)
        </Text>
        <Text style={styles.text}>
          If you believe your copyrighted work has been copied or used in a way
          that constitutes infringement, you may submit a written notice to our
          designated Copyright Agent.
        </Text>
        <Text style={styles.text}>
          Your notice must include the following (as required under the DMCA or
          equivalent law):
        </Text>
        <Text style={styles.bulletPoint}>
          1. Identification of the copyrighted work claimed to have been
          infringed.
        </Text>
        <Text style={styles.bulletPoint}>
          2. Identification of the infringing material and its location on
          TheVanApp.
        </Text>
        <Text style={styles.bulletPoint}>
          3. Your name, mailing address, phone number, and email address.
        </Text>
        <Text style={styles.bulletPoint}>
          4. A statement that you have a good faith belief that the disputed use
          is not authorized by the copyright owner, its agent, or the law.
        </Text>
        <Text style={styles.bulletPoint}>
          5. A statement, made under penalty of perjury, that the information in
          your notice is accurate and that you are the copyright owner or
          authorized to act on the copyright owner's behalf.
        </Text>
        <Text style={styles.bulletPoint}>
          6. Your physical or electronic signature.
        </Text>

        <Text style={styles.text}>Send notices to:</Text>
        <Text style={styles.contactText}>
          Copyright Agent{"\n"}
          Asergis Operations Limited{"\n"}
          Suite 17. Stonegate{"\n"}
          20, Triq Bernadette{"\n"}
          San Gwann{"\n"}
          SGN 1467{"\n"}
          Malta{"\n"}
          Email: info@thevanapp.com
        </Text>

        <Text style={styles.sectionTitle}>6. Counter-Notice Procedure</Text>
        <Text style={styles.text}>
          If your content has been removed due to a copyright claim and you
          believe this was done in error, you may submit a counter-notice to our
          Copyright Agent.
        </Text>
        <Text style={styles.text}>Your counter-notice must include:</Text>
        <Text style={styles.bulletPoint}>
          1. Identification of the content removed and its prior location.
        </Text>
        <Text style={styles.bulletPoint}>
          2. A statement, under penalty of perjury, that you have a good faith
          belief that the material was removed or disabled as a result of
          mistake or misidentification.
        </Text>
        <Text style={styles.bulletPoint}>
          3. Your name, address, phone number, and email address.
        </Text>
        <Text style={styles.bulletPoint}>
          4. A statement that you consent to the jurisdiction of the courts in
          your country (or [Insert Country/State if specific jurisdiction
          applies]).
        </Text>
        <Text style={styles.bulletPoint}>
          5. Your physical or electronic signature.
        </Text>
        <Text style={styles.text}>
          Upon receipt of a valid counter-notice, we may restore the removed
          content unless the original complainant initiates legal action within
          the time required by law.
        </Text>

        <Text style={styles.sectionTitle}>7. Repeat Infringers</Text>
        <Text style={styles.text}>
          We may, in appropriate circumstances and at our discretion, terminate
          the accounts of users who are repeat infringers of intellectual
          property rights or who repeatedly submit infringing material.
        </Text>

        <Text style={styles.sectionTitle}>8. Disclaimer</Text>
        <Text style={styles.bulletPoint}>
          • We act as a platform provider and are not responsible for
          user-uploaded content.
        </Text>
        <Text style={styles.bulletPoint}>
          • We do not actively monitor all content, but we will respond to valid
          copyright notices.
        </Text>
        <Text style={styles.bulletPoint}>
          • Nothing in this Policy waives any rights or remedies available to us
          under applicable law.
        </Text>

        <Text style={styles.sectionTitle}>9. Changes to This Policy</Text>
        <Text style={styles.text}>
          We may update this Copyright & Intellectual Property Policy from time
          to time. Updates will be effective upon posting in the App or on our
          website.
        </Text>

        <Text style={styles.sectionTitle}>10. Contact Information</Text>
        <Text style={styles.text}>
          For copyright or intellectual property inquiries, please contact:
        </Text>
        <Text style={styles.contactText}>
          Copyright Agent{"\n"}
          Asergis Operations Limited{"\n"}
          Suite 17. Stonegate{"\n"}
          20, Triq Bernadette{"\n"}
          San Gwann{"\n"}
          SGN 1467{"\n"}
          Malta{"\n"}
          Email: info@thevanapp.com
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

export default CopyRight;
