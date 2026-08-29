import { Request, Response } from 'express';
import crypto from 'crypto';
import Order from '../models/Order';
import Inventory from '../models/Inventory';
import { emitOrderUpdate } from '../sockets/order.socket';
import { env } from '../config/env';

const getWebhookSecret = (): string => {
  const secret = env.PADDLE_ENVIRONMENT === 'sandbox' 
    ? env.PADDLE_SANDBOX_WEBHOOK_SECRET 
    : env.PADDLE_PRODUCTION_WEBHOOK_SECRET;
  return secret || '';
};

// Verify Paddle webhook signature
const verifyPaddleSignature = (payload: string, signature: string, secret: string): boolean => {
  try {
    const timestamp = signature.split(',')[0].split('=')[1];
    const v1Signature = signature.split(',')[1].split('=')[1];
    
    const signedPayload = `${timestamp}.${payload}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(v1Signature)
    );
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return false;
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

// Handle Paddle webhook
export const handlePaddleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers['paddle-signature'] as string;
    const rawBody = req.body as Buffer;
    const payload = rawBody.toString('utf8');
    const secret = getWebhookSecret();

    console.log('Paddle webhook received:', {
      hasSignature: !!signature,
      payloadLength: payload.length,
      hasSecret: !!secret,
    });

    // Verify signature if secret is configured
    if (secret) {
      if (!signature || !verifyPaddleSignature(payload, signature, secret)) {
        console.error('Invalid webhook signature');
        res.status(401).json({ message: 'Invalid signature' });
        return;
      }
    } else {
      console.warn('Webhook secret not configured - skipping signature verification (development mode)');
    }

    const eventData = JSON.parse(payload);
    console.log('Paddle webhook event:', {
      eventType: eventData.event_type,
      eventId: eventData.event_id,
    });

    // Handle transaction.completed event
    if (eventData.event_type === 'transaction.completed') {
      const transaction = eventData.data;
      const transactionId = transaction.id;
      const txRef = transaction.custom_data?.txRef;
      const items = transaction.custom_data?.items;
      const expectedTotalPrice = transaction.custom_data?.totalPrice;
      const userId = transaction.custom_data?.userId;
      const totalAmount = parseInt(transaction.totals.total) / 100; // Convert cents to dollars
      const currency = transaction.currency_code;

      console.log('Processing transaction.completed:', {
        transactionId,
        txRef,
        totalAmount,
        expectedTotalPrice,
        currency,
        hasItems: !!items,
        userId,
      });

      // Check for duplicate order
      const existingOrder = await Order.findOne({ paymentId: transactionId });
      if (existingOrder) {
        console.log('Order already exists for transaction:', transactionId);
        res.status(200).json({ message: 'Order already processed' });
        return;
      }

      // Verify currency is USD
      if (currency !== 'USD') {
        console.error('Invalid currency:', currency);
        res.status(400).json({ message: 'Invalid currency' });
        return;
      }

      // Verify amount matches expected
      if (totalAmount !== expectedTotalPrice) {
        console.error('Amount mismatch:', { expected: expectedTotalPrice, received: totalAmount });
        res.status(400).json({ message: 'Payment amount mismatch' });
        return;
      }

      // Verify items are present
      if (!items || !Array.isArray(items) || items.length === 0) {
        console.error('Missing items in custom_data');
        res.status(400).json({ message: 'Missing order items' });
        return;
      }

      // Verify userId is present
      if (!userId) {
        console.error('Missing userId in custom_data');
        res.status(400).json({ message: 'Missing user context' });
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
        user: userId,
        items,
        totalPrice: totalAmount,
        paymentId: transactionId,
        txRef,
        status: 'Order Received',
      });

      // Emit socket event
      emitOrderUpdate(userId, order);

      console.log('Order created from webhook:', order._id);

      console.log('Webhook processed successfully for transaction:', transactionId);
      res.status(200).json({ message: 'Webhook processed' });
      return;
    }

    // Acknowledge other events
    res.status(200).json({ message: 'Event acknowledged' });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
};
