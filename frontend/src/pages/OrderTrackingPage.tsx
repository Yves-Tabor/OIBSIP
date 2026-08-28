import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useAuth';
import { getOrderById } from '../features/order/orderSlice';
import { useSocket } from '../hooks/useSocket';

const OrderTrackingPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentOrder, isLoading } = useAppSelector((state) => state.order);
  const { user } = useAppSelector((state) => state.auth);

  useSocket(user?.id);

  useEffect(() => {
    if (id) {
      dispatch(getOrderById(id));
    }
  }, [id, dispatch]);

  const statusSteps = [
    { key: 'Order Received', icon: '📋' },
    { key: 'In Kitchen', icon: '👨‍🍳' },
    { key: 'Sent to Delivery', icon: '🚚' },
    { key: 'Delivered', icon: '✅' },
  ];

  const currentStatusIndex = currentOrder
    ? statusSteps.findIndex((step) => step.key === currentOrder.status)
    : -1;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 animate-fade-in">
      <h1 className="font-heading text-3xl font-bold text-brand-choco-dark mb-8">
        Order Tracking
      </h1>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-pulse-soft text-brand-text-muted">Loading order...</div>
        </div>
      ) : currentOrder ? (
        <div className="space-y-8">
          {/* Order Status */}
          <div className="bg-brand-surface border border-brand-border rounded-md p-8">
            <h2 className="font-heading text-xl font-semibold text-brand-choco-dark mb-6">
              Order Status
            </h2>
            <div className="flex items-center justify-between">
              {statusSteps.map((step, index) => (
                <div key={step.key} className="flex-1 flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center w-16 h-16 rounded-full text-2xl ${
                      index <= currentStatusIndex
                        ? 'bg-brand-orange text-white'
                        : 'bg-brand-border text-brand-text-muted'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <p className={`mt-2 text-sm font-medium ${
                    index <= currentStatusIndex ? 'text-brand-choco-dark' : 'text-brand-text-muted'
                  }`}>
                    {step.key}
                  </p>
                  {index < statusSteps.length - 1 && (
                    <div className={`flex-1 h-px w-full mt-4 ${
                      index < currentStatusIndex ? 'bg-brand-orange' : 'bg-brand-border'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-brand-surface border border-brand-border rounded-md p-8">
            <h2 className="font-heading text-xl font-semibold text-brand-choco-dark mb-6">
              Order Details
            </h2>
            <div className="space-y-4">
              {currentOrder.items.map((item, index) => (
                <div key={index} className="border-b border-brand-border pb-4 last:border-0">
                  <p className="font-medium text-brand-choco-dark">
                    Base: {item.base}
                  </p>
                  <p className="text-brand-text-secondary">Sauce: {item.sauce}</p>
                  <p className="text-brand-text-secondary">Cheese: {item.cheese}</p>
                  <p className="text-brand-text-secondary">
                    Vegetables: {item.vegetables.join(', ')}
                  </p>
                  <p className="text-brand-orange font-medium mt-2">
                    ₹{item.price.toFixed(2)}
                  </p>
                </div>
              ))}
              <div className="pt-4 border-t border-brand-border">
                <p className="font-heading text-lg font-bold text-brand-choco-dark">
                  Total: ₹{currentOrder.totalPrice.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-brand-text-muted">
          Order not found
        </div>
      )}
    </div>
  );
};

export default OrderTrackingPage;
