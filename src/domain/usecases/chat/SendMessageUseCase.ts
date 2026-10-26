// src/domain/usecases/chat/SendMessageUseCase.ts

import { IChatRepository } from '../../repositories/IChatRepository';
import { ChatMessage } from '../../entities/ChatMessage';

export class SendMessageUseCase {
  constructor(private chatRepository: IChatRepository) {}

  async execute(message: string, history: ChatMessage[]): Promise<string> {
    // 1. Validate dữ liệu đầu vào
    if (!message || message.trim().length === 0) {
      throw new Error('Tin nhắn không được để trống');
    }

    // 2. Gọi Repository để lấy kết quả từ AI
    const cleanMessage = message.trim();
    return this.chatRepository.sendMessage(cleanMessage, history);
  }
}