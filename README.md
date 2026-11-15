# BeautyTech - Ứng dụng Thương mại điện tử Mỹ phẩm tích hợp AI

**BeautyTech** là một ứng dụng đa nền tảng (Cross-platform Mobile App) phục vụ mua sắm mỹ phẩm và chăm sóc da, được tích hợp Trí tuệ Nhân tạo (AI) và Kiến trúc Offline-First. Đây là Đồ án Tốt nghiệp (Capstone Project).

## 🌟 Điểm nhấn kỹ thuật nổi bật
- **AI On-device (TensorFlow Lite):** Phân tích tình trạng da (Mụn/Da thường) trực tiếp trên thiết bị thông qua camera. Độ trễ cực thấp (~85ms), bảo mật tuyệt đối dữ liệu khuôn mặt (không gửi lên server).
- **Kiến trúc Offline-First (SQLite):** Cho phép người dùng thao tác thêm giỏ hàng, đặt hàng, xem sản phẩm ngay cả khi mất mạng. Tự động đồng bộ (Sync Queue) và xử lý xung đột dữ liệu (Conflict Resolution) khi có mạng trở lại.
- **Thanh toán tự động:** Tích hợp cổng thanh toán chuyển khoản VietQR và tự động xác nhận qua Webhook SePay.
- **Chatbot AI:** Tư vấn da liễu thông qua Groq API (Llama 3).
- **Kiểm thử tự động (Automated Testing):** 60/60 Test Cases (Jest) pass 100% các luồng nghiệp vụ từ cơ bản đến nâng cao.

## 🚀 Công nghệ sử dụng
- **Ngôn ngữ:** TypeScript
- **Framework:** React Native (Expo Router)
- **Local Storage:** SQLite (Offline-First)
- **AI/ML:** TensorFlow Lite, Google ML Kit
- **Testing:** Jest
- **Authentication:** Firebase Auth (Google), JWT (Facebook/Email)

## ⚙️ Hướng dẫn cài đặt và chạy Frontend

1. **Cài đặt các gói phụ thuộc:**
```bash
npm install
1. **Cấu hình biến môi trường:**
- Tạo file .env ở thư mục gốc và thêm API Key (nếu có):
``` env:
EXPO_PUBLIC_GROQ_API_KEY=your_groq_api_key_here

3. **Khởi động ứng dụng:**
``` bash
npx expo start -c

- Quét mã QR bằng ứng dụng Expo Go (trên Android/iOS) hoặc chạy trên máy ảo.

4. **Chạy kiểm thử tự động (60 Test Cases):**
``` bash
npm test

**🔑 Tài khoản Test (Dành cho Giảng viên/Hội đồng)**
**Tài khoản Admin:*
Email: admin
Mật khẩu: 123456

**Tài khoản Khách hàng:*
Email: test@gmail.com
Mật khẩu: 123456

**📁 Cấu trúc thư mục**
src/app/: Chứa các màn hình (Screens) của ứng dụng (Expo Router).
src/presentation/: Chứa Contexts, Components, Hooks.
src/services/: Chứa logic gọi API, AI, Offline Sync.
src/data/: Chứa cấu hình Axios, SQLite.
src/__tests__/: Chứa 60 kịch bản kiểm thử tự động.

**Phát triển bởi:**
- Đỗ Thảo Dương - 23IT.B034
- Ngô Võ Phương Hiền - 23IT.B052