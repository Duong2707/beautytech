const API_URL = "http://localhost:5000/api/notifications";

// Dữ liệu mẫu để test
const MOCK_NOTIFICATIONS = [
  { 
    _id: '1', 
    title: 'Tặng bạn mã BEAUTY50', 
    content: 'Nhập mã BEAUTY50 để được giảm ngay 50.000đ cho đơn từ 200k. Bấm vào đây để dùng ngay!', 
    type: 'promo', 
    voucherCode: 'BEAUTY50', 
    isRead: false, 
    createdAt: new Date().toISOString() 
  },
  { 
    _id: '2', 
    title: 'Chào mừng bạn mới', 
    content: 'Nhập mã NEWBIE20 giảm 20.000đ cho mọi đơn hàng. Bấm vào đây để dùng ngay!', 
    type: 'promo', 
    voucherCode: 'NEWBIE20', 
    isRead: false, 
    createdAt: new Date().toISOString() 
  },
  { 
    _id: '3', 
    title: 'Bảo trì hệ thống', 
    content: 'Hệ thống sẽ bảo trì vào 12h đêm nay. Mong bạn thông cảm.', 
    type: 'system', 
    voucherCode: null, 
    isRead: true, 
    createdAt: new Date().toISOString() 
  },
];

export const fetchNotifications = async () => {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Lỗi khi gọi API");
    
    const data = await res.json();
    
    // Nếu Backend trả về mảng rỗng (chưa có data), tự động trả về Mock Data để test
    if (data.length === 0) {
      return MOCK_NOTIFICATIONS;
    }
    return data;
  } catch (error) {
    console.log("Không kết nối được Backend, dùng Mock Data:", error);
    // Nếu Backend chưa chạy, trả về Mock Data luôn
    return MOCK_NOTIFICATIONS;
  }
};