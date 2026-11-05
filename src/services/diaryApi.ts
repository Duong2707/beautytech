import api from '../data/datasources/remote/api';

// Lưu ý: Không cần truyền token vào nữa, Axios đã tự động gắn token ngầm định

export const fetchDiariesApi = async () => {
  try {
    const res = await api.get('/api/skin-diary');
    return res.data;
  } catch (error) {
    console.error("Lỗi lấy danh sách nhật ký:", error);
    throw error;
  }
};

export const createDiaryApi = async (diaryData: any) => {
  try {
    const res = await api.post('/api/skin-diary', diaryData);
    return res.data;
  } catch (error) {
    console.error("Lỗi thêm nhật ký:", error);
    throw error;
  }
};

export const deleteDiaryApi = async (id: string) => {
  try {
    const res = await api.delete(`/api/skin-diary/${id}`);
    return res.data;
  } catch (error) {
    console.error("Lỗi xóa nhật ký:", error);
    throw error;
  }
};

export const clearDiaryApi = async () => {
  try {
    const res = await api.delete('/api/skin-diary/clear');
    return res.data;
  } catch (error) {
    console.error("Lỗi xóa toàn bộ nhật ký:", error);
    throw error;
  }
};