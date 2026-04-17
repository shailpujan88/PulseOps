import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const getProducts = createAsyncThunk('inventory/getProducts', async () => {
  const response = await api.get('/api/products');
  return response.data;
});

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: {
    products: [],
    lowStockItems: [],
    categoryFilter: null,
    loading: false,
    error: null,
  },
  reducers: {
    updateProducts: (state, action) => {
      state.products = action.payload;
      state.lowStockItems = action.payload.filter(p => p.stock < p.minStock);
    },
    setCategoryFilter: (state, action) => {
      state.categoryFilter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
        state.lowStockItems = action.payload.filter(p => p.stock < p.minStock);
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { updateProducts, setCategoryFilter } = inventorySlice.actions;

export const selectProducts = (state) => state.inventory.products;
export const selectLowStockItems = (state) => state.inventory.lowStockItems;
export const selectCategoryFilter = (state) => state.inventory.categoryFilter;
export const selectFilteredProducts = (state) => {
  const { products, categoryFilter } = state.inventory;
  if (!categoryFilter) return products;
  return products.filter(p => p.category === categoryFilter);
};

export default inventorySlice.reducer;