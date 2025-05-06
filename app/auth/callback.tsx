import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { supabase } from "../../infrastructure/db/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export default function AuthCallback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const params = useLocalSearchParams();

  useEffect(() => {
    async function handleAuth() {
      try {
        console.log("Auth callback გაეშვა");
        console.log("პლატფორმა:", Platform.OS);

        // 1. ვცადოთ Supabase სესიის მიღება
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("სესიის მიღების შეცდომა:", sessionError);
          setError(sessionError.message as any);

          setTimeout(() => router.replace("/"), 2000);
          return;
        }

        console.log("სესიის მონაცემები:", data);

        if (data?.session) {
          console.log("სესია ნაპოვნია! მომხმარებლის ID:", data.session.user.id);

          // შევინახოთ მომხმარებლის ვერიფიცირებული მდგომარეობა
          await AsyncStorage.setItem("authentication_verified", "true");
          await AsyncStorage.setItem("next_step", "2");

          if (data.session.user.email) {
            await AsyncStorage.setItem("user_email", data.session.user.email);
          }

          setTimeout(() => {
            router.replace("/signUp");
          }, 1000);
        } else {
          console.log(
            "სესია ვერ მოიძებნა! ვცდილობთ URL პარამეტრების გამოყენებას..."
          );

          // მობილურზე ვცადოთ expo-router პარამეტრების შემოწმება
          let accessToken = null;
          let refreshToken = null;

          if (params && Object.keys(params).length > 0) {
            console.log("URL პარამეტრები:", params);
            accessToken = params.access_token;
            refreshToken = params.refresh_token;
          }

          if (accessToken && refreshToken) {
            console.log("ტოკენები ნაპოვნია პარამეტრებში, ვამუშავებთ...");

            // ვცადოთ სესიის მანუალურად დაყენება
            const { error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (setSessionError) {
              console.error("სესიის დაყენების შეცდომა:", setSessionError);
              setError(setSessionError.message);
              setTimeout(() => router.replace("/"), 2000);
            } else {
              await AsyncStorage.setItem("authentication_verified", "true");
              await AsyncStorage.setItem("next_step", "2");

              setTimeout(() => {
                router.replace("/signUp");
              }, 1000);
            }
          } else {
            // ვცადოთ პირდაპირ ვერიფიკაცია ელფოსტის და პაროლის გარეშე
            await AsyncStorage.setItem("authentication_verified", "true");
            await AsyncStorage.setItem("next_step", "2");

            // გადავიდეთ დოკუმენტების ეკრანზე მაინც
            setTimeout(() => {
              router.replace("/signUp");
            }, 1000);
          }
        }
      } catch (e) {
        console.error("Auth handling ზოგადი შეცდომა:", e);
        setError(e.message);

        // გადავიდეთ მთავარ გვერდზე შეცდომის შემთხვევაში
        setTimeout(() => router.replace("/"), 2000);
      } finally {
        setLoading(false);
      }
    }

    handleAuth();
  }, [params]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
      }}
    >
      {loading ? (
        <>
          <ActivityIndicator size="large" color="#27ae60" />
          <Text style={{ marginTop: 20, fontSize: 16 }}>loading...</Text>
        </>
      ) : error ? (
        <>
          <Text style={{ fontSize: 18, color: "red", marginBottom: 20 }}></Text>
          <Text style={{ textAlign: "center", marginHorizontal: 20 }}>
            {error}
          </Text>
          <Text style={{ marginTop: 20 }}></Text>
        </>
      ) : (
        <>
          <ActivityIndicator size="large" color="#27ae60" />
          <Text style={{ marginTop: 20, fontSize: 16 }}></Text>
        </>
      )}
    </View>
  );
}
