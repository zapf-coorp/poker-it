import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "poker-plan-it-room";

export async function getStoredParticipant(
  roomId: string
): Promise<{ participantId: string; isFacilitator: boolean } | null> {
  try {
    const raw = await AsyncStorage.getItem(`${STORAGE_KEY}-${roomId}`);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data?.participantId
      ? { participantId: data.participantId, isFacilitator: !!data.isFacilitator }
      : null;
  } catch {
    return null;
  }
}

export async function setStoredParticipant(
  roomId: string,
  participantId: string,
  isFacilitator: boolean
) {
  await AsyncStorage.setItem(
    `${STORAGE_KEY}-${roomId}`,
    JSON.stringify({ participantId, isFacilitator })
  );
}

export async function clearStoredParticipant(roomId: string) {
  await AsyncStorage.removeItem(`${STORAGE_KEY}-${roomId}`);
}
