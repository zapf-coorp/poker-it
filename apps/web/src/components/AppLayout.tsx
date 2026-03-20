import { Link, Outlet } from "react-router-dom";
import { Button } from "./Button";
import { useAuthContext } from "../context/AuthContext";

const headerStyles: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 10,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "8px 24px",
  height: "60px",
  borderBottom: "1px solid var(--color-border)",
  background: "var(--color-surface)",
};

export function AppLayout() {
  const { isAuthenticated, user, logout } = useAuthContext();

  return (
    <>
      <header style={headerStyles}>
        <Link to="/" style={{ textDecoration: "none", color: "var(--color-text)", fontWeight: 600 }}>
          Poker Plan It
        </Link>
        {isAuthenticated && user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)" }}>
              {user.name}
            </span>
            <Button variant="secondary" onClick={logout} type="button">
              Log out
            </Button>
          </div>
        ) : (
          <Link to="/login" style={{ textDecoration: "none" }}>
            <Button variant="secondary" type="button">
              Log in
            </Button>
          </Link>
        )}
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
