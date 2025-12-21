import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setBaseUrl } from '../../redux/slices/ConfigSlice';

export default function SettingIpScreen({ navigation }) {
  const dispatch = useDispatch();
  // Lấy IP hiện tại từ Redux để hiển thị lên ô input
  const currentUrl = useSelector((state) => state.config.baseUrl);
  
  const [url, setUrl] = useState(currentUrl);

  // Sync state khi Redux thay đổi (lúc mới vào màn hình)
  useEffect(() => {
    setUrl(currentUrl);
  }, [currentUrl]);

  const handleSave = () => {
    // Validate sơ sơ (nếu cần)
    if (!url.startsWith('http')) {
      Alert.alert('Lỗi', 'URL phải bắt đầu bằng http:// hoặc https://');
      return;
    }

    // Lưu vào Redux
    dispatch(setBaseUrl(url));
    Alert.alert('Thành công', 'Đã cập nhật IP server!', [
        { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <View className="flex-1 p-5 bg-white justify-center">
      <Text className="text-xl font-bold mb-4 text-center">Cấu hình Server IP</Text>
      
      <Text className="text-gray-600 mb-2">Nhập URL API (VD: http://192.168.1.5:3000)</Text>
      <TextInput
        className="border border-gray-300 rounded-lg p-3 mb-6 text-lg"
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
        keyboardType="url"
      />

      <TouchableOpacity 
        className="bg-blue-600 p-4 rounded-lg items-center"
        onPress={handleSave}
      >
        <Text className="text-white font-bold text-lg">Lưu Cấu Hình</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        className="mt-4 p-4 items-center"
        onPress={() => navigation.goBack()}
      >
        <Text className="text-gray-500">Hủy bỏ</Text>
      </TouchableOpacity>
    </View>
  );
}