import React from "react";
import { Alert, View } from "react-native"; // Thêm Alert
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BottomNavigation } from "react-native-paper";
import { CommonActions } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux"; // Import hook dispatch

// Import Action Logout và HomeScreen
import StudentHomeScreen from "../screen/student-screens/StudentHomeScreen";
import { logout } from "../../redux/slices/AuthSlice";
import UserOptionScreen from "../screen/UserOptionScreen";
import TeacherHomeScreen from "../screen/teacher-screens/TeacherHomeScreen";
import StudentScheduleScreen from "../screen/student-screens/StudentScheduleScreen";
import TeacherScheduleScreen from "../screen/teacher-screens/TeacherScheduleScreen";

const Tab = createBottomTabNavigator();

// Component giả: Sẽ không bao giờ được render vì ta chặn navigation rồi
const LogoutPlaceholder = () => <View />;

export default function MainNavigator() {
  const dispatch = useDispatch();
  const { roles } = useSelector((state) => state.auth);
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={({ navigation, state, descriptors, insets }) => (
        <BottomNavigation.Bar
          navigationState={state}
          safeAreaInsets={insets}
          onTabPress={({ route, preventDefault }) => {
            const event = navigation.emit({
              type: "tabPress",
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
      {roles.includes("STUDENT") && (
        <>
          <Tab.Screen
            name="StudentHome"
            component={StudentHomeScreen}
            options={{
              tabBarLabel: "Học tập",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons
                  name="school"
                  size={size}
                  color={color}
                />
              ),
            }}
          />
          <Tab.Screen
            name="StudentSchedule"
            component={StudentScheduleScreen}
            options={{
              tabBarLabel: "Lịch học",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons
                  name="calendar"
                  size={size}
                  color={color}
                />
              ),
            }}
          />
        </>
      )}

      {/* CASE 2: NẾU CÓ ROLE TEACHER -> HIỆN TAB GIẢNG DẠY */}
      {/* Nếu user có cả 2 role, cả 2 tab sẽ cùng hiện lên */}
      {roles.includes("TEACHER") && (
        <>
          <Tab.Screen
            name="TeacherHome"
            component={TeacherHomeScreen}
            options={{
              tabBarLabel: "Giảng dạy",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons
                  name="school"
                  size={size}
                  color={color}
                />
              ),
            }}
          />
          <Tab.Screen
            name="TeacherSchedule"
            component={TeacherScheduleScreen}
            options={{
              tabBarLabel: "Lịch dạy",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons
                  name="calendar"
                  size={size}
                  color={color}
                />
              ),
            }}
          />
        </>
      )}
      <Tab.Screen
        name="UserOption"
        component={UserOptionScreen}
        options={{
          tabBarLabel: "User",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
