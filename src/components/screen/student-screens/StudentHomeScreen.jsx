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

// 1. Import Hook Redux
import { useSelector } from "react-redux";

import MainLayout from "../../layout/MainLayout";
import api from "../../../api/APIClient";

const HomeScreen = () => {
  const navigation = useNavigation();
  const today = moment().format("YYYY-MM-DD");
  const { defaultAddress } = useSelector((state) => state.dataConfig);
  // 2. LẤY DATA TỪ REDUX STORE
  const { user } = useSelector((state) => state.auth);
  
  // 👇 LẤY URL TỪ CONFIG SLICE (Đảm bảo slice tên là 'config' trong rootReducer)
  // Fallback về localhost nếu chưa load được config
  const baseUrl = useSelector((state) => state.config?.baseUrl || "http://localhost:3000"); 

  const studentId = user?.id;

  // State UI
  const [selectedDate, setSelectedDate] = useState(today);
  const [scheduleData, setScheduleData] = useState({});
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // --- 1. HÀM LẤY LỊCH HỌC ---
  const fetchSchedule = async () => {
    if (!studentId) return;
    try {
      const fromDate = moment().startOf('month').format('YYYY-MM-DD');
      const toDate = moment().add(1, 'year').endOf('month').format('YYYY-MM-DD');
      
      const response = await api.get(`/enrollments/schedule?studentId=${studentId}&fromDate=${fromDate}&toDate=${toDate}`);

      let rawList = [];
      if (Array.isArray(response.data)) {
        rawList = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        rawList = response.data.data;
      }

      if (rawList.length > 0) {
        const formattedSchedule = {};
        rawList.forEach((item) => {
          const dateKey = moment(item.date).format("YYYY-MM-DD");
          if (!formattedSchedule[dateKey]) {
            formattedSchedule[dateKey] = [];
          }
          formattedSchedule[dateKey].push({
            id: item.id || Math.random().toString(),
            name: item.className,
            time: item.startTime && item.endTime 
              ? `${moment(item.startTime).format("HH:mm")} - ${moment(item.endTime).format("HH:mm")}`
              : "Chưa cập nhật",
            address: defaultAddress,
            teacher: item.teacherName || "Giảng viên",
            status: item.myAttendanceStatus,
          });
        });
        setScheduleData(formattedSchedule);
        
        // Tự động chọn ngày đầu tiên có lịch nếu hôm nay không có
        const listDates = Object.keys(formattedSchedule).sort();
        if (listDates.length > 0 && !formattedSchedule[today]) {
             setSelectedDate(listDates[0]); 
        }
      }
    } catch (error) {
      console.error("❌ Lỗi lấy lịch học:", error);
    }
  };

  // --- 2. HÀM LẤY KHÓA HỌC ---
  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses'); 
      const rawData = response.data.data || response.data;

      if (Array.isArray(rawData)) {
        const formattedCourses = rawData.map((course) => {
          // --- LOGIC XỬ LÝ ẢNH DỰA TRÊN BASE URL ---
          let imageUrl = `https://picsum.photos/seed/${course.id}/300/200`; // Ảnh mặc định nếu null
          
          if (course.coverImage) {
            if (course.coverImage.startsWith('http')) {
                // Nếu DB đã lưu link tuyệt đối (cloudinary/s3)
                imageUrl = course.coverImage;
            } else {
                // Nếu DB lưu link tương đối (/public/...) -> Nối với baseUrl từ Redux
                // Xử lý bỏ dấu / thừa ở cuối baseUrl hoặc đầu coverImage
                const cleanBaseUrl = baseUrl.replace(/\/$/, "");
                const cleanPath = course.coverImage.replace(/^\//, "");
                imageUrl = `${cleanBaseUrl}/${cleanPath}`;
            }
          }

          return {
            id: course.id,
            name: course.name,
            code: course.code, // Mã môn (HRC-CB)
            duration: course.duration || "Chưa cập nhật", // Thời lượng
            image: imageUrl,
          };
        });
        
        setCourses(formattedCourses);
      }
    } catch (error) {
      console.error("❌ Lỗi lấy khóa học:", error);
    }
  };

  // --- 3. LOAD DATA ---
  // Load lại khi studentId hoặc baseUrl thay đổi (ví dụ user đổi cấu hình IP)
  useEffect(() => {
    if (studentId && baseUrl) {
        loadAllData();
    }
  }, [studentId, baseUrl]);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchSchedule(), fetchCourses()]);
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (studentId) {
        await Promise.all([fetchSchedule(), fetchCourses()]);
    }
    setRefreshing(false);
  }, [studentId, baseUrl]);

  // --- NAVIGATION & HELPERS ---
  const handleMenuPress = (route) => {
    try { navigation.navigate(route); } catch (error) { navigation.navigate("Home"); }
  };

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
    { id: 4, name: "Forms", icon: "wpforms", color: "#EF4444", route: "Forms" },
  ];

  // --- RENDER UI ---
  return (
    <MainLayout>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chào, {user?.fullname || "Bạn"} 👋</Text>
          <TouchableOpacity onPress={() => console.log("Notification")}>
            <Icon name="bell" size={24} color="#4F46E5" />
          </TouchableOpacity>
        </View>

        {/* Calendar */}
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

        {/* Schedule Detail */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.scheduleSection}>
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
                    <View style={styles.timeBadge}>
                      <Icon name="clock-o" size={14} color="#fff" />
                      <Text style={styles.timeText}>{item.time}</Text>
                    </View>
                    <Text style={styles.subjectText}>{item.name}</Text>
                    <View style={styles.scheduleInfo}>
                      <View style={styles.infoRow}>
                        <Icon name="map-marker" size={16} color="#6B7280" style={{ width: 20 }} />
                        <Text style={styles.infoText}>{item.address}</Text>
                      </View>
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
                <Text style={styles.emptyText}>Không có lịch học</Text>
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

        {/* --- COURSES SECTION (ĐÃ CẬP NHẬT GIAO DIỆN) --- */}
        <View style={styles.coursesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Khóa Học Của Tôi</Text>
            <TouchableOpacity onPress={() => handleMenuPress("Courses")}>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {courses.length > 0 ? (
              courses.map((course, index) => (
                <Animated.View
                  key={course.id}
                  entering={FadeInDown.delay(index * 100).duration(500)}
                >
                  <TouchableOpacity 
                    style={styles.courseCard} 
                    onPress={() => console.log("Detail:", course.id)}
                  >
                    {/* Hình ảnh (Size 300x200 qua style) */}
                    <Image 
                        source={{ uri: course.image }} 
                        style={styles.courseImage} 
                        resizeMode="cover" 
                    />
                    
                    <View style={styles.courseContent}>
                      {/* Tên Khóa Học */}
                      <Text style={styles.courseName} numberOfLines={2}>
                        {course.name}
                      </Text>
                      
                      {/* THAY PROGRESS BAR BẰNG THÔNG TIN KHÁC */}
                      <View style={styles.courseMeta}>
                        {/* Badge Mã môn */}
                        <View style={styles.codeBadge}>
                            <Text style={styles.codeText}>{course.code}</Text>
                        </View>
                        
                        {/* Icon + Thời lượng */}
                        <View style={styles.durationContainer}>
                            <Icon name="clock-o" size={12} color="#6B7280" />
                            <Text style={styles.durationText} numberOfLines={1}>
                                {course.duration}
                            </Text>
                        </View>
                      </View>

                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))
            ) : (
                <Text style={{ marginLeft: 8, color: '#6B7280' }}>
                    {loading ? "Đang tải dữ liệu..." : "Chưa có khóa học nào."}
                </Text>
            )}
          </ScrollView>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </MainLayout>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, paddingTop: 40, backgroundColor: "#fff" },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#1F2937" },
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
  
  // --- COURSES SECTION STYLES ---
  coursesSection: { padding: 16 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  seeAllText: { color: "#4F46E5", fontSize: 14, fontWeight: "600" },
  courseCard: { 
    width: 280, 
    marginRight: 16, 
    backgroundColor: "#fff", 
    borderRadius: 12, 
    overflow: "hidden", 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 3 
  },
  courseImage: { 
    width: "100%", 
    height: 160 // Tỷ lệ giống mock 300x200
  },
  courseContent: { padding: 12 },
  courseName: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: "#1F2937", 
    marginBottom: 8,
    minHeight: 40 // Đảm bảo chiều cao cố định cho 2 dòng text
  },
  courseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4
  },
  codeBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C7D2FE'
  },
  codeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#4F46E5'
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    justifyContent: 'flex-end'
  },
  durationText: {
    fontSize: 12,
    color: '#6B7280',
    maxWidth: '80%'
  }
});

export default HomeScreen;