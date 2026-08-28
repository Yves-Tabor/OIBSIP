import { Request, Response } from 'express';
import Inventory from '../models/Inventory';

// Get All Inventory (Admin)
export const getAllInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const inventory = await Inventory.find().sort({ category: 1, item: 1 });
    res.status(200).json(inventory);
  } catch (error) {
    console.error('Get all inventory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update Inventory Item (Admin)
export const updateInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { quantity, threshold } = req.body;

    const inventory = await Inventory.findById(id);
    if (!inventory) {
      res.status(404).json({ message: 'Inventory item not found' });
      return;
    }

    if (quantity !== undefined) inventory.quantity = quantity;
    if (threshold !== undefined) inventory.threshold = threshold;

    await inventory.save();

    res.status(200).json(inventory);
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create Inventory Item (Admin)
export const createInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { item, category, quantity, threshold } = req.body;

    const inventory = await Inventory.create({
      item,
      category,
      quantity,
      threshold,
    });

    res.status(201).json(inventory);
  } catch (error) {
    console.error('Create inventory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete Inventory Item (Admin)
export const deleteInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const inventory = await Inventory.findByIdAndDelete(id);
    if (!inventory) {
      res.status(404).json({ message: 'Inventory item not found' });
      return;
    }

    res.status(200).json({ message: 'Inventory item deleted' });
  } catch (error) {
    console.error('Delete inventory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
