import { apiFetch } from "@/lib/api/client";
import type { AgentRequest, AgentResponse } from "@/lib/types/agent";

export function askAgent(request: AgentRequest): Promise<AgentResponse> {
  return apiFetch<AgentResponse>("/agent", {
    method: "POST",
    body: JSON.stringify(request),
  });
}
