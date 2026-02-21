import { Link } from "react-router-dom";
import { Card } from "../components/Card";
import { Button } from "../components/Button";

export function Home() {
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: 8 }}>Poker Plan It</h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: 24 }}>
        Planning Poker for agile teams.
      </p>
      <Card>
        <Link to="/create" style={{ textDecoration: "none" }}>
          <Button variant="primary" style={{ width: "100%" }}>
            Create a room
          </Button>
        </Link>
        <p style={{ marginTop: 16, color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>
          Or join via a shared link.
        </p>
      </Card>
    </div>
  );
}
