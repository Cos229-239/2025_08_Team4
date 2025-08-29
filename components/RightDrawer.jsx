import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Pressable, StyleSheet, View, Text } from "react-native";
import { useRightDrawer } from "./RightDrawerContext";
import { useRouter } from "expo-router";
import { useGlobalContext } from "../context/GlobalProvider";
import { account } from "../lib/appwrite";

const PANEL_WIDTH = Math.floor(Dimensions.get("window").width * 0.8);

export default function RightDrawer() {
  const { isOpen, closeDrawer } = useRightDrawer();
  const { setUser, setIsLoggedIn } = useGlobalContext();
  const router = useRouter();

  const slideX = useRef(new Animated.Value(PANEL_WIDTH)).current;
  const fade   = useRef(new Animated.Value(0)).current;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      Animated.parallel([
        Animated.timing(slideX, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(fade,   { toValue: 1, duration: 700, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideX, { toValue: PANEL_WIDTH, duration: 200, useNativeDriver: true }),
        Animated.timing(fade,   { toValue: 0,           duration: 100, useNativeDriver: true }),
      ]).start(({ finished }) => finished && setVisible(false));
    }
  }, [isOpen, slideX, fade]);

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      setUser(null);
      setIsLoggedIn(false);
      closeDrawer();
      router.replace("/welcomescreen");
    } catch (error) {
      console.error("Logout Error:", error);
      alert("Failed to log out");
    }
  };

  const navigate = (path) => {
    closeDrawer();
    router.push(path);
  };

  if (!visible) return null;

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { zIndex: 9999, elevation: 9999, pointerEvents: "auto" },
      ]}
    >
      {/* Backdrop */}
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
          paddingTop: 60,
          paddingHorizontal: 20
        }}
      >
        <Text style={{ fontWeight: "600", fontSize: 18, marginBottom: 30 }}>Menu</Text>
        <Pressable onPress={() => navigate('/about')} style={{ paddingVertical: 12 }}>
          <Text>About</Text>
        </Pressable>
        <Pressable onPress={() => navigate('/placeholder')} style={{ paddingVertical: 12 }}>
          <Text>Placeholder</Text>
        </Pressable>
        
        {}
        <Pressable onPress={() => navigate('/(drawer)/settings')} style={{ paddingVertical: 12 }}>
          <Text>Settings</Text>
        </Pressable>

        <Pressable onPress={handleLogout} style={{ paddingVertical: 12 }}>
          <Text>Sign out</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}