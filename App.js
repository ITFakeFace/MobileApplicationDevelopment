import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import MainLayout from "./src/components/layout/MainLayout";
import { View } from "react-native";

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <View>
          <MainLayout></MainLayout>
        </View>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
