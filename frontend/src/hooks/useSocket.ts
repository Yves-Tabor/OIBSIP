import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch } from '../app/store';
import { updateOrderRealtime } from '../features/order/orderSlice';

export const useSocket = (userId: string | undefined) => {
  const socketRef = useRef<Socket | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!userId) return;

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    socketRef.current = io(SOCKET_URL);

    socketRef.current.emit('join-user-room', userId);

    socketRef.current.on('order:updated', (order) => {
      dispatch(updateOrderRealtime(order));
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [userId, dispatch]);

  return socketRef.current;
};
