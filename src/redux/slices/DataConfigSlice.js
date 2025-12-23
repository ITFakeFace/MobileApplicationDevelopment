import { createSlice } from '@reduxjs/toolkit';

const dataConfigSlice = createSlice({
  name: 'dataConfig',
  initialState: {
    // 1. Địa chỉ mặc định (Thay thế hằng số DEFAULT_ADDRESS)
    defaultAddress: "Phòng Lab 1, Tòa nhà HRC, Q.10",
    
    // 2. Các thông tin liên hệ chung (Gợi ý thêm)
    hotline: "1900 1234",
    supportEmail: "support@hrc.edu.vn",
    
    // 3. Hình ảnh mặc định (Placeholder)
    defaultAvatar: "https://picsum.photos/200/300", 
    defaultCourseImage: "https://picsum.photos/seed/default/300/200",
  },
  reducers: {
    // Dùng khi bạn muốn cập nhật lại cấu hình (ví dụ gọi API lấy config mới về)
    setDataConfig: (state, action) => {
      // Merge state hiện tại với payload mới
      return { ...state, ...action.payload };
    },
    // Cập nhật từng trường riêng lẻ
    updateSingleConfig: (state, action) => {
      const { key, value } = action.payload;
      state[key] = value;
    }
  },
});

export const { setDataConfig, updateSingleConfig } = dataConfigSlice.actions;
export default dataConfigSlice.reducer;