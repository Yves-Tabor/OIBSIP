import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useAuth';
import { getOrderById } from '../features/order/orderSlice';
import { useSocket } from '../hooks/useSocket';

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentOrder, isLoading } = useAppSelector((state) => state.order);
  const { user } = useAppSelector((state) => state.auth);

  useSocket(user?.id);
  useEffect(() => { if (id) dispatch(getOrderById(id)); }, [id, dispatch]);

  if (isLoading) return <div className="mx-auto max-w-4xl px-4 py-12 text-center text-brand-text-muted">Loading order...</div>;
  if (!currentOrder) return <div className="mx-auto max-w-4xl px-4 py-12 text-center text-brand-text-muted">Order not found</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8 animate-fade-in">
      <Link to="/orders" className="mb-6 inline-flex items-center gap-2 text-sm text-brand-orange hover:text-brand-choco"><ArrowLeft size={16} /> Back to Orders</Link>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div><h1 className="font-heading text-3xl font-bold text-brand-choco-dark">Order #{currentOrder._id.slice(-6)}</h1><p className="mt-1 text-sm text-brand-text-secondary">{new Date(currentOrder.createdAt).toLocaleString()}</p></div>
        <span className="rounded bg-brand-orange-pale px-3 py-1 text-sm font-medium text-brand-choco">{currentOrder.status}</span>
      </div>
      <div className="space-y-4 rounded-md border border-brand-border bg-brand-surface p-6">
        {(currentOrder.items || []).map((item, index) => (
          <div key={index} className="border-b border-brand-border pb-4 last:border-0">
            <div className="flex justify-between gap-4"><h2 className="font-medium text-brand-choco-dark">Pizza {index + 1}</h2><span className="text-sm text-brand-text-secondary">Qty: {item.quantity ?? 1}</span></div>
            <p className="mt-2 text-sm text-brand-text-secondary">Base: {item.base} · Sauce: {item.sauce} · Cheese: {item.cheese}</p>
            <p className="text-sm text-brand-text-secondary">Vegetables: {item.vegetables?.join(', ') || 'None'}</p>
          </div>
        ))}
        <div className="flex justify-between border-t border-brand-border pt-4 font-heading text-lg font-bold text-brand-choco-dark"><span>Total</span><span>${(currentOrder.totalPrice ?? 0).toFixed(2)}</span></div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
