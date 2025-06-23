import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

export const RegistrationForm = ({
  name,
  surname,
  email,
  phoneNumber,
  password,
  confirmPassword,
  vanOption,
  contactMethod,
  loading,
  showPassword,
  showConfirmPassword,
  nameError,
  surnameError,
  emailError,
  phoneNumberError,
  passwordError,
  confirmPasswordError,
  vanOptionError,
  setName,
  setSurname,
  setEmail,
  setPhoneNumber,
  setPassword,
  setConfirmPassword,
  setShowPassword,
  setShowConfirmPassword,
  setVanOption,
  setContactMethod,
  validateName,
  validateSurname,
  validateEmail,
  validatePhoneNumber,
  validatePassword,
  validateConfirmPassword,
  validateVanOption,
  sendVerificationCode,
  Title,
  NameSurnameRow,
  NameInput,
  SurnameInput,
  StyledInput,
  StyledButton,
  selectedCountry,
  setSelectedCountry,
  COUNTRIES,
}: any) => {
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCountries = COUNTRIES.filter(
    (country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.dialCode.includes(searchQuery)
  );

  return (
    <View style={{ width: "100%" }}>
      <Title>Welcome to TheVanApp driver</Title>
      <Title>Create account</Title>
      <Text style={{ marginBottom: 20, marginTop: -10, textAlign: "center" }}>
        We will require a number of documents from you to complete the process.
      </Text>

      <NameSurnameRow>
        <NameInput
          label="Name"
          leftIcon={{
            type: "material-community",
            name: "account-outline",
            size: 22,
            color: "#27ae60",
          }}
          onChangeText={(text) => {
            setName(text);
            if (nameError) validateName(text);
          }}
          inputStyle={{ paddingTop: 5 }}
          value={name}
          placeholder="First name"
          autoCapitalize="words"
          errorMessage={nameError}
          onBlur={() => validateName(name)}
        />

        <SurnameInput
          label="Surname"
          leftIcon={{
            type: "material-community",
            name: "account-outline",
            size: 22,
            color: "#27ae60",
          }}
          onChangeText={(text) => {
            setSurname(text);
            if (surnameError) validateSurname(text);
          }}
          inputStyle={{ paddingTop: 5 }}
          value={surname}
          placeholder="Last name"
          autoCapitalize="words"
          errorMessage={surnameError}
          onBlur={() => validateSurname(surname)}
        />
      </NameSurnameRow>

      <Modal
        visible={showCountryPicker}
        animationType="none"
        transparent={true}
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
          onPress={() => setShowCountryPicker(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: "80%",
              minHeight: "80%",
              paddingTop: 20,
            }}
            onPress={() => {}}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 20,
                marginBottom: 15,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                Select Country
              </Text>
              <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                <Text style={{ fontSize: 16, color: "#27ae60" }}>Done</Text>
              </TouchableOpacity>
            </View>

            <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#ddd",
                  borderRadius: 10,
                  padding: 10,
                  fontSize: 16,
                }}
                placeholder="Search country..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <ScrollView style={{ padding: 10 }}>
              {filteredCountries.map((country) => (
                <TouchableOpacity
                  key={country.code}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 15,
                    borderBottomWidth: 1,
                    borderBottomColor: "#eee",
                    backgroundColor:
                      selectedCountry.code === country.code
                        ? "#f0f9f4"
                        : "#fff",
                  }}
                  onPress={() => {
                    setSelectedCountry(country);
                    setShowCountryPicker(false);
                    setSearchQuery("");
                  }}
                >
                  <Text style={{ fontSize: 24, marginRight: 15 }}>
                    {country.flag}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: "500" }}>
                      {country.name}
                    </Text>
                    <Text style={{ fontSize: 14, color: "#7f8c8d" }}>
                      {country.dialCode}
                    </Text>
                  </View>
                  {selectedCountry.code === country.code && (
                    <Text style={{ fontSize: 20, color: "#27ae60" }}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <StyledInput
        label="Password"
        leftIcon={{
          type: "material-community",
          name: "lock-outline",
          size: 22,
          color: "#27ae60",
        }}
        rightIcon={{
          type: "material-community",
          name: showPassword ? "eye-off-outline" : "eye-outline",
          size: 22,
          color: "#95a5a6",
          onPress: () => setShowPassword(!showPassword),
        }}
        inputStyle={{ paddingTop: 5 }}
        onChangeText={(text) => {
          setPassword(text);
          if (passwordError) validatePassword(text);
          if (confirmPassword && confirmPasswordError)
            validateConfirmPassword(confirmPassword);
        }}
        value={password}
        secureTextEntry={!showPassword}
        placeholder="Create a password"
        autoCapitalize="none"
        errorMessage={passwordError}
        onBlur={() => validatePassword(password)}
      />

      <StyledInput
        label="Confirm Password"
        leftIcon={{
          type: "material-community",
          name: "lock-outline",
          size: 22,
          color: "#27ae60",
        }}
        rightIcon={{
          type: "material-community",
          name: showConfirmPassword ? "eye-off-outline" : "eye-outline",
          size: 22,
          color: "#95a5a6",
          onPress: () => setShowConfirmPassword(!showConfirmPassword),
        }}
        inputStyle={{ paddingTop: 5 }}
        onChangeText={(text) => {
          setConfirmPassword(text);
          if (confirmPasswordError) validateConfirmPassword(text);
        }}
        value={confirmPassword}
        secureTextEntry={!showConfirmPassword}
        placeholder="Confirm your password"
        autoCapitalize="none"
        errorMessage={confirmPasswordError}
        onBlur={() => validateConfirmPassword(confirmPassword)}
      />

      <View style={{ marginBottom: 25, marginTop: -10, marginLeft: 11 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "500",
            marginBottom: 10,
            color: "#2c3e50",
          }}
        >
          Verification Method:
        </Text>

        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginRight: 20,
            }}
            onPress={() => setContactMethod("email")}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: "#27ae60",
                marginRight: 10,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {contactMethod === "email" && (
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: "#27ae60",
                  }}
                />
              )}
            </View>
            <Text style={{ fontSize: 16, color: "#2c3e50" }}>Email</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => setContactMethod("phone")}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: "#27ae60",
                marginRight: 10,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {contactMethod === "phone" && (
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: "#27ae60",
                  }}
                />
              )}
            </View>
            <Text style={{ fontSize: 16, color: "#2c3e50" }}>Phone</Text>
          </TouchableOpacity>
        </View>
      </View>

      {contactMethod === "email" && (
        <StyledInput
          label="Email"
          leftIcon={{
            type: "material-community",
            name: "email-outline",
            size: 22,
            color: "#27ae60",
          }}
          onChangeText={(text) => {
            setEmail(text);
            if (emailError) validateEmail(text);
          }}
          inputStyle={{ paddingTop: 5 }}
          value={email}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          errorMessage={emailError}
          onBlur={() => validateEmail(email)}
        />
      )}

      {contactMethod === "phone" && (
        <View style={{ marginBottom: 10 }}>
          <Text
            style={{
              fontSize: 14,
              color: "#86939e",
              fontWeight: "bold",
              marginBottom: 10,
              marginLeft: 10,
            }}
          >
            Phone Number
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderBottomWidth: 1,
              borderBottomColor: "#86939e",
              paddingBottom: 8,
              marginHorizontal: 10,
            }}
          >
            <TouchableOpacity
              onPress={() => setShowCountryPicker(true)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 5,
                marginRight: 10,
                backgroundColor: "#f5f5f5",
                borderRadius: 5,
              }}
            >
              <Text style={{ fontSize: 20, marginRight: 5 }}>
                {selectedCountry.flag}
              </Text>
              <Text style={{ fontSize: 16, color: "#2c3e50" }}>
                {selectedCountry.dialCode}
              </Text>
              <Text style={{ fontSize: 12, marginLeft: 5, color: "#7f8c8d" }}>
                ▼
              </Text>
            </TouchableOpacity>

            <TextInput
              style={{
                flex: 1,
                fontSize: 16,
                paddingVertical: 5,
                color: "#2c3e50",
              }}
              value={phoneNumber}
              onChangeText={(text) => {
                setPhoneNumber(text);
                if (phoneNumberError) validatePhoneNumber(text);
              }}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              onBlur={() => validatePhoneNumber(phoneNumber)}
            />
            <TouchableOpacity
              style={{
                paddingHorizontal: 10,
                paddingVertical: 10,
                backgroundColor: "green",
                borderRadius: 10,
              }}
            >
              <Text style={{ color: "white" }}>Verify</Text>
            </TouchableOpacity>
          </View>
          {phoneNumberError ? (
            <Text
              style={{
                color: "#e74c3c",
                fontSize: 12,
                marginTop: 5,
                marginLeft: 10,
              }}
            >
              {phoneNumberError}
            </Text>
          ) : null}
        </View>
      )}

      <View style={{ marginBottom: 20 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "500",
            marginBottom: 10,
            color: "#2c3e50",
            marginLeft: 8,
          }}
        >
          Select an option:
        </Text>

        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 15,
            backgroundColor: vanOption === "own" ? "#e8f8f0" : "#fff",
            borderWidth: 1,
            borderColor: vanOption === "own" ? "#27ae60" : "#ddd",
            borderRadius: 10,
            marginBottom: 10,
          }}
          onPress={() => {
            setVanOption("own");
            if (vanOptionError) validateVanOption("own");
          }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: "#27ae60",
              marginRight: 10,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {vanOption === "own" && (
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: "#27ae60",
                }}
              />
            )}
          </View>
          <Text style={{ fontSize: 16, color: "#2c3e50" }}>
            I have my own van
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 15,
            backgroundColor: vanOption === "company" ? "#e8f8f0" : "#fff",
            borderWidth: 1,
            borderColor: vanOption === "company" ? "#27ae60" : "#ddd",
            borderRadius: 10,
          }}
          onPress={() => {
            setVanOption("company");
            if (vanOptionError) validateVanOption("company");
          }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: "#27ae60",
              marginRight: 10,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {vanOption === "company" && (
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: "#27ae60",
                }}
              />
            )}
          </View>
          <Text style={{ fontSize: 16, color: "#2c3e50" }}>
            I want to drive your van
          </Text>
        </TouchableOpacity>

        {vanOptionError ? (
          <Text style={{ color: "#e74c3c", fontSize: 12, marginTop: 5 }}>
            {vanOptionError}
          </Text>
        ) : null}
      </View>

      <StyledButton
        ViewComponent={LinearGradient}
        linearGradientProps={{
          colors: ["#27ae60", "#2ecc71"],
          start: { x: 0, y: 0 },
          end: { x: 1, y: 0 },
        }}
        title="Create account"
        disabled={loading}
        onPress={sendVerificationCode}
        loading={loading}
        buttonStyle={{
          borderRadius: 10,
          padding: 12,
        }}
        titleStyle={{
          fontWeight: "bold",
          fontSize: 16,
        }}
      />

      <View style={{ marginTop: 10, alignItems: "center" }}>
        <View style={{ flexDirection: "row", gap: 5 }}>
          <Text
            style={{
              color: "#7f8c8d",
              fontSize: 14,
              marginBottom: 10,
            }}
          >
            Already have an account?
          </Text>
          <TouchableOpacity onPress={() => router.push("/")}>
            <Text
              style={{
                color: "#27ae60",
                fontSize: 15,
                fontWeight: "bold",
              }}
            >
              Login
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
