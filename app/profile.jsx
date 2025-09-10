import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalContext } from '../context/GlobalProvider';
import { account } from '../lib/appwrite';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, setUser, setIsLoggedIn } = useGlobalContext();

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
      setIsLoggedIn(false);
      router.replace('/welcomescreen');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {}
      <Stack.Screen 
        options={{ 
          headerShown: true,
          headerStyle: { backgroundColor: '#3177C9' },
          headerTintColor: '#fff',
          headerTitleAlign: 'center',
          title: 'Profile'
        }} 
      />

      <View style={styles.profileInfoContainer}>
        <Ionicons name="person-circle-outline" size={90} color="#3177C9" />
        <Text style={styles.profileName}>{user?.name || 'User Name'}</Text>
        <Text style={styles.profileEmail}>{user?.email}</Text>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(drawer)/settings')}>
          <Ionicons name="settings-outline" size={24} color="#4B5563" />
          <Text style={styles.menuItemText}>Settings</Text>
          <Ionicons name="chevron-forward-outline" size={24} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Log Out</Text>
          <Ionicons name="chevron-forward-outline" size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  
  profileInfoContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  profileName: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 24,
    color: '#111827',
    marginTop: 12,
  },
  profileEmail: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  menuContainer: {
    marginTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  menuItemText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    color: '#111827',
  },
});