import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PlusButton({ onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.button}
      activeOpacity={0.85}
    >
      
      <Ionicons name="add" size={40} color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: -25, 
    left: "50%",
    
    
    width: 70, 
    height: 70,
    borderRadius: 35, 
    transform:[{translateX: -35}], 
    backgroundColor: '#64F0D2',

   
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF', 
  },
});