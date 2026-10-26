// src/domain/repositories/IChatRepository.ts

import { ChatMessage } from '../entities/ChatMessage';

export interface IChatRepository {
  sendMessage(message: string, history: ChatMessage[]): Promise<string>;
}