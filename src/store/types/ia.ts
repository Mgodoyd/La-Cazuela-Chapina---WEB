export interface VoiceChatMessage {
  type: 'audio' | 'text' | 'system';
  content: string | ArrayBuffer;
  timestamp: number;
  sender: 'user' | 'ai';
}

export interface VoiceChatState {
  isRecording: boolean;
  isPlaying: boolean;
  messages: VoiceChatMessage[];
  error: string | null;
}
