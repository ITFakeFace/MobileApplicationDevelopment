import { Text, View } from "react-native";

const MainLayout = ({children})=>{
    return (
        <View className="flex-1 mt-10">
            {children}
        </View>
    )
}

export default MainLayout;