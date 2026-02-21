import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s/g, "-");
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            display: "block",
            marginBottom: 4,
            fontSize: "0.9rem",
            fontWeight: 500,
            color: "var(--color-text)",
          }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        style={{
          width: "100%",
          minHeight: 44,
          padding: "12px 16px",
          fontSize: "1rem",
          border: `2px solid ${error ? "var(--color-error)" : "var(--color-border)"}`,
          borderRadius: 8,
          background: "var(--color-surface)",
          color: "var(--color-text)",
        }}
        {...props}
      />
      {error && (
        <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--color-error)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
