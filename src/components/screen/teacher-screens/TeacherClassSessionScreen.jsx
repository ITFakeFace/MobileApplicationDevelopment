import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Button, Card, Chip, Portal, Modal } from "react-native-paper";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import QRCode from "react-native-qrcode-svg";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import api from "../../../api/APIClient";
import { useSelector } from "react-redux";

const TeacherClassSessionScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { sessionId } = route.params;
  const { user } = useSelector((state) => state.auth);

  const [session, setSession] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    attendedStudents: 0,
    absentStudents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrData, setQrData] = useState("");

  // --- 1. GET SESSION DETAILS ---
  const fetchSessionDetails = async () => {
    try {
      const response = await api.get(`/sessions/${sessionId}`);
      const responseData = response.data?.data || response.data;

      if (responseData) {
        setSession({
          ...responseData,
          className: responseData.class?.name || "Lớp học",
          sessionTitle: responseData.title || `Buổi học số ${responseData.sessionNumber}`,
          teacherName: user?.fullname || "Tôi",
          room: responseData.description || "Chưa cập nhật",
        });

        if (responseData.isAttendanceOpen && responseData.attendanceCode) {
          setQrData(responseData.attendanceCode);
        }
      }
    } catch (error) {
      console.error("Error fetching session:", error);
    }
  };

  // --- 2. GET STATISTICS (MỚI THÊM) ---
  const fetchStatistics = async () => {
    try {
      // Gọi API thống kê riêng biệt
      const response = await api.get(`/attendance/records/statistics/${sessionId}`);
      const data = response.data?.data || response.data;
      
      if (data) {
        setStats({
          totalStudents: data.totalStudents || 0,
          attendedStudents: data.attendedStudents || 0,
          absentStudents: data.absentStudents || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Hàm load tất cả dữ liệu
  const loadAllData = async () => {
    // Chỉ show loading lần đầu
    if (!session) setLoading(true);
    
    await Promise.all([fetchSessionDetails(), fetchStatistics()]);
    
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadAllData();

      // Có thể set interval để tự động cập nhật số liệu mỗi 5-10s nếu muốn realtime
      const interval = setInterval(fetchStatistics, 5000);
      return () => clearInterval(interval);
    }, [sessionId])
  );

  // --- 3. START SESSION ---
  const handleStartSession = async () => {
    try {
      Alert.alert(
        "Bắt đầu lớp học",
        'Trạng thái sẽ chuyển sang "Đang diễn ra".',
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Bắt đầu",
            onPress: async () => {
              await api.post(`/sessions/${sessionId}/start`);
              loadAllData();
              Alert.alert("Thành công", "Lớp học đã bắt đầu.");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error starting session:", error);
      Alert.alert("Lỗi", "Không thể bắt đầu lớp học.");
    }
  };

  // --- 4. FINISH SESSION ---
  const handleFinishSession = async () => {
    try {
      Alert.alert(
        "Kết thúc lớp học",
        "Lớp học sẽ đóng và không thể điểm danh nữa.",
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Kết thúc",
            onPress: async () => {
              await api.post(`/sessions/${sessionId}/finish`);
              setQrModalVisible(false);
              loadAllData();
              Alert.alert("Thành công", "Lớp học đã kết thúc.");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error finishing session:", error);
      Alert.alert("Lỗi", "Không thể kết thúc lớp học.");
    }
  };

  // --- 5. OPEN ATTENDANCE ---
  const handleOpenAttendance = async () => {
    if (session.isAttendanceOpen && session.attendanceCode) {
      setQrData(session.attendanceCode);
      setQrModalVisible(true);
      return;
    }

    try {
      const response = await api.post(`/sessions/${sessionId}/attendance/open`);
      const data = response.data?.data || response.data;

      if (data && data.attendanceCode) {
        setQrData(data.attendanceCode);
        setSession((prev) => ({
          ...prev,
          isAttendanceOpen: true,
          attendanceCode: data.attendanceCode,
        }));
        setQrModalVisible(true);
        // Reload lại thống kê (vì vừa tạo record mới cho cả lớp - mặc định vắng)
        fetchStatistics(); 
      }
    } catch (error) {
      console.error("Error opening attendance:", error);
      Alert.alert("Lỗi", "Không thể tạo mã điểm danh. Hãy chắc chắn lớp đã Bắt đầu.");
    }
  };

  // --- 6. CLOSE ATTENDANCE ---
  const handleCloseAttendance = async () => {
    try {
      Alert.alert(
        "Đóng điểm danh",
        "Sinh viên sẽ không thể quét mã nữa. Bạn có chắc chắn?",
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Đóng",
            onPress: async () => {
                try {
                    await api.post(`/sessions/${sessionId}/attendance/close`);
                    setSession((prev) => ({
                        ...prev,
                        isAttendanceOpen: false,
                    }));
                    fetchStatistics(); // Update lần cuối
                    Alert.alert("Thành công", "Đã đóng điểm danh.");
                } catch (err) {
                    console.error(err);
                    Alert.alert("Lỗi", "Không thể đóng điểm danh.");
                }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error closing attendance:", error);
    }
  };

  // Helper formats
  const formatTime = (timeString) => {
    if (!timeString) return "--:--";
    const date = new Date(timeString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "--/--/----";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      SCHEDULED: { label: "Chưa bắt đầu", color: "#3b82f6", icon: "📅", canStart: true, canFinish: false },
      ONGOING: { label: "Đang diễn ra", color: "#10b981", icon: "🟢", canStart: false, canFinish: true },
      FINISHED: { label: "Đã kết thúc", color: "#6b7280", icon: "✅", canStart: false, canFinish: false },
      CANCELED: { label: "Đã hủy", color: "#ef4444", icon: "❌", canStart: false, canFinish: false },
    };
    return configs[status] || configs.SCHEDULED;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không tìm thấy buổi học</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>Quay lại</Button>
      </View>
    );
  }

  const statusConfig = getStatusConfig(session.status);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Session Info Card */}
        <Animated.View entering={FadeInDown.duration(600).delay(200)}>
          <Card style={styles.infoCard}>
            <Card.Content>
              <View style={styles.statusBadge}>
                <Text style={styles.statusIcon}>{statusConfig.icon}</Text>
                <Chip mode="flat" style={[styles.statusChip, { backgroundColor: statusConfig.color }]} textStyle={styles.statusText}>
                  {statusConfig.label}
                </Chip>
              </View>

              <Text style={styles.className}>{session.className}</Text>
              <Text style={styles.sessionTitle}>{session.sessionTitle}</Text>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📅 Ngày học:</Text>
                <Text style={styles.infoValue}>{formatDate(session.date)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>⏰ Thời gian:</Text>
                <Text style={styles.infoValue}>{formatTime(session.startTime)} - {formatTime(session.endTime)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>👨‍🏫 Giáo viên:</Text>
                <Text style={styles.infoValue}>{session.teacherName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>🚪 Phòng/Note:</Text>
                <Text style={styles.infoValue}>{session.room}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>👥 Sĩ số:</Text>
                <Text style={styles.infoValue}>{stats.attendedStudents}/{stats.totalStudents} học sinh</Text>
              </View>
            </Card.Content>
          </Card>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View entering={FadeInDown.duration(600).delay(400)} style={styles.actionsContainer}>
          <Button
            mode="contained"
            onPress={handleStartSession}
            disabled={!statusConfig.canStart}
            style={[styles.actionButton, !statusConfig.canStart && styles.disabledButton]}
            labelStyle={styles.buttonLabel}
            icon="door-open"
          >
            Bắt đầu lớp học
          </Button>

          <Button
            mode="contained"
            onPress={handleFinishSession}
            disabled={!statusConfig.canFinish}
            style={[styles.actionButton, styles.closeButton, !statusConfig.canFinish && styles.disabledButton]}
            labelStyle={styles.buttonLabel}
            icon="door-closed"
          >
            Kết thúc lớp học
          </Button>

          {session.status === "ONGOING" && (
            <>
                <Button
                mode="outlined"
                onPress={handleOpenAttendance}
                style={styles.qrButton}
                labelStyle={styles.qrButtonLabel}
                icon="qrcode"
                >
                {session.isAttendanceOpen ? "Hiện lại mã QR" : "Mở điểm danh (QR)"}
                </Button>

                {session.isAttendanceOpen && (
                    <Button
                        mode="outlined"
                        onPress={handleCloseAttendance}
                        style={[styles.qrButton, { borderColor: '#ef4444' }]} 
                        labelStyle={[styles.qrButtonLabel, { color: '#ef4444' }]}
                        icon="close-circle-outline"
                    >
                        Đóng điểm danh
                    </Button>
                )}
            </>
          )}
        </Animated.View>

        {/* Attendance Stats Card - ĐÃ CẬP NHẬT BIẾN STATS */}
        {session.status !== "CANCELED" && (
          <Animated.View entering={FadeInDown.duration(600).delay(600)}>
            <Card style={styles.statsCard}>
              <Card.Content>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
                    <Text style={styles.statsTitle}>Thống kê điểm danh</Text>
                    <Button 
                        compact 
                        mode="text" 
                        onPress={fetchStatistics} 
                        icon="refresh"
                        labelStyle={{fontSize: 12}}
                    >
                        Làm mới
                    </Button>
                </View>

                <View style={styles.statsContainer}>
                  {/* Có mặt */}
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.attendedStudents}</Text>
                    <Text style={styles.statLabel}>Có mặt</Text>
                  </View>
                  <View style={styles.statDivider} />
                  
                  {/* Vắng */}
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, styles.statAbsent]}>
                      {stats.absentStudents}
                    </Text>
                    <Text style={styles.statLabel}>Vắng</Text>
                  </View>
                  <View style={styles.statDivider} />
                  
                  {/* Tỷ lệ */}
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {stats.totalStudents > 0
                        ? Math.round((stats.attendedStudents / stats.totalStudents) * 100)
                        : 0}%
                    </Text>
                    <Text style={styles.statLabel}>Tỷ lệ</Text>
                  </View>
                </View>

                {/* Sĩ số tổng (Optional) */}
                <Text style={{textAlign: 'center', marginTop: 12, color: '#6b7280', fontSize: 13}}>
                   Tổng sĩ số: {stats.totalStudents} sinh viên
                </Text>

                <Button
                  mode="text"
                  icon="account-details"
                  style={{ marginTop: 8 }}
                  labelStyle={{ color: "#6366f1" }}
                  onPress={() => navigation.navigate("AttendanceDetail", { sessionId })}
                >
                  Xem chi tiết danh sách
                </Button>
              </Card.Content>
            </Card>
          </Animated.View>
        )}
      </ScrollView>

      {/* QR Code Modal */}
      <Portal>
        <Modal
          visible={qrModalVisible}
          onDismiss={() => setQrModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Animated.View entering={ZoomIn.duration(400)} style={styles.qrModalContent}>
            <Text style={styles.qrModalTitle}>Mã QR điểm danh</Text>
            <Text style={styles.qrModalSubtitle}>Học sinh quét mã này để điểm danh</Text>

            {qrData ? (
              <View style={styles.qrCodeContainer}>
                <QRCode value={qrData} size={250} />
                <Text style={{ textAlign: "center", marginTop: 10, fontSize: 24, fontWeight: "bold", letterSpacing: 2 }}>
                  {qrData}
                </Text>
              </View>
            ) : (
              <ActivityIndicator size="large" color="#6366f1" />
            )}

            <Text style={styles.qrInfo}>{session.className}</Text>
            <Text style={styles.qrInfo}>{session.sessionTitle}</Text>

            <Button mode="contained" onPress={() => setQrModalVisible(false)} style={styles.closeModalButton}>
              Đóng
            </Button>
          </Animated.View>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ... Các styles cũ giữ nguyên
  container: { flex: 1, backgroundColor: "#f9fafb" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f9fafb" },
  loadingText: { marginTop: 12, fontSize: 16, color: "#6b7280" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: 'center', padding: 20 },
  errorText: { fontSize: 18, color: "#6b7280", marginBottom: 20 },
  scrollView: { flex: 1 },
  infoCard: { margin: 16, borderRadius: 12, elevation: 2 },
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
  actionsContainer: { paddingHorizontal: 16, gap: 12 },
  actionButton: { borderRadius: 12, paddingVertical: 8, backgroundColor: "#6366f1" },
  closeButton: { backgroundColor: "#ef4444" },
  disabledButton: { backgroundColor: "#d1d5db" },
  buttonLabel: { fontSize: 16, fontWeight: "600" },
  qrButton: { borderRadius: 12, borderColor: "#6366f1", borderWidth: 2 },
  qrButtonLabel: { color: "#6366f1", fontSize: 16, fontWeight: "600" },
  statsCard: { margin: 16, borderRadius: 12, elevation: 2 },
  statsTitle: { fontSize: 18, fontWeight: "bold", color: "#1f2937" },
  statsContainer: { flexDirection: "row", justifyContent: "space-around" },
  statItem: { alignItems: "center", flex: 1 },
  statValue: { fontSize: 32, fontWeight: "bold", color: "#6366f1", marginBottom: 4 },
  statAbsent: { color: "#ef4444" },
  statLabel: { fontSize: 13, color: "#6b7280" },
  statDivider: { width: 1, backgroundColor: "#e5e7eb", marginHorizontal: 8 },
  modalContainer: { backgroundColor: "white", margin: 20, borderRadius: 16, padding: 24, alignItems: "center" },
  qrModalContent: { alignItems: "center" },
  qrModalTitle: { fontSize: 22, fontWeight: "bold", color: "#1f2937", marginBottom: 8 },
  qrModalSubtitle: { fontSize: 14, color: "#6b7280", marginBottom: 24, textAlign: "center" },
  qrCodeContainer: { padding: 20, backgroundColor: "#fff", borderRadius: 12, marginBottom: 20, alignItems: "center" },
  qrInfo: { fontSize: 14, color: "#6b7280", textAlign: "center", marginBottom: 4 },
  closeModalButton: { marginTop: 20, width: "100%", borderRadius: 12 },
});

export default TeacherClassSessionScreen;