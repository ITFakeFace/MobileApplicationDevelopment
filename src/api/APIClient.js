import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Tạo instance
const APIClient = axios.create({
  baseURL: 'http://192.168.1.66:3000', // Thay bằng IP máy tính nếu chạy trên điện thoại thật (VD: 192.168.1.10:3000)
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// 2. Request Interceptor: Tự động gắn Token vào mọi request
APIClient.interceptors.request.use(
  async (config) => {
    // Lấy token từ storage (hoặc từ Redux store nếu bạn muốn inject store vào đây)
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Response Interceptor: Xử lý dữ liệu trả về cho gọn
APIClient.interceptors.response.use(
  (response) => {
    // Trả về trực tiếp data của response (bỏ qua config, headers...)
    return response.data;
  },
  (error) => {
    // Xử lý lỗi chung (VD: 401 thì logout)
    const message = error.response?.data?.message || error.message;
    console.error('API Error:', message);
    return Promise.reject(error.response?.data || error);
  }
);

// 4. Các hàm helper (để bạn dùng cho gọn)
const api = {
  get: (url, params) => APIClient.get(url, { params }),
  post: (url, data) => APIClient.post(url, data),
  put: (url, data) => APIClient.put(url, data),
  delete: (url) => APIClient.delete(url),
};

export default api;