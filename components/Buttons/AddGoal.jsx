import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Oswald_600SemiBold } from '@expo-google-fonts/oswald';
import { OpenSans_400Regular } from '@expo-google-fonts/open-sans';

export default function AddGoal({ isVisible, onClose }) {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    Oswald_600SemiBold,
    OpenSans_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleNavigate = (path) => {
    onClose(); 
    router.push(path); 
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <BlurView intensity={100} tint="dark" style={styles.blurView}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.modalContentContainer}>
          <Text style={styles.modalTitle}>What do you want to add?</Text>
          <View style={styles.buttonRow}>
            <Pressable 
              style={styles.choiceButtonOuter} 
              onPress={() => handleNavigate('/addgoal-flow')} 
            >
              <LinearGradient
                colors={['#C060A1', '#FF9F00']}
                start={[0, 0]} end={[1, 1]}
                style={styles.choiceButtonGradient}
              >
                <Ionicons name="flag-outline" size={30} color="#FFFFFF" />
                <Text style={styles.choiceButtonText}>Add Goal</Text>
                <Text style={styles.choiceButtonDescription}>Set a new long-term objective</Text>
              </LinearGradient>
            </Pressable>
            
            
            <Pressable 
              style={styles.choiceButtonOuter} 
              onPress={() => handleNavigate('/addtask-flow')} 
            >
              <LinearGradient
                colors={['#4C7AFB', '#2A3C8A']} 
                start={[0, 0]} end={[1, 1]}
                style={styles.choiceButtonGradient}
              >
                <Ionicons name="clipboard-outline" size={30} color="#FFFFFF" />
                <Text style={styles.choiceButtonText}>Add Task</Text>
                <Text style={styles.choiceButtonDescription}>Add a task to an existing goal</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  blurView: {
    flex: 1,
    justifyContent: 'flex-end', 
    alignItems: 'center',
    paddingBottom: 100, 
  },
  modalContentContainer: {
    alignItems: 'center',
    width: '90%', 
  },
  modalTitle: {
    fontFamily: 'Oswald_600SemiBold',
    fontSize: 24,
    color: 'white',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 15, 
  },
  choiceButtonOuter: {
    flex: 1,
    borderRadius: 30, 
    borderWidth: 3, 
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    overflow: 'hidden', 
  },
  choiceButtonGradient: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Oswald_600SemiBold',
    marginTop: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  choiceButtonDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontFamily: 'OpenSans_400Regular',
    textAlign: 'center',
    marginTop: 5,
  },
});