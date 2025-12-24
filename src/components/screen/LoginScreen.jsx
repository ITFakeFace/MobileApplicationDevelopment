import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Checkbox } from 'react-native-paper';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';
// --- 1. Import Redux ---
import { useDispatch, useSelector } from 'react-redux';
import { clearError, loginUser } from '../../redux/slices/AuthSlice';
// Đảm bảo đường dẫn này đúng với file AuthSlice của bạn

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState(''); // Ở đây mình dùng biến này làm username luôn
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [localErrors, setLocalErrors] = useState({});

  // --- 2. Setup Redux Hooks ---
  const dispatch = useDispatch();
  // Lấy trạng thái loading và lỗi từ Redux
  const { isLoading, error } = useSelector((state) => state.auth);

  const buttonScale = useSharedValue(1);
  const shakeAnimation = useSharedValue(0);

  // Hiệu ứng rung lắc khi lỗi
  const triggerShake = () => {
    shakeAnimation.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  // Lắng nghe lỗi từ API trả về (nếu có)
  useEffect(() => {
    if (error) {
      triggerShake();
      Alert.alert("Đăng nhập thất bại", error, [
        { text: "OK", onPress: () => dispatch(clearError()) }
      ]);
    }
  }, [error]);

  const validateInput = () => {
    const newErrors = {};
    // Validate Username/Email
    if (!email) {
      newErrors.email = 'Vui lòng nhập tài khoản';
    } 
    
    // Validate Password
    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải từ 6 ký tự trở lên';
    }

    if (Object.keys(newErrors).length > 0) {
      setLocalErrors(newErrors);
      triggerShake();
      return false;
    }
    setLocalErrors({});
    return true;
  };

  const handleLogin = () => {
    if (!validateInput()) return;

    // --- 3. GỌI API QUA REDUX ---
    // API của bạn yêu cầu "username", ta map biến "email" vào "username"
    const loginData = {
      email: email, 
      password: password,
      rememberMe: rememberMe
    };

    console.log("Sending Login Data:", loginData);

    dispatch(loginUser(loginData))
      .unwrap()
      .then((res) => {
        // Thành công -> Redux cập nhật isLoggedIn = true -> App tự chuyển màn hình
        console.log("Đăng nhập thành công:", res?.user?.fullname);
      })
      .catch((err) => {
        console.log("Lỗi đăng nhập:", err);
        // Lỗi đã được useEffect bắt và hiện Alert ở trên
      });
  };

  // Animations
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }]
  }));

  const animatedShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeAnimation.value }]
  }));

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
      style={{ backgroundColor: '#f0f4ff' }}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-12 relative">
          <TouchableOpacity
            className="absolute top-12 right-6 z-50 p-2 bg-white/80 rounded-full shadow-sm"
            onPress={() => navigation.navigate('SettingIpScreen')}
          >
            <FontAwesome name="cog" size={24} color="#4b5563" />
          </TouchableOpacity>
          <Animated.View style={animatedShakeStyle}>
            
            {/* --- Header (Đã sửa lỗi hiển thị Text) --- */}
            <View className="items-center mb-10 w-full">
              <View className="w-20 h-20 bg-indigo-600 rounded-full items-center justify-center mb-4 shadow-lg shadow-indigo-300">
                <Text className="text-white text-3xl font-bold">A</Text>
              </View>
              {/* Thêm flex-wrap và text-center để đảm bảo không bị mất chữ */}
              <Text className="text-3xl font-bold text-gray-800 mb-2 text-center flex-wrap w-full">
                Welcome Back
              </Text>
              <Text className="text-gray-600 text-base text-center">
                Sign in to continue
              </Text>
            </View>

            {/* Form */}
            <View className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-200">
              {/* Email/Username Input */}
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">Tài khoản</Text>
                <TextInput
                  className={`bg-gray-50 border ${localErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-xl px-4 py-3 text-gray-800`}
                  placeholder="Nhập tên đăng nhập hoặc email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (localErrors.email) setLocalErrors({ ...localErrors, email: null });
                  }}
                  autoCapitalize="none"
                />
                {localErrors.email && (
                  <Text className="text-red-500 text-sm mt-1">{localErrors.email}</Text>
                )}
              </View>

              {/* Password Input */}
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">Mật khẩu</Text>
                <View className="relative">
                  <TextInput
                    className={`bg-gray-50 border ${localErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-xl px-4 py-3 text-gray-800 pr-12`}
                    placeholder="••••••••"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (localErrors.password) setLocalErrors({ ...localErrors, password: null });
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3"
                  >
                    <Text className="text-indigo-600 font-semibold">
                      {showPassword ? 'Hide' : 'Show'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {localErrors.password && (
                  <Text className="text-red-500 text-sm mt-1">{localErrors.password}</Text>
                )}
              </View>

              {/* Remember Me & Forgot Password */}
              <View className="flex-row justify-between items-center mb-6">
                <TouchableOpacity 
                  className="flex-row items-center"
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <Checkbox
                    status={rememberMe ? 'checked' : 'unchecked'}
                    onPress={() => setRememberMe(!rememberMe)}
                    color="#4f46e5"
                  />
                  <Text className="text-gray-700 ml-1">Lưu đăng nhập</Text>
                </TouchableOpacity>
                
                <TouchableOpacity>
                  <Text className="text-indigo-600 font-semibold">Quên mật khẩu?</Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <Animated.View style={animatedButtonStyle}>
                <TouchableOpacity
                  // Đổi màu nút khi đang Loading
                  className={`rounded-xl py-4 items-center shadow-md ${isLoading ? 'bg-indigo-400' : 'bg-indigo-600'}`}
                  onPress={handleLogin}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  activeOpacity={0.8}
                  disabled={isLoading} // Khóa nút khi đang load
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-bold text-lg">Đăng nhập</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>

              {/* Sign Up Link */}
              {/* <View className="flex-row justify-center mt-6">
                <Text className="text-gray-600">Chưa có tài khoản? </Text>
                <TouchableOpacity>
                  <Text className="text-indigo-600 font-semibold">Đăng ký</Text>
                </TouchableOpacity>
              </View> */}
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}