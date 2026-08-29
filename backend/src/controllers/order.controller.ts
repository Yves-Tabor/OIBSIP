import { Request, Response } from 'express';
import Order from '../models/Order';
import Inventory from '../models/Inventory';
import User from '../models/User';
import { initializePaddlePayment, verifyPaddlePayment } from '../services/payment.service';
import { emitOrderUpdate, emitOrderStatusUpdate } from '../sockets/order.socket';

// Create Paddle Transaction
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { items, totalPrice } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const txRef = `order${Date.now()}${Math.random().toString(36).substring(7)}`;
    const { transactionId } = await initializePaddlePayment({
      amount: totalPrice,
      txRef,
      customer: {
        email: user.email,
        name: user.name,
      },
      items,
      userId: req.userId!.toString(),
    });

    res.status(200).json({ txRef, transactionId });
  } catch (error: any) {
    console.error('Create payment transaction error:', error);
    res.status(500).json({ message: error.message || 'Failed to initialize payment' });
  }
};

// Verify Payment and Create Order
export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { transactionId, txRef, items, totalPrice } = req.body;

    if (!transactionId || !txRef) {
      res.status(400).json({ message: 'Transaction ID and txRef are required' });
      return;
    }

    // Check for duplicate order
    const existingOrder = await Order.findOne({ paymentId: transactionId });
    if (existingOrder) {
      res.status(400).json({ message: 'Order already exists for this transaction' });
      return;
    }

    // Verify payment status with Paddle API
    const verification = await verifyPaddlePayment(transactionId);
    
    // Comprehensive verification checks
    if (verification.status !== 'completed') {
      console.error('Payment verification failed: status not completed', verification);
      res.status(400).json({ message: 'Payment was not completed' });
      return;
    }

    if (verification.currency !== 'USD') {
      console.error('Payment verification failed: currency mismatch', { expected: 'USD', received: verification.currency });
      res.status(400).json({ message: 'Payment currency must be USD' });
      return;
    }

    if (verification.txRef !== txRef) {
      console.error('Payment verification failed: txRef mismatch', { expected: txRef, received: verification.txRef });
      res.status(400).json({ message: 'Transaction reference mismatch' });
      return;
    }

    if (verification.amount !== totalPrice) {
      console.error('Payment verification failed: amount mismatch', { expected: totalPrice, received: verification.amount });
      res.status(400).json({ message: 'Payment amount does not match order total' });
      return;
    }

    // Decrement inventory
    for (const item of items) {
      await decrementInventory(item.base, 'base');
      await decrementInventory(item.sauce, 'sauce');
      await decrementInventory(item.cheese, 'cheese');
      for (const veg of item.vegetables) {
        await decrementInventory(veg, 'vegetable');
      }
    }

    // Create order
    const order = await Order.create({
      user: req.userId,
      items,
      totalPrice,
      paymentId: transactionId,
      txRef,
      status: 'Order Received',
    });

    // Emit socket event
    emitOrderUpdate(req.userId!.toString(), order);

    res.status(201).json({
      message: 'Order created successfully',
      order,
    });
  } catch (error: any) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: error.message || 'Payment verification failed' });
  }
};

// Decrement Inventory Helper
const decrementInventory = async (item: string, category: string): Promise<void> => {
  const inventory = await Inventory.findOne({ item, category });
  if (inventory && inventory.quantity > 0) {
    inventory.quantity -= 1;
    await inventory.save();
  }
};

// Get My Orders
export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error: any) {
    console.error('Get my orders error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch orders' });
  }
};

// Get Order by ID
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate('user', 'name email');

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.userId && req.userRole !== 'admin') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    res.status(200).json(order);
  } catch (error: any) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch order' });
  }
};

// Get All Orders (Admin)
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error: any) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch orders' });
  }
};

// Update Order Status (Admin)
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    order.status = status;
    await order.save();

    // Emit socket event to user and admin
    emitOrderStatusUpdate(order.user.toString(), order);

    res.status(200).json(order);
  } catch (error: any) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: error.message || 'Failed to update order status' });
  }
};
