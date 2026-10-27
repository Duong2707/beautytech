export interface User {
  _id?: string;
  email: string;
  fullName?: string;
  phone?: string;
  address?: string; // <-- Thêm dòng này
  role?: 'user' | 'admin';
  avatar?: string;
  token?: string;
}