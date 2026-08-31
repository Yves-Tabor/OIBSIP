import { Request, Response } from 'express';
import { Paddle } from '@paddle/paddle-node-sdk';
import Order from '../models/Order';
import Inventory from '../models/Inventory';
import Notification from '../models/Notification';
import { emitOrderUpdate } from '../sockets/order.socket';
import { emitAdminNewOrder } from '../sockets/order.socket';
import { emitNotification } from '../sockets/order.socket';
import User from '../models/User';
import { env } from '../config/env';

const paddle = new Paddle(env.PADDLE_API_KEY);

export const handlePaddleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    // Parse raw body from request
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {}));
    const signature = req.headers['paddle-signature'] as string | undefined;
    const secret = env.PADDLE_WEBHOOK_SECRET;

    if (!signature) {
      console.error('Missing Paddle signature');
      res.status(200).json({ received: true });
      return;
    }

    // Validate webhook signature

    const isValid = paddle.webhooks.isSignatureValid(rawBody.toString('utf8'), secret, signature);
    if (!isValid) {
      console.error('Invalid Paddle webhook signature');
      res.status(401).json({ received: false });
      return;
    }

    const event = JSON.parse(rawBody.toString('utf8'));
    const eventType = event?.eventType || event?.event_type;

    if (eventType === 'transaction.completed') {
      const customData = event?.data?.customData || event?.data?.custom_data || {};
      const { txRef, userId, items, totalPrice } = customData;
      const paymentId = event.data?.id;

      if (!txRef || !userId || !Array.isArray(items) || !paymentId) {
        console.error('Webhook missing required fields', { txRef, userId, itemCount: items?.length || 0, paymentId });
        res.status(200).json({ received: true });
        return;
      }

      const existingOrder = await Order.findOne({ paymentId }) || await Order.findOne({ txRef });
      if (existingOrder) {
        console.log('✅ Existing order found, skipping duplicate webhook');
        res.status(200).json({ received: true });
        return;
      }

      const order = await Order.create({
        user: userId,
        items,
        totalPrice,
        paymentId,
        txRef,
        status: 'Order Received',
        createdAt: new Date(),
      });

      for (const item of items) {
        if (item.base) {
          await Inventory.updateOne({ item: item.base }, { $inc: { quantity: -1 } });
        }
        if (item.sauce) {
          await Inventory.updateOne({ item: item.sauce }, { $inc: { quantity: -1 } });
        }
        if (item.cheese) {
          await Inventory.updateOne({ item: item.cheese }, { $inc: { quantity: -1 } });
        }
        if (Array.isArray(item.vegetables)) {
          for (const vegetable of item.vegetables) {
            await Inventory.updateOne({ item: vegetable }, { $inc: { quantity: -1 } });
          }
        }
      }

      emitOrderUpdate(userId, order);
      const user = await User.findById(userId, 'name');
      emitAdminNewOrder({
        orderId: order._id,
        userName: user?.name || 'Customer',
        totalPrice: order.totalPrice,
        items: order.items,
        status: order.status,
      });

      // Create notification for the user
      const userNotification = await Notification.create({
        user: userId,
        message: `Your order #${order._id.toString().slice(-6)} has been received successfully!`,
        type: 'order',
        link: `/orders/${order._id}`,
      });
      emitNotification(userId, userNotification);

      // Create notifications for all admins about new order
      const admins = await User.find({ role: 'admin' }, '_id');
      for (const admin of admins) {
        const adminNotification = await Notification.create({
          user: admin._id,
          message: `New order #${order._id.toString().slice(-6)} from ${user?.name || 'Customer'}`,
          type: 'order',
          link: '/admin/orders',
        });
        emitNotification(admin._id.toString(), adminNotification);
      }

      console.log('✅ Order saved:', order._id);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(200).json({ received: true });
  }
};
