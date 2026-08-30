import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { InventoryItem } from '../../types';
import { inventoryApi } from '../../api/inventory.api';
import { getApiErrorMessage } from '../../utils/errors';

interface InventoryState {
  items: InventoryItem[];
  isLoading: boolean;
  error: string | null;
}

const initialState: InventoryState = {
  items: [],
  isLoading: false,
  error: null,
};

export const getAllInventory = createAsyncThunk(
  'inventory/getAllInventory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await inventoryApi.getAllInventory();
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch inventory'));
    }
  }
);

export const createInventory = createAsyncThunk(
  'inventory/createInventory',
  async (data: {
    item: string;
    category: 'base' | 'sauce' | 'cheese' | 'vegetable';
    quantity: number;
    threshold: number;
    price: number;
    imageUrl?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await inventoryApi.createInventory(data);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to create inventory item'));
    }
  }
);

export const updateInventory = createAsyncThunk(
  'inventory/updateInventory',
  async ({ id, data }: { id: string; data: { quantity?: number; threshold?: number } }, { rejectWithValue }) => {
    try {
      const response = await inventoryApi.updateInventory(id, data);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to update inventory'));
    }
  }
);

export const deleteInventory = createAsyncThunk(
  'inventory/deleteInventory',
  async (id: string, { rejectWithValue }) => {
    try {
      await inventoryApi.deleteInventory(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to delete inventory'));
    }
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All Inventory
      .addCase(getAllInventory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllInventory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(getAllInventory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Inventory
      .addCase(createInventory.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // Update Inventory
      .addCase(updateInventory.fulfilled, (state, action) => {
        const index = state.items.findIndex((i: InventoryItem) => i._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Delete Inventory
      .addCase(deleteInventory.fulfilled, (state, action) => {
        state.items = state.items.filter((i: InventoryItem) => i._id !== action.payload);
      });
  },
});

export const { clearError } = inventorySlice.actions;
export default inventorySlice.reducer;
