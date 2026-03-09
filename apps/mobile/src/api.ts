import { Platform } from "react-native";
import { createRoomApi } from "shared";

// Android emulator: 10.0.2.2 = host machine. Physical device: set EXPO_PUBLIC_API_URL to your PC's IP (e.g. 192.168.1.x:3033)
const defaultApiUrl =
  Platform.OS === "android" ? "http://10.0.2.2:3033" : "http://localhost:3033";
export const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? defaultApiUrl;

export const roomApi = createRoomApi(apiUrl);
