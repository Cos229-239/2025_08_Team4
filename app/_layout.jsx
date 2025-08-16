// app/_layout.jsx
import { Tabs, useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import PlusButton from '../components/Buttons/PlusButton';
import { useFonts, Pacifico_400Regular } from "@expo-google-fonts/pacifico";
import { Text } from "react-native";

export default function Layout() {
    const router = useRouter();
    
  const [fontsLoaded] = useFonts({
    Pacifico_400Regular,
  });

  return (
    <Tabs>
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
            e.preventDefault(); // turns off the tab so we can use the PlusButton.jsx file
          },
        }}
      />
      <Tabs.Screen
        name="about"
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
              Menu
            </Text>
             
          ),
          headerStyle: {
      backgroundColor: "#004496",
    },
          title: "Menu",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="menu" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}