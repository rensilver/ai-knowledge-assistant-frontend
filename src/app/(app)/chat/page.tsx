import { ChatWindow } from "@/components/chat/ChatWindow";

export default function ChatPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Chat</h1>
        <p className="text-sm text-muted-foreground">
          Ask questions answered from your documents.
        </p>
      </div>
      <ChatWindow endpoint="chat" badge="RAG" placeholder="Ask about your documents…" />
    </div>
  );
}
