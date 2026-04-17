import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchAlerts } from '../services/api';

export const getAlerts = createAsyncThunk('alerts/getAlerts', async () => {
  const response = await fetchAlerts();
  return response.data;
});

const alertsSlice = createSlice({
  name: 'alerts',
  initialState: {
    active: [],
    dismissed: [],
    loading: false,
    error: null,
  },
  reducers: {
    updateAlerts: (state, action) => {
      state.active = action.payload;
    },
    dismissAlert: (state, action) => {
      const alert = state.active.find(a => a.id === action.payload);
      if (alert) {
        state.dismissed.push({ ...alert, dismissedAt: new Date().toISOString() });
        state.active = state.active.filter(a => a.id !== action.payload);
      }
    },
    addAlert: (state, action) => {
      state.active.unshift(action.payload); // Add to top
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAlerts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAlerts.fulfilled, (state, action) => {
        state.loading = false;
        state.active = action.payload;
      })
      .addCase(getAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { updateAlerts, dismissAlert, addAlert } = alertsSlice.actions;

export const selectActiveAlerts = (state) => state.alerts.active;
export const selectDismissedAlerts = (state) => state.alerts.dismissed;

export default alertsSlice.reducer;