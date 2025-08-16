import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Pressable, View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { useRightDrawer } from "./RightDrawerContext";

const WIDTH = Math.min(320, Math.round(Dimensions.get("window").width * 0.85));

export default function RightDrawer() {
  const { open, closeDrawer } = useRightDrawer();
  const x = useRef(new Animated.Value(WIDTH)).current;

  useEffect(() => {
    Animated.timing(x, { toValue: open ? 0 : WIDTH, duration: 220, useNativeDriver: true }).start();
  }, [open]);

  if (!open) return null;

  return (
    <View style={[StyleSheet.absoluteFillObject, { zIndex: 1000, flexDirection: "row" }]}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)" }} onPress={closeDrawer} />
      <Animated.View
        style={{
          width: WIDTH,
          backgroundColor: "#E2FAF5",
          transform: [{ translateX: x }],
          shadowColor: "#000",
          shadowOffset: { width: -2, height: 0 },
          shadowOpacity: 0.25,
          shadowRadius: 10,
          elevation: 60,
          paddingTop: 70,
          paddingHorizontal: 16,
        }}
      >
        <Text style={{ fontWeight: "600", fontSize: 18, marginBottom: 30 }}>Menu</Text>
        <Link href="/(drawer)/about" onPress={closeDrawer} style={{ paddingVertical: 12 }}>
          About
        </Link>
        <Link href="/(drawer)/placeholder" onPress={closeDrawer} style={{ paddingVertical: 12 }}>
          Placeholder
        </Link>
        {/* Add the other pages here just as above */}
      </Animated.View>
    </View>
  );
}
