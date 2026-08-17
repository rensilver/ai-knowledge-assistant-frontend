import { ChatWindow } from "@/components/chat/ChatWindow";

export default function AgentPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Agent</h1>
        <p className="text-sm text-muted-foreground">
          Tool-calling agent — can take longer and may reach beyond your documents.
        </p>
      </div>
      <ChatWindow
        endpoint="agent"
        badge="Agent (tool-calling)"
        placeholder="Ask the agent…"
      />
    </div>
  );
}
