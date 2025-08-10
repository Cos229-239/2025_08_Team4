// app/_layout.jsx
import { Tabs, useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import PlusButton from '../components/Buttons/PlusButton'

export default function Layout() {
    const router = useRouter();
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
          <Tabs.Screen
        name="addgoal"
        options={{
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
            e.preventDefault(); // prevent normal tab navigation
          },
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: "About",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="menu-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}