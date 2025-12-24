import { createSlice } from '@reduxjs/toolkit';

const configSlice = createSlice({
  name: 'config',
  initialState: {
    // Giá trị mặc định (IP hiện tại của bạn)
    baseUrl: 'https://madserver-production.up.railway.app', 
  },
  reducers: {
    setBaseUrl: (state, action) => {
      state.baseUrl = action.payload;
    },
  },
});

export const { setBaseUrl } = configSlice.actions;
export default configSlice.reducer;