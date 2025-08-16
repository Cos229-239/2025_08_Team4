// app/_layout.jsx
import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text, View, ActivityIndicator, Pressable } from "react-native";
import PlusButton from "../components/Buttons/PlusButton";
import { useFonts, Pacifico_400Regular } from "@expo-google-fonts/pacifico";
import { RightDrawerProvider, useRightDrawer } from "../components/RightDrawerContext";
import RightDrawer from "../components/RightDrawer";

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

  // Don't render until fonts are loaded
  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <Tabs
        screenOptions={{
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: "#004496" },
          headerTintColor: "#fff",
        }}
      >
         <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerTitleAlign: "center",
          headerTitle: () => (
            <Text
              style={{
                fontFamily: "Pacifico_400Regular",
                fontSize: 40,
                color: "#FFFFFF",
                height:85,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              LucidPaths
            </Text>
          ),
          headerStyle: {
            backgroundColor: "#004496",
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />

        <Tabs.Screen
        name="addgoal"
        options={{
             headerTitleAlign: "center",
          headerTitle: () => (
            <Text
              style={{
                fontFamily: "Pacifico_400Regular",
                fontSize: 40,
                color: "#FFFFFF",
                height:95,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Goal Worksheet
            </Text>
             
          ),
          headerStyle: {
      backgroundColor: "#004496",
    },
             headerTitleAlign: "center",
          headerTitle: () => (
            <Text
              style={{
                fontFamily: "Pacifico_400Regular",
                fontSize: 40,
                color: "#FFFFFF",
                height:95,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Goal Worksheet
            </Text>
             
          ),
          headerStyle: {
      backgroundColor: "#004496",
    },
          tabBarButton: (props) => (
            <PlusButton
              {...props}
              size={50}
              onPress={() => {
                router.push('/addgoal');
              }}
            />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault(); // Stops the default tab from being touchable and lets us use the image.
          },
        }}
      />

        {/* calls the openDraw functuon with the menu.jsx being the place holder*/}
        <Tabs.Screen
          name="menu"               
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => <Ionicons name="menu" color={color} size={size} />,
            tabBarButton: (props) => <Pressable {...props} onPress={openDrawer} />,
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();    // block navigation to /menu
              openDrawer();          // calls the custom drawer overlay with the openDrawer Functiuon
            },
          }}
        />
        
        {/* Below code hides the drawer folder from the tab menu. */}
  <Tabs.Screen name="(drawer)" options={{ href: null }} /> 
</Tabs>

      {/* This allows our custom drawer to load over an of the other tabs. */}
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
