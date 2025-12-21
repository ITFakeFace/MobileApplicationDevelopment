import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

// Import các Navigator con

// Import các màn hình Public (Dùng chung)
import MainNavigator from '../navigator/MainNavigator';
import AuthNavigator from '../navigator/AuthNavigator';
import SettingIpScreen from '../screen/SettingIpScreen';

const Stack = createNativeStackNavigator();

export default function MainRouter() {
  const { isLoggedIn } = useSelector((state) => state.auth);

  // (Optional) Loading khi check token lúc mở app
  const [isChecking, setIsChecking] = useState(false);

  if (isChecking) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        
        {/* --- PHẦN 1: LOGIC CHUYỂN ĐỔI AUTH / MAIN --- */}
        {isLoggedIn ? (
          // Nếu đã đăng nhập -> Load MainNavigator
          <Stack.Screen name="MainApp" component={MainNavigator} />
        ) : (
          // Nếu chưa đăng nhập -> Load AuthNavigator
          <Stack.Screen name="AuthApp" component={AuthNavigator} />
        )}

        {/* --- PHẦN 2: PUBLIC ROUTER (LUÔN LUÔN CÓ MẶT) --- */}
        {/* Dùng Group để gom nhóm và setting hiệu ứng chung (ví dụ Modal trượt lên) */}
        <Stack.Group 
          screenOptions={{ 
            headerShown: true, 
            presentation: 'modal', // Hiệu ứng trồi từ dưới lên (iOS style)
            animation: 'slide_from_bottom'
          }}
        >
          <Stack.Screen 
            name="SettingIpScreen" 
            component={SettingIpScreen} 
            options={{ title: 'Cấu hình Server' }}
          />
          {/* Bạn có thể thêm các màn hình public khác ở đây: About, Terms... */}
        </Stack.Group>

      </Stack.Navigator>
    </NavigationContainer>
  );
}