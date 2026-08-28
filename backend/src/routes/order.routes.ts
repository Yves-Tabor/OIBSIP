import { Router } from 'express';
import {
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/order.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.post('/initialize-payment', authenticate, createOrder);
router.post('/verify-payment', authenticate, verifyPayment);
router.get('/my-orders', authenticate, getMyOrders);
router.get('/:id', authenticate, getOrderById);
router.get('/admin/all', authenticate, requireAdmin, getAllOrders);
router.patch('/:id/status', authenticate, requireAdmin, updateOrderStatus);

export default router;
