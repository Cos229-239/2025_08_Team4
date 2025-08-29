import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text, Pressable } from "react-native";
import PlusButton from "../../components/Buttons/PlusButton";
import { useRightDrawer } from "../../components/RightDrawerContext";
import RightDrawer from "../../components/RightDrawer";
import { useState } from 'react';
import AddGoal from '../../components/Buttons/AddGoal';

const HEADER_STYLE = { backgroundColor: "#3177C9" };
const HEADER_TITLE = (txt) => (
  <Text
    style={{ fontFamily: "Pacifico_400Regular", fontSize: 40, color: "#FFFFFF" }}
  >
    {txt}
  </Text>
);

export default function TabsLayout() {
  const router = useRouter();
  const { openDrawer } = useRightDrawer();
  const [isModalVisible, setIsModalVisible] = useState(false);

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
            tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} /> 
          }} 
        />
        <Tabs.Screen name="addgoal" options={{ title: "Goal Worksheet", headerTitle: () => HEADER_TITLE("Goal Worksheet"), tabBarButton: (props) => <PlusButton {...props} size={50} onPress={() => setIsModalVisible(true)} /> }} listeners={{ tabPress: (e) => { e.preventDefault(); } }} />
        <Tabs.Screen name="menu" options={{ headerShown: false, tabBarIcon: ({ color, size }) => <Ionicons name="menu" color={color} size={size} />, tabBarButton: (props) => <Pressable {...props} onPress={openDrawer} /> }} listeners={{ tabPress: (e) => { e.preventDefault(); openDrawer(); } }} />
        <Tabs.Screen name="dailystandup" options={{ href: null }} />
      </Tabs>
      <AddGoal isVisible={isModalVisible} onClose={() => setIsModalVisible(false)} />
      <RightDrawer />
    </>
  );
}