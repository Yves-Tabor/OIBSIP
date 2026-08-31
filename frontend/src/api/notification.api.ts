import api from '../utils/axios';

export interface Notification {
  _id: string;
  message: string;
  type: 'order-status' | 'inventory' | 'order';
  link?: string;
  read: boolean;
  createdAt: string;
}

export const notificationApi = {
  getMy: (): Promise<{ data: Notification[] }> => api.get('/notifications/my'),
  markAllRead: (): Promise<{ data: { message: string } }> => api.patch('/notifications/read-all'),
  deleteAll: (): Promise<{ data: { success: boolean; deleted: number } }> => api.delete('/notifications/delete-all'),
};
