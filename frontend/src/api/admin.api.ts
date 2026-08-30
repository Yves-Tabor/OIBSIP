import api from '../utils/axios';

export interface Analytics {
  totalRevenue: number;
  totalOrders: number;
  ordersToday: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  revenueByDay: { date: string; revenue: number; orders: number }[];
  ordersByStatus: Record<string, number>;
  topItems: { name: string; count: number }[];
}

export const adminApi = {
  getAnalytics: (): Promise<{ data: Analytics }> => api.get('/admin/analytics'),
};
