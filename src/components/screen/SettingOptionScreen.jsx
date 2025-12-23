import React from "react";
import { View, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import { List, Avatar, Divider, Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import MainLayout from "../layout/MainLayout";

const SettingOptionScreen = () => {
  const navigation = useNavigation();

  const menuItems = [
    {
      title: "Cài đặt IP",
      icon: "cog",
      onPress: () => navigation.navigate("SettingIpScreen"),
    },
    {
      title: "Cài đặt Data",
      icon: "help-circle",
      onPress: () => navigation.navigate("Help"),
    },
  ];

  return (
    <MainLayout>
      <ScrollView className="flex-1 bg-gray-50">
        <View className="bg-white mt-2">
          {menuItems.map((item, index) => (
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
          ))}
        </View>

      </ScrollView>
    </MainLayout>
  );
};

export default SettingOptionScreen;
