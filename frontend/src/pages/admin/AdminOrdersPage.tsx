import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAuth';
import { orderApi } from '../../api/order.api';
import { updateOrderStatus } from '../../features/order/orderSlice';
import { useSocket } from '../../hooks/useSocket';

const AdminOrdersPage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useSocket(user?.id, true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const response = await orderApi.getAllOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await dispatch(updateOrderStatus({ id: orderId, status: newStatus }));
      loadOrders();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Order Received':
        return 'bg-brand-orange-pale text-brand-choco';
      case 'In Kitchen':
        return 'bg-yellow-100 text-yellow-800';
      case 'Sent to Delivery':
        return 'bg-green-100 text-green-800';
      case 'Delivered':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 animate-fade-in">
      <h1 className="font-heading text-3xl font-bold text-brand-choco-dark mb-8">
        Manage Orders
      </h1>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-pulse-soft text-brand-text-muted">Loading orders...</div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-brand-surface border border-brand-border rounded-md p-8 text-center text-brand-text-muted">
          No orders yet
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-brand-surface border border-brand-border rounded-md p-6 animate-fade-up"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-brand-choco-dark">
                    Order #{order._id.slice(-6)}
                  </p>
                  <p className="text-sm text-brand-text-secondary mt-1">
                    Customer: {order.user?.name || 'Unknown'}
                  </p>
                  <p className="text-sm text-brand-text-secondary">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <p className="font-medium text-brand-choco-dark mt-2">
                    Total: ₹{order.totalPrice.toFixed(2)}
                  </p>
                </div>
                <div className="ml-4">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="bg-white border border-brand-border rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-colors duration-150"
                  >
                    <option value="Order Received">Order Received</option>
                    <option value="In Kitchen">In Kitchen</option>
                    <option value="Sent to Delivery">Sent to Delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                  <span
                    className={`inline-block mt-2 px-2 py-0.5 rounded text-xs ${getStatusColor(order.status)}`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
