export interface ChatSource {
  filename: string;
  page: number;
}

export interface ChatRequest {
  message: string;
  conversationId: string | null;
}

export interface ChatResponse {
  answer: string;
  conversationId: string;
  sources: ChatSource[];
}
