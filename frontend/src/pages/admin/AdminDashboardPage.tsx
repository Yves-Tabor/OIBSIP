import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, ClipboardList, Package } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { adminApi, Analytics } from '../../api/admin.api';
import { useAppSelector } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { AdminNewOrderEvent } from '../../types';

const money = (value: number) => `$${Number(value || 0).toFixed(2)}`;

const AdminDashboardPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const socket = useSocket(user?.id, true);

  useEffect(() => {
    const load = () => adminApi.getAnalytics().then((response) => setAnalytics(response.data)).catch((error) => console.error('Failed to load analytics:', error));
    load();
    const timer = window.setInterval(load, 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleNewOrder = (order: AdminNewOrderEvent) => {
      setToast(`New order from ${order.userName || 'Customer'} - ${money(order.totalPrice)}`);
      window.setTimeout(() => setToast(null), 4000);
    };
    socket.on('admin:new-order', handleNewOrder);
    socket.off('admin:new-order', handleNewOrder);
    return undefined;
  }, [socket]);

  const stats = [
    ['Total Revenue', money(analytics?.totalRevenue || 0)],
    ["Today's Revenue", money(analytics?.revenueToday || 0)],
    ['Total Orders', analytics?.totalOrders ?? 0],
    ['Orders Today', analytics?.ordersToday ?? 0],
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 animate-fade-in">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div><h1 className="font-heading text-3xl font-bold text-brand-choco-dark">Admin Dashboard</h1><p className="mt-1 text-sm text-brand-text-secondary">Financial progress and order health</p></div>
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/admin/orders" className="inline-flex items-center gap-2 rounded-sm bg-brand-orange px-4 py-2 text-sm font-semibold text-white"><ClipboardList size={17} /> Orders</Link>
          <Link to="/admin/inventory" className="inline-flex items-center gap-2 rounded-sm border border-brand-choco px-4 py-2 text-sm font-semibold text-brand-choco hover:bg-brand-cream"><Package size={17} /> Manage Store</Link>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{stats.map(([label, value]) => <div key={label} className="rounded-md border border-brand-border bg-brand-surface p-5"><p className="text-sm text-brand-text-secondary">{label}</p><p className="mt-2 font-heading text-2xl font-bold text-brand-choco-dark">{value}</p></div>)}</div>
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="rounded-md border border-brand-border bg-brand-surface p-5 lg:col-span-2"><div className="mb-4 flex items-center gap-2"><BarChart2 size={19} className="text-brand-orange" /><h2 className="font-heading text-xl font-semibold text-brand-choco-dark">Revenue, last 7 days</h2></div><div className="h-72">{analytics && <ResponsiveContainer width="100%" height="100%"><BarChart data={analytics.revenueByDay}><CartesianGrid strokeDasharray="3 3" stroke="#E8E2D9" /><XAxis dataKey="date" tickFormatter={(date) => new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short' })} /><YAxis tickFormatter={(value) => `$${value}`} /><Tooltip formatter={(value) => money(Number(value))} /><Bar dataKey="revenue" fill="#E8722A" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer>}</div></section>
        <section className="rounded-md border border-brand-border bg-brand-surface p-5"><h2 className="font-heading text-xl font-semibold text-brand-choco-dark">Orders by status</h2><div className="mt-5 space-y-4">{['Order Received', 'In Kitchen', 'Sent to Delivery'].map((status) => <div key={status}><div className="flex justify-between text-sm"><span className="text-brand-text-secondary">{status}</span><strong className="text-brand-choco-dark">{analytics?.ordersByStatus[status] ?? 0}</strong></div><div className="mt-1 h-2 rounded bg-brand-border"><div className="h-2 rounded bg-brand-orange" style={{ width: `${Math.min(100, ((analytics?.ordersByStatus[status] || 0) / Math.max(1, analytics?.totalOrders || 1)) * 100)}%` }} /></div></div>)}</div></section>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2"><section className="rounded-md border border-brand-border bg-brand-surface p-5"><h2 className="font-heading text-xl font-semibold text-brand-choco-dark">Top ingredients</h2><div className="mt-4 space-y-3">{analytics?.topItems.map((item, index) => <div key={item.name} className="flex items-center justify-between border-b border-brand-border pb-2 text-sm last:border-0"><span className="text-brand-text-secondary">{index + 1}. {item.name}</span><strong className="text-brand-choco-dark">{item.count}</strong></div>)}</div></section><section className="rounded-md border border-brand-border bg-brand-surface p-5"><div className="flex items-center gap-2"><Package size={19} className="text-brand-orange" /><h2 className="font-heading text-xl font-semibold text-brand-choco-dark">Period revenue</h2></div><div className="mt-4 grid grid-cols-2 gap-4 text-sm"><div><p className="text-brand-text-secondary">Last 7 days</p><strong className="text-brand-choco-dark">{money(analytics?.revenueThisWeek || 0)}</strong></div><div><p className="text-brand-text-secondary">This month</p><strong className="text-brand-choco-dark">{money(analytics?.revenueThisMonth || 0)}</strong></div></div></section></div>
      {toast && <div className="fixed bottom-6 right-6 z-50 rounded-md bg-brand-choco px-4 py-3 text-sm text-white shadow-xl animate-slide-in-right" role="status">{toast}</div>}
    </div>
  );
};

export default AdminDashboardPage;
