import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "destructive";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

export function Button({
  variant = "primary",
  loading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      data-variant={variant}
      style={{
        minHeight: 44,
        padding: "12px 24px",
        borderRadius: 8,
        border: "none",
        fontSize: "1rem",
        fontWeight: 600,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.7 : 1,
        ...(variant === "primary" && {
          background: "var(--color-primary)",
          color: "var(--color-primary-text)",
        }),
        ...(variant === "secondary" && {
          background: "transparent",
          color: "var(--color-primary)",
          border: "2px solid var(--color-primary)",
        }),
        ...(variant === "destructive" && {
          background: "var(--color-error)",
          color: "#fff",
        }),
      }}
      {...props}
    >
      {loading ? "..." : children}
    </button>
  );
}
