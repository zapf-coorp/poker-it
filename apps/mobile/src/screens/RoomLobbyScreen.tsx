import { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { Room, Participant } from "shared";
import { RoomState, ParticipantRole } from "shared";
import { io } from "socket.io-client";
import { roomApi, apiUrl } from "../api";
import { clearStoredParticipant } from "../storage";
import { Button } from "../components/Button";
import type { RootStackParamList } from "../App";


type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "RoomLobby">;
  route: { params: { roomId: string; participantId: string; isFacilitator: boolean } };
};

export function RoomLobbyScreen({ navigation, route }: Props) {
  const { roomId, participantId, isFacilitator } = route.params;
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRoom = useCallback(async () => {
    try {
      const r = await roomApi.getRoom(roomId);
      setRoom(r);
      const { participants: list } = await roomApi.getParticipants(roomId);
      setParticipants(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load room");
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  useEffect(() => {
    const socket = io(apiUrl, { path: "/socket.io" });
    socket.on("connect", () => {
      socket.emit("joinRoom", { roomId, participantId });
    });
    socket.on("participantJoined", (p: Participant) => {
      setParticipants((prev) => {
        if (prev.some((x) => x.id === p.id)) return prev;
        return [...prev, p].sort((a, b) => a.joinedAt - b.joinedAt);
      });
    });
    socket.on("participantLeft", (p: Participant) => {
      setParticipants((prev) => prev.filter((x) => x.id !== p.id));
    });
    socket.on("roomClosed", () => {
      setRoom((prev) => (prev ? { ...prev, state: RoomState.CLOSED } : null));
    });
    return () => {
      socket.disconnect();
    };
  }, [roomId, participantId]);

  function handleLeave() {
    Alert.alert(
      "Leave room",
      "Leave this room? You will need the link to rejoin.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            setActionLoading(true);
            try {
              await roomApi.leaveRoom(roomId, participantId);
              await clearStoredParticipant(roomId);
              navigation.replace("Home");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Failed to leave");
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  }

  function handleClose() {
    Alert.alert(
      "Close room",
      "Close this room? No one will be able to vote after closing.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Close room",
          style: "destructive",
          onPress: async () => {
            setActionLoading(true);
            try {
              await roomApi.closeRoom(roomId, participantId);
              setRoom((prev) => (prev ? { ...prev, state: RoomState.CLOSED } : null));
            } catch (err) {
              setError(err instanceof Error ? err.message : "Failed to close room");
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const isClosed = room?.state === RoomState.CLOSED;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{room?.name ?? "Room"}</Text>
          <View style={[styles.badge, isClosed ? styles.badgeClosed : styles.badgeOpen]}>
            <Text style={styles.badgeText}>{isClosed ? "Closed" : "Open"}</Text>
          </View>
        </View>
        {!isClosed && (
          <View style={styles.actions}>
            {isFacilitator ? (
              <>
                <Button title="Close room" onPress={handleClose} variant="destructive" disabled={actionLoading} />
                <Button title="Leave" onPress={handleLeave} variant="secondary" disabled={actionLoading} />
              </>
            ) : (
              <Button title="Leave" onPress={handleLeave} variant="secondary" disabled={actionLoading} />
            )}
          </View>
        )}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Current item</Text>
        <Text style={styles.hint}>No item yet. (Estimation items coming in Phase 3)</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Participants ({participants.length})</Text>
        {participants.map((p) => (
          <View key={p.id} style={styles.participant}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{p.displayName.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.participantName}>
              {p.displayName}
              {p.role === ParticipantRole.FACILITATOR && " (facilitator)"}
              {p.role === ParticipantRole.OBSERVER && " (observer)"}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f0e8" },
  content: { padding: 24 },
  centered: { justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "bold", color: "#1a1a1a" },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, alignSelf: "flex-start", marginTop: 8 },
  badgeOpen: { backgroundColor: "#0d6b0d" },
  badgeClosed: { backgroundColor: "#555" },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  actions: { gap: 8 },
  error: { color: "#b91c1c", marginBottom: 16 },
  card: {
    backgroundColor: "#faf8f5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e0d9cf",
  },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8, color: "#1a1a1a" },
  hint: { color: "#555" },
  participant: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#e0d9cf" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0d6b0d",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  participantName: { fontSize: 16 },
});
