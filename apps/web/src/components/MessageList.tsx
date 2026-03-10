import { useMessageContext } from "../context/MessageContext";
import type { MessageType } from "../context/MessageContext";

const typeStyles: Record<MessageType, React.CSSProperties> = {
  info: {
    background: "var(--color-surface)",
    borderLeft: "1px solid var(--color-primary)",
    borderBottom: "1px solid var(--color-primary)"
  },
  error: {
    background: "var(--color-surface)",
    borderLeft: "1px solid var(--color-error)",
    borderBottom: "1px solid var(--color-error)"
  },
  success: {
    background: "var(--color-surface)",
    borderLeft: "1px solid var(--color-primary)",
    borderBottom: "1px solid var(--color-primary)"
  },
};

export function MessageList() {
  const { messages, removeMessage } = useMessageContext();

  if (messages.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Messages"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 12,
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      {messages.map((m) => (
        <div
          key={m.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "4px 12px",
            borderRadius: 8,
            border: "1px solid var(--color-border)",
            boxShadow: "rgba(0, 0, 0, 0.1) 4px -4px 4px",
            fontSize: "0.9rem",
            ...typeStyles[m.type],
          }}
        >
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
            {m.text}
          </span>
          <button
            type="button"
            onClick={() => removeMessage(m.id)}
            aria-label="Close"
            style={{
              flexShrink: 0,
              width: 28,
              height: 28,
              padding: 0,
              border: "none",
              borderRadius: 6,
              background: "transparent",
              color: "var(--color-text-secondary)",
              cursor: "pointer",
              fontSize: "1.1rem",
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
