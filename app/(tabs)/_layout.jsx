import { Tabs, useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { useState } from 'react';

// Make sure these paths are correct for your project
import PlusButton from "../../components/Buttons/PlusButton";
import { useRightDrawer } from "../../components/RightDrawerContext";
import RightDrawer from "../../components/RightDrawer";
import AddGoal from "../../components/Buttons/AddGoal";

export default function TabsLayout() {
  const router = useRouter();
  const { openDrawer } = useRightDrawer();
  const [isModalVisible, setIsModalVisible] = useState(false); 

  return (
    <>
      <Tabs screenOptions={{ tabBarActiveTintColor: '#04A777' }}>
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="goals"
          options={{
            title: "Goals",
            tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="summit" size={size} color={color} />,
            headerShown: false,
          }}
        />
        
        {/* CORRECTED: The name now matches your 'addgoal.jsx' file */}
        <Tabs.Screen
          name="addgoal" 
          options={{
            tabBarButton: (props) => <PlusButton {...props} onPress={() => setIsModalVisible(true)} />,
          }}
          listeners={{
            tabPress: (e) => { e.preventDefault(); }
          }}
        />

        <Tabs.Screen
          name="projects"
          options={{
            title: "Projects",
            tabBarIcon: ({ color, size }) => <Ionicons name="briefcase-outline" color={color} size={size} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="dailystandup"
          options={{ href: null, headerShown: false }}
        />
        <Tabs.Screen
          name="taskAttack"
          options={{ href: null, headerShown: false }}
        />
        <Tabs.Screen
          name="menu"
          options={{
            tabBarLabel: "Menu",
            tabBarIcon: ({ color, size }) => <Ionicons name="menu" color={color} size={size} />,
            tabBarButton: (props) => <Pressable {...props} onPress={openDrawer} />,
          }}
        />
      </Tabs>
      
      <AddGoal isVisible={isModalVisible} onClose={() => setIsModalVisible(false)} />
      <RightDrawer />
    </>
  );
}