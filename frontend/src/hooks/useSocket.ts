import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAppDispatch } from '../app/store';
import { updateOrderRealtime, updateOrderStatusRealtime } from '../features/order/orderSlice';
import { addNotification } from '../features/notification/notificationSlice';

export const useSocket = (userId: string | undefined, isAdmin: boolean = false) => {
  const socketRef = useRef<any>(null);
  const [socket, setSocket] = useState<any>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!userId) return;

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    socketRef.current = io(SOCKET_URL);
    setSocket(socketRef.current);

    socketRef.current.emit('join-user-room', userId);

    if (isAdmin) {
      socketRef.current.emit('join-admin-room');
    }

    socketRef.current.on('order:updated', (order: any) => {
      dispatch(updateOrderRealtime(order));
    });

    socketRef.current.on('order:status-updated', (order: any) => {
      dispatch(updateOrderStatusRealtime(order));
    });

    socketRef.current.on('notification:new', (notification: any) => {
      dispatch(addNotification(notification));
    });

    socketRef.current.on('admin:new-order', (order: any) => {
      dispatch(addNotification({
        _id: `admin-${order.orderId}-${Date.now()}`,
        message: `New order from ${order.userName} - $${Number(order.totalPrice ?? 0).toFixed(2)}`,
        type: 'order',
        read: false,
        createdAt: new Date().toISOString(),
      }));
    });

    socketRef.current.on('admin:order-updated', (order: any) => {
      console.log('Order updated:', order);
    });

    return () => {
      socketRef.current?.disconnect();
      setSocket(null);
    };
  }, [userId, isAdmin, dispatch]);

  return socket;
};
