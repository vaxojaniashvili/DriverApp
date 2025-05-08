import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Button } from "@rneui/themed";
import { LinearGradient } from "expo-linear-gradient";
import styled from "styled-components/native";
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
}: any) => {
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
        <StyledInput
          label="Phone Number"
          leftIcon={{
            type: "material-community",
            name: "phone-outline",
            size: 22,
            color: "#27ae60",
          }}
          onChangeText={(text) => {
            setPhoneNumber(text);
            if (phoneNumberError) validatePhoneNumber(text);
          }}
          inputStyle={{ paddingTop: 5 }}
          value={phoneNumber}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          errorMessage={phoneNumberError}
          onBlur={() => validatePhoneNumber(phoneNumber)}
        />
      )}

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

      {/* Van Option Selection */}
      <View style={{ marginBottom: 20 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "500",
            marginBottom: 10,
            color: "#2c3e50",
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

      {/* Contact Method Selection */}
      <View style={{ marginBottom: 20 }}>
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
