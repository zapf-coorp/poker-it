interface BadgeProps {
  status: "open" | "closed" | "voting" | "revealed";
}

export function Badge({ status }: BadgeProps) {
  const styles: Record<string, { bg: string; color: string }> = {
    open: { bg: "var(--color-primary)", color: "#fff" },
    closed: { bg: "var(--color-text-secondary)", color: "#fff" },
    voting: { bg: "var(--color-secondary)", color: "#1a1a1a" },
    revealed: { bg: "var(--color-primary)", color: "#fff" },
  };
  const s = styles[status] ?? styles.open;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 12px",
        borderRadius: 999,
        fontSize: "0.8rem",
        fontWeight: 600,
        background: s.bg,
        color: s.color,
      }}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
