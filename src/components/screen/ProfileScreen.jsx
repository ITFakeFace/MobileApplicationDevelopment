import { Text, View } from "react-native";
import MainLayout from "../layout/MainLayout";

export default function ProfileScreen() {
  return (
    <MainLayout>
      <View className="flex-1 items-center justify-center">
        <Text className="text-lg font-semibold">Profile Screen</Text>
      </View>
    </MainLayout>
  );
}