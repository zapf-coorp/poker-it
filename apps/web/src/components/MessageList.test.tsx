/**
 * MessageList component tests.
 * Covers: renders nothing when empty, renders messages, close button removes message.
 * Per tasks.MD §2.7.9, configuration.MD §3 TDD mandate.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MessageProvider } from "../context/MessageContext";
import { MessageList } from "./MessageList";
import { useMessageContext } from "../context/MessageContext";

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MessageProvider>{children}</MessageProvider>;
}

function MessageAdder({ text, type }: { text: string; type?: "info" | "error" | "success" }) {
  const { addMessage } = useMessageContext();
  return (
    <button type="button" onClick={() => addMessage(text, type)}>
      Add
    </button>
  );
}

describe("MessageList", () => {
  it("renders nothing when there are no messages", () => {
    render(
      <Wrapper>
        <MessageList />
      </Wrapper>
    );
    expect(screen.queryByRole("region", { name: "Messages" })).not.toBeInTheDocument();
  });

  it("renders a message when one is added", async () => {
    const user = userEvent.setup();
    render(
      <Wrapper>
        <MessageAdder text="Hello world" />
        <MessageList />
      </Wrapper>
    );
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(screen.getByText("Hello world")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Messages" })).toBeInTheDocument();
  });

  it("renders multiple messages stacked", async () => {
    const user = userEvent.setup();
    render(
      <Wrapper>
        <MessageAdder text="First" />
        <MessageAdder text="Second" />
        <MessageList />
      </Wrapper>
    );
    const addButtons = screen.getAllByRole("button", { name: "Add" });
    await user.click(addButtons[0]);
    await user.click(addButtons[1]);
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });

  it("removes a message when close button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <Wrapper>
        <MessageAdder text="Dismiss me" />
        <MessageList />
      </Wrapper>
    );
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(screen.getByText("Dismiss me")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByText("Dismiss me")).not.toBeInTheDocument();
  });

  it("renders each message with a close button", async () => {
    const user = userEvent.setup();
    render(
      <Wrapper>
        <MessageAdder text="Message A" />
        <MessageAdder text="Message B" />
        <MessageList />
      </Wrapper>
    );
    const addButtons = screen.getAllByRole("button", { name: "Add" });
    await user.click(addButtons[0]);
    await user.click(addButtons[1]);
    expect(screen.getAllByRole("button", { name: "Close" })).toHaveLength(2);
  });
});
