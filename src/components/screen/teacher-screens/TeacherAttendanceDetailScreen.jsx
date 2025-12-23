import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Card,
  Avatar,
  IconButton,
  Portal,
  Modal,
  TextInput,
  Button,
  Divider,
} from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import api from "../../../api/APIClient";
import MainLayout from "../../layout/MainLayout";
import { useSelector } from "react-redux";

// Định nghĩa các trạng thái và màu sắc
const ATTENDANCE_STATUS = {
  PRESENT: { label: "Có mặt", color: "#10B981", value: "PRESENT" },
  ABSENT: { label: "Vắng", color: "#EF4444", value: "ABSENT" },
  LATE: { label: "Trễ", color: "#F59E0B", value: "LATE" },
  EXCUSED: { label: "Có phép", color: "#6366F1", value: "EXCUSED" },
};

const TeacherAttendanceDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { sessionId } = route.params;

  const [loading, setLoading] = useState(true);
  const [studentList, setStudentList] = useState([]);
  const [stats, setStats] = useState({ present: 0, absent: 0, total: 0 });

  // State cho Modal Edit
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editStatus, setEditStatus] = useState("PRESENT");
  const [editNote, setEditNote] = useState("");
  const [updating, setUpdating] = useState(false);
  const baseUrl = useSelector(
    (state) => state.dataConfig?.baseUrl || "http://localhost:3000"
  );
  // --- 1. LẤY DỮ LIỆU DANH SÁCH (ĐÃ SỬA API) ---
  const fetchAttendanceList = async () => {
    try {
      // 👇 SỬA Ở ĐÂY: Gọi API lấy danh sách records thay vì lấy session detail
      const response = await api.get(
        `/attendance/records/session/${sessionId}`
      );

      console.log("List Response:", response.data); // Debug

      // Cấu trúc API trả về: { status: true, data: [ ...mảng records... ] }
      const records = response.data?.data || response.data;

      if (Array.isArray(records)) {
        // Tính toán thống kê
        const total = records.length;

        // Đếm số lượng theo trạng thái
        const present = records.filter((r) => r.status === "PRESENT").length;

        // Những ai không phải PRESENT thì coi như vắng (bao gồm ABSENT, LATE, EXCUSED...)
        // Hoặc bạn có thể đếm cụ thể từng loại nếu muốn hiển thị chi tiết hơn
        const absent = total - present;

        setStats({ total, present, absent });
        setStudentList(records);
      }
    } catch (error) {
      console.error("Error fetching attendance list:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách điểm danh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceList();
  }, [sessionId]);

  // --- 2. XỬ LÝ UPDATE ---
  const handleOpenModal = (record) => {
    setSelectedRecord(record);
    setEditStatus(record.status);
    setEditNote(record.note || "");
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!selectedRecord) return;

    try {
      setUpdating(true);
      // Gọi API Update Manual
      await api.put(
        `/attendance/records/manual/session/${sessionId}/student/${selectedRecord.stdId}`,
        {
          status: editStatus,
          note: editNote,
        }
      );

      setModalVisible(false);
      fetchAttendanceList(); // Reload lại danh sách sau khi sửa
      Alert.alert("Thành công", "Đã cập nhật điểm danh.");
    } catch (error) {
      console.error("Error updating record:", error);
      Alert.alert("Lỗi", "Cập nhật thất bại.");
    } finally {
      setUpdating(false);
    }
  };

  // --- RENDER ITEM DANH SÁCH ---
  const renderStudentItem = ({ item }) => {
    const statusConfig = ATTENDANCE_STATUS[item.status] || ATTENDANCE_STATUS.ABSENT;
    
    // 1. XỬ LÝ AVATAR
    // Tạo chữ cái đầu nếu không có ảnh
    const avatarLabel = item.student?.fullname
      ? item.student.fullname.split(" ").pop().charAt(0).toUpperCase()
      : "S";

    // Xử lý Link ảnh
    let avatarSource = null;
    if (item.student?.avatar) {
        // Nếu link đã là tuyệt đối (http...) thì giữ nguyên, nếu tương đối thì nối baseUrl
        const rawAvatar = item.student.avatar;
        if (rawAvatar.startsWith('http')) {
            avatarSource = { uri: rawAvatar };
        } else {
            // Xử lý xóa dấu / thừa để tránh lỗi url (vd: url//public)
            const cleanBase = baseUrl.replace(/\/$/, ""); 
            const cleanPath = rawAvatar.replace(/^\//, "");
            avatarSource = { uri: `${cleanBase}/${cleanPath}` };
        }
    }

    // 2. XỬ LÝ NGÀY SINH
    const formatDob = (dobString) => {
        if (!dobString) return "Ngày sinh: --/--/----";
        const date = new Date(dobString);
        return `Ngày sinh: ${date.toLocaleDateString("vi-VN")}`;
    };

    return (
      <Card style={styles.studentCard}>
        <View style={styles.cardRow}>
          
          {/* CỘT TRÁI: AVATAR + INFO */}
          <View style={styles.leftSection}>
            
            {/* Logic hiển thị: Có ảnh thì hiện ảnh, không thì hiện Chữ cái */}
            {avatarSource ? (
                <Avatar.Image 
                    size={45} 
                    source={avatarSource} 
                    style={{ backgroundColor: '#fff' }} // Nền trắng cho ảnh
                />
            ) : (
                <Avatar.Text 
                    size={45} 
                    label={avatarLabel} 
                    style={{ backgroundColor: statusConfig.color }} // Nền màu theo trạng thái
                    color="#fff"
                />
            )}

            <View style={styles.infoColumn}>
              {/* Tên sinh viên */}
              <Text style={styles.studentName}>{item.student?.fullname}</Text>
              
              {/* MSSV */}
              {/* <Text style={styles.studentId}>{item.student?.pID || "MSSV: N/A"}</Text> */}
              
              {/* 👇 NGÀY SINH (Thay vào vị trí Note cũ) */}
              <View style={styles.dobContainer}>
                 <Text style={styles.dobText}>
                    {formatDob(item.student?.dob)}
                 </Text>
              </View>

              {/* Nếu vẫn muốn hiện Note điểm danh thì để nhỏ ở dưới cùng */}
              {item.note ? (
                <Text style={styles.noteText} numberOfLines={1}>
                  Note: {item.note}
                </Text>
              ) : null}
            </View>
          </View>

          {/* CỘT PHẢI: TRẠNG THÁI + EDIT */}
          <View style={styles.rightSection}>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}> 
                <Text style={[styles.statusText, { color: statusConfig.color }]}>
                    {statusConfig.label}
                </Text>
            </View>
            
            <IconButton
              icon="pencil"
              iconColor="#6B7280"
              size={20}
              onPress={() => handleOpenModal(item)}
            />
          </View>
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        {/* --- HEADER: THỐNG KÊ --- */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Chi tiết điểm danh</Text>
          <Card style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: "#10B981" }]}>
                  {stats.present}
                </Text>
                <Text style={styles.statLabel}>Có mặt</Text>
              </View>
              <View style={styles.verticalDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: "#EF4444" }]}>
                  {stats.absent}
                </Text>
                <Text style={styles.statLabel}>Vắng</Text>
              </View>
              <View style={styles.verticalDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: "#6366f1" }]}>
                  {stats.total > 0
                    ? Math.round((stats.present / stats.total) * 100)
                    : 0}
                  %
                </Text>
                <Text style={styles.statLabel}>Tỷ lệ</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* --- BODY: DANH SÁCH --- */}
        <FlatList
          data={studentList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderStudentItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Chưa có danh sách sinh viên.</Text>
          }
        />

        {/* --- MODAL EDIT --- */}
        <Portal>
          <Modal
            visible={modalVisible}
            onDismiss={() => setModalVisible(false)}
            contentContainerStyle={styles.modalContainer}
          >
            {/* Tiêu đề Modal */}
            <Text style={styles.modalTitle}>Cập nhật trạng thái</Text>
            <Text style={styles.modalSubtitle}>
              {selectedRecord?.student?.fullname} -{" "}
              {selectedRecord?.student?.pID}
            </Text>

            <Divider style={{ marginVertical: 12 }} />

            {/* Chọn trạng thái (Custom Chips) */}
            <Text style={styles.inputLabel}>Trạng thái:</Text>
            <View style={styles.statusOptions}>
              {Object.keys(ATTENDANCE_STATUS).map((key) => {
                const item = ATTENDANCE_STATUS[key];
                const isSelected = editStatus === item.value;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.statusOptionBtn,
                      isSelected && { backgroundColor: item.color },
                      !isSelected && {
                        borderColor: item.color,
                        borderWidth: 1,
                      },
                    ]}
                    onPress={() => setEditStatus(item.value)}
                  >
                    <Text
                      style={[
                        styles.statusOptionText,
                        isSelected ? { color: "#fff" } : { color: item.color },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Nhập Note */}
            <Text style={styles.inputLabel}>Ghi chú:</Text>
            <TextInput
              mode="outlined"
              placeholder="Nhập lý do (nếu có)..."
              value={editNote}
              onChangeText={setEditNote}
              style={styles.textInput}
              outlineColor="#E5E7EB"
              activeOutlineColor="#6366f1"
            />

            {/* Buttons Action */}
            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setModalVisible(false)}
                style={styles.modalButton}
                textColor="#6B7280"
              >
                Hủy
              </Button>
              <Button
                mode="contained"
                onPress={handleUpdate}
                style={[styles.modalButton, { backgroundColor: "#6366f1" }]}
                loading={updating}
              >
                Cập nhật
              </Button>
            </View>
          </Modal>
        </Portal>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Header Styles
  headerContainer: { padding: 16, backgroundColor: "#fff", paddingBottom: 8 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  statsCard: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: "#fff",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statItem: { alignItems: "center", flex: 1 },
  statNumber: { fontSize: 22, fontWeight: "bold" },
  statLabel: { fontSize: 13, color: "#6B7280", marginTop: 4 },
  verticalDivider: { width: 1, height: 40, backgroundColor: "#E5E7EB" },

  // List Styles
  listContainer: { padding: 16, paddingBottom: 80 },
  studentCard: {
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 1,
  },
  cardRow: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftSection: { flexDirection: "row", alignItems: "center", flex: 1 },
  infoColumn: { marginLeft: 12, flex: 1 },
  studentName: { fontSize: 16, fontWeight: "600", color: "#1F2937" },
  studentId: { fontSize: 13, color: "#6B7280" },
  noteText: {
    fontSize: 12,
    color: "#F59E0B",
    fontStyle: "italic",
    marginTop: 2,
  },

  rightSection: { alignItems: "flex-end", justifyContent: "center" },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  statusText: { fontSize: 11, fontWeight: "bold" },

  emptyText: { textAlign: "center", marginTop: 30, color: "#6B7280" },

  // Modal Styles
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginTop: 12,
    marginBottom: 8,
  },
  statusOptions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statusOptionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 4,
  },
  statusOptionText: { fontSize: 13, fontWeight: "600" },

  textInput: { backgroundColor: "#fff", fontSize: 14, height: 40 },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 24,
    gap: 12,
  },
  modalButton: { borderRadius: 8, flex: 1 },
});

export default TeacherAttendanceDetailScreen;
