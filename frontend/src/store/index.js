import { configureStore } from '@reduxjs/toolkit';
import storesReducer from './storesSlice';
import ordersReducer from './ordersSlice';
import inventoryReducer from './inventorySlice';
import alertsReducer from './alertsSlice';
import surgeReducer from './surgeSlice';

export const store = configureStore({
  reducer: {
    stores: storesReducer,
    orders: ordersReducer,
    inventory: inventoryReducer,
    alerts: alertsReducer,
    surge: surgeReducer,
  },
});

export default store;