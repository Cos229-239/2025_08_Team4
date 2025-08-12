import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PlusButton({ onPress, size = 64, style, ...rest }) {
  const incoming = Array.isArray(style) ? Object.assign({}, ...style) : style || {};
  const { backgroundColor, ...safeStyle } = incoming;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.button}
      activeOpacity={0.85}
    >
      <Ionicons name="add" size={55} color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: -20,
    left: "50%",
    transform:[{translateX: -40}],
    backgroundColor: '#50E3C2',
    borderRadius: 30,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,

    elevation: 8,
  },
});