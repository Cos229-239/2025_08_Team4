import { useEffect, useRef, useState, useCallback } from "react";
import { Animated, Dimensions, Pressable, StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { useRightDrawer } from "./RightDrawerContext";
import { useRouter, usePathname } from "expo-router"; // Changed useSegments to usePathname
import { useGlobalContext } from "../context/GlobalProvider";
import { Ionicons } from "@expo/vector-icons";

const PANEL_WIDTH = Math.floor(Dimensions.get("window").width * 0.8);
const SIGN_OUT_REDIRECT = "/welcomescreen";

const DrawerLink = ({ href, text, iconName }) => {
  const router = useRouter();
  const pathname = usePathname(); // Use usePathname for an exact match
  const { closeDrawer } = useRightDrawer();

  // This is a more reliable way to check for the active route
  const isActive = pathname === href;

  const handlePress = () => {
    closeDrawer();
    setTimeout(() => {
        router.push(href);
    }, 200);
  };

  return (
    <TouchableOpacity 
      style={[styles.linkContainer, isActive && styles.activeLink]} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Ionicons 
        name={iconName} 
        size={24} 
        color={isActive ? '#FFFFFF' : '#333333'}
        style={styles.iconStyle} 
      />
      <Text style={[styles.linkText, isActive && styles.activeLinkText]}>{text}</Text>
    </TouchableOpacity>
  );
};

export default function RightDrawer() {
  const { isOpen, closeDrawer } = useRightDrawer();
  const { user, isLoggedIn, signOut, profile } = useGlobalContext();
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
        <View style={styles.drawerContent}>
          
          <View style={styles.profileSection}>
            <Ionicons name="person-circle-outline" size={60} color="#333333" />
            <Text style={styles.profileName}>{profile?.name || 'User'}</Text>
            <Text style={styles.profileEmail}>{user ? user.email : "Not signed in"}</Text>
          </View>

          <View style={styles.menuGroup}>
            <DrawerLink href="/" text="Home" iconName="home-outline" />
            <DrawerLink href="/goals" text="Goals" iconName="flag-outline" />
            <DrawerLink href="/(drawer)/placeholder" text="Dashboard Overview" iconName="grid-outline" />
            <DrawerLink href="/(drawer)/ExampleScreen" text="Mountain View" iconName="image-outline" />
            <DrawerLink href="/settings" text="App Settings" iconName="options-outline" />
            <DrawerLink href="/about" text="About LucidPaths" iconName="information-circle-outline" />
          </View>
        </View>

        <View style={styles.drawerFooter}>
            <TouchableOpacity style={styles.linkContainer} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={24} color="#EB5757" style={styles.iconStyle} />
                <Text style={[styles.linkText, { color: "#EB5757" }]}>Sign out</Text>
            </TouchableOpacity>
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
    backgroundColor: '#FCFCFD',
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 25,
  },
  drawerContent: { 
    flex: 1, 
    paddingTop: 80, 
  },
  profileSection: { 
    alignItems: "center", 
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  profileName: {
    fontFamily: "Oswald_600SemiBold",
    fontSize: 22,
    color: "#333333",
    marginTop: 12,
  },
  profileEmail: {
    fontFamily: "OpenSans_400Regular",
    fontSize: 14,
    color: "#828282",
    marginTop: 4,
  },
  menuGroup: {
    paddingHorizontal: 15,
  },
  linkContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 5,
    gap: 15,
  },
  activeLink: { 
    backgroundColor: '#04A777',
  },
  iconStyle: { 
    width: 25, 
    textAlign: "center" 
  },
  linkText: { 
    fontFamily: "OpenSans_700Bold", 
    color: "#333333",
    fontSize: 16 
  },
  activeLinkText: {
    color: '#FFFFFF',
  },
  drawerFooter: {
    padding: 20,
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F2'
  },
  footerText: { 
    fontFamily: "OpenSans_400Regular", 
    fontSize: 12, 
    color: "#BDBDBD"
  },
});