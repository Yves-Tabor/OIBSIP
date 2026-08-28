import { Request, Response } from 'express';
import Pizza from '../models/Pizza';

// Get Pizza Options
export const getPizzaOptions = async (req: Request, res: Response): Promise<void> => {
  try {
    let pizza = await Pizza.findOne();
    
    // Create default pizza options if none exist
    if (!pizza) {
      pizza = await Pizza.create({
        bases: [
          { name: 'Thin Crust', price: 5, inStock: true },
          { name: 'Thick Crust', price: 6, inStock: true },
          { name: 'Stuffed Crust', price: 7, inStock: true },
        ],
        sauces: [
          { name: 'Tomato', price: 2, inStock: true },
          { name: 'BBQ', price: 2.5, inStock: true },
          { name: 'Pesto', price: 3, inStock: true },
        ],
        cheeses: [
          { name: 'Mozzarella', price: 3, inStock: true },
          { name: 'Cheddar', price: 3.5, inStock: true },
          { name: 'Parmesan', price: 4, inStock: true },
        ],
        vegetables: [
          { name: 'Mushrooms', price: 1, inStock: true },
          { name: 'Peppers', price: 1, inStock: true },
          { name: 'Onions', price: 0.5, inStock: true },
          { name: 'Olives', price: 1.5, inStock: true },
          { name: 'Tomatoes', price: 1, inStock: true },
        ],
      });
    }

    res.status(200).json(pizza);
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
