import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text, View, ActivityIndicator, Pressable } from "react-native";
import PlusButton from "../../components/Buttons/PlusButton";
import { useFonts, Pacifico_400Regular } from "@expo-google-fonts/pacifico";
import { RightDrawerProvider, useRightDrawer } from "../../components/RightDrawerContext";
import RightDrawer from "../../components/RightDrawer";
import { useState, useEffect } from 'react'; // 
import AddGoal from '../../components/Buttons/AddGoal';
import GlobalProvider from "../../context/GlobalProvider"; 

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
  const [isModalVisible, setIsModalVisible] = useState(false);

  // --- TEMPORARY REDIRECT ---
  useEffect(() => {
    router.replace('/onboarding/step1');
  }, []); // Empty array ensures this runs only once
  // -------------------------

  if (!fontsLoaded) {
    return <ActivityIndicator />;
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
            tabBarButton: (props) => (
              <PlusButton
                {...props}
                size={50}
                onPress={() => setIsModalVisible(true)}
              />
            ),
          }}
          listeners={{ tabPress: (e) => { e.preventDefault(); } }}
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
          listeners={{ tabPress: (e) => { e.preventDefault(); openDrawer(); } }}
        />
        <Tabs.Screen name="(drawer)" options={{ href: null, headerShown: false }} />
        <Tabs.Screen name="welcomescreen" options={{ href: null }} />
        <Tabs.Screen name="signup" options={{ href: null }} />
        <Tabs.Screen name="login" options={{ href: null }} />
        <Tabs.Screen name="dailystandup" options={{ href: null }} /> 
      </Tabs>
      <RightDrawer />
      <AddGoal 
        isVisible={isModalVisible} 
        onClose={() => setIsModalVisible(false)} 
      />
    </>
  );
}

export default function Layout() {
  return (
    <GlobalProvider>
      <RightDrawerProvider>
        <TabsContent />
      </RightDrawerProvider>
    </GlobalProvider>
  );
}