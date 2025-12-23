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
import Animated, { FadeInDown } from "react-native-reanimated";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";
import "moment/locale/vi";

import { useSelector } from "react-redux";
import MainLayout from "../../layout/MainLayout";
import api from "../../../api/APIClient";

moment.locale("vi");

const TeacherHomeScreen = () => {
  const navigation = useNavigation();
  const today = moment().format("YYYY-MM-DD");

  const { user } = useSelector((state) => state.auth);
  const { defaultAddress } = useSelector((state) => state.dataConfig);
  const baseUrl = useSelector(
    (state) => state.config?.baseUrl || "http://localhost:3000"
  );

  const teacherId = user?.id;

  // State dữ liệu
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [upcomingSchedule, setUpcomingSchedule] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // --- 1. HÀM LẤY LỊCH DẠY ---
  const fetchSchedule = async () => {
    if (!teacherId) return;
    try {
      // Lấy lịch trong khoảng 1 tháng tới để lọc
      const fromDate = moment().format("YYYY-MM-DD");
      const toDate = moment().add(1, "month").format("YYYY-MM-DD");

      const response = await api.get(
        `/courses/teacher-schedule?teacherId=${teacherId}&fromDate=${fromDate}&toDate=${toDate}`
      );

      const rawList = response.data?.data || response.data || [];

      if (Array.isArray(rawList)) {
        const listToday = [];
        const listUpcoming = [];

        rawList.forEach((item) => {
          const itemDate = moment(item.date).format("YYYY-MM-DD");

          const scheduleItem = {
            id: item.id,
            name: item.className,
            courseName: item.courseName,
            time:
              item.timeString ||
              `${moment(item.startTime).format("HH:mm")} - ${moment(
                item.endTime
              ).format("HH:mm")}`,
            address: item.address || defaultAddress,
            isAttendanceOpen: item.isAttendanceOpen,
            status: item.sessionStatus,
            date: item.date,
          };

          if (itemDate === today) {
            listToday.push(scheduleItem);
          } else if (moment(itemDate).isAfter(today)) {
            listUpcoming.push(scheduleItem);
          }
        });

        // Sắp xếp lịch sắp tới theo thời gian gần nhất
        listUpcoming.sort((a, b) => new Date(a.date) - new Date(b.date));

        setTodaySchedule(listToday);
        setUpcomingSchedule(listUpcoming);
      }
    } catch (error) {
      console.error("❌ Lỗi lấy lịch học:", error);
    }
  };

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

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchSchedule(), fetchCourses()]);
    setLoading(false);
  };

  useEffect(() => {
    if (teacherId) loadAllData();
  }, [teacherId, baseUrl]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  }, [teacherId]);

  const handleMenuPress = (route) => {
    navigation.navigate(route);
  };

  const menuItems = [
    {
      id: 1,
      name: "Thời Khóa Biểu",
      icon: "calendar",
      color: "#4F46E5",
      route: "Schedule",
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

  // Component render item lịch dạy
  const renderScheduleCard = (item, isToday = false) => (
    <Card
      key={item.id}
      style={[styles.card, !isToday && styles.upcomingCard]}
      onPress={() =>
        navigation.navigate("SessionDetail", { sessionId: item.id })
      }
    >
      <Card.Content>
        <View style={styles.row}>
          <Icon
            name="users"
            size={18}
            color={isToday ? "#4F46E5" : "#6B7280"}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.className}>{item.name}</Text>
            {!isToday && (
              <Text style={styles.dateLabel}>
                {moment(item.date).format("dddd, DD/MM")}
              </Text>
            )}
          </View>
          {item.isAttendanceOpen && (
            <View style={styles.badgeActive}>
              <Text style={styles.badgeText}>LIVE</Text>
            </View>
          )}
        </View>

        <View style={styles.infoRow}>
          <Icon
            name="clock-o"
            size={14}
            color="#6B7280"
            style={{ width: 18 }}
          />
          <Text style={styles.infoText}>{item.time}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon
            name="map-marker"
            size={14}
            color="#6B7280"
            style={{ width: 18 }}
          />
          <Text style={styles.infoText} numberOfLines={1}>
            {item.address}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

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
            Chào, {user?.fullname || "Bạn"} 👋
          </Text>
          <TouchableOpacity>
            <Icon name="bell" size={24} color="#4F46E5" />
          </TouchableOpacity>
        </View>

        {/* --- LỊCH HÔM NAY --- */}
        <Animated.View
          entering={FadeInDown.duration(500)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Lịch dạy hôm nay</Text>
          {loading && !refreshing ? (
            <ActivityIndicator size="small" color="#4f46e5" />
          ) : todaySchedule.length > 0 ? (
            todaySchedule.map((item) => renderScheduleCard(item, true))
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                Hôm nay Thầy/Cô không có lịch dạy.
              </Text>
            </View>
          )}
        </Animated.View>

        {/* --- LỊCH DỰ KIẾN (GẦN NHẤT) --- */}
        {upcomingSchedule.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(200).duration(500)}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Lịch dạy sắp tới</Text>
              <TouchableOpacity onPress={() => handleMenuPress("Schedule")}>
                <Text style={styles.seeAllText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            {upcomingSchedule
              .slice(0, 3)
              .map((item) => renderScheduleCard(item, false))}
          </Animated.View>
        )}

        {/* Menu Grid */}
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
                  <Icon name={item.icon} size={24} color="#fff" />
                </View>
                <Text style={styles.menuText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Courses Section */}
        <View style={styles.coursesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Khóa Học Quản Lý</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {courses.map((course, index) => {
              console.log("Rendering course:", course);
              return (
                <TouchableOpacity key={course.id} style={styles.courseCard}>
                  <Image
                    source={{ uri: `${course.image}` }}
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
                      <Text style={styles.durationText}>{course.duration}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 20,
  },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#1F2937" },

  section: { paddingHorizontal: 16, marginTop: 10 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 10,
  },
  seeAllText: { color: "#4F46E5", fontSize: 14, fontWeight: "600" },

  card: {
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#4F46E5",
  },
  upcomingCard: { borderLeftColor: "#9CA3AF", elevation: 1 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 10 },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 8,
  },

  className: { fontSize: 16, fontWeight: "bold", color: "#111827", flex: 1 },
  dateLabel: { fontSize: 12, color: "#4F46E5", fontWeight: "600" },
  infoText: { fontSize: 13, color: "#4B5563" },

  badgeActive: {
    backgroundColor: "#DEF7EC",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: { color: "#03543F", fontSize: 10, fontWeight: "bold" },
  emptyBox: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  emptyText: { color: "#6B7280", fontSize: 14 },

  menuSection: { padding: 16 },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  menuButton: { width: "23%", alignItems: "center", marginBottom: 16 },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  menuText: { fontSize: 12, color: "#4B5563", textAlign: "center" },

  coursesSection: { paddingLeft: 16 },
  courseCard: {
    width: 240,
    marginRight: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    marginBottom: 10,
  },
  courseImage: { width: "100%", height: 130 },
  courseContent: { padding: 10 },
  courseName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1F2937",
    height: 40,
  },
  courseMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  codeBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  codeText: { fontSize: 10, fontWeight: "bold", color: "#4F46E5" },
  durationText: { fontSize: 11, color: "#6B7280" },
});

export default TeacherHomeScreen;
