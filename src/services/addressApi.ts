// src/services/addressApi.ts

// ⚠️ SỬA LẠI ĐƯỜNG DẪN NÀY CHO ĐÚNG VỚI BACKEND CỦA BẠN
// Nếu chạy trên máy ảo Android, localhost sẽ là 10.0.2.2
const API_URL = "http://localhost:5000/api/addresses"; 

const getHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export const fetchAddresses = async (token: string) => {
  const res = await fetch(API_URL, { headers: getHeaders(token) });
  if (!res.ok) throw new Error("Lỗi khi tải địa chỉ");
  return res.json();
};

export const createAddress = async (token: string, data: any) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Lỗi khi thêm địa chỉ");
  return res.json();
};

export const updateAddress = async (token: string, id: string, data: any) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Lỗi khi sửa địa chỉ");
  return res.json();
};

export const deleteAddress = async (token: string, id: string) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error("Lỗi khi xóa địa chỉ");
  return res.json();
};