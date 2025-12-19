import { NavigationContainer } from "@react-navigation/native";
import AuthNavigator from "../navigator/AuthNavigator";
import MainNavigator from "../navigator/MainNavigator";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";

const MainRouter = () => {
  const dispatch = useDispatch();
  // Lấy trạng thái đăng nhập từ Redux
  const { isLoggedIn } = useSelector((state) => state.auth);
  
  // (Tùy chọn) State check token local khi mới mở app
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
      {isLoggedIn ? (
        // Nếu ĐÃ đăng nhập -> Dùng Layout Main (Có Tabs, Header)
        <MainNavigator />
      ) : (
        // Nếu CHƯA đăng nhập -> Dùng Layout Auth (Trơn, full màn hình)
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export default MainRouter;
