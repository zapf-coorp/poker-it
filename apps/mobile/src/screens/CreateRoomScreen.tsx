import { useState } from "react";
import { StyleSheet, Text, View, TextInput, ScrollView, Alert } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Picker } from "@react-native-picker/picker";
import { Share } from "react-native";
import * as Clipboard from "expo-clipboard";
import { DeckType, DECKS } from "shared";
import { roomApi } from "../api";
import { setStoredParticipant } from "../storage";
import { Button } from "../components/Button";
import type { RootStackParamList } from "../App";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "CreateRoom">;
};

export function CreateRoomScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [deckType, setDeckType] = useState<DeckType>(DeckType.FIBONACCI);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    roomId: string;
    participantId: string;
    shareableLink: string;
  } | null>(null);
  const [opening, setOpening] = useState(false);

  async function handleSubmit() {
    setError("");
    if (!name.trim()) {
      setError("Room name is required");
      return;
    }
    setLoading(true);
    try {
      const res = await roomApi.createRoom(name.trim(), deckType);
      setResult({
        roomId: res.room.id,
        participantId: res.participant.id,
        shareableLink: res.shareableLink,
      });
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.name === "AbortError"
            ? "Connection timeout. Check if the server is running."
            : err.message
          : "Failed to create room";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!result) return;
    await Clipboard.setStringAsync(result.shareableLink);
    Alert.alert("Copied", "Link copied to clipboard");
  }

  async function shareLink() {
    if (!result) return;
    try {
      await Share.share({
        message: result.shareableLink,
        title: "Room link",
      });
    } catch {
      await copyLink();
    }
  }

  async function openRoom() {
    if (!result || opening) return;
    setError("");
    setOpening(true);
    try {
      await setStoredParticipant(result.roomId, result.participantId, true);
      navigation.replace("RoomLobby", {
        roomId: result.roomId,
        participantId: result.participantId,
        isFacilitator: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open room");
    } finally {
      setOpening(false);
    }
  }

  if (result) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Room created</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.card}>
          <Text style={styles.label}>Share this link:</Text>
          <Text style={styles.link} selectable>
            {result.shareableLink}
          </Text>
          <Button title="Copy link" onPress={copyLink} style={styles.btn} />
          <Button title="Share" onPress={shareLink} variant="secondary" style={styles.btn} />
          <Button title={opening ? "Opening..." : "Open room"} onPress={openRoom} variant="primary" style={styles.btn} disabled={opening} />
        </View>
        <Button
          title="← Back to home"
          onPress={() => navigation.navigate("Home")}
          variant="secondary"
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Create room</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Room name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Sprint 42"
          placeholderTextColor="#888"
        />
        <Text style={styles.label}>Deck</Text>
        <Picker
          selectedValue={deckType}
          onValueChange={(v) => setDeckType(v as DeckType)}
          style={styles.picker}
        >
          {Object.entries(DECKS).map(([key, deck]) => (
            <Picker.Item key={key} label={`${key} (${deck.deckValues.join(", ")})`} value={key} />
          ))}
        </Picker>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          title={loading ? "Creating..." : "Create room"}
          onPress={handleSubmit}
          disabled={loading}
          style={styles.btn}
        />
      </View>
      <Button
        title="← Back to home"
        onPress={() => navigation.navigate("Home")}
        variant="secondary"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f0e8" },
  content: { padding: 24 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16, color: "#1a1a1a" },
  card: {
    backgroundColor: "#faf8f5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e0d9cf",
  },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 8, color: "#1a1a1a" },
  input: {
    borderWidth: 2,
    borderColor: "#e0d9cf",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 44,
    marginBottom: 16,
  },
  picker: { height: 120, marginBottom: 16 },
  link: { fontSize: 12, marginBottom: 16, color: "#555", wordBreak: "break-all" },
  error: { color: "#b91c1c", marginBottom: 16 },
  btn: { marginBottom: 12 },
});
