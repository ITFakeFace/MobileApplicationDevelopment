import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mẹo: Import store kiểu này (có thể gây circular dependency warning nhưng thường vẫn chạy tốt nếu chỉ dùng trong hàm)
// Nếu bị lỗi, ta sẽ dùng cách khác.
let store; 

// Hàm để inject store từ file App.js hoặc Store.js vào đây (tránh import trực tiếp gây lỗi vòng lặp)
export const injectStore = (_store) => {
  store = _store;
};

// 1. Tạo instance (Lúc này baseURL chỉ là tạm thời)
const APIClient = axios.create({
  baseURL: 'https://madserver-production.up.railway.app', // Giá trị tạm, sẽ bị ghi đè ngay lập tức
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});
// 2. Request Interceptor: GẮN URL ĐỘNG + TOKEN
APIClient.interceptors.request.use(
  async (config) => {
    // --- XỬ LÝ URL ĐỘNG TỪ REDUX ---
    if (store) {
      const state = store.getState();
      const dynamicUrl = state.config.baseUrl; // Lấy URL từ Redux
      
      if (dynamicUrl) {
        config.baseURL = dynamicUrl; // Ghi đè baseURL của axios
      }
    }

    // --- XỬ LÝ TOKEN ---
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log nhẹ để debug xem nó đang gọi vào IP nào
    console.log(`Calling API: ${config.baseURL}${config.url}`);
    
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
// const api = {
//   get: (url, params) => APIClient.get(url, { params }),
//   post: (url, data) => APIClient.post(url, data),
//   put: (url, data) => APIClient.put(url, data),
//   delete: (url) => APIClient.delete(url),
// };
const api = {
  get: (url, params, config) => APIClient.get(url, { params, ...config }),
  post: (url, data, config) => APIClient.post(url, data, config),
  put: (url, data, config) => APIClient.put(url, data, config),
  delete: (url, config) => APIClient.delete(url, config),
};
export default api;