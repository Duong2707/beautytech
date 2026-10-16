import { IAuthRepository, AuthResponse } from '../../repositories/IAuthRepository';

export class LoginUseCase {
  constructor(private authRepo: IAuthRepository) {}

  async execute(email: string, password: string): Promise<AuthResponse> {
    if (!email || !password) {
      throw new Error('Vui lòng nhập email và password');
    }

    if (!email.includes('@')) {
      throw new Error('Email không hợp lệ');
    }

    if (password.length < 6) {
      throw new Error('Password phải có ít nhất 6 ký tự');
    }

    return this.authRepo.login({ email, password });
  }
}