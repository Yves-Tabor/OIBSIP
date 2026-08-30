import { Request, Response } from 'express';
import Order from '../models/Order';

export const getAnalytics = async (_req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startWeek = new Date(startToday);
    startWeek.setDate(startWeek.getDate() - 6);
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const orders = await Order.find({}, 'totalPrice createdAt status items').lean();
    const revenue = (list: typeof orders) => list.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);
    const inRange = (start: Date) => orders.filter((order) => new Date(order.createdAt) >= start);
    const todayOrders = inRange(startToday);
    const weekOrders = inRange(startWeek);
    const monthOrders = inRange(startMonth);
    const revenueByDay = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(startWeek);
      date.setDate(startWeek.getDate() + index);
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      const dayOrders = orders.filter((order) => {
        const createdAt = new Date(order.createdAt);
        return createdAt >= date && createdAt < nextDate;
      });
      return { date: date.toISOString().slice(0, 10), revenue: revenue(dayOrders), orders: dayOrders.length };
    });
    const statuses = ['Order Received', 'In Kitchen', 'Sent to Delivery'] as const;
    const ordersByStatus = statuses.reduce((result, status) => {
      result[status] = orders.filter((order) => order.status === status).length;
      return result;
    }, {} as Record<(typeof statuses)[number], number>);
    const itemCounts = new Map<string, number>();
    orders.forEach((order) => order.items.forEach((item) => {
      [item.base, item.sauce, item.cheese, ...(item.vegetables || [])].forEach((name) => {
        if (name) itemCounts.set(name, (itemCounts.get(name) || 0) + Number((item as { quantity?: number }).quantity || 1));
      });
    }));
    res.json({
      totalRevenue: revenue(orders), totalOrders: orders.length, ordersToday: todayOrders.length,
      revenueToday: revenue(todayOrders), revenueThisWeek: revenue(weekOrders), revenueThisMonth: revenue(monthOrders),
      revenueByDay, ordersByStatus,
      topItems: [...itemCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count })),
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
};
