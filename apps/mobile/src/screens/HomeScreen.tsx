import { StyleSheet, Text, View } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Button } from "../components/Button";
import { apiUrl } from "../api";
import type { RootStackParamList } from "../App";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Home">;
};

export function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Poker Plan It</Text>
      <Text style={styles.subtitle}>Planning Poker for agile teams.</Text>
      <Button
        title="Create a room"
        onPress={() => navigation.navigate("CreateRoom")}
        style={styles.button}
      />
      <Text style={styles.hint}>Or join via a shared link.</Text>
      <Text style={styles.apiHint}>
        API: {apiUrl}{"\n"}
        (Dispositivo físico? Use EXPO_PUBLIC_API_URL=http://SEU_IP:3000)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f0e8",
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1a1a1a",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    color: "#555",
  },
  button: {
    alignSelf: "stretch",
    minHeight: 44,
  },
  hint: {
    marginTop: 16,
    fontSize: 14,
    color: "#555",
  },
  apiHint: {
    marginTop: 24,
    fontSize: 11,
    color: "#888",
    textAlign: "center",
  },
});
