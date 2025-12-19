import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import MainLayout from "./src/components/layout/MainLayout";
import { View } from "react-native";
import MainRouter from "./src/components/router/MainRouter";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./src/redux/store";
import { Provider } from "react-redux";

export default function App() {
  return (
    <Provider store={store}>
      {/* loading={null} nghĩa là khi đang đọc ổ cứng thì không hiện gì (hoặc hiện Splash Screen) */}
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <PaperProvider>
            <View className="flex-1">
              <MainRouter />
            </View>
          </PaperProvider>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}
