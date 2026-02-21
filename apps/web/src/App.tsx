import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Home } from "./pages/Home";
import { CreateRoom } from "./pages/CreateRoom";
import { JoinRoom } from "./pages/JoinRoom";
import { RoomLobby } from "./pages/RoomLobby";
import { getStoredParticipant } from "./storage";

function RoomRoute() {
  const roomId = window.location.pathname.match(/^\/room\/([^/]+)/)?.[1];
  if (!roomId) return <Navigate to="/" replace />;
  const stored = getStoredParticipant(roomId);
  if (stored) {
    return <RoomLobby />;
  }
  return <JoinRoom />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateRoom />} />
        <Route path="/room/:id" element={<RoomRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

