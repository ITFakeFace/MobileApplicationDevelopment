import React from "react";
import { View, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import { Avatar, Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import MainLayout from "../layout/MainLayout";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/AuthSlice";

const ROLE_LABEL = {
  STUDENT: "Học viên",
  ADMIN: "Admin",
  STAFF: "Nhân viên",
  TEACHER: "Giảng viên",
};

const UserOptionScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { user, roles } = useSelector((state) => state.auth);
  const baseUrl = useSelector(
    (state) => state.config?.baseUrl || "http://localhost:3000"
  );

  const isStudent = Array.isArray(roles) && roles.includes("STUDENT");

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất không?", [
      { text: "Hủy", style: "cancel" },
      { text: "Đồng ý", style: "destructive", onPress: () => dispatch(logout()) },
    ]);
  };

  const menuItems = [
    {
      title: "Thông tin cá nhân",
      icon: "account-circle",
      tone: "indigo",
      onPress: () => navigation.navigate("Profile"),
    },
  ];

  const studentMenuItems = [
    {
      title: "Yêu cầu hỗ trợ",
      icon: "headset",
      tone: "emerald",
      onPress: () => navigation.navigate("RequestForm"),
    },
  ];

  const bottomMenuItems = [
    {
      title: "Thông tin liên lạc",
      icon: "phone",
      tone: "cyan",
      onPress: () => navigation.navigate("ContactUs"),
    },
    {
      title: "Về chúng tôi",
      icon: "information",
      tone: "violet",
      onPress: () => navigation.navigate("AboutUs"),
    },
    {
      title: "Cài đặt",
      icon: "cog",
      tone: "amber",
      onPress: () => navigation.navigate("SettingOption"),
    },
    {
      title: "Trợ giúp",
      icon: "lifebuoy",
      tone: "pink",
      onPress: () => navigation.navigate("Help"),
    },
  ];

  const toneStyles = (tone) => {
    switch (tone) {
      case "cyan":
        return { bg: "#ECFEFF", fg: "#0891B2" };
      case "violet":
        return { bg: "#F5F3FF", fg: "#7C3AED" };
      case "pink":
        return { bg: "#FCE7F3", fg: "#DB2777" };
      case "emerald":
        return { bg: "#ECFDF5", fg: "#059669" };
      case "amber":
        return { bg: "#FFFBEB", fg: "#D97706" };
      case "indigo":
      default:
        return { bg: "#EEF2FF", fg: "#4F46E5" };
    }
  };

  const MenuCard = ({ children }) => (
    <View className="bg-white rounded-2xl mx-4 mt-3 overflow-hidden border border-gray-100">
      {children}
    </View>
  );

  const Divider = () => <View className="h-[1px] bg-gray-100" />;

  const MenuRow = ({ title, icon, tone, onPress }) => {
    const t = toneStyles(tone);
    return (
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onPress}
        className="px-4 py-3 flex-row items-center"
      >
        <View
          className="w-11 h-11 rounded-2xl items-center justify-center border"
          style={{ backgroundColor: t.bg, borderColor: "rgba(0,0,0,0.04)" }}
        >
          <Avatar.Icon
            size={30}
            icon={icon}
            color={t.fg}
            style={{ backgroundColor: "transparent" }}
          />
        </View>

        <View className="flex-1 ml-3">
          <Text className="text-[15px] font-semibold text-gray-900">{title}</Text>
        </View>

        <Avatar.Icon
          size={26}
          icon="chevron-right"
          color="#9CA3AF"
          style={{ backgroundColor: "transparent" }}
        />
      </TouchableOpacity>
    );
  };

  const LogoutRow = () => (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={handleLogout}
      className="px-4 py-3 flex-row items-center"
    >
      <View
        className="w-11 h-11 rounded-2xl items-center justify-center border"
        style={{ backgroundColor: "#FEF2F2", borderColor: "rgba(0,0,0,0.04)" }}
      >
        <Avatar.Icon
          size={30}
          icon="logout"
          color="#EF4444"
          style={{ backgroundColor: "transparent" }}
        />
      </View>

      <View className="flex-1 ml-3">
        <Text className="text-[15px] font-semibold" style={{ color: "#EF4444" }}>
          Đăng xuất
        </Text>
      </View>

      <Avatar.Icon
        size={26}
        icon="chevron-right"
        color="#FCA5A5"
        style={{ backgroundColor: "transparent" }}
      />
    </TouchableOpacity>
  );

  const userAvatarUri =
    user?.avatar ? { uri: `${baseUrl}${user.avatar}` } : null;

  return (
    <MainLayout>
      <ScrollView
        className="flex-1 bg-gray-50"
        showsVerticalScrollIndicator={false}
      >
        {/* PROFILE HEADER CARD */}
        <View className="mx-4 mt-4 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Accent strip */}
          <View className="h-2 bg-indigo-500" />

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate("Profile")}
            className="p-4 flex-row items-center"
          >
            {/* Avatar with ring */}
            <View
              className="rounded-full p-[2px]"
              style={{ backgroundColor: "rgba(79,70,229,0.25)" }}
            >
              {userAvatarUri ? (
                <Image
                  source={userAvatarUri}
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <Avatar.Icon size={64} icon="account" />
              )}
            </View>

            <View className="ml-4 flex-1">
              <Text className="text-[18px] font-bold text-gray-900">
                {user?.username || "Người dùng"}
              </Text>
              <Text className="text-[13px] text-gray-500 mt-1">
                {user?.email || "email@example.com"}
              </Text>

              {/* Role chips */}
              <View className="flex-row flex-wrap mt-2">
                {(Array.isArray(roles) ? roles : []).slice(0, 3).map((r) => (
                  <View
                    key={r}
                    className="mr-2 mb-2 px-3 py-[6px] rounded-full border"
                    style={{
                      backgroundColor: "#EEF2FF",
                      borderColor: "#E0E7FF",
                    }}
                  >
                    <Text
                      className="text-[11px] font-bold"
                      style={{ color: "#4F46E5" }}
                    >
                      {ROLE_LABEL[r] || r}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View className="items-end">
              <View
                className="px-3 py-2 rounded-full border"
                style={{
                  backgroundColor: "#EEF2FF",
                  borderColor: "#E0E7FF",
                }}
              >
                <Text className="text-[11px] font-extrabold text-indigo-600">
                  Xem hồ sơ
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* MAIN MENU */}
        <MenuCard>
          {menuItems.map((it, idx) => (
            <React.Fragment key={it.title}>
              <MenuRow {...it} />
              {idx < menuItems.length - 1 ? <Divider /> : null}
            </React.Fragment>
          ))}

          {isStudent ? <Divider /> : null}

          {isStudent &&
            studentMenuItems.map((it, idx) => (
              <React.Fragment key={it.title}>
                <MenuRow {...it} />
                {idx < studentMenuItems.length - 1 ? <Divider /> : null}
              </React.Fragment>
            ))}
        </MenuCard>

        {/* INFO MENU */}
        <MenuCard>
          {bottomMenuItems.map((it, idx) => (
            <React.Fragment key={it.title}>
              <MenuRow {...it} />
              {idx < bottomMenuItems.length - 1 ? <Divider /> : null}
            </React.Fragment>
          ))}
        </MenuCard>

        {/* LOGOUT */}
        <MenuCard>
          <LogoutRow />
        </MenuCard>

        {/* VERSION */}
        <View className="items-center py-6">
          <Text className="text-xs text-gray-400">Phiên bản 1.0.0</Text>
        </View>
      </ScrollView>
    </MainLayout>
  );
};

export default UserOptionScreen;
