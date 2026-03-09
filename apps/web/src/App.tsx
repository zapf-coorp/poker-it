import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/AppLayout";
import { Home } from "./pages/Home";
import { CreateRoom } from "./pages/CreateRoom";
import { JoinRoom } from "./pages/JoinRoom";
import { RoomLobby } from "./pages/RoomLobby";
import { Login } from "./pages/Login";
import { getStoredParticipant } from "./storage";

function RoomRoute() {
  const { id: roomId } = useParams<{ id: string }>();
  if (!roomId) return <Navigate to="/" replace />;
  const stored = getStoredParticipant(roomId);
  if (stored) {
    return <RoomLobby />;
  }
  return <JoinRoom />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <CreateRoom />
                </ProtectedRoute>
              }
            />
            <Route path="/room/:id" element={<RoomRoute />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

