// app/_layout.jsx
import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text, View, ActivityIndicator, Pressable } from "react-native";
import PlusButton from "../components/Buttons/PlusButton";
import { useFonts, Pacifico_400Regular } from "@expo-google-fonts/pacifico";
import { RightDrawerProvider, useRightDrawer } from "../components/RightDrawerContext";
import RightDrawer from "../components/RightDrawer"; // Corrected import path

const HEADER_STYLE = { backgroundColor: "#3177C9" };
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
  const { openDrawer } = useRightDrawer(); 
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
        initialRouteName="welcomescreen"
        screenOptions={{
          headerTitleAlign: "center",
          headerStyle: HEADER_STYLE,
          headerTintColor: "#fff",
        }}
      >
        <Tabs.Screen 
          name="welcomescreen" 
          options={{ 
            href: null, 
            headerShown: false, 
            tabBarStyle: { display: 'none' } 
          }} 
        />
        <Tabs.Screen name="signup" options={{ href: null, tabBarStyle: { display: 'none' } }} />
        <Tabs.Screen name="login" options={{ href: null, tabBarStyle: { display: 'none' } }} />
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
            tabPress: (e) => { e.preventDefault(); },
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
            tabPress: (e) => { e.preventDefault(); openDrawer(); },
          }}
        />
        <Tabs.Screen name="(drawer)" 
        options={{ 
          href: null,
          headerTitle: () => HEADER_TITLE("LucidPaths"), }} />
      </Tabs>
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