import { User } from '../../domain/entities/User';

export type UserApiResponse = {
  _id: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  avatar?: string;
  token: string;
};

export function toUserDomain(data: UserApiResponse): User {
  return {
    id: data._id,
    email: data.email,
    fullName: data.fullName,
    phone: data.phone,
    role: (data.role as 'user' | 'admin') || 'user',
    avatar: data.avatar,
  };
}