import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useAuth';
import { getMyOrders } from '../features/order/orderSlice';
import { orderApi } from '../api/order.api';
import { parsePendingPizzaBuild } from '../utils/storage';

const MyOrdersPage = () => {
  const dispatch = useAppDispatch();
  const { orders, isLoading } = useAppSelector((state) => state.order);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const status = searchParams.get('status');
    const transactionId = searchParams.get('transaction_id');

    if (status === 'completed' && transactionId) {
      const savedBuildStr = localStorage.getItem('pendingPizzaBuild');

      if (savedBuildStr) {
        try {
          const savedBuild = parsePendingPizzaBuild(savedBuildStr);
          orderApi.verifyPayment({
            transactionId: savedBuild.transactionId ?? transactionId,
          })
            .then(() => {
              localStorage.removeItem('pendingPizzaBuild');
              window.history.replaceState({}, '', '/orders');
              dispatch(getMyOrders());
            })
            .catch((err) => {
              console.error('Payment verification failed:', err);
              localStorage.removeItem('pendingPizzaBuild');
              dispatch(getMyOrders());
            });
        } catch (e) {
          console.error('Error parsing saved build:', e);
          localStorage.removeItem('pendingPizzaBuild');
          dispatch(getMyOrders());
        }
      } else {
        dispatch(getMyOrders());
      }

      window.history.replaceState({}, '', '/orders');
      return;
    }

    dispatch(getMyOrders());
  }, [dispatch, searchParams]);

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
        My Orders
      </h1>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-pulse-soft text-brand-text-muted">Loading orders...</div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-brand-surface border border-brand-border rounded-md p-8 text-center">
          <p className="text-brand-text-secondary mb-4">No orders yet</p>
          <Link
            to="/menu"
            className="bg-brand-orange text-white px-5 py-2.5 rounded-sm text-sm font-medium hover:bg-brand-orange-light transition-colors duration-200"
          >
            Order Your First Pizza
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="block bg-brand-surface border border-brand-border rounded-md p-6 hover:shadow-md transition-shadow duration-200 animate-fade-up"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-brand-choco-dark">
                    Order #{order._id.slice(-6)}
                  </p>
                  <p className="text-sm text-brand-text-secondary mt-1">
                    {new Date(order.createdAt).toLocaleDateString()} at{' '}
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${getStatusColor(order.status)}`}
                  >
                    {order.status}
                  </span>
                  <p className="font-medium text-brand-choco-dark mt-2">
                    ₹{(order.totalPrice ?? 0).toFixed(2)}
                  </p>
                  <span className="mt-1 inline-block text-xs font-medium text-brand-orange">View Details</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
