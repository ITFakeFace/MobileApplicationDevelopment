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
import ProfileScreen from '../screen/ProfileScreen';
import EditProfileScreen from '../screen/EditProfileScreen';
import SettingOptionScreen from '../screen/SettingOptionScreen';
import RequestFormScreen from '../screen/student-screens/RequestFormScreen';
import ContactUsScreen from '../screen/ContactUsScreen';
import AboutUsScreen from '../screen/AboutUsScreen';
import TeacherClassSessionScreen from '../screen/teacher-screens/TeacherClassSessionScreen';
import StudentClassSessionScreen from '../screen/student-screens/StudentClassSessionScreen';
import TeacherAttendanceDetailScreen from '../screen/teacher-screens/TeacherAttendanceDetailScreen';
import CourseDetailScreen from '../screen/CourseDetailScreen';

const Stack = createNativeStackNavigator();

export default function MainRouter() {
  const { isLoggedIn, user, roles } = useSelector((state) => state.auth);

  // (Optional) Loading khi check token lúc mở app
  const [isChecking, setIsChecking] = useState(false);
// --- HÀM TÁCH BIỆT: Xử lý logic chọn màn hình ---
  const renderScreenByRole = () => {
    // 1. Kiểm tra an toàn: user có tồn tại và roles có phải mảng không?

    if (roles.includes('TEACHER')) 
      return (
        <>
        <Stack.Screen 
          name="SessionDetail" 
          component={TeacherClassSessionScreen} 
          options={{ title: 'Chi tiết lớp học (GV)', headerShown: true }}
        />
        <Stack.Screen 
          name="AttendanceDetail" 
          component={TeacherAttendanceDetailScreen} 
          options={{ title: 'Chi tiết điểm danh', headerShown: true }}
        />
        </>
      );

    // Mặc định trả về màn hình Student
    return (
      <>
        <Stack.Screen 
          name="SessionDetail" 
          component={StudentClassSessionScreen} 
          options={{ title: 'Chi tiết lớp học (SV)', headerShown: true }}
        />
      </>
    );
  };
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
          <>
          <Stack.Screen name="MainApp" component={MainNavigator} />
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen} 
            options={{ headerShown: true, title: 'Hồ sơ cá nhân' }} 
          />
          <Stack.Screen 
            name="EditProfile" 
            component={EditProfileScreen} 
            options={{ headerShown: true, title: 'Chỉnh sửa hồ sơ' }} 
          />
          <Stack.Screen 
            name="SettingOption" 
            component={SettingOptionScreen} 
            options={{ headerShown: true, title: 'Cài đặt' }} 
          />
          <Stack.Screen 
            name="RequestForm" 
            component={RequestFormScreen} 
            options={{ headerShown: true, title: 'Yêu cầu hỗ trợ' }} 
          />
          <Stack.Screen 
            name="ContactUs" 
            component={ContactUsScreen} 
            options={{ headerShown: true, title: 'Thông tin liên lạc' }} 
          />
          {renderScreenByRole()}
          <Stack.Screen 
            name="AboutUs" 
            component={AboutUsScreen} 
            options={{ headerShown: true, title: 'Về chúng tôi' }} 
          />
          <Stack.Screen
            name="CourseDetail"
            component={CourseDetailScreen}
            options={{ title: "Chi tiết khóa học" }}
          />
          </>
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