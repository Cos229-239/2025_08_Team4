import { View, Text, StyleSheet } from "react-native";

export default function About() {
  return (
    // page view 
    <View style={styles.container}>
      <View style={styles.heading_container}><Text style={styles.heading}>
        <Text style={{color: 'white'}}>About LucidPaths</Text></Text></View>
        <View style={styles.body_container}>
      <Text style={styles.body}>LucidPaths is a goal setting, tracking, and completion app. 
        We are here for you and your acheivments in every aspect of your life.</Text></View>
        <View style={styles.subheading_container}><Text style={styles.subheading}>
          <Text style={{color: 'white'}}>Application v1.0</Text></Text></View>
      <Text style={styles.body2}> See more information here (link)</Text>
      <View style={styles.subheading_container}><Text style={styles.subheading}>
        <Text style={{color: 'white'}}>Meet the team</Text></Text></View>
        <View style={styles.body2_container}>
      <Text style={styles.body}>Greg - Developer</Text>
      <Text style={styles.body}>Khalid - Developer</Text>
      <Text style={styles.body}>Aiden - Developer</Text>
      <Text style={styles.body}>Corey - Developer</Text>
      <Text style={styles.body}>Michael - Developer</Text></View>
      <Text style={styles.body2}>Learn more about our team and goals here: link</Text>
      <View style={styles.subheading_container}><Text style={styles.subheading}>
        <Text style={{color: 'white'}}>Need Help?</Text></Text></View>
      <Text style={styles.body2}>Visit our FAQ page for support here (link)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // General text settings for the page
  container: { flex: 1, alignItems: "center", justifyContent: "top", marginTop: 10, 
    marginLeft: 5, marginRight: 5, },
    // Heading text details
  heading: { fontSize: 22, fontWeight: "skinnybold", marginTop: 10, marginBottom: 10,
  },
  // Subjeading text details
  subheading: { fontSize: 18, fontWeight: "skinnybold", marginTop: 0},
  // Body text details
  body: {textAlign: "center", marginRight: 10, marginLeft: 10, fontSize: 16, marginBottom: 10, marginTop: 10},
  // Bold text body details 
  body2: { textAlign: "center", fontWeight: "300", marginBottom: 5, marginTop: 5},
  // boxes for heading
  heading_container: {
    height: 55, width: 380, alignItems: "center", 
    justifyContent: "center", 
    backgroundColor: '#3277C9', 
    borderRadius: 10},
  subheading_container: {
    height: 45, width: 380, alignItems: "center", 
    justifyContent: "center", 
    backgroundColor: '#3277C9', 
    borderRadius: 10, marginTop: 10},
  body_container: {
    height: 90, width: 380, alignItems: "center", 
    justifyContent: "center", 
    backgroundColor: '#A2C8F3',
    borderRadius: 15, marginTop: 10},
  body2_container: {
    height: 220, width: 380, alignItems: "center", 
    justifyContent: "center", 
    backgroundColor: '#A2C8F3',
    borderRadius: 15, marginTop: 10},
});

/*                     DEV NOTES
 - Preffered skinny bold over default, default seemed splotchy
 - Went for highlighter blocks around most text, fills the page and draws the eyes to each section
 - I decided to go with white on dark, black on light to stand out better
 - Need to add links? patch / update notes, introduction to the team, support
*/