import React from 'react';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from '../screen/LoginScreen';

// Import màn hình
// LƯU Ý: Kiểm tra folder của bạn là 'screen' hay 'screens' để import cho đúng nhé 
// import RegisterScreen from "../screens/RegisterScreen"; // Sau này mở comment khi có màn Register

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Login"
      screenOptions={{ 
        headerShown: false, // Ẩn header mặc định để tự code giao diện Login full màn hình
        animation: 'slide_from_right' // Hiệu ứng lướt từ phải sang (chuẩn Android/iOS)
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      {/* <Stack.Screen name="Register" component={RegisterScreen} /> */}
    </Stack.Navigator>
  );
};

export default AuthNavigator;