import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Pressable, StyleSheet, View, Text } from "react-native";
import { useRightDrawer } from "./RightDrawerContext";
import { useRouter, useSegments } from "expo-router";
import { useGlobalContext } from "../context/GlobalProvider";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const PANEL_WIDTH = Math.floor(Dimensions.get("window").width * 0.8);
const SIGN_OUT_REDIRECT = "/(auth)/welcomescreen";

const DrawerLink = ({ href, text, iconName }) => {
  const router = useRouter();
  const segments = useSegments();
  const { closeDrawer } = useRightDrawer();

  const handlePress = () => {
    closeDrawer();
    router.push(href);
  };


  const isActive = "/" + segments.join("/") === href;

  return (
    <Pressable style={[styles.linkContainer, isActive && styles.activeLink]} onPress={handlePress}>
      <Ionicons name={iconName} size={24} color="#FFFFFF" style={styles.iconStyle} />
      <Text style={styles.linkText}>{text}</Text>
    </Pressable>
  );
};

export default function RightDrawer() {
  const { isOpen, closeDrawer } = useRightDrawer();
  const { user, isLoggedIn, signOut } = useGlobalContext();
  const router = useRouter();

  const slideX = useRef(new Animated.Value(PANEL_WIDTH)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      Animated.parallel([
        Animated.timing(slideX, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideX, { toValue: PANEL_WIDTH, duration: 200, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(({ finished }) => finished && setVisible(false));
    }
  }, [isOpen, slideX, fade]);

  const handleLogout = async () => {
    try {
      if (isLoggedIn) {
        await signOut();
      }
    } catch (err) {

      console.warn("Logout warning:", err?.message);
    } finally {
      closeDrawer();
      router.dismissAll();               
      router.replace(SIGN_OUT_REDIRECT); 
    }
  };

  if (!visible) return null;

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 9999 }]}>
      <Animated.View
        style={[{ ...StyleSheet.absoluteFillObject, opacity: fade, backgroundColor: "rgba(0,0,0,0.5)" }]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer} />
      </Animated.View>

      <Animated.View style={[styles.drawerPanel, { transform: [{ translateX: slideX }] }]}>
        <LinearGradient
          colors={["#60A3EF", "#A5F3E2", "#37CAA9"]}
          locations={[0.1, 0.6, 1.0]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.drawerContent}>
          <View style={styles.profileSection}>
            <Ionicons name="person-circle-outline" size={70} color="#FFFFFF" />
            <Text style={styles.profileEmail}>{user ? user.email : "Not signed in"}</Text>
          </View>
          <View style={styles.separator} />

          <Text style={styles.drawerTitle}>Menu</Text>
          {/* Use full paths (include groups) so matching works reliably */}
          <DrawerLink href="/about" text="About LucidPaths" iconName="information-circle-outline" />
          <DrawerLink href="/(drawer)/placeholder" text="Dashboard Overview" iconName="grid-outline" />
          <DrawerLink href="/(drawer)/settings" text="App Settings" iconName="options-outline" />

          <View style={styles.separator} />
          <Pressable style={styles.linkContainer} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#FFD700" style={styles.iconStyle} />
            <Text style={[styles.linkText, { color: "#FFD700" }]}>Sign out</Text>
          </Pressable>
        </View>

        <View style={styles.drawerFooter}>
          <Text style={styles.footerText}>LucidPaths v1.0.0</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  drawerPanel: {
    position: "absolute",
    top: 0, right: 0, bottom: 0,
    width: PANEL_WIDTH,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 25,
  },
  drawerContent: { flex: 1, paddingTop: 80, paddingHorizontal: 20 },
  profileSection: { alignItems: "center", marginBottom: 20 },
  profileEmail: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 8,
  },
  drawerTitle: { fontFamily: "Oswald_600SemiBold", fontSize: 22, color: "#FFFFFF", marginBottom: 10 },
  linkContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 5,
    gap: 15,
  },
  activeLink: { backgroundColor: "rgba(255, 255, 255, 0.15)" },
  iconStyle: { width: 25, textAlign: "center" },
  linkText: { fontFamily: "OpenSans_700Bold", color: "#FFFFFF", fontSize: 16 },
  separator: { height: 1, backgroundColor: "rgba(255, 255, 255, 0.15)", marginVertical: 15 },
  drawerFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
  },
  footerText: { fontFamily: "OpenSans_400Regular", fontSize: 12, color: "rgba(255, 255, 255, 0.7)" },
});
