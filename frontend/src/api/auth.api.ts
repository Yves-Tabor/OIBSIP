import api from '../utils/axios';
import { User } from '../types';

interface MessageResponse {
  message: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

interface EmptyResponse { message: string; }

export const authApi = {
  register: (data: { name: string; email: string; password: string }): Promise<{ data: MessageResponse }> =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }): Promise<{ data: LoginResponse }> =>
    api.post('/auth/login', data),
  
  verifyEmail: (token: string): Promise<{ data: EmptyResponse }> =>
    api.get(`/auth/verify-email/${token}`),
  
  forgotPassword: (email: string): Promise<{ data: MessageResponse }> =>
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string): Promise<{ data: MessageResponse }> =>
    api.post(`/auth/reset-password/${token}`, { password }),
  
  getCurrentUser: (): Promise<{ data: User }> =>
    api.get('/auth/me'),
};
