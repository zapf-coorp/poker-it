import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  Switch,
  ActivityIndicator,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ParticipantRole } from "shared";
import type { Room } from "shared";
import { roomApi } from "../api";
import { setStoredParticipant } from "../storage";
import { Button } from "../components/Button";
import type { RootStackParamList } from "../App";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "JoinRoom">;
  route: { params: { roomId: string } };
};

export function JoinRoomScreen({ navigation, route }: Props) {
  const { roomId } = route.params;
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [roomError, setRoomError] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [joinAsObserver, setJoinAsObserver] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState("");

  useEffect(() => {
    roomApi
      .getRoom(roomId)
      .then(setRoom)
      .catch(() => setRoomError("Room not found"))
      .finally(() => setLoading(false));
  }, [roomId]);

  async function handleSubmit() {
    if (!displayName.trim()) return;
    setJoinError("");
    setJoinLoading(true);
    try {
      const res = await roomApi.joinRoom(
        roomId,
        displayName.trim(),
        joinAsObserver ? ParticipantRole.OBSERVER : ParticipantRole.PARTICIPANT
      );
      await setStoredParticipant(roomId, res.participant.id, res.participant.role === ParticipantRole.FACILITATOR);
      navigation.replace("RoomLobby", {
        roomId,
        participantId: res.participant.id,
        isFacilitator: res.participant.role === ParticipantRole.FACILITATOR,
      });
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : "Failed to join");
    } finally {
      setJoinLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading room...</Text>
      </View>
    );
  }

  if (roomError || !room) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.error}>{roomError || "Room not found"}</Text>
          <Button title="Create a room instead" onPress={() => navigation.navigate("Home")} variant="secondary" />
        </View>
      </ScrollView>
    );
  }

  if (room.state === "CLOSED") {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.error}>This room is closed.</Text>
          <Button title="Create a room instead" onPress={() => navigation.navigate("Home")} variant="secondary" />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Join {room.name}</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Your name</Text>
        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Display name"
          placeholderTextColor="#888"
        />
        <View style={styles.switchRow}>
          <Text style={styles.label}>Join as observer (read-only)</Text>
          <Switch value={joinAsObserver} onValueChange={setJoinAsObserver} />
        </View>
        {joinError ? <Text style={styles.error}>{joinError}</Text> : null}
        <Button
          title={joinLoading ? "Joining..." : "Join"}
          onPress={handleSubmit}
          disabled={!displayName.trim() || joinLoading}
          style={styles.btn}
        />
      </View>
      <Button
        title="← Create a room instead"
        onPress={() => navigation.navigate("Home")}
        variant="secondary"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f0e8" },
  content: { padding: 24 },
  centered: { justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12 },
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
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  error: { color: "#b91c1c", marginBottom: 16 },
  btn: { marginBottom: 12 },
});
