import React from 'react';
import { Alert, View } from 'react-native'; // Thêm Alert
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomNavigation } from 'react-native-paper';
import { CommonActions } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux'; // Import hook dispatch

// Import Action Logout và HomeScreen
import HomeScreen from '../screen/HomeScreen';
import { logout } from '../../redux/slices/AuthSlice';

const Tab = createBottomTabNavigator();

// Component giả: Sẽ không bao giờ được render vì ta chặn navigation rồi
const LogoutPlaceholder = () => <View />;

export default function MainNavigator() {
  const dispatch = useDispatch();

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất không?",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Đồng ý", 
          style: "destructive",
          onPress: () => dispatch(logout()) // Gọi Redux Logout -> App tự chuyển về Login
        }
      ]
    );
  };

  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={({ navigation, state, descriptors, insets }) => (
        <BottomNavigation.Bar
          navigationState={state}
          safeAreaInsets={insets}
          onTabPress={({ route, preventDefault }) => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (event.defaultPrevented) {
              preventDefault();
            } else {
              navigation.dispatch({
                ...CommonActions.navigate(route.name, route.params),
                target: state.key,
              });
            }
          }}
          renderIcon={({ route, focused, color }) => {
            const { options } = descriptors[route.key];
            if (options.tabBarIcon) {
              return options.tabBarIcon({ focused, color, size: 24 });
            }
            return null;
          }}
          getLabelText={({ route }) => {
            const { options } = descriptors[route.key];
            return options.tabBarLabel || options.title || route.name;
          }}
        />
      )}
    >
      {/* --- TAB 1: HOME --- */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Trang chủ',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />

      {/* --- TAB 2: LOGOUT --- */}
      <Tab.Screen
        name="Logout"
        component={LogoutPlaceholder} // Component giả
        listeners={{
          tabPress: (e) => {
            // QUAN TRỌNG: Chặn chuyển màn hình
            e.preventDefault(); 
            // Hiện popup xác nhận logout
            handleLogout();
          },
        }}
        options={{
          tabBarLabel: 'Đăng xuất',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="logout" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}