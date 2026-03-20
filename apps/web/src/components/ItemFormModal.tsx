import { Input } from "./Input";
import { Button } from "./Button";
import { Modal } from "./Modal";

interface ItemFormModalProps {
  title: string;
  itemTitle: string;
  itemDesc: string;
  error?: string;
  onTitleChange: (value: string) => void;
  onDescChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const textareaStyles: React.CSSProperties = {
  width: "100%",
  padding: 12,
  borderRadius: 8,
  border: "2px solid var(--color-border)",
  background: "var(--color-surface)",
  color: "var(--color-text)",
  fontSize: "1rem",
};

export function ItemFormModal({
  title,
  itemTitle,
  itemDesc,
  error,
  onTitleChange,
  onDescChange,
  onSubmit,
  onCancel,
  isLoading,
}: ItemFormModalProps) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <Modal onClose={onCancel}>
      <form onSubmit={handleSubmit}>
        <h2 style={{ margin: "0 0 16px" }}>{title}</h2>
        <Input
          label="Title"
          value={itemTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Item title"
          error={error}
        />
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 4, fontSize: "0.9rem" }}>
            Description (optional)
          </label>
          <textarea
            value={itemDesc}
            onChange={(e) => onDescChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit();
              }
            }}
            placeholder="Description"
            rows={3}
            style={textareaStyles}
          />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="primary" type="submit" loading={isLoading}>
            Save
          </Button>
          <Button variant="secondary" type="button" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
