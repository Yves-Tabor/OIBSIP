import { Request, Response } from 'express';
import Order from '../models/Order';
import Inventory from '../models/Inventory';
import { createRazorpayOrder, verifyRazorpayPayment } from '../services/payment.service';
import { emitOrderUpdate } from '../sockets/order.socket';

// Create Razorpay Order
export const createRazorpayOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { items, totalPrice } = req.body;

    const razorpayOrder = await createRazorpayOrder(totalPrice);

    res.status(200).json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify Payment and Create Order
export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, items, totalPrice } = req.body;

    // Verify payment
    const isValid = await verifyRazorpayPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      res.status(400).json({ message: 'Invalid payment signature' });
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
      paymentId: razorpayPaymentId,
      status: 'Order Received',
    });

    // Emit socket event
    emitOrderUpdate(req.userId.toString(), order);

    res.status(201).json({
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Server error' });
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
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ message: 'Server error' });
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
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get All Orders (Admin)
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error' });
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

    // Emit socket event to user
    emitOrderUpdate(order.user.toString(), order);

    res.status(200).json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
