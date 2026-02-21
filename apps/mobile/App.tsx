import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, createNavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Linking from "expo-linking";
import { HomeScreen } from "./src/screens/HomeScreen";
import { CreateRoomScreen } from "./src/screens/CreateRoomScreen";
import { JoinRoomScreen } from "./src/screens/JoinRoomScreen";
import { RoomLobbyScreen } from "./src/screens/RoomLobbyScreen";
import { getStoredParticipant } from "./src/storage";

export type RootStackParamList = {
  Home: undefined;
  CreateRoom: undefined;
  JoinRoom: { roomId: string };
  RoomLobby: { roomId: string; participantId: string; isFacilitator: boolean };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();

function parseRoomId(url: string): string | null {
  const match = url.match(/\/room\/([^/?#]+)/);
  return match?.[1] ?? null;
}

function useDeepLinks() {
  useEffect(() => {
    const handleUrl = async (url: string) => {
      const roomId = parseRoomId(url);
      if (!roomId || !navigationRef.isReady()) return;
      const stored = await getStoredParticipant(roomId);
      if (stored) {
        navigationRef.reset({
          index: 0,
          routes: [
            { name: "Home", params: undefined },
            {
              name: "RoomLobby",
              params: {
                roomId,
                participantId: stored.participantId,
                isFacilitator: stored.isFacilitator,
              },
            },
          ],
        });
      } else {
        navigationRef.reset({
          index: 0,
          routes: [
            { name: "Home", params: undefined },
            { name: "JoinRoom", params: { roomId } },
          ],
        });
      }
    };
    Linking.getInitialURL().then((url: string | null) => url && handleUrl(url));
    const sub = Linking.addEventListener("url", (e: { url: string }) => handleUrl(e.url));
    return () => sub.remove();
  }, []);
}

export default function App() {
  useDeepLinks();
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CreateRoom" component={CreateRoomScreen} />
        <Stack.Screen name="JoinRoom" component={JoinRoomScreen} />
        <Stack.Screen name="RoomLobby" component={RoomLobbyScreen} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
