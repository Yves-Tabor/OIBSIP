import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch } from '../app/store';
import { updateOrderRealtime, updateOrderStatusRealtime } from '../features/order/orderSlice';

export const useSocket = (userId: string | undefined, isAdmin: boolean = false) => {
  const socketRef = useRef<Socket | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!userId) return;

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    socketRef.current = io(SOCKET_URL);

    socketRef.current.emit('join-user-room', userId);

    if (isAdmin) {
      socketRef.current.emit('join-admin-room');
    }

    socketRef.current.on('order:updated', (order) => {
      dispatch(updateOrderRealtime(order));
    });

    socketRef.current.on('order:status-updated', (order) => {
      dispatch(updateOrderStatusRealtime(order));
    });

    socketRef.current.on('admin:new-order', (order) => {
      // Admin can handle this event for new order notifications
      console.log('New order received:', order);
    });

    socketRef.current.on('admin:order-updated', (order) => {
      // Admin can handle this event for order status updates
      console.log('Order updated:', order);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [userId, isAdmin, dispatch]);

  return socketRef.current;
};
