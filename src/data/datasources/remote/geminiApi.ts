import { GoogleGenAI } from '@google/genai';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

if (!API_KEY) {
  console.warn('⚠️ Chưa cấu hình EXPO_PUBLIC_GEMINI_API_KEY trong file .env');
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const SYSTEM_PROMPT = `Bạn là chuyên gia tư vấn chăm sóc da của BeautyTech.
Hãy trả lời ngắn gọn, thân thiện, tập trung vào sản phẩm skincare.
Nếu câu hỏi không liên quan đến da hoặc mỹ phẩm, hãy lịch sự từ chối trả lời.`;

export type ChatMessage = {
  role: 'user' | 'model';
  text: string;
};

export const geminiApi = {
  async chat(message: string, history: ChatMessage[] = []): Promise<string> {
    const contents = [
      ...history.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
    });

    return response.text ?? '';
  },
};