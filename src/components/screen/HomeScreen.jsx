import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Card } from "react-native-paper";
import { Calendar } from "react-native-calendars";
import Animated, { FadeInDown } from "react-native-reanimated";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";

// 1. Import Hook của Redux
import { useSelector } from "react-redux";

import MainLayout from "../layout/MainLayout";
import api from "../../api/APIClient";

// --- CONSTANTS ---
const DEFAULT_ADDRESS = "Phòng Lab 1, Tòa nhà HRC, Q.10"; 

const mockCourses = [
  {
    id: 1,
    name: "React Native Cơ Bản",
    image: "https://picsum.photos/seed/react1/300/200",
    progress: 75,
    lessons: 24,
  },
  {
    id: 2,
    name: "Database Management",
    image: "https://picsum.photos/seed/db1/300/200",
    progress: 60,
    lessons: 18,
  },
];

const HomeScreen = () => {
  const navigation = useNavigation();
  const today = moment().format("YYYY-MM-DD");

  // 2. LẤY DATA TỪ REDUX STORE (Khớp với authSlice)
  // state.auth.user chứa object { id, username, ... } như bạn đã lưu khi login thành công
  const { user } = useSelector((state) => state.auth);
  
  // Trích xuất ID. Nếu user chưa load xong (null) thì studentId là undefined
  const studentId = user?.id; 

  // State UI
  const [selectedDate, setSelectedDate] = useState(today);
  const [scheduleData, setScheduleData] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // --- SỬA LẠI HÀM NÀY ---
  const fetchSchedule = async () => {
    if (!studentId) return;

    setLoading(true);
    try {
      // (Giữ nguyên đoạn tạo fromDate, toDate)
      const fromDate = moment().startOf('month').format('YYYY-MM-DD');
      const toDate = moment().add(1, 'year').endOf('month').format('YYYY-MM-DD');

      const response = await api.get(`/enrollments/schedule?studentId=${studentId}&fromDate=${fromDate}&toDate=${toDate}`);

      console.log("✅ Data nhận được:", response.data);

      // --- SỬA TẠI ĐÂY ---
      let rawList = [];
      
      // Kiểm tra xem response.data có phải là mảng luôn không?
      if (Array.isArray(response.data)) {
         rawList = response.data; // Trường hợp API trả về mảng trực tiếp
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
         rawList = response.data.data; // Trường hợp API trả về object bọc { status: true, data: [] }
      }

      if (rawList.length > 0) {
        const formattedSchedule = {};
        
        rawList.forEach((item) => {
          // Format ngày làm Key cho Calendar (YYYY-MM-DD)
          const dateKey = moment(item.date).format("YYYY-MM-DD");
          
          if (!formattedSchedule[dateKey]) {
            formattedSchedule[dateKey] = [];
          }

          formattedSchedule[dateKey].push({
            id: item.id || Math.random().toString(),
            name: item.className, // Map className -> name
            time: item.startTime && item.endTime 
              ? `${moment(item.startTime).format("HH:mm")} - ${moment(item.endTime).format("HH:mm")}`
              : "Chưa cập nhật", 
            address: DEFAULT_ADDRESS, 
            teacher: item.teacherName || "Giảng viên", 
            status: item.myAttendanceStatus, 
          });
        });

        console.log("📅 Lịch sau khi format:", formattedSchedule); // Log kiểm tra lần cuối
        setScheduleData(formattedSchedule);

        // Logic tự động chọn ngày có lịch (như đã bàn)
        const listDates = Object.keys(formattedSchedule).sort();
        const todayKey = moment().format("YYYY-MM-DD");
        if (listDates.length > 0 && !formattedSchedule[todayKey]) {
             setSelectedDate(listDates[0]); 
        }
      } else {
        console.log("⚠️ API trả về danh sách rỗng");
      }
      // -------------------

    } catch (error) {
      console.error("❌ Lỗi gọi API:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // --- 4. USE EFFECT ---
  // Tự động gọi API khi studentId thay đổi (ví dụ: login xong -> có ID -> gọi API ngay)
  useEffect(() => {
    fetchSchedule();
  }, [studentId]);

  // Pull to Refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSchedule();
  }, [studentId]);

  // Navigation Handler
  const handleMenuPress = (route) => {
    try {
      navigation.navigate(route); 
    } catch (error) {
      navigation.navigate("Home");
    }
  };

  // Helper: Marked Dates
  const getMarkedDates = () => {
    const marks = {};
    Object.keys(scheduleData).forEach((date) => {
      marks[date] = { marked: true, dotColor: "#4F46E5" };
    });
    marks[selectedDate] = {
      ...(marks[selectedDate] || {}),
      selected: true,
      selectedColor: "#4F46E5",
    };
    return marks;
  };

  const currentSchedule = scheduleData[selectedDate] || [];

  const menuItems = [
    { id: 1, name: "Thời Khóa Biểu", icon: "calendar", color: "#4F46E5", route: "Schedule" },
    { id: 2, name: "Điểm Danh", icon: "check-circle", color: "#10B981", route: "Attendance" },
    { id: 3, name: "Profile", icon: "user", color: "#F59E0B", route: "Profile" },
    { id: 4, name: "Chat", icon: "comments", color: "#EF4444", route: "Chat" },
    { id: 5, name: "Forms", icon: "wpforms", color: "#EF4444", route: "Forms" },
  ];

  return (
    <MainLayout>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {/* Hiển thị tên User lấy từ Redux (nếu có) */}
            Chào, {user?.fullname || "Bạn"} 👋
          </Text>
          <TouchableOpacity onPress={() => console.log("Notification")}>
            <Icon name="bell" size={24} color="#4F46E5" />
          </TouchableOpacity>
        </View>

        {/* Calendar Section */}
        <View style={styles.calendarContainer}>
          <Calendar
            current={today}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={getMarkedDates()}
            theme={{
              selectedDayBackgroundColor: "#4F46E5",
              todayTextColor: "#4F46E5",
              dotColor: "#4F46E5",
              arrowColor: "#4F46E5",
              textDayFontWeight: '500',
            }}
          />
        </View>

        {/* Schedule Detail Section */}
        <Animated.View
          entering={FadeInDown.duration(500)}
          style={styles.scheduleSection}
        >
          <Text style={styles.sectionTitle}>
            Lịch học {selectedDate === today ? "hôm nay" : moment(selectedDate).format("DD/MM/YYYY")}
          </Text>

          {loading && !refreshing ? (
            <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 20 }} />
          ) : currentSchedule.length > 0 ? (
            currentSchedule.map((item, index) => (
              <Card key={index} style={styles.scheduleCard}>
                <Card.Content>
                  <View style={styles.scheduleContent}>
                    {/* Time Badge */}
                    <View style={styles.timeBadge}>
                      <Icon name="clock-o" size={14} color="#fff" />
                      <Text style={styles.timeText}>{item.time}</Text>
                    </View>

                    {/* Subject Name */}
                    <Text style={styles.subjectText}>{item.name}</Text>

                    <View style={styles.scheduleInfo}>
                      {/* Address */}
                      <View style={styles.infoRow}>
                        <Icon name="map-marker" size={16} color="#6B7280" style={{ width: 20 }} />
                        <Text style={styles.infoText}>{item.address}</Text>
                      </View>
                      
                      {/* Teacher */}
                      <View style={styles.infoRow}>
                        <Icon name="user" size={16} color="#6B7280" style={{ width: 20 }} />
                        <Text style={styles.infoText}>{item.teacher}</Text>
                      </View>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text style={styles.emptyText}>
                  Không có lịch học
                </Text>
              </Card.Content>
            </Card>
          )}
        </Animated.View>

        {/* Menu Buttons */}
        <View style={styles.menuSection}>
          <View style={styles.menuGrid}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuButton}
                onPress={() => handleMenuPress(item.route)}
              >
                <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                  <Icon name={item.icon} size={28} color="#fff" />
                </View>
                <Text style={styles.menuText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Courses Section */}
        <View style={styles.coursesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Khóa Học Của Tôi</Text>
            <TouchableOpacity onPress={() => handleMenuPress("Courses")}>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {mockCourses.map((course, index) => (
              <Animated.View
                key={course.id}
                entering={FadeInDown.delay(index * 100).duration(500)}
              >
                <TouchableOpacity style={styles.courseCard}>
                  <Image source={{ uri: course.image }} style={styles.courseImage} />
                  <View style={styles.courseContent}>
                    <Text style={styles.courseName}>{course.name}</Text>
                    <Text style={styles.courseLessons}>{course.lessons} bài học</Text>
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${course.progress}%` }]} />
                      </View>
                      <Text style={styles.progressText}>{course.progress}%</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </View>
        
        <View style={{ height: 20 }} />
      </ScrollView>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, paddingTop: 40, backgroundColor: "#fff" },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#1F2937" }, // Giảm size chữ chút cho vừa tên
  calendarContainer: { backgroundColor: "#fff", margin: 16, borderRadius: 12, padding: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  scheduleSection: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1F2937", marginBottom: 12 },
  scheduleCard: { marginBottom: 12, borderRadius: 12, elevation: 2 },
  scheduleContent: { gap: 8 },
  timeBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#4F46E5", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: "flex-start", gap: 6 },
  timeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  subjectText: { fontSize: 16, fontWeight: "bold", color: "#1F2937" },
  scheduleInfo: { gap: 6 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoText: { fontSize: 14, color: "#6B7280", flex: 1 },
  emptyCard: { borderRadius: 12, elevation: 1 },
  emptyText: { textAlign: "center", color: "#6B7280", fontSize: 14 },
  menuSection: { padding: 16 },
  menuGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  menuButton: { width: "23%", alignItems: "center", marginBottom: 16 },
  iconContainer: { width: 64, height: 64, borderRadius: 16, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  menuText: { fontSize: 12, color: "#4B5563", textAlign: "center" },
  coursesSection: { padding: 16 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  seeAllText: { color: "#4F46E5", fontSize: 14, fontWeight: "600" },
  courseCard: { width: 280, marginRight: 16, backgroundColor: "#fff", borderRadius: 12, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  courseImage: { width: "100%", height: 160 },
  courseContent: { padding: 12 },
  courseName: { fontSize: 16, fontWeight: "bold", color: "#1F2937", marginBottom: 4 },
  courseLessons: { fontSize: 12, color: "#6B7280", marginBottom: 8 },
  progressContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  progressBar: { flex: 1, height: 6, backgroundColor: "#E5E7EB", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#4F46E5", borderRadius: 3 },
  progressText: { fontSize: 12, fontWeight: "600", color: "#4F46E5" },
});

export default HomeScreen;