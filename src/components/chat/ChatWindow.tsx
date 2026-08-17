"use client";

import { useEffect, useRef, useState } from "react";
import { askChat } from "@/lib/api/chat";
import { askAgent } from "@/lib/api/agent";
import type { ChatSource } from "@/lib/types/chat";
import { ApiError } from "@/lib/api/client";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatInput } from "@/components/chat/ChatInput";

export interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
}

interface ChatWindowProps {
  endpoint: "chat" | "agent";
  badge: string;
  placeholder: string;
}

export function ChatWindow({ endpoint, badge, placeholder }: ChatWindowProps) {
  const sendMessage = endpoint === "chat" ? askChat : askAgent;
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(text: string) {
    const userMessage: DisplayMessage = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setError(null);
    setIsSending(true);
    try {
      const response = await sendMessage({ message: text, conversationId });
      setConversationId(response.conversationId);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: response.answer,
          sources: response.sources,
        },
      ]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="font-mono text-xs text-muted-foreground uppercase">{badge}</span>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">Ask a question to get started.</p>
        )}
        <div className="flex flex-col gap-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </div>
        <div ref={bottomRef} />
      </div>
      {error && <p className="px-4 pb-2 text-sm text-destructive">{error}</p>}
      <ChatInput onSend={handleSend} disabled={isSending} placeholder={placeholder} />
    </div>
  );
}
