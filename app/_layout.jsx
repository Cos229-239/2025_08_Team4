// app/_layout.jsx
import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text, View, ActivityIndicator, Pressable } from "react-native";
import PlusButton from "../components/Buttons/PlusButton";
import { useFonts, Pacifico_400Regular } from "@expo-google-fonts/pacifico";
import { RightDrawerProvider, useRightDrawer } from "../components/RightDrawerContext";
import RightDrawer from "../components/RightDrawer";

const HEADER_STYLE = { backgroundColor: "#004496" };
const HEADER_TITLE = (txt) => (
  <Text
    style={{
      fontFamily: "Pacifico_400Regular",
      fontSize: 40,
      color: "#FFFFFF",
      height: 85,
      textAlignVertical: "center",
      textAlign: "center",
    }}
  >
    {txt}
  </Text>
);

function TabsContent() {
  const router = useRouter();
  const { openDrawer } = useRightDrawer();   // now safely inside Provider
  const [fontsLoaded] = useFonts({ Pacifico_400Regular });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <>
      <Tabs
        screenOptions={{
          headerTitleAlign: "center",
          headerStyle: HEADER_STYLE,
          headerTintColor: "#fff",
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            headerTitle: () => HEADER_TITLE("LucidPaths"),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" color={color} size={size} />
            ),
          }}
        />

        <Tabs.Screen
          name="addgoal"
          options={{
            title: "Goal Worksheet",
            headerTitle: () => HEADER_TITLE("Goal Worksheet"),
            headerStyle: HEADER_STYLE,
            tabBarButton: (props) => (
              <PlusButton
                {...props}
                size={50}
                onPress={() => router.push("/addgoal")}
              />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault(); // use the custom button instead of default nav
            },
          }}
        />

        <Tabs.Screen
          name="menu"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="menu" color={color} size={size} />
            ),
            tabBarButton: (props) => (
              <Pressable {...props} onPress={openDrawer} />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();  // block navigation to /menu
              openDrawer();        // open the custom drawer instead
            },
          }}
        />

        {/* Hide the (drawer) route from the tab bar */}
        <Tabs.Screen name="(drawer)" 
        options={{ 
          href: null,
          headerTitle: () => HEADER_TITLE("LucidPaths"), }} />
      </Tabs>

      {/* Drawer overlays tabs */}
      <RightDrawer />
    </>
  );
}

export default function Layout() {
  return (
    <RightDrawerProvider>
      <TabsContent />
    </RightDrawerProvider>
  );
}
