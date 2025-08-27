import { View, Text, StyleSheet, ImageBackground, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useRef } from 'react';

export default function WelcomeScreen() {
  const router = useRouter();
  
  const signUpScale = useRef(new Animated.Value(1)).current;
  const loginScale = useRef(new Animated.Value(1)).current;
  const signUpRipple = useRef(new Animated.Value(0)).current;
  const loginRipple = useRef(new Animated.Value(0)).current;

  const handleSignUp = () => {
    router.push('/signup'); 
  };

  const handleLogin = () => {
    router.push('/login'); 
  };

  const animatePress = (scaleValue, rippleValue) => {
    Animated.parallel([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(rippleValue, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      }),
    ]).start(() => {
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(rippleValue, {
          toValue: 0,
          duration: 400,
          useNativeDriver: false,
        }),
      ]).start();
    });
  };

  return (
    <ImageBackground 
      source={require('../assets/splash-icon.png')} 
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.topSpacer} />
        
        <View style={styles.buttonContainer}>
          <Animated.View style={{ transform: [{ scale: signUpScale }] }}>
            <Pressable 
              style={styles.button} 
              onPress={handleSignUp}
              onPressIn={() => animatePress(signUpScale, signUpRipple)}
            >
              <Text style={styles.buttonText}>Sign Up</Text>
              <Animated.View 
                style={[
                  styles.ripple,
                  {
                    opacity: signUpRipple.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.3],
                    }),
                    transform: [{
                      scale: signUpRipple.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1.5],
                      }),
                    }],
                  },
                ]}
              />
            </Pressable>
          </Animated.View>
          
          <Animated.View style={{ transform: [{ scale: loginScale }] }}>
            <Pressable 
              style={styles.button} 
              onPress={handleLogin}
              onPressIn={() => animatePress(loginScale, loginRipple)}
            >
              <Text style={styles.buttonText}>Login</Text>
              <Animated.View 
                style={[
                  styles.ripple,
                  {
                    opacity: loginRipple.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.3],
                    }),
                    transform: [{
                      scale: loginRipple.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1.5],
                      }),
                    }],
                  },
                ]}
              />
            </Pressable>
          </Animated.View>
        </View>
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
    backgroundColor: 'rgba(49, 119, 201, 0.1)',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 50,
  },
  topSpacer: {
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 40,
    gap: 16,
    paddingBottom: 20,
  },
  button: {
    backgroundColor: '#3177C9',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
    position: 'relative',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    zIndex: 1, 
  },
  ripple: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    marginTop: -10,
    marginLeft: -10,
  },
});