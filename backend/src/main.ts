import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { connectDB } from './config/db';
import { env } from './config/env';
import { errorHandler, notFound } from './middlewares/error.middleware';
import { initializeSocket } from './sockets/order.socket';
import { startCronJobs } from './services/cron.service';
import authRoutes from './routes/auth.routes';
import orderRoutes from './routes/order.routes';
import pizzaRoutes from './routes/pizza.routes';
import inventoryRoutes from './routes/inventory.routes';

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: env.FRONTEND_URL,
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/pizza', pizzaRoutes);
app.use('/api/inventory', inventoryRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Initialize Socket.io
initializeSocket(io);

// Start cron jobs
startCronJobs();

// Start server
const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    
    httpServer.listen(env.PORT, () => {
      console.log(`🚀 Server running on port ${env.PORT}`);
      console.log(`📝 Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
