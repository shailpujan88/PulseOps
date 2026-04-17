import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchStores, fetchStore, fetchStoreInventory } from '../services/api';

export const getStores = createAsyncThunk('stores/getStores', async () => {
  const response = await fetchStores();
  return response.data;
});

export const getStore = createAsyncThunk('stores/getStore', async (id) => {
  const response = await fetchStore(id);
  return response.data;
});

export const getStoreInventory = createAsyncThunk('stores/getStoreInventory', async (id) => {
  const response = await fetchStoreInventory(id);
  return response.data;
});

const storesSlice = createSlice({
  name: 'stores',
  initialState: {
    stores: [],
    selectedStore: null,
    inventory: [],
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedStore: (state, action) => {
      state.selectedStore = action.payload;
    },
    updateStores: (state, action) => {
      state.stores = action.payload;
    },
    updateStoreInventory: (state, action) => {
      state.inventory = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getStores.pending, (state) => {
        state.loading = true;
      })
      .addCase(getStores.fulfilled, (state, action) => {
        state.loading = false;
        state.stores = action.payload;
      })
      .addCase(getStores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(getStore.fulfilled, (state, action) => {
        state.selectedStore = action.payload;
      })
      .addCase(getStoreInventory.fulfilled, (state, action) => {
        state.inventory = action.payload;
      });
  },
});

export const { setSelectedStore, updateStores, updateStoreInventory } = storesSlice.actions;

export const selectStores = (state) => state.stores.stores;
export const selectSelectedStore = (state) => state.stores.selectedStore;
export const selectStoreInventory = (state) => state.stores.inventory;
export const selectStoresLoading = (state) => state.stores.loading;

export default storesSlice.reducer;