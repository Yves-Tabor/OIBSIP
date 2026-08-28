import api from '../utils/axios';
import { InventoryItem } from '../types';

export const inventoryApi = {
  getAllInventory: (): Promise<{ data: InventoryItem[] }> =>
    api.get('/inventory'),
  
  createInventory: (data: {
    item: string;
    category: 'base' | 'sauce' | 'cheese' | 'vegetable';
    quantity: number;
    threshold: number;
    price: number;
    imageUrl?: string;
  }): Promise<{ data: InventoryItem }> =>
    api.post('/inventory', data),
  
  updateInventory: (
    id: string,
    data: { quantity?: number; threshold?: number; price?: number; imageUrl?: string }
  ): Promise<{ data: InventoryItem }> =>
    api.patch(`/inventory/${id}`, data),
  
  deleteInventory: (id: string): Promise<{ data: { message: string } }> =>
    api.delete(`/inventory/${id}`),
};
