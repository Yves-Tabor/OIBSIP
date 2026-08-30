import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { notificationApi, Notification } from '../../api/notification.api';

interface NotificationState {
  items: Notification[];
  isLoading: boolean;
}

const initialState: NotificationState = { items: [], isLoading: false };

export const getNotifications = createAsyncThunk('notifications/get', async () => {
  const response = await notificationApi.getMy();
  return response.data;
});

export const markNotificationsRead = createAsyncThunk('notifications/readAll', async () => {
  await notificationApi.markAllRead();
});

export const deleteNotifications = createAsyncThunk('notifications/deleteAll', async () => {
  await notificationApi.deleteAll();
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.items = [action.payload, ...state.items.filter((item: Notification) => item._id !== action.payload._id)].slice(0, 10);
    },
    clearNotifications: (state) => { state.items = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getNotifications.pending, (state) => { state.isLoading = true; })
      .addCase(getNotifications.fulfilled, (state, action) => { state.isLoading = false; state.items = action.payload; })
      .addCase(getNotifications.rejected, (state) => { state.isLoading = false; })
      .addCase(markNotificationsRead.fulfilled, (state) => {
        state.items.forEach((notification: Notification) => { notification.read = true; });
      })
      .addCase(deleteNotifications.fulfilled, (state) => { state.items = []; });
  },
});

export const { addNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
