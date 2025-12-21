import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import Reducer (Chú ý đường dẫn phải đúng file AuthSlice của bạn)
import authReducer from './slices/AuthSlice'; 
import configReducer from './slices/ConfigSlice';

// 1. Cấu hình Persist
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  version: 1,
  // QUAN TRỌNG: Chỉ lưu 'auth' vào ổ cứng. 
  // Nếu có các state khác (như modal, loading tạm thời) thì không nên lưu.
  whitelist: ['auth','config'], 
  // blacklist: ['something_else'] // Ngược lại với whitelist
};

// 2. Gộp các Reducer lại
const rootReducer = combineReducers({
  auth: authReducer,
  // Thêm các reducer khác nếu có: product: productReducer...
  config: configReducer,
});

// 3. Tạo Persisted Reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 4. Tạo Store
export const store = configureStore({
  reducer: persistedReducer,
  // QUAN TRỌNG: Middleware này giúp tắt cảnh báo lỗi "Serializable" của Redux Toolkit
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// 5. Tạo Persistor (dùng cho PersistGate)
export const persistor = persistStore(store);