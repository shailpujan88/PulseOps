import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchLiveOrders } from '../services/api';

export const getLiveOrders = createAsyncThunk('orders/getLiveOrders', async () => {
  const response = await fetchLiveOrders();
  return response.data;
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    liveOrders: [],
    history: [],
    filters: {
      status: null,
      storeId: null,
    },
    loading: false,
    error: null,
  },
  reducers: {
    addOrder: (state, action) => {
      state.liveOrders.push(action.payload);
      if (state.liveOrders.length > 100) {
        state.liveOrders.shift();
      }
    },
    updateOrders: (state, action) => {
      state.liveOrders = action.payload;
    },
    setOrderFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    archiveOrder: (state, action) => {
      const order = state.liveOrders.find(o => o.orderId === action.payload);
      if (order) {
        state.history.push(order);
        state.liveOrders = state.liveOrders.filter(o => o.orderId !== action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getLiveOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(getLiveOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.liveOrders = action.payload;
      })
      .addCase(getLiveOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { addOrder, updateOrders, setOrderFilters, archiveOrder } = ordersSlice.actions;

export const selectLiveOrders = (state) => state.orders.liveOrders;
export const selectOrderHistory = (state) => state.orders.history;
export const selectOrderFilters = (state) => state.orders.filters;
export const selectFilteredOrders = (state) => {
  const { liveOrders, filters } = state.orders;
  return liveOrders.filter(order => {
    if (filters.status && order.status !== filters.status) return false;
    if (filters.storeId && order.storeId !== filters.storeId) return false;
    return true;
  });
};

export default ordersSlice.reducer;