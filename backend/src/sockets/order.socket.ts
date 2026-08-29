import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer;

export const initializeSocket = (socketIo: SocketIOServer): void => {
  io = socketIo;

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-user-room', (userId: string) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    socket.on('join-admin-room', () => {
      socket.join('admin-room');
      console.log('Admin joined admin room');
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  console.log('✅ Socket.io initialized');
};

export const emitOrderUpdate = (userId: string, order: any): void => {
  if (io) {
    // Emit to user's room for their order updates
    io.to(`user-${userId}`).emit('order:updated', order);
    // Emit to admin room for new order notification
    io.to('admin-room').emit('admin:new-order', order);
  }
};

export const emitOrderStatusUpdate = (userId: string, order: any): void => {
  if (io) {
    // Emit to user's room for status update
    io.to(`user-${userId}`).emit('order:status-updated', order);
    // Emit to admin room for status update
    io.to('admin-room').emit('admin:order-updated', order);
  }
};
