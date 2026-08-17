import type { DisplayMessage } from "@/components/chat/ChatWindow";

interface MessageBubbleProps {
  message: DisplayMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex flex-col gap-1.5 ${isUser ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[75%] rounded-lg px-3.5 py-2.5 text-sm whitespace-pre-wrap ${
          isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
        }`}
      >
        {message.content}
      </div>
      {message.sources && message.sources.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {message.sources.map((source, i) => (
            <span
              key={i}
              className="rounded-full border border-citation/40 bg-citation/10 px-2 py-0.5 font-mono text-xs text-citation"
            >
              {source.filename} · p.{source.page}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
