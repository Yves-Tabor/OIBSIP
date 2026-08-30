import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAuth';
import { inventoryApi } from '../../api/inventory.api';
import { getAllInventory } from '../../features/inventory/inventorySlice';
import { Plus, Pencil, Trash2, ImageIcon, X } from 'lucide-react';
import { InventoryItem } from '../../types';

const PLACEHOLDER = 'https://placehold.co/400x300/FDE8D4/6B3520?text=No+Image';

const AdminInventoryPage = () => {
  const dispatch = useAppDispatch();
  const { items, isLoading } = useAppSelector((state) => state.inventory);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    item: '',
    category: 'base' as 'base' | 'sauce' | 'cheese' | 'vegetable',
    quantity: 0,
    threshold: 10,
    price: 0,
    imageUrl: '',
  });
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    dispatch(getAllInventory());
  }, [dispatch]);

  const resetForm = () => {
    setFormData({ item: '', category: 'base', quantity: 0, threshold: 10, price: 0, imageUrl: '' });
    setImgError(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await inventoryApi.updateInventory(editingItem._id, {
          quantity: formData.quantity,
          threshold: formData.threshold,
          price: formData.price,
          imageUrl: formData.imageUrl,
        });
      } else {
        await inventoryApi.createInventory(formData);
      }
      dispatch(getAllInventory());
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save inventory:', error);
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      item: item.item,
      category: item.category,
      quantity: item.quantity,
      threshold: item.threshold,
      price: item.price || 0,
      imageUrl: item.imageUrl || '',
    });
    setImgError(false);
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

  const previewSrc = formData.imageUrl && !imgError ? formData.imageUrl : PLACEHOLDER;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl font-bold text-brand-choco-dark">
          Inventory Management
        </h1>
        <button
          onClick={() => {
            resetForm();
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
                <th className="px-4 py-3 text-left text-xs font-medium text-brand-text-secondary uppercase tracking-wider w-16">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary uppercase tracking-wider">
                  Price
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
              {items.map((item: InventoryItem) => (
                <tr key={item._id} className="hover:bg-brand-cream transition-colors duration-150">
                  <td className="px-4 py-3">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.item}
                        className="w-12 h-12 rounded-md object-cover border border-brand-border"
                        onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-md bg-brand-surface border border-brand-border flex items-center justify-center">
                        <ImageIcon size={16} className="text-brand-text-muted" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-choco-dark">
                    {item.item}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-secondary capitalize">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-brand-choco-dark">
                    ${(item.price || 0).toFixed(2)}
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-scale-in p-4">
          <div className="bg-white rounded-lg w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-brand-border">
              <h2 className="font-heading text-xl font-bold text-brand-choco-dark">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h2>
              <button
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="text-brand-text-muted hover:text-brand-text-primary transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
              {/* Image Preview */}
              <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-2">
                  Item Image
                </label>
                <div className="relative w-full h-44 rounded-lg overflow-hidden border-2 border-dashed border-brand-border mb-3 bg-brand-surface group">
                  <img
                    src={previewSrc}
                    alt="Preview"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={() => setImgError(true)}
                    onLoad={() => setImgError(false)}
                  />
                  {(!formData.imageUrl || imgError) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-brand-text-muted">
                      <ImageIcon size={32} />
                      <span className="text-xs">Paste image URL below to preview</span>
                    </div>
                  )}
                </div>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => { setFormData({ ...formData, imageUrl: e.target.value }); setImgError(false); }}
                  className="w-full bg-white border border-brand-border rounded px-3 py-2.5 text-brand-text-primary placeholder:text-brand-text-placeholder focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-colors duration-150 text-sm"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.imageUrl && imgError && (
                  <p className="text-xs text-red-500 mt-1">⚠ Could not load image from this URL.</p>
                )}
              </div>

              {/* Item Name */}
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
                  placeholder="e.g. Classic Tomato Sauce"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    const category = e.target.value as typeof formData.category;
                    setFormData({ ...formData, category });
                  }}
                  className="w-full bg-white border border-brand-border rounded px-3 py-2.5 text-brand-text-primary focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-colors duration-150"
                  disabled={!!editingItem}
                >
                  <option value="base">Base</option>
                  <option value="sauce">Sauce</option>
                  <option value="cheese">Cheese</option>
                  <option value="vegetable">Vegetable</option>
                </select>
              </div>

              {/* Quantity, Price + Threshold row */}
              <div className="grid grid-cols-3 gap-4">
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
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full bg-white border border-brand-border rounded px-3 py-2.5 text-brand-text-primary focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-colors duration-150"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-text-secondary mb-2">
                    Low Stock Threshold
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
              </div>

              {/* Actions */}
              <div className="flex space-x-4 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  className="flex-1 border border-brand-choco text-brand-choco px-5 py-2.5 rounded-sm text-sm font-medium hover:bg-brand-cream transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-orange text-white px-5 py-2.5 rounded-sm text-sm font-medium hover:bg-brand-orange-light transition-colors duration-200"
                >
                  {editingItem ? 'Save Changes' : 'Add Item'}
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
