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
import notificationRoutes from './routes/notification.routes';
import adminRoutes from './routes/admin.routes';

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: [
      'http://localhost:5173',
      'https://dailypizza.onrender.com',
    ],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://dailypizza.onrender.com'
  ],
  credentials: true,
}));

// Paddle webhook must receive raw JSON before any JSON parser runs.
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const { handlePaddleWebhook } = await import('./controllers/webhook.controller');
    return handlePaddleWebhook(req as any, res as any);
  } catch (error) {
    console.error('Webhook route error:', error);
    return res.status(200).json({ received: true });
  }
});
app.post('/api/orders/paddle/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const { handlePaddleWebhook } = await import('./controllers/webhook.controller');
    return handlePaddleWebhook(req as any, res as any);
  } catch (error) {
    console.error('Legacy webhook route error:', error);
    return res.status(200).json({ received: true });
  }
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/pizza', pizzaRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

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
      console.log(`Server running on port ${env.PORT}`);
      console.log(`Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
