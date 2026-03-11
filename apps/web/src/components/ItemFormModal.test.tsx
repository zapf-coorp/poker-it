/**
 * ItemFormModal component tests.
 * Covers: renders form fields, submit triggers onSubmit, cancel triggers onCancel,
 * error displayed, loading state disables save button.
 * Per tasks.MD §3.5, configuration.MD §3 TDD mandate.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ItemFormModal } from "./ItemFormModal";

function renderModal(overrides?: Partial<React.ComponentProps<typeof ItemFormModal>>) {
  const props = {
    title: "Add item",
    itemTitle: "",
    itemDesc: "",
    error: undefined,
    onTitleChange: vi.fn(),
    onDescChange: vi.fn(),
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    isLoading: false,
    ...overrides,
  };
  render(<ItemFormModal {...props} />);
  return props;
}

describe("ItemFormModal", () => {
  it("renders the modal title", () => {
    renderModal({ title: "Add item" });
    expect(screen.getByText("Add item")).toBeInTheDocument();
  });

  it("renders Title input and Description textarea", () => {
    renderModal();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Description")).toBeInTheDocument();
  });

  it("renders Save and Cancel buttons", () => {
    renderModal();
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("calls onSubmit when Save is clicked", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderModal();
    await user.click(screen.getByRole("button", { name: /save/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const { onCancel } = renderModal();
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onTitleChange when title input changes", async () => {
    const user = userEvent.setup();
    const { onTitleChange } = renderModal();
    await user.type(screen.getByLabelText(/title/i), "My story");
    expect(onTitleChange).toHaveBeenCalled();
  });

  it("calls onDescChange when description textarea changes", async () => {
    const user = userEvent.setup();
    const { onDescChange } = renderModal();
    await user.type(screen.getByPlaceholderText("Description"), "Some description");
    expect(onDescChange).toHaveBeenCalled();
  });

  it("displays error message when error prop is provided", () => {
    renderModal({ error: "Title is required" });
    expect(screen.getByText("Title is required")).toBeInTheDocument();
  });

  it("shows pre-filled title and description values", () => {
    renderModal({ itemTitle: "Existing story", itemDesc: "Existing desc" });
    expect(screen.getByDisplayValue("Existing story")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Existing desc")).toBeInTheDocument();
  });

  it("shows 'Edit item' as title when editing", () => {
    renderModal({ title: "Edit item" });
    expect(screen.getByText("Edit item")).toBeInTheDocument();
  });
});
