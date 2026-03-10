import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type MessageType = "info" | "error" | "success";

export interface Message {
  id: string;
  text: string;
  type: MessageType;
}

interface MessageContextValue {
  messages: Message[];
  addMessage: (text: string, type?: MessageType) => string;
  removeMessage: (id: string) => void;
  clearMessages: () => void;
}

const MessageContext = createContext<MessageContextValue | null>(null);

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);

  const addMessage = useCallback((text: string, type: MessageType = "info") => {
    const id = crypto.randomUUID();
    setMessages((prev) => [...prev, { id, text, type }]);
    return id;
  }, []);

  const removeMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const value = useMemo(
    () => ({ messages, addMessage, removeMessage, clearMessages }),
    [messages, addMessage, removeMessage, clearMessages]
  );

  return (
    <MessageContext.Provider value={value}>{children}</MessageContext.Provider>
  );
}

export function useMessageContext(): MessageContextValue {
  const ctx = useContext(MessageContext);
  if (!ctx) {
    throw new Error("useMessageContext must be used within MessageProvider");
  }
  return ctx;
}
