import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  base: string;
  sauce: string;
  cheese: string;
  vegetables: string[];
  price: number;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalPrice: number;
  paymentId?: string;
  txRef?: string;
  eventId?: string;
  status: 'Order Received' | 'In Kitchen' | 'Sent to Delivery' | 'Delivered';
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        base: { type: String, required: true },
        sauce: { type: String, required: true },
        cheese: { type: String, required: true },
        vegetables: [{ type: String }],
        quantity: { type: Number, default: 1 },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    paymentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    txRef: {
      type: String,
      unique: true,
      sparse: true,
    },
    eventId: {
      type: String,
      unique: true,
      sparse: true,
    },
    status: {
      type: String,
      enum: ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered'],
      default: 'Order Received',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IOrder>('Order', orderSchema);
