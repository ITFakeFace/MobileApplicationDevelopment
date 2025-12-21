import { createSlice } from '@reduxjs/toolkit';

const configSlice = createSlice({
  name: 'config',
  initialState: {
    // Giá trị mặc định (IP hiện tại của bạn)
    baseUrl: 'http://192.168.1.66:3000', 
  },
  reducers: {
    setBaseUrl: (state, action) => {
      state.baseUrl = action.payload;
    },
  },
});

export const { setBaseUrl } = configSlice.actions;
export default configSlice.reducer;