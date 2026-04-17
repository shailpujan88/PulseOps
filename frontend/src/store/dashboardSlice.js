import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  orders: [],
  inventory: [],
  alerts: [],
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    updateOrders: (state, action) => {
      state.orders = action.payload;
    },
    updateInventory: (state, action) => {
      state.inventory = action.payload;
    },
    updateAlerts: (state, action) => {
      state.alerts = action.payload;
    },
  },
});

export const { updateOrders, updateInventory, updateAlerts } = dashboardSlice.actions;

export default dashboardSlice.reducer;