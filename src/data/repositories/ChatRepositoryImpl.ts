// src/data/repositories/ChatRepositoryImpl.ts

import { IChatRepository } from '../../domain/repositories/IChatRepository';
import { ChatMessage } from '../../domain/entities/ChatMessage';
import { geminiApi } from '../datasources/remote/geminiApi';

export class ChatRepositoryImpl implements IChatRepository {
  async sendMessage(message: string, history: ChatMessage[]): Promise<string> {
    // Gọi trực tiếp tới API Gemini đã viết ở Ngày 7
    return await geminiApi.chat(message, history);
  }
}