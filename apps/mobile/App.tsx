import { FIBONACCI } from "shared";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

const apiUrl =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Poker Plan It</Text>
      <Text style={styles.subtitle}>Planning Poker for agile teams.</Text>
      <Text style={styles.api}>API: {apiUrl}</Text>
      <Text style={styles.api}>Deck: {FIBONACCI.deckValues.join(", ")}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f0e8",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  api: {
    fontSize: 14,
    color: "#555",
  },
});
