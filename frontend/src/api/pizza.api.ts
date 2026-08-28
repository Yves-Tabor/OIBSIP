import api from '../utils/axios';
import { PizzaOptions } from '../types';

export const pizzaApi = {
  getPizzaOptions: (): Promise<{ data: PizzaOptions }> =>
    api.get('/pizza/options'),
  
  updatePizzaOptionStock: (data: {
    category: string;
    name: string;
    inStock: boolean;
  }) =>
    api.patch('/pizza/options/stock', data),
};
