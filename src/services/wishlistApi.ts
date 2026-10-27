import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = "http://localhost:5000/api/wishlist";

export const toggleWishlistApi = async (token: string, productId: string) => {
  try {
    const res = await fetch(`${API_URL}/toggle`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ productId }),
    });
    
    // Nếu Backend báo lỗi 404 (chưa code xong), hàm catch bên dưới sẽ bắt
    if (!res.ok) throw new Error("API chưa sẵn sàng");
    return await res.json();
    
  } catch (error) {
    // Lỗi cũng không sao, vì máy đã lưu rồi (do Context lo)
    console.log("Backend chưa có API hoặc lỗi mạng, nhưng UI đã được lưu local.");
    return { success: false };
  }
};