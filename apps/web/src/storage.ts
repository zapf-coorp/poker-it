const STORAGE_KEY = "poker-plan-it-room";
const AUTH_STORAGE_KEY = "poker-plan-it-auth";

export function getStoredAuth(): { user: { id: string; email: string; name: string }; token: string } | null {
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data?.user && data?.token ? data : null;
  } catch {
    return null;
  }
}

export function setStoredAuth(user: { id: string; email: string; name: string }, token: string) {
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, token }));
}

export function clearStoredAuth() {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
}

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
