import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Oswald_600SemiBold } from '@expo-google-fonts/oswald';


const TaskItem = ({ item, index }) => (
  <View style={[styles.taskItem, index % 2 === 1 && styles.taskItemOdd]}>
    <View style={styles.taskLeft}>
      <TouchableOpacity style={[styles.checkboxBase, item.completed && styles.checkboxChecked]}>
        {item.completed && <Ionicons name="checkmark" size={18} color="white" />}
      </TouchableOpacity>
      <Text style={styles.taskTitle}>{item.title}</Text>
    </View>
    <View style={styles.taskRight}>
      <Text style={styles.taskDueDate}>{item.dueDate}</Text>
      <Ionicons name="chevron-forward" size={24} color="#B0B0B0" />
    </View>
  </View>
);


const EmptyListComponent = () => (
  <View style={styles.taskItem}>
    <View style={styles.taskLeft}>
      <View style={styles.checkboxBase} />
      <Text style={styles.emptyText}>Add Goal / Add Task</Text>
    </View>
  </View>
);

export default function HomeScreen() {
  const [tasks, setTasks] = useState([]);
  
  const [fontsLoaded] = useFonts({
    Oswald_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.taskListContainer}>
        <FlatList
          data={tasks}
          renderItem={({ item, index }) => <TaskItem item={item} index={index} />}
          keyExtractor={(item, index) => item.id || index.toString()}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={EmptyListComponent}
          
          alwaysBounceVertical={false}
        />
      </View>

      <View style={styles.buttonGridContainer}>
        <Text>Button Grid Goes Here</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  taskListContainer: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3177C9',
    overflow: 'hidden',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    fontFamily: 'Oswald_600SemiBold',
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: 'white',
  },
  taskItemOdd: {
    backgroundColor: '#E0F0FF',
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taskRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxBase: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#B0B0B0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#004496',
    borderColor: '#004496',
  },
  taskTitle: {
    fontSize: 16,
    fontFamily: 'Oswald_600SemiBold',
  },
  taskDueDate: {
    fontSize: 14,
    color: '#888',
    fontFamily: 'Oswald_600SemiBold',
  },
  separator: {
    height: 1,
    backgroundColor: '#D0D0D0',
    marginLeft: 50,
  },
  buttonGridContainer: {
    flex: 1, 
    margin: 16,
    marginTop: 0,
  },
});