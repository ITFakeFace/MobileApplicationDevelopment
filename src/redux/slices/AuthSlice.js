import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../api/APIClient";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (loginData, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", loginData);

      if (!response.status) {
        return rejectWithValue(response.message || "Đăng nhập thất bại");
      }

      await AsyncStorage.setItem("accessToken", response.data.accessToken);
      await AsyncStorage.setItem("refreshToken", response.data.refreshToken);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Lỗi kết nối server");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null, // Thông tin user (id, username, roles...)
    accessToken: null, // Token dùng để gọi API
    permissions: [], // Danh sách quyền
    roles: [],
    isLoggedIn: false, // Trạng thái đăng nhập
    isLoading: false, // Để hiện loading spinner
    error: null, // Thông báo lỗi nếu có
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.permissions = [];
      state.roles=[];
      state.isLoggedIn = false;
      state.error = null;
      AsyncStorage.clear();
    },
    clearError: (state) => {
      state.error = null;
    },

    // ✅ THÊM HÀM NÀY
    updateUser: (state, action) => {
      const payload = action.payload || {};
      const { roles, permissions, ...basic } = payload; // ✅ bỏ 2 field này

      state.user = {
        ...(state.user || {}),
        ...basic, // ✅ chỉ update thông tin cơ bản
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoggedIn = true;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.permissions = action.payload.user.permissions;
        state.roles = action.payload.user.roles;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoggedIn = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
