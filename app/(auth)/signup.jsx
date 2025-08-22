import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { useAuth } from "../../components/AuthContext";
import { useState } from "react";

export default function Signup() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  return (
    <View style={s.wrap}>
      <Text style={s.title}>Create account</Text>

      <TextInput placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} style={s.input}/>
      <TextInput placeholder="Password" secureTextEntry value={pass} onChangeText={setPass} style={s.input}/>

      <Pressable style={s.btn} onPress={() => signIn("new-user-token")}>
        <Text style={s.btnText}>Sign up</Text>
      </Pressable>

      <Link href="/(auth)/login" style={s.link}>Have an account? Log in</Link>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 16, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 12, padding: 12, marginBottom: 12 },
  btn: { backgroundColor: "#004496", padding: 14, borderRadius: 14, alignItems: "center", marginTop: 6 },
  btnText: { color: "#fff", fontWeight: "700" },
  link: { marginTop: 16, textAlign: "center", color: "#004496", fontWeight: "600" },
});
