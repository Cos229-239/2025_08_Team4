import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Pressable, Animated, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { useFonts, OpenSans_700Bold } from '@expo-google-fonts/open-sans';

export default function WelcomeScreen() {
  const router = useRouter();
  
  const [fontsLoaded] = useFonts({
    OpenSans_700Bold,
  });

  const signUpScale = useRef(new Animated.Value(1)).current;
  const loginScale = useRef(new Animated.Value(1)).current;

  const animatePressIn = (scaleValue) => {
    Animated.timing(scaleValue, {
      toValue: 0.95,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const animatePressOut = (scaleValue) => {
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleSignUp = () => {
    router.push('/signup'); 
  };

  const handleLogin = () => {
    router.push('/login'); 
  };
  
  if (!fontsLoaded) {
    return null;
  }

  return (
    <ImageBackground 
      source={require('../assets/splash-icon.png')} 
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.topSpacer} />
        
        <View style={styles.buttonContainer}>
          <Animated.View style={{ transform: [{ scale: loginScale }] }}>
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]} 
              onPress={handleLogin}
              onPressIn={() => animatePressIn(loginScale)}
              onPressOut={() => animatePressOut(loginScale)}
              activeOpacity={0.8}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>Login</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: signUpScale }] }}>
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]}
              onPress={handleSignUp}
              onPressIn={() => animatePressIn(signUpScale)}
              onPressOut={() => animatePressOut(signUpScale)}
              activeOpacity={0.8}
            >
              <Text style={[styles.buttonText, styles.primaryButtonText]}>Sign Up</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View style={styles.bottomSpacer} />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent', 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  topSpacer: {
    flex: 1.5,
  },
  bottomSpacer: {
    flex: 1,
  },
  buttonContainer: {
    width: '85%',
    gap: 15,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: {
        elevation: 0,
        shadowColor: "rgba(0,0,0,0.2)", 
      },
    }),
  },
  primaryButton: {
    backgroundColor: '#64F0D2',
    borderColor: '#64F0D2',
  },
  secondaryButton: {
    backgroundColor: '#FCFCFD',
    borderColor: '#FCFCFD',
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'OpenSans_700Bold',
  },
  primaryButtonText: {
    color: '#333333',
  },
  secondaryButtonText: {
    color: '#04A777',
  },
});