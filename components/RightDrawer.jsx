// components/RightDrawer.jsx
import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Pressable, StyleSheet, View, Text, } from "react-native";
import { useRightDrawer } from "./RightDrawerContext";
import { Link } from "expo-router";

const PANEL_WIDTH = Math.floor(Dimensions.get("window").width * 0.8);

export default function RightDrawer() {
  const { isOpen, closeDrawer } = useRightDrawer();

  // animate slide and fade
  const slideX = useRef(new Animated.Value(PANEL_WIDTH)).current; // off-screen right
  const fade   = useRef(new Animated.Value(0)).current;           // backdrop opacity
  const [visible, setVisible] = useState(false);                  // mount/unmount layer

  useEffect(() => {
    if (isOpen) {
      // mount then animate in
      setVisible(true);
      Animated.parallel([
        Animated.timing(slideX, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(fade,   { toValue: 1, duration: 700, useNativeDriver: true }),
      ]).start();
    } else {
      // animate out then unmount so no shadow remains
      Animated.parallel([
        Animated.timing(slideX, { toValue: PANEL_WIDTH, duration: 200, useNativeDriver: true }),
        Animated.timing(fade,   { toValue: 0,            duration: 100, useNativeDriver: true }),
      ]).start(({ finished }) => finished && setVisible(false));
    }
  }, [isOpen, slideX, fade]);

  if (!visible) return null; // nothing rendered when closed

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { zIndex: 9999, elevation: 9999, pointerEvents: "auto" },
      ]}
    >
      {/* Backdrop: covers entire screen except the drawer width on the right */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { right: PANEL_WIDTH, opacity: fade, backgroundColor: "rgba(0,0,0,0.4)" },
        ]}
        pointerEvents="auto"
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer} />
      </Animated.View>

      {/* Drawer panel */}
      <Animated.View
        style={{
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: PANEL_WIDTH,
    transform: [{ translateX: slideX }],
    backgroundColor: "#E2FAF5",
    zIndex: 10000,
    elevation: 10000,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: -4, height: 0 },
    paddingTop: 60,       // give space below notch/status bar
    paddingHorizontal: 20 // consistent left/right padding
  }}
      >
        <Text style={{ fontWeight: "600", fontSize: 18, marginBottom: 30 }}>Menu</Text>
        <Link href="/(drawer)/about" onPress={closeDrawer} style={{ paddingVertical: 12 }}>
          About
        </Link>
        <Link href="/(drawer)/placeholder" onPress={closeDrawer} style={{ paddingVertical: 12 }}>
          Placeholder
        </Link>
        <Pressable onPress={async ()=>{ await signOut(); router.replace("/(auth)/login"); }}>
          <Text>Sign out</Text>
        </Pressable>
        {/* drawer content */}
      </Animated.View>
    </View>
  );
}
