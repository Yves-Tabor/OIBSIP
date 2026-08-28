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
        price: { type: Number, required: true },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    paymentId: String,
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
