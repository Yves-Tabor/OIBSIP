import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  message: string;
  type: 'order-status' | 'inventory' | 'order';
  link?: string;
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    message: { type: String, required: true, trim: true },
    type: { type: String, enum: ['order-status', 'inventory', 'order'], required: true },
    link: { type: String, trim: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export default mongoose.model<INotification>('Notification', notificationSchema);
