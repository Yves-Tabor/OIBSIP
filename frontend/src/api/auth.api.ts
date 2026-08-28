import api from '../utils/axios';
import { User } from '../types';

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  verifyEmail: (token: string) =>
    api.get(`/auth/verify-email/${token}`),
  
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string) =>
    api.post(`/auth/reset-password/${token}`, { password }),
  
  getCurrentUser: (): Promise<{ data: User }> =>
    api.get('/auth/me'),
};
