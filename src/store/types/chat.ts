export interface ChatMessage {
  id: number;
  message: string;
  isBot: boolean;
  timestamp: Date;
}

export interface AIStreamResponse {
  content: string;
  done: boolean;
}

export interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  currentStreamingMessage: string;
}
