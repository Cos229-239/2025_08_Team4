import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // Import useRouter for the back button

const COLORS = { 
  primary: '#04A777', 
  background: '#F8F9FA', 
  card: '#FFFFFF', 
  text: '#212529', 
  textSecondary: '#6C757D', 
  border: '#E9ECEF',
};

const LinkItem = ({ icon, text, url }) => {
  const handlePress = async () => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(`Don't know how to open this URL: ${url}`);
    }
  };

  return (
    <Pressable style={styles.linkItem} onPress={handlePress}>
      <Ionicons name={icon} size={24} color={COLORS.primary} />
      <Text style={styles.linkText}>{text}</Text>
      <Ionicons name="open-outline" size={22} color={COLORS.textSecondary} />
    </Pressable>
  );
};


export default function AboutScreen() {
  const router = useRouter();
  const appVersion = "1.0.0";

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* NEW: Custom Header Area */}
        <View style={styles.customHeader}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={COLORS.text} />
          </Pressable>
        </View>
        
        <View style={styles.headerContainer}>
          <Text style={styles.appName}>LucidPaths</Text>
          <Text style={styles.appVersion}>Version {appVersion}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Our Mission</Text>
          <Text style={styles.cardBody}>
            To provide a clear, intuitive, and motivating platform for individuals to define, track, and achieve their most ambitious goals. We believe that with the right tools, every path becomes clearer.
          </Text>
        </View>

        <View style={styles.card}>
          <LinkItem 
            icon="document-text-outline" 
            text="Terms of Service" 
            url="https://yourwebsite.com/terms"
          />
          <View style={styles.divider} />
          <LinkItem 
            icon="shield-checkmark-outline" 
            text="Privacy Policy" 
            url="https://yourwebsite.com/privacy"
          />
          <View style={styles.divider} />
          <LinkItem 
            icon="mail-outline" 
            text="Contact Support" 
            url="mailto:support@yourdomain.com"
          />
        </View>

        <Text style={styles.footerText}>
          Built with ❤️ using React Native & Expo.
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  // NEW: Styles for the custom header and back button
  customHeader: {
    paddingTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  backButton: {
    padding: 8, // Increase touchable area
    marginLeft: -8, // Align visually with the edge
  },
  // ---
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 8,
  },
  appName: {
    fontFamily: 'Pacifico_400Regular',
    fontSize: 48,
    color: COLORS.text,
  },
  appVersion: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  cardBody: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textSecondary,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  linkText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#B0B0B0',
  },
});