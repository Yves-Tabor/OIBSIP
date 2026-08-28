import api from '../utils/axios';
import { Order } from '../types';

export const orderApi = {
  createRazorpayOrder: (data: { items: any[]; totalPrice: number }) =>
    api.post('/orders/create-razorpay-order', data),
  
  verifyPayment: (data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    items: any[];
    totalPrice: number;
  }) =>
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
