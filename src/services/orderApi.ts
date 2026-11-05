// src/services/orderApi.ts
import api from '../data/datasources/remote/api';

// Lưu ý: Không cần truyền token nữa, Axios đã tự động gắn token ngầm định

export const createOrderApi = async (orderData: any) => {
  try {
    const res = await api.post('/api/orders', orderData);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Lỗi khi tạo đơn hàng");
  }
};

export const fetchOrdersApi = async () => {
  try {
    const res = await api.get('/api/orders');
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Lỗi khi lấy danh sách đơn hàng");
  }
};

export const updateOrderStatusApi = async (orderId: string, status: string) => {
  try {
    const res = await api.put(`/api/orders/${orderId}/status`, { status });
    return res.data;
  } catch (error: any) {
    throw new Error("Lỗi cập nhật trạng thái");
  }
};

export const submitReviewApi = async (orderId: string, rating: number, comment: string) => {
  try {
    const res = await api.put(`/api/orders/${orderId}/review`, { rating, comment });
    return res.data;
  } catch (error: any) {
    throw new Error("Lỗi gửi đánh giá");
  }
};

export const cancelOrderApi = async (orderId: string) => {
  try {
    const res = await api.put(`/api/orders/${orderId}/cancel`);
    return res.data;
  } catch (error: any) {
    throw new Error("Lỗi hủy đơn hàng");
  }
};