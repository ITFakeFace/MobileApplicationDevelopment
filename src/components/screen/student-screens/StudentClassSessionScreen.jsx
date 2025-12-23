import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  Dimensions,
  StatusBar
} from 'react-native';
import { Card, Button, Divider, IconButton, Portal, Modal, TextInput, Chip, ActivityIndicator } from 'react-native-paper';
import { CameraView, useCameraPermissions } from 'expo-camera'; 
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Animated, { FadeInDown } from "react-native-reanimated"; // Import Animation

import api from '../../../api/APIClient'; 
import MainLayout from '../../layout/MainLayout';

const { width } = Dimensions.get('window');

const StudentClassSessionScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { sessionId } = route.params || {}; 
  const { user } = useSelector((state) => state.auth);

  // State
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Điểm danh State
  const [isAttended, setIsAttended] = useState(false);
  const [sessionStatus, setSessionStatus] = useState(null); // 'OPEN', 'CLOSED'
  
  // Modal State
  const [showManualInput, setShowManualInput] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [manualCode, setManualCode] = useState('');
  
  // Camera Permission
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  // --- 1. LẤY THÔNG TIN BUỔI HỌC (Mapping giống Teacher) ---
  const fetchSessionInfo = async () => {
  if (!sessionId || !user?.id) return;
  
  if (!sessionData) setLoading(true);

  try {
    console.log("Fetching session info for ID:", sessionId);
    const [sessionRes, recordsRes] = await Promise.all([
      api.get(`/sessions/${sessionId}`),
      api.get(`/attendance/records/session/${sessionId}`)
    ]);

    const sessionRaw = sessionRes.data?.data || sessionRes.data;
    
    // Dữ liệu từ API bạn gửi: response.data.data là một mảng
    const records = recordsRes.data?.data || recordsRes.data || [];
    console.log("Attendance records fetched:", records);
    console.log("Session data fetched:", sessionRaw);
    // 👇 SỬA LOGIC Ở ĐÂY: Đối chiếu với stdId theo dữ liệu thực tế của bạn
    const myRecord = records.find(r => r.stdId === user.id);
    console.log("My attendance record:", myRecord);
    // Kiểm tra trạng thái: Nếu status là PRESENT, LATE hoặc EXCUSED thì coi như đã điểm danh
    const isUserPresent = myRecord && (
        myRecord.status === 'PRESENT' || 
        myRecord.status === 'LATE' || 
        myRecord.status === 'EXCUSED'
    );

    const mappedSession = {
      ...sessionRaw,
      className: sessionRaw.class?.name || sessionRaw.courseName || "Lớp học",
      sessionTitle: sessionRaw.title || `Buổi học`,
      teacherName: sessionRaw.class?.lecturer?.fullname || "Giảng viên", 
      room: sessionRaw.description || sessionRaw.room || "Chưa cập nhật",
      date: sessionRaw.date || sessionRaw.startTime,
      startTime: sessionRaw.startTime,
      endTime: sessionRaw.endTime,
    };

    setSessionData(mappedSession);
    setSessionStatus(sessionRaw.isAttendanceOpen ? 'OPEN' : 'CLOSED'); 
    setIsAttended(!!isUserPresent); // Ép kiểu về boolean

  } catch (error) {
    console.error("Fetch Error:", error);
  } finally {
    setLoading(false);
  }
};

  useFocusEffect(
  useCallback(() => {
    console.log("useFocusEffect triggered! sessionId:", sessionId);
    if (sessionId) {
      fetchSessionInfo();
    } else {
      console.log("Wait... sessionId is missing!");
      setLoading(false); // Tắt loading nếu không có ID
    }
  }, [sessionId])
);

  // --- 2. XỬ LÝ ĐIỂM DANH ---
  const submitAttendance = async (code, type = 'MANUAL') => {
    setLoading(true);
    try {
      // ĐỔI URL: Khớp với @Post('check-in') ở Backend
      const res = await api.post('/attendance/records/check-in', {
        sessionId: sessionId,
        code: code, // Đây là mã QR hoặc OTP nhập tay
      });
      console.log("Attendance Response:", res.data);

      setIsAttended(true);
      setShowManualInput(false);
      setShowScanner(false);
      setManualCode('');
      
      // Load lại thông tin để cập nhật giao diện (hiện chữ Đã có mặt)
      fetchSessionInfo();
      
      Alert.alert('Thành công', 'Bạn đã điểm danh thành công!');
    } catch (error) {
      // Lấy message lỗi từ ResponseModel của NestJS gửi về
      const msg = error.response?.data?.message || 'Điểm danh thất bại.';
      Alert.alert('Lỗi', msg);
      
      if (type === 'QR') {
        setTimeout(() => setScanned(false), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  // --- 3. CAMERA & QR ---
  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned) return;
    setScanned(true); 
    submitAttendance(data, 'QR');
  };

  const handleOpenScanner = async () => {
    if (!permission) await requestPermission();
    if (!permission?.granted) {
       const { status } = await requestPermission();
       if (status !== 'granted') {
         Alert.alert('Quyền truy cập', 'Bạn cần cấp quyền Camera để quét mã QR.');
         return;
       }
    }
    setScanned(false);
    setShowScanner(true);
  };

  // --- 4. FORMAT HELPERS (Giống Teacher) ---
  const formatTime = (timeString) => {
    if (!timeString) return "--:--";
    const date = new Date(timeString);
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "--/--/----";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });
  };

  // Config hiển thị trạng thái cho sinh viên
  const getStudentStatusConfig = () => {
      if (isAttended) return { label: "Đã điểm danh", color: "#10b981", icon: "✅" }; // Xanh lá
      if (sessionStatus === 'OPEN') return { label: "Đang mở điểm danh", color: "#3b82f6", icon: "⏳" }; // Xanh dương
      return { label: "Chưa điểm danh / Đã đóng", color: "#6b7280", icon: "🔒" }; // Xám
  };

  if (loading && !sessionData) {
      return (
          <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#6366f1" />
          </View>
      )
  }

  if (!sessionId || !sessionData) {
      return (
          <View style={styles.centerContainer}>
              <Text>Không tìm thấy thông tin buổi học.</Text>
          </View>
      )
  }

  const statusConfig = getStudentStatusConfig();

  return (
    <MainLayout>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* --- Card Thông Tin Môn Học (Giống Teacher) --- */}
        <Animated.View entering={FadeInDown.duration(600).delay(200)}>
            <Card style={styles.infoCard}>
                <Card.Content>
                    {/* Badge Trạng Thái */}
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusIcon}>{statusConfig.icon}</Text>
                        <Chip 
                            mode="flat" 
                            style={[styles.statusChip, { backgroundColor: statusConfig.color }]} 
                            textStyle={styles.statusText}
                        >
                            {statusConfig.label}
                        </Chip>
                    </View>

                    {/* Tên Lớp & Buổi học */}
                    <Text style={styles.className}>{sessionData.className}</Text>
                    <Text style={styles.sessionTitle}>{sessionData.sessionTitle}</Text>
                    
                    <View style={styles.divider} />

                    {/* Chi tiết: Ngày, Giờ, GV, Phòng */}
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>📅 Ngày học:</Text>
                        <Text style={styles.infoValue}>{formatDate(sessionData.date)}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>⏰ Thời gian:</Text>
                        <Text style={styles.infoValue}>
                            {formatTime(sessionData.startTime)} - {formatTime(sessionData.endTime)}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>👨‍🏫 Giảng viên:</Text>
                        <Text style={styles.infoValue}>{sessionData.teacherName}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>🚪 Phòng:</Text>
                        <Text style={styles.infoValue}>{sessionData.room}</Text>
                    </View>
                </Card.Content>
            </Card>
        </Animated.View>

        {/* --- Card Thao Tác Điểm Danh --- */}
        <Animated.View entering={FadeInDown.duration(600).delay(400)}>
            <Card style={styles.actionCard}>
                <Card.Content>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
                        <Text style={styles.sectionTitle}>Điểm Danh</Text>
                        <Button 
                            mode="text" 
                            compact 
                            onPress={fetchSessionInfo} 
                            loading={loading}
                            labelStyle={{color: '#6366f1'}}
                        >
                            Làm mới
                        </Button>
                    </View>

                    {isAttended ? (
                         <View style={styles.successBox}>
                            <Text style={styles.successText}>✓ Bạn đã có mặt trong buổi học này</Text>
                            <Text style={{textAlign: 'center', color: '#047857', fontSize: 12, marginTop: 4}}>
                                Chúc bạn học tốt!
                            </Text>
                        </View>
                    ) : sessionStatus === 'OPEN' ? (
                        <View style={styles.actionContainer}>
                            <View style={styles.statusBadgeOpen}>
                                <Text style={styles.statusTextOpen}>⚡ Phiên điểm danh đang mở</Text>
                            </View>

                            <View style={styles.buttonGroup}>
                                <Button
                                    mode="contained" // Đổi thành contained cho nổi bật
                                    onPress={() => setShowManualInput(true)}
                                    icon="keyboard"
                                    style={[styles.actionBtn, {backgroundColor: '#fff', borderColor: '#6366f1', borderWidth: 1}]}
                                    textColor="#6366f1"
                                >
                                    Nhập Mã
                                </Button>

                                <Button
                                    mode="contained"
                                    onPress={handleOpenScanner}
                                    icon="qrcode-scan"
                                    style={[styles.actionBtn, {backgroundColor: '#6366f1'}]}
                                >
                                    Quét QR
                                </Button>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.closedBox}>
                            <Text style={styles.closedText}>Phiên điểm danh chưa mở hoặc đã kết thúc.</Text>
                        </View>
                    )}
                </Card.Content>
            </Card>
        </Animated.View>

        {/* --- MODAL: NHẬP MÃ --- */}
        <Portal>
            <Modal
            visible={showManualInput}
            onDismiss={() => setShowManualInput(false)}
            contentContainerStyle={styles.modalContent}
            >
            <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Nhập Mã Xác Thực</Text>
                <IconButton icon="close" size={20} onPress={() => setShowManualInput(false)} />
            </View>

            <TextInput
                mode="outlined"
                style={styles.input}
                placeholder="Nhập mã 6 số"
                keyboardType="number-pad"
                maxLength={6}
                value={manualCode}
                onChangeText={setManualCode}
                outlineColor="#E5E7EB"
                activeOutlineColor="#6366f1"
            />

            <Button
                mode="contained"
                onPress={() => submitAttendance(manualCode, 'MANUAL')}
                loading={loading}
                disabled={manualCode.length < 4}
                style={{ marginTop: 16, backgroundColor: '#6366f1' }}
            >
                Xác Nhận
            </Button>
            </Modal>
        </Portal>

        {/* --- MODAL: CAMERA SCANNER --- */}
        <Portal>
            <Modal
                visible={showScanner}
                onDismiss={() => setShowScanner(false)}
                contentContainerStyle={styles.cameraModal}
            >
                <View style={{ flex: 1, backgroundColor: 'black' }}>
                    <CameraView
                        style={StyleSheet.absoluteFillObject}
                        facing="back"
                        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                        barcodeScannerSettings={{
                            barcodeTypes: ["qr"],
                        }}
                    />
                    
                    <View style={styles.cameraOverlay}>
                        <Text style={styles.cameraText}>Di chuyển camera vào mã QR</Text>
                        <TouchableOpacity 
                            style={styles.closeCameraBtn}
                            onPress={() => setShowScanner(false)}
                        >
                            <Text style={{color: '#fff', fontWeight: 'bold'}}>Đóng</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.scannerFrame} />
                </View>
            </Modal>
        </Portal>

      </ScrollView>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Styles giống Teacher Info Card
  infoCard: { margin: 16, marginBottom: 8, borderRadius: 12, elevation: 2, backgroundColor: '#fff' },
  statusBadge: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  statusIcon: { fontSize: 24, marginRight: 8 },
  statusChip: { height: 32 },
  statusText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  className: { fontSize: 20, fontWeight: "bold", color: "#1f2937", marginBottom: 4 },
  sessionTitle: { fontSize: 16, color: "#6b7280", marginBottom: 16 },
  divider: { height: 1, backgroundColor: "#e5e7eb", marginVertical: 16 },
  infoRow: { flexDirection: "row", marginBottom: 12, alignItems: "center" },
  infoLabel: { fontSize: 15, color: "#6b7280", width: 120 },
  infoValue: { fontSize: 15, color: "#1f2937", fontWeight: "600", flex: 1 },

  // Action Card Styles
  actionCard: { margin: 16, marginTop: 8, borderRadius: 12, elevation: 2, backgroundColor: '#fff' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  
  actionContainer: { marginTop: 8 },
  statusBadgeOpen: { backgroundColor: '#EFF6FF', padding: 12, borderRadius: 8, marginBottom: 16, alignItems: 'center' },
  statusTextOpen: { color: '#2563EB', fontWeight: '600' },
  buttonGroup: { gap: 12 },
  actionBtn: { borderRadius: 8, paddingVertical: 4 },
  
  successBox: { backgroundColor: '#ECFDF5', padding: 20, borderRadius: 8, borderColor: '#10B981', borderWidth: 1, marginTop: 10, alignItems: 'center' },
  successText: { color: '#047857', fontWeight: 'bold', fontSize: 16 },
  
  closedBox: { backgroundColor: '#F3F4F6', padding: 20, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  closedText: { color: '#6B7280', fontStyle: 'italic' },

  // Modal Styles
  modalContent: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 12 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  input: { backgroundColor: '#fff', textAlign: 'center', fontSize: 18 },

  // Camera Styles
  cameraModal: { flex: 1, margin: 0 },
  cameraOverlay: { position: 'absolute', top: 50, left: 0, right: 0, alignItems: 'center', zIndex: 10 },
  cameraText: { color: '#fff', backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 4, marginBottom: 10 },
  closeCameraBtn: { backgroundColor: 'rgba(255,255,255,0.3)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  scannerFrame: {
      position: 'absolute',
      top: '30%',
      left: width * 0.15,
      width: width * 0.7,
      height: width * 0.7,
      borderWidth: 2,
      borderColor: '#6366f1',
      borderRadius: 12
  }
});

export default StudentClassSessionScreen;