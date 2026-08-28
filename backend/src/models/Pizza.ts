import mongoose, { Document, Schema } from 'mongoose';

export interface IPizzaOption {
  name: string;
  price: number;
  inStock: boolean;
  imageUrl?: string;
}

export interface IPizza extends Document {
  bases: IPizzaOption[];
  sauces: IPizzaOption[];
  cheeses: IPizzaOption[];
  vegetables: IPizzaOption[];
  createdAt: Date;
  updatedAt: Date;
}

const pizzaSchema = new Schema<IPizza>(
  {
    bases: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        inStock: { type: Boolean, default: true },
        imageUrl: { type: String, default: '' },
      },
    ],
     sauces: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        inStock: { type: Boolean, default: true },
        imageUrl: { type: String, default: '' },
      },
    ],
     cheeses: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        inStock: { type: Boolean, default: true },
        imageUrl: { type: String, default: '' },
      },
    ],
     vegetables: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        inStock: { type: Boolean, default: true },
        imageUrl: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPizza>('Pizza', pizzaSchema);
