// src/services/aiApi.ts

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

if (!API_KEY) {
  console.warn("⚠️ Chưa có EXPO_PUBLIC_GROQ_API_KEY trong file .env");
}

export const sendMessageToAI = async (
  prompt: string,
  history: { role: "user" | "assistant"; content: string }[] = []
) => {
  try {
    const messages = [
      {
        role: "system",
        content: "Bạn là BeautyTech AI - một chuyên gia tư vấn da liễu và làm đẹp thân thiện, chuyên nghiệp. Hãy trả lời ngắn gọn, dễ hiểu, và luôn khuyên người dùng tham khảo ý kiến bác sĩ nếu có vấn đề nghiêm trọng về da."
      },
      ...history,
      { role: "user", content: prompt }
    ];

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // 👇 ĐÃ ĐỔI SANG MODEL MỚI ĐƯỢC GROQ KHUYẾN NGHỊ
        model: 'openai/gpt-oss-120b', 
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024, // Tăng lên một chút vì model mới có thể cần nhiều token hơn
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("Chi tiết lỗi từ Groq:", errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "Xin lỗi, mình chưa có câu trả lời.";
    
  } catch (error) {
    console.error("Lỗi gọi Groq API:", error);
    throw new Error("Không thể kết nối với AI lúc này.");
  }
};