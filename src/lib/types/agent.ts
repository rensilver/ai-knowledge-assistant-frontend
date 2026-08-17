// /agent shares the exact same request/response shape as /chat (see CLAUDE.md §4.3).
export type {
  ChatRequest as AgentRequest,
  ChatResponse as AgentResponse,
  ChatSource as AgentSource,
} from "@/lib/types/chat";
