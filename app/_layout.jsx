// app/_layout.jsx
import { Tabs, useRouter, SplashScreen } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text, View, ActivityIndicator, Pressable } from "react-native";
import PlusButton from "../components/Buttons/PlusButton";
import { useFonts, Pacifico_400Regular } from "@expo-google-fonts/pacifico";
import { Oswald_600SemiBold } from '@expo-google-fonts/oswald';
import { OpenSans_700Bold } from '@expo-google-fonts/open-sans';
import { RightDrawerProvider, useRightDrawer } from "../components/RightDrawerContext";
import RightDrawer from "../components/RightDrawer";
import GlobalProvider, { useGlobalContext } from "../context/GlobalProvider";
import { useEffect, useState } from "react";
import AddGoal from '../components/Buttons/AddGoal';

SplashScreen.preventAutoHideAsync();

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

function TabsContent({ onAddGoalPress }) {
  const router = useRouter();
  const { openDrawer } = useRightDrawer();
  const { isLoading, isLoggedIn } = useGlobalContext();
  const [fontsLoaded, fontError] = useFonts({ 
    Pacifico_400Regular,
    Oswald_600SemiBold,
    OpenSans_700Bold
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (isLoading || !fontsLoaded) return;

    if (isLoggedIn) {
      router.replace('/');
    } else {
      router.replace('/welcomescreen');
    }
  }, [isLoggedIn, isLoading, fontsLoaded]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerTitleAlign: "center",
          headerStyle: HEADER_STYLE,
          headerTintColor: "#fff",
        }}
      >
        <Tabs.Screen name="welcomescreen" options={{ href: null, headerShown: false, tabBarStyle: { display: 'none' } }} />
        <Tabs.Screen name="signup" options={{ href: null, headerShown: false, tabBarStyle: { display: 'none' } }} />
        <Tabs.Screen name="login" options={{ href: null, headerShown: false, tabBarStyle: { display: 'none' } }} />
        
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarLabel: "Home",
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
                onPress={onAddGoalPress}
              />
            ),
          }}
          listeners={{ tabPress: (e) => { e.preventDefault(); }, }}
        />
        <Tabs.Screen
          name="menu"
          options={{
            headerShown: false,
            tabBarLabel: "Menu",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="menu" color={color} size={size} />
            ),
            tabBarButton: (props) => (
              <Pressable {...props} onPress={openDrawer} />
            ),
          }}
          listeners={{ tabPress: (e) => { e.preventDefault(); openDrawer(); }, }}
        />
        <Tabs.Screen name="(drawer)" options={{ href: null, headerTitle: () => HEADER_TITLE("LucidPaths"), }} />
      </Tabs>
      <RightDrawer />
    </View>
  );
}

export default function Layout() {
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <GlobalProvider>
      <RightDrawerProvider>
        <TabsContent onAddGoalPress={() => setIsModalVisible(true)} />
        <AddGoal 
          isVisible={isModalVisible} 
          onClose={() => setIsModalVisible(false)} 
        />
      </RightDrawerProvider>
    </GlobalProvider>
  );
}