import { View, Text, TextInput } from "react-native";

export const LicensePlateInput = ({
  plateLetters,
  setPlateLetters,
  plateNumbers,
  setPlateNumbers,
}: any) => {
  return (
    <View style={{ marginHorizontal: 10, marginBottom: 20 }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "bold",
          color: "#86939e",
          marginBottom: 10,
          marginLeft: 0,
        }}
      >
        Vehicle License Plate
      </Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <TextInput
          value={plateLetters}
          onChangeText={(text) => {
            if (text.length <= 3 && /^[A-Za-z]*$/.test(text)) {
              setPlateLetters(text.toUpperCase());
            }
          }}
          style={{
            width: 80,
            height: 50,
            borderWidth: 2,
            borderColor: plateLetters ? "#27ae60" : "#e5e7eb",
            borderRadius: 8,
            textAlign: "center",
            fontSize: 18,
            fontWeight: "bold",
            backgroundColor: "#fff",
            color: "#1f2937",
            marginRight: 15,
          }}
          placeholder="ABA"
          maxLength={3}
          autoCapitalize="characters"
        />

        <TextInput
          value={plateNumbers}
          onChangeText={(text) => {
            if (text.length <= 3 && /^\d*$/.test(text)) {
              setPlateNumbers(text);
            }
          }}
          style={{
            width: 80,
            height: 50,
            borderWidth: 2,
            borderColor: plateNumbers ? "#27ae60" : "#e5e7eb",
            borderRadius: 8,
            textAlign: "center",
            fontSize: 18,
            fontWeight: "bold",
            backgroundColor: "#fff",
            color: "#1f2937",
          }}
          placeholder="001"
          maxLength={3}
          keyboardType="numeric"
        />
      </View>
    </View>
  );
};
