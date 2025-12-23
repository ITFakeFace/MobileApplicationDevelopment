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
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";
import "moment/locale/vi";

import { useSelector } from "react-redux";
import MainLayout from "../../layout/MainLayout";
import api from "../../../api/APIClient";

moment.locale("vi");

const StudentHomeScreen = () => {
  const navigation = useNavigation();
  const today = moment().format("YYYY-MM-DD");

  // 1. LẤY DATA TỪ REDUX
  const { defaultAddress } = useSelector((state) => state.dataConfig);
  const { user } = useSelector((state) => state.auth);
  const baseUrl = useSelector(
    (state) => state.config?.baseUrl || "http://localhost:3000"
  );
  const studentId = user?.id;

  // State
  const [todaysSchedule, setTodaysSchedule] = useState([]);
  const [upcomingSchedule, setUpcomingSchedule] = useState([]); // Thêm state cho lịch sắp tới
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // --- HÀM 1: LẤY LỊCH HỌC (PHÂN LOẠI HÔM NAY & SẮP TỚI) ---
  const fetchSchedule = async () => {
    if (!studentId) return;

    try {
      const fromDate = moment().format("YYYY-MM-DD");
      const toDate = moment().add(14, "days").format("YYYY-MM-DD");

      const response = await api.get(
        `/enrollments/schedule?studentId=${studentId}&fromDate=${fromDate}&toDate=${toDate}`
      );

      let rawList = [];
      if (Array.isArray(response.data)) rawList = response.data;
      else if (response.data?.data && Array.isArray(response.data.data))
        rawList = response.data.data;

      // Log để kiểm tra cấu trúc của 1 item bất kỳ từ API
      if (rawList.length > 0) {
        console.log("Dữ liệu mẫu từ API:", JSON.stringify(rawList[0], null, 2));
      }

      if (rawList.length > 0) {
        const listToday = [];
        const listUpcoming = [];

        rawList.forEach((item) => {
          const itemDate = moment(item.date).format("YYYY-MM-DD");

          const timeDisplay = item.timeString
            ? item.timeString
            : `${moment(item.startTime).format("HH:mm")} - ${moment(
                item.endTime
              ).format("HH:mm")}`;

          const addressDisplay = item.address || defaultAddress;

          // --- SỬA Ở ĐÂY: Tìm ID chính xác ---
          // Ưu tiên lấy sessionId nếu NestJS trả về quan hệ phẳng, 
          // hoặc item.session.id nếu trả về object lồng nhau.
          const actualSessionId = item.sessionId || (item.session && item.session.id) || item.id;

          const scheduleItem = {
            id: item.id, // Gán ID thực của Session vào đây
            name: item.className || item.courseName || (item.session && item.session.title) || "Lớp học",
            date: item.date,
            displayDate: moment(item.date).format("dddd, DD/MM"),
            time: timeDisplay,
            address: addressDisplay,
            teacher: item.teacherName || (item.session && item.session.teacher?.fullname) || "Giảng viên",
            status: item.sessionStatus || (item.session && item.session.status),
            isAttendanceOpen: item.isAttendanceOpen !== undefined ? item.isAttendanceOpen : (item.session && item.session.isAttendanceOpen),
          };

          // PHÂN LOẠI
          if (itemDate === today) {
            listToday.push(scheduleItem);
          } else if (moment(itemDate).isAfter(today)) {
            listUpcoming.push(scheduleItem);
          }
        });

        listUpcoming.sort((a, b) => new Date(a.date) - new Date(b.date));

        setTodaysSchedule(listToday);
        setUpcomingSchedule(listUpcoming);
      } else {
        setTodaysSchedule([]);
        setUpcomingSchedule([]);
      }
    } catch (error) {
      console.error("❌ Lỗi lấy lịch học:", error);
    }
  };

  // --- HÀM 2: LẤY KHÓA HỌC ---
  const fetchCourses = async () => {
    try {
      const response = await api.get("/courses");
      const rawData = response.data?.data || response.data;

      if (Array.isArray(rawData)) {
        const formattedCourses = rawData.map((course) => {
          let imageUrl = `https://picsum.photos/seed/${course.id}/300/200`;
          if (course.coverImage) {
            if (course.coverImage.startsWith("http")) {
              imageUrl = course.coverImage;
            } else {
              imageUrl = `${baseUrl}${course.coverImage}`;
            }
          }
          return {
            id: course.id,
            name: course.name,
            code: course.code,
            duration: course.duration || "Chưa cập nhật",
            image: imageUrl,
          };
        });
        setCourses(formattedCourses);
      }
    } catch (error) {
      console.error("❌ Lỗi lấy khóa học:", error);
    }
  };

  // --- LOAD DATA ---
  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchSchedule(), fetchCourses()]);
    setLoading(false);
  };

  useEffect(() => {
    if (studentId) loadAllData();
  }, [studentId, baseUrl]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  }, [studentId]);

  const handleSessionPress = (sessionId) => {
    console.log("Navigating with sessionId:", sessionId); // Log thử xem có id không
    navigation.navigate("SessionDetail", { sessionId: sessionId });
  };

  const menuItems = [
    {
      id: 1,
      name: "Thời Khóa Biểu",
      icon: "calendar",
      color: "#4F46E5",
      route: "StudentSchedule",
    },
    {
      id: 2,
      name: "Điểm Danh",
      icon: "check-circle",
      color: "#10B981",
      route: "Attendance",
    },
    {
      id: 3,
      name: "Profile",
      icon: "user",
      color: "#F59E0B",
      route: "Profile",
    },
    { id: 4, name: "Forms", icon: "wpforms", color: "#EF4444", route: "Forms" },
  ];

  const handleMenuPress = (route) => {
    try {
      navigation.navigate(route);
    } catch (error) {
      navigation.navigate("Home");
    }
  };

  // Component render item lịch (Tái sử dụng cho cả Today và Upcoming)
  const renderScheduleItem = (item, index, isToday = true) => (
    <TouchableOpacity
      // 👇 SỬA key: Kết hợp id và index để đảm bảo luôn duy nhất
      key={`${item.id}_${index}`}
      activeOpacity={0.7}
      onPress={() => handleSessionPress(item.id)}
    >
      <Card style={[styles.scheduleCard, !isToday && styles.upcomingCard]}>
        <Card.Content>
          <View style={styles.scheduleContent}>
            {/* Hàng 1: Giờ + Ngày + Badge */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <View
                style={{ flexDirection: "row", gap: 8, alignItems: "center" }}
              >
                <View
                  style={[
                    styles.timeBadge,
                    !isToday && { backgroundColor: "#6B7280" },
                  ]}
                >
                  <Icon name="clock-o" size={14} color="#fff" />
                  <Text style={styles.timeText}>{item.time}</Text>
                </View>
                {!isToday && (
                  <Text style={styles.dateBadgeText}>{item.displayDate}</Text>
                )}
              </View>

              {item.isAttendanceOpen && (
                <View style={styles.liveBadge}>
                  <Text style={styles.liveText}>Đang điểm danh</Text>
                </View>
              )}
            </View>

            {/* Hàng 2: Tên môn */}
            <Text style={styles.subjectText}>{item.name}</Text>

            {/* Hàng 3: Địa điểm & GV */}
            <View style={styles.scheduleInfo}>
              <View style={styles.infoRow}>
                <Icon
                  name="map-marker"
                  size={16}
                  color="#6B7280"
                  style={{ width: 20 }}
                />
                <Text style={styles.infoText}>{item.address}</Text>
              </View>
              <View style={styles.infoRow}>
                <Icon
                  name="user"
                  size={16}
                  color="#6B7280"
                  style={{ width: 20 }}
                />
                <Text style={styles.infoText}>{item.teacher}</Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Chào, {user?.username || user?.fullname || "Bạn"} 👋
          </Text>
          <TouchableOpacity onPress={() => console.log("Notification")}>
            <Icon name="bell" size={24} color="#4F46E5" />
          </TouchableOpacity>
        </View>

        {/* --- PHẦN 1: LỊCH HÔM NAY --- */}
        <Animated.View
          entering={FadeInDown.duration(500)}
          style={styles.scheduleSection}
        >
          <View style={styles.todayHeader}>
            <View>
              <Text style={styles.sectionTitle}>Lịch học hôm nay</Text>
              <Text style={styles.dateText}>
                {moment().format("dddd, DD/MM/YYYY")}
              </Text>
            </View>
          </View>

          {loading && !refreshing ? (
            <ActivityIndicator
              size="large"
              color="#4F46E5"
              style={{ marginTop: 20 }}
            />
          ) : todaysSchedule.length > 0 ? (
            todaysSchedule.map((item, index) =>
              renderScheduleItem(item, index, true)
            )
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content
                style={{ alignItems: "center", paddingVertical: 24 }}
              >
                <Icon name="coffee" size={40} color="#D1D5DB" />
                <Text
                  style={[
                    styles.emptyText,
                    { marginTop: 12, fontWeight: "bold" },
                  ]}
                >
                  Hôm nay trống lịch!
                </Text>
              </Card.Content>
            </Card>
          )}
        </Animated.View>

        {/* --- PHẦN 2: LỊCH DỰ KIẾN (SẮP TỚI) --- */}
        {upcomingSchedule.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(200).duration(500)}
            style={styles.scheduleSection}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Lịch dự kiến</Text>
              <TouchableOpacity
                onPress={() => handleMenuPress("StudentSchedule")}
              >
                <Text style={styles.seeAllText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            {upcomingSchedule
              .slice(0, 3)
              .map((item, index) => renderScheduleItem(item, index, false))}
            {/* Chỉ hiện tối đa 3 item sắp tới để đỡ dài */}
          </Animated.View>
        )}

        {/* --- MENU GRID --- */}
        <View style={styles.menuSection}>
          <View style={styles.menuGrid}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuButton}
                onPress={() => handleMenuPress(item.route)}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: item.color },
                  ]}
                >
                  <Icon name={item.icon} size={28} color="#fff" />
                </View>
                <Text style={styles.menuText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* --- COURSES SECTION --- */}
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
                  key={course.id || index}
                  entering={FadeInRight.delay(index * 100).duration(500)}
                >
                  <TouchableOpacity 
                    style={styles.courseCard} 
                    // onPress={() => console.log("Detail:", course.id)}
                    onPress={() => navigation.navigate("CourseDetail", { courseId: course.id })}
                  >
                    <Image
                      source={{ uri: course.image }}
                      style={styles.courseImage}
                      resizeMode="cover"
                    />
                    <View style={styles.courseContent}>
                      <Text style={styles.courseName} numberOfLines={2}>
                        {course.name}
                      </Text>
                      <View style={styles.courseMeta}>
                        <View style={styles.codeBadge}>
                          <Text style={styles.codeText}>{course.code}</Text>
                        </View>
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
              <Text style={{ marginLeft: 8, color: "#6B7280" }}>
                {loading ? "Đang tải dữ liệu..." : "Chưa có khóa học nào."}
              </Text>
            )}
          </ScrollView>
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 40,
    backgroundColor: "#fff",
  },
  headerTitle: { fontSize: 32, fontWeight: "bold", color: "#1F2937" },

  // SCHEDULE STYLES
  scheduleSection: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  todayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1F2937" },
  dateText: {
    fontSize: 14,
    color: "#4F46E5",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  seeAllText: { color: "#4F46E5", fontSize: 14, fontWeight: "600" },

  scheduleCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: "#fff",
    borderLeftWidth: 4,
    borderLeftColor: "#4F46E5", // Màu nhấn cho hôm nay
  },
  upcomingCard: {
    borderLeftColor: "#9CA3AF", // Màu xám cho sắp tới
    opacity: 0.9,
  },
  scheduleContent: { gap: 8 },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4F46E5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  timeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  dateBadgeText: { fontSize: 13, fontWeight: "600", color: "#4B5563" },

  subjectText: { fontSize: 16, fontWeight: "bold", color: "#1F2937" },
  scheduleInfo: { gap: 6 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoText: { fontSize: 14, color: "#6B7280", flex: 1 },

  liveBadge: {
    backgroundColor: "#DEF7EC",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#31C48D",
  },
  liveText: { color: "#03543F", fontSize: 10, fontWeight: "bold" },

  emptyCard: {
    borderRadius: 12,
    elevation: 1,
    backgroundColor: "#F3F4F6",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  emptyText: { textAlign: "center", color: "#6B7280", fontSize: 14 },

  // MENU STYLES
  menuSection: { padding: 16 },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  menuButton: { width: "23%", alignItems: "center", marginBottom: 16 },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  menuText: { fontSize: 12, color: "#4B5563", textAlign: "center" },

  // COURSES STYLES
  coursesSection: { padding: 16, paddingTop: 0 },
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
    elevation: 3,
    marginBottom: 8, // tạo khoảng cách bóng đổ
  },
  courseImage: { width: "100%", height: 160 },
  courseContent: { padding: 12 },
  courseName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
    minHeight: 40,
  },
  courseMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  codeBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  codeText: { fontSize: 11, fontWeight: "bold", color: "#4F46E5" },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
    justifyContent: "flex-end",
  },
  durationText: { fontSize: 12, color: "#6B7280", maxWidth: "80%" },
});

export default StudentHomeScreen;
