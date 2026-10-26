// src/domain/entities/ChatMessage.ts

export type MessageRole = 'user' | 'model';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
}