import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  id?: string;
  wrapperStyle?: React.CSSProperties;
}

const selectStyles: React.CSSProperties = {
  width: "100%",
  minHeight: 44,
  padding: "12px 16px",
  fontSize: "1rem",
  border: "2px solid var(--color-border)",
  borderRadius: 8,
  background: "var(--color-surface)",
  color: "var(--color-text)",
};

export function Select({ label, id, wrapperStyle, children, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s/g, "-");
  return (
    <div style={{ marginBottom: 16, ...wrapperStyle }}>
      {label && (
        <label
          htmlFor={selectId}
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
      <select id={selectId} style={selectStyles} {...props}>
        {children}
      </select>
    </div>
  );
}
