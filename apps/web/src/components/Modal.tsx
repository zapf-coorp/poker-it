import type { ReactNode } from "react";
import { Card } from "./Card";

const overlayStyles: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: 24,
};

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
  maxWidth?: number;
}

export function Modal({ children, onClose, maxWidth = 400 }: ModalProps) {
  return (
    <div style={overlayStyles} onClick={onClose}>
      <Card
        style={{ maxWidth, width: "100%" }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </Card>
    </div>
  );
}
