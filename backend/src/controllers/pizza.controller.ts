import { Request, Response } from 'express';
import Pizza from '../models/Pizza';
import Inventory from '../models/Inventory';

// Get Pizza Options
export const getPizzaOptions = async (req: Request, res: Response): Promise<void> => {
  try {
    // Dynamically retrieve options directly from items created by the admin in the inventory
    const inventoryItems = await Inventory.find().sort({ item: 1 });

    const bases: any[] = [];
    const sauces: any[] = [];
    const cheeses: any[] = [];
    const vegetables: any[] = [];

    inventoryItems.forEach((item) => {
      const option = {
        name: item.item,
        price: item.price || 0,
        inStock: item.quantity > 0,
        imageUrl: item.imageUrl || '',
      };

      if (item.category === 'base') bases.push(option);
      else if (item.category === 'sauce') sauces.push(option);
      else if (item.category === 'cheese') cheeses.push(option);
      else if (item.category === 'vegetable') vegetables.push(option);
    });

    res.status(200).json({
      bases,
      sauces,
      cheeses,
      vegetables,
    });
  } catch (error) {
    console.error('Get pizza options error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update Pizza Option Stock (Admin)
export const updatePizzaOptionStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, name, inStock } = req.body;

    const pizza = await Pizza.findOne();
    if (!pizza) {
      res.status(404).json({ message: 'Pizza options not found' });
      return;
    }

    const categoryMap: Record<string, any[]> = {
      base: pizza.bases,
      sauce: pizza.sauces,
      cheese: pizza.cheeses,
      vegetable: pizza.vegetables,
    };

    const options = categoryMap[category];
    if (!options) {
      res.status(400).json({ message: 'Invalid category' });
      return;
    }

    const option = options.find((opt) => opt.name === name);
    if (!option) {
      res.status(404).json({ message: 'Option not found' });
      return;
    }

    option.inStock = inStock;
    await pizza.save();

    res.status(200).json(pizza);
  } catch (error) {
    console.error('Update pizza option stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
