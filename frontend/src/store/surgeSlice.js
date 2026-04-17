import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchSurgeStats } from '../services/api';

export const getSurgeStats = createAsyncThunk('surge/getSurgeStats', async () => {
  const response = await fetchSurgeStats();
  return response.data;
});

const surgeSlice = createSlice({
  name: 'surge',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {
    updateSurge: (state, action) => {
      state.data = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSurgeStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSurgeStats.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(getSurgeStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { updateSurge } = surgeSlice.actions;

export const selectSurgeData = (state) => state.surge.data;

export default surgeSlice.reducer;