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

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  console.log('✅ Socket.io initialized');
};

export const emitOrderUpdate = (userId: string, order: any): void => {
  if (io) {
    io.to(`user-${userId}`).emit('order:updated', order);
  }
};
