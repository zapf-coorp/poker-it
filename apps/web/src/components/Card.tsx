import type { HTMLAttributes } from "react";

export function Card({ children, style, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        borderRadius: 12,
        padding: 16,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        border: "1px solid var(--color-border)",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
