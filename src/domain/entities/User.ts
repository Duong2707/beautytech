export type User = {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'admin';
};