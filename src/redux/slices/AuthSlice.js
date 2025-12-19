import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../api/APIClient";

// --- THUNK: Gọi API Login ---
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (loginData, { rejectWithValue }) => {
    try {
      // Gọi API: POST /auth/login
      const response = await api.post("/auth/login", loginData);

      // Kiểm tra status từ JSON trả về (theo mẫu của bạn status: true là thành công)
      if (!response.status) {
        return rejectWithValue(response.message || "Đăng nhập thất bại");
      }

      // Lưu Token xuống bộ nhớ máy để Axios dùng cho lần sau
      await AsyncStorage.setItem("accessToken", response.data.accessToken);
      await AsyncStorage.setItem("refreshToken", response.data.refreshToken);

      return response.data; // Trả về cục data chứa user & tokens
    } catch (error) {
      return rejectWithValue(error.message || "Lỗi kết nối server");
    }
  }
);

// --- SLICE ---
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null, // Thông tin user (id, username, roles...)
    accessToken: null, // Token dùng để gọi API
    permissions: [], // Danh sách quyền
    isLoggedIn: false, // Trạng thái đăng nhập
    isLoading: false, // Để hiện loading spinner
    error: null, // Thông báo lỗi nếu có
  },
  reducers: {
    // Hàm Logout: Xóa sạch dữ liệu
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.permissions = [];
      state.isLoggedIn = false;
      state.error = null;
      AsyncStorage.clear(); // Xóa sạch storage
    },
    // Hàm reset lỗi (dùng khi user bấm tắt thông báo lỗi)
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 1. Đang gọi API
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      // 2. Gọi thành công
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoggedIn = true;
        // Mapping dữ liệu từ API JSON vào State
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.permissions = action.payload.user.permissions;
      })
      // 3. Gọi thất bại
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoggedIn = false;
        state.error = action.payload; // Message lỗi từ catch
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
