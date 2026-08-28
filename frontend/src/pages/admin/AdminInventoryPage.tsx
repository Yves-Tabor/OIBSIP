import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAuth';
import { inventoryApi } from '../../api/inventory.api';
import { getAllInventory } from '../../features/inventory/inventorySlice';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const AdminInventoryPage = () => {
  const dispatch = useAppDispatch();
  const { items, isLoading } = useAppSelector((state) => state.inventory);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    item: '',
    category: 'base' as 'base' | 'sauce' | 'cheese' | 'vegetable',
    quantity: 0,
    threshold: 10,
  });

  useEffect(() => {
    dispatch(getAllInventory());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await inventoryApi.updateInventory(editingItem._id, {
          quantity: formData.quantity,
          threshold: formData.threshold,
        });
      } else {
        await inventoryApi.createInventory(formData);
      }
      dispatch(getAllInventory());
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({ item: '', category: 'base', quantity: 0, threshold: 10 });
    } catch (error) {
      console.error('Failed to save inventory:', error);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      item: item.item,
      category: item.category,
      quantity: item.quantity,
      threshold: item.threshold,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await inventoryApi.deleteInventory(id);
        dispatch(getAllInventory());
      } catch (error) {
        console.error('Failed to delete inventory:', error);
      }
    }
  };

  const getLowStockColor = (quantity: number, threshold: number) => {
    if (quantity <= threshold * 0.5) return 'text-red-600';
    if (quantity <= threshold) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl font-bold text-brand-choco-dark">
          Inventory Management
        </h1>
        <button
          onClick={() => {
            setEditingItem(null);
            setFormData({ item: '', category: 'base', quantity: 0, threshold: 10 });
            setIsModalOpen(true);
          }}
          className="bg-brand-orange text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-brand-orange-light transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>Add Item</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-pulse-soft text-brand-text-muted">Loading inventory...</div>
        </div>
      ) : (
        <div className="bg-brand-surface border border-brand-border rounded-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-brand-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary uppercase tracking-wider">
                  Threshold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {items.map((item) => (
                <tr key={item._id} className="hover:bg-brand-cream transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-choco-dark">
                    {item.item}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-secondary capitalize">
                    {item.category}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getLowStockColor(item.quantity, item.threshold)}`}>
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-secondary">
                    {item.threshold}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-brand-choco hover:text-brand-orange transition-colors duration-150"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-600 hover:text-red-800 transition-colors duration-150"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-scale-in">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="font-heading text-2xl font-bold text-brand-choco-dark mb-6">
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-2">
                  Item Name
                </label>
                <input
                  type="text"
                  value={formData.item}
                  onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                  className="w-full bg-white border border-brand-border rounded px-3 py-2.5 text-brand-text-primary placeholder:text-brand-text-placeholder focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-colors duration-150"
                  required
                  disabled={!!editingItem}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full bg-white border border-brand-border rounded px-3 py-2.5 text-brand-text-primary focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-colors duration-150"
                  disabled={!!editingItem}
                >
                  <option value="base">Base</option>
                  <option value="sauce">Sauce</option>
                  <option value="cheese">Cheese</option>
                  <option value="vegetable">Vegetable</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  className="w-full bg-white border border-brand-border rounded px-3 py-2.5 text-brand-text-primary focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-colors duration-150"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-2">
                  Threshold
                </label>
                <input
                  type="number"
                  value={formData.threshold}
                  onChange={(e) => setFormData({ ...formData, threshold: parseInt(e.target.value) })}
                  className="w-full bg-white border border-brand-border rounded px-3 py-2.5 text-brand-text-primary focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-colors duration-150"
                  required
                  min="0"
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 border border-brand-choco text-brand-choco px-5 py-2.5 rounded-sm text-sm font-medium hover:bg-brand-cream transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-orange text-white px-5 py-2.5 rounded-sm text-sm font-medium hover:bg-brand-orange-light transition-colors duration-200"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventoryPage;
