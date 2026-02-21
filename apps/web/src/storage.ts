const STORAGE_KEY = "poker-plan-it-room";

export function getStoredParticipant(
  roomId: string
): { participantId: string; isFacilitator: boolean } | null {
  try {
    const raw = sessionStorage.getItem(`${STORAGE_KEY}-${roomId}`);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data?.participantId
      ? { participantId: data.participantId, isFacilitator: !!data.isFacilitator }
      : null;
  } catch {
    return null;
  }
}

export function setStoredParticipant(
  roomId: string,
  participantId: string,
  isFacilitator: boolean
) {
  sessionStorage.setItem(
    `${STORAGE_KEY}-${roomId}`,
    JSON.stringify({ participantId, isFacilitator })
  );
}

export function clearStoredParticipant(roomId: string) {
  sessionStorage.removeItem(`${STORAGE_KEY}-${roomId}`);
}
