import api from '../utils/axios';
import { Order } from '../types';

export const orderApi = {
  initializePayment: (data: { items: any[]; totalPrice: number }): Promise<{ data: { txRef: string; transactionId: string } }> =>
    api.post('/orders/initialize-payment', data),
  
  verifyPayment: (data: {
    transactionId: string;
    txRef: string;
    items: any[];
    totalPrice: number;
  }): Promise<{ data: { message: string; order: Order } }> =>
    api.post('/orders/verify-payment', data),
  
  getMyOrders: (): Promise<{ data: Order[] }> =>
    api.get('/orders/my-orders'),
  
  getOrderById: (id: string): Promise<{ data: Order }> =>
    api.get(`/orders/${id}`),
  
  getAllOrders: (): Promise<{ data: Order[] }> =>
    api.get('/orders/admin/all'),
  
  updateOrderStatus: (id: string, status: string): Promise<{ data: Order }> =>
    api.patch(`/orders/${id}/status`, { status }),
};
