import React from "react";
import { View, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import { List, Avatar, Divider, Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import MainLayout from "../layout/MainLayout";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/AuthSlice";

const UserOptionScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user, roles } = useSelector((state) => state.auth);
  const baseUrl = useSelector(
    (state) => state.config?.baseUrl || "http://localhost:3000"
  );

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đồng ý",
        style: "destructive",
        onPress: () => dispatch(logout()), // Gọi Redux Logout -> App tự chuyển về Login
      },
    ]);
  };

  const menuItems = [
    {
      title: "Thông tin cá nhân",
      icon: "account",
      onPress: () => navigation.navigate("Profile"),
    },
    
  ];
  const studentMenuItems = [
    {
      title: "Yêu cầu hỗ trợ",
      icon: "account",
      onPress: () => navigation.navigate("RequestForm"),
    },
  ];
  const bottomMenuItems = [
    {
      title: "Thông tin liên lạc",
      icon: "help-circle",
      onPress: () => navigation.navigate("ContactUs"),
    },
    {
      title: "Về chúng tôi",
      icon: "help-circle",
      onPress: () => navigation.navigate("AboutUs"),
    },
    {
      title: "Cài đặt",
      icon: "cog",
      onPress: () => navigation.navigate("SettingOption"),
    },
    {
      title: "Trợ giúp",
      icon: "help-circle",
      onPress: () => navigation.navigate("Help"),
    },
  ];
  const bottomMenuItemsTemplate = bottomMenuItems.map((item, index) => (
    <React.Fragment key={index}>
      <List.Item
        title={item.title}
        left={(props) => <List.Icon {...props} icon={item.icon} />}
        right={(props) => <List.Icon {...props} icon="chevron-right" />}
        onPress={item.onPress}
        className="px-4"
      />
      {index < menuItems.length - 1 && <Divider />}
    </React.Fragment>
  ));

  console.log(`${baseUrl}${user.avatar}`);
  const menuItemsTemplate = menuItems.map((item, index) => (
    <React.Fragment key={index}>
      <List.Item
        title={item.title}
        left={(props) => <List.Icon {...props} icon={item.icon} />}
        right={(props) => <List.Icon {...props} icon="chevron-right" />}
        onPress={item.onPress}
        className="px-4"
      />
      {index < menuItems.length - 1 && <Divider />}
    </React.Fragment>
  ));

  const studentMenuItemsTemplate = studentMenuItems.map((item, index) => (
    <React.Fragment key={index}>
      <List.Item
        title={item.title}
        left={(props) => <List.Icon {...props} icon={item.icon} />}
        right={(props) => <List.Icon {...props} icon="chevron-right" />}
        onPress={item.onPress}
        className="px-4"
      />
      {index < menuItems.length - 1 && <Divider />}
    </React.Fragment>
  ));

  return (
    <MainLayout>
      <ScrollView className="flex-1 bg-gray-50">
        {/* User Info Tile */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Profile")}
          className="bg-white p-4 flex-row items-center mb-2"
        >
          {user?.avatar ? (
            <Image
              source={{ uri: `${baseUrl}${user.avatar}` }}
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <Avatar.Icon size={64} icon="account" />
          )}

          <View className="ml-4 flex-1">
            <Text className="text-lg font-semibold text-gray-900">
              {user?.username || "Người dùng"}
            </Text>
            <Text className="text-sm text-gray-500">
              {user?.email || "email@example.com"}
            </Text>
          </View>

          <List.Icon icon="chevron-right" />
        </TouchableOpacity>

        <Divider />

        {/* Menu Items */}
        <View className="bg-white mt-2">
          {menuItemsTemplate}
          {roles.includes("STUDENT") && studentMenuItemsTemplate}
          {bottomMenuItemsTemplate}
        </View>

        <Divider className="mt-2" />

        {/* Logout Button */}
        <View className="bg-white mt-2">
          <List.Item
            title="Đăng xuất"
            titleStyle={{ color: "#ef4444" }}
            left={(props) => (
              <List.Icon {...props} icon="logout" color="#ef4444" />
            )}
            onPress={handleLogout}
            className="px-4"
          />
        </View>

        {/* Version Info */}
        <View className="items-center py-6">
          <Text className="text-xs text-gray-400">Phiên bản 1.0.0</Text>
        </View>
      </ScrollView>
    </MainLayout>
  );
};

export default UserOptionScreen;
