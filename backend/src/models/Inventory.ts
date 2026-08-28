import mongoose, { Document, Schema } from 'mongoose';

export interface IInventory extends Document {
  item: string;
  category: 'base' | 'sauce' | 'cheese' | 'vegetable';
  quantity: number;
  threshold: number;
  price: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const inventorySchema = new Schema<IInventory>(
  {
    item: {
      type: String,
      required: [true, 'Please provide an item name'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['base', 'sauce', 'cheese', 'vegetable'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    threshold: {
      type: Number,
      required: true,
      default: 10,
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      default: 0,
    },
    imageUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IInventory>('Inventory', inventorySchema);
