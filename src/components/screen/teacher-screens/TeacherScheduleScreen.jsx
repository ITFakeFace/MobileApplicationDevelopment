import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { Card, Chip, Divider, SegmentedButtons } from "react-native-paper";
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
  Layout,
} from "react-native-reanimated";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import api from "../../../api/APIClient";
import moment from "moment";

const TeacherScheduleScreen = () => {
  const navigation = useNavigation();
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [markedDates, setMarkedDates] = useState({});
  const [viewMode, setViewMode] = useState("day"); 
  
  // Lấy ID giáo viên từ Redux Auth
  const { user } = useSelector((state) => state.auth);
  const teacherId = user?.id;

  useEffect(() => {
    if (teacherId) fetchTeacherSchedule();
  }, [teacherId]);

  const fetchTeacherSchedule = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const fromDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
      const toDate = new Date(today.getFullYear(), today.getMonth() + 2, 0).toISOString().split("T")[0];

      const response = await api.get(
        `/courses/teacher-schedule?teacherId=${teacherId}&fromDate=${fromDate}&toDate=${toDate}`
      );

      // SỬA: Kiểm tra kỹ cấu trúc mảng
      const rawData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      
      // SỬA QUAN TRỌNG: Dùng moment để lấy ngày YYYY-MM-DD chính xác theo giờ địa phương
      const formattedData = rawData.map(item => ({
        ...item,
        localDate: moment(item.date).format("YYYY-MM-DD") 
      }));

      setScheduleData(formattedData);

      const marks = {};
      formattedData.forEach((item) => {
        marks[item.localDate] = { marked: true, dotColor: "#10b981" };
      });
      setMarkedDates(marks);

      const todayStr = moment().format("YYYY-MM-DD");
      setSelectedDate(todayStr);
    } catch (error) {
      console.error("Error fetching teacher schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionPress = (sessionId) => {
    if (!sessionId) return;
    // Điều hướng tới màn hình quản lý buổi học của giáo viên
    navigation.navigate("SessionDetail", { sessionId: sessionId });
  };

  // --- HELPERS (Giữ nguyên logic format của bạn) ---
  const formatTime = (timeString) => {
    if (!timeString) return "--:--";
    const date = new Date(timeString);
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const formatShortDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  };

  const getWeekDates = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      weekDates.push(d.toISOString().split("T")[0]);
    }
    return weekDates;
  };

  const getMonthDates = (dateString) => {
    const date = new Date(dateString);
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const dates = [];
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().split("T")[0]);
    }
    return dates;
  };

 const getFilteredSchedule = () => {
    if (!selectedDate) return [];

    if (viewMode === "day") {
      // So sánh chính xác ngày địa phương
      return scheduleData.filter((item) => item.localDate === selectedDate);
    } else if (viewMode === "week") {
      const weekDates = getWeekDates(selectedDate);
      return scheduleData.filter((item) =>
        weekDates.includes(item.localDate)
      );
    } else if (viewMode === "month") {
      const monthDates = getMonthDates(selectedDate);
      return scheduleData.filter((item) =>
        monthDates.includes(item.localDate)
      );
    }
    return [];
  };

  const groupScheduleByDate = (schedule) => {
    const grouped = {};
    schedule.forEach((item) => {
      const dateKey = item.localDate; // Dùng localDate đã chuẩn hóa
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(item);
    });
    return grouped;
  };

  const getClassColor = (classCode) => {
    return "#10b981"; // Màu thương hiệu cho giáo viên
  };

  // --- RENDERS ---
  const renderDayView = (filteredSchedule) => (
    <>
      <Animated.Text entering={FadeIn.duration(400)} style={styles.sectionTitle}>
        {formatDate(selectedDate)}
      </Animated.Text>
      {filteredSchedule.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>☕</Text>
          <Text style={styles.emptyTitle}>Không có tiết dạy</Text>
          <Text style={styles.emptySubtitle}>Thầy/Cô có thể nghỉ ngơi</Text>
        </View>
      ) : (
        filteredSchedule.map((item, index) => (
          <Animated.View key={`${item.id}-${index}`} entering={FadeInDown.duration(400).delay(index * 50)} layout={Layout.springify()}>
            <ClassCard item={item} getClassColor={getClassColor} formatTime={formatTime} onPress={() => handleSessionPress(item.id)} />
          </Animated.View>
        ))
      )}
    </>
  );

  const renderWeekView = (filteredSchedule) => {
    const groupedSchedule = groupScheduleByDate(filteredSchedule);
    const weekDates = getWeekDates(selectedDate);
    return (
      <>
        <Text style={styles.sectionTitle}>Lịch dạy trong tuần</Text>
        {weekDates.map((date, idx) => {
          const daySchedule = groupedSchedule[date] || [];
          return (
            <View key={date} style={styles.daySection}>
              <View style={styles.daySectionHeader}>
                <Text style={styles.dayName}>{new Date(date).toLocaleDateString("vi-VN", { weekday: "short" })}</Text>
                <Text style={styles.dayDate}>{formatShortDate(date)}</Text>
                <Text style={styles.classCount}>{daySchedule.length} tiết</Text>
              </View>
              {daySchedule.map((item, index) => (
                <View key={index} style={styles.compactCard}>
                  <ClassCard item={item} getClassColor={getClassColor} formatTime={formatTime} compact onPress={() => handleSessionPress(item.id)} />
                </View>
              ))}
            </View>
          );
        })}
      </>
    );
  };

  const renderMonthView = (filteredSchedule) => {
    const groupedSchedule = groupScheduleByDate(filteredSchedule);
    const datesWithClasses = Object.keys(groupedSchedule).sort();
    return (
      <>
        <Text style={styles.sectionTitle}>Tóm tắt tháng dạy</Text>
        {datesWithClasses.map((date) => (
          <View key={date} style={styles.monthDaySection}>
            <TouchableOpacity onPress={() => { setSelectedDate(date); setViewMode("day"); }} style={styles.monthDayHeader}>
               <Text style={styles.monthDayDate}>{formatDate(date)}</Text>
               <Text style={styles.monthDayCount}>{groupedSchedule[date].length} tiết →</Text>
            </TouchableOpacity>
            {groupedSchedule[date].map((item, index) => (
              <TouchableOpacity key={index} style={styles.monthClassItem} onPress={() => handleSessionPress(item.id)}>
                <View style={[styles.monthClassDot, { backgroundColor: '#10b981' }]} />
                <View style={styles.monthClassInfo}>
                  <Text style={styles.monthClassName} numberOfLines={1}>{item.className}</Text>
                  <Text style={styles.monthClassTime}>{formatTime(item.startTime)} - {formatTime(item.endTime)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Đang tải lịch dạy...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch Dạy Của Tôi</Text>
        <Text style={styles.headerSubtitle}>Chào Thầy/Cô, {user?.fullname}</Text>
      </View>

      <View style={styles.segmentedContainer}>
        <SegmentedButtons
          value={viewMode}
          onValueChange={setViewMode}
          buttons={[
            { value: "day", label: "Ngày", icon: "calendar-today" },
            { value: "week", label: "Tuần", icon: "calendar-week" },
            { value: "month", label: "Tháng", icon: "calendar-month" },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {viewMode === "day" && (
          <Calendar
            current={selectedDate}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={{
              ...markedDates,
              [selectedDate]: { ...markedDates[selectedDate], selected: true, selectedColor: "#10b981" },
            }}
            theme={{ todayTextColor: "#10b981", arrowColor: "#10b981" }}
            style={styles.calendar}
          />
        )}
        <View style={styles.scheduleContainer}>
          {viewMode === "day" && renderDayView(getFilteredSchedule())}
          {viewMode === "week" && renderWeekView(getFilteredSchedule())}
          {viewMode === "month" && renderMonthView(getFilteredSchedule())}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const ClassCard = ({ item, getClassColor, formatTime, compact = false, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
    <Card style={compact ? styles.classCardCompact : styles.classCard}>
      <Card.Content>
        <View style={styles.classHeader}>
          <View style={styles.classInfo}>
            <Text style={styles.className} numberOfLines={compact ? 1 : 2}>{item.className}</Text>
            <Text style={styles.sessionTitle}>{item.sessionTitle || `Buổi số ${item.sessionNumber || ''}`}</Text>
          </View>
          <Chip mode="flat" style={[styles.classChip, { backgroundColor: '#10b981' }]} textStyle={styles.chipText}>
            {item.classCode}
          </Chip>
        </View>
        <Divider style={styles.divider} />
        <View style={styles.timeContainer}>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>⏰</Text>
            <Text style={styles.timeValue}>{formatTime(item.startTime)} - {formatTime(item.endTime)}</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  </TouchableOpacity>
);

// STYLE GIỮ NGUYÊN 100% NHƯ BẢN CŨ CỦA BẠN
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f9fafb" },
  loadingText: { marginTop: 12, fontSize: 16, color: "#6b7280" },
  header: { backgroundColor: "#fff", paddingHorizontal: 20, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: "#1f2937", marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: "#6b7280" },
  segmentedContainer: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#fff" },
  segmentedButtons: { backgroundColor: "#f3f4f6" },
  scrollView: { flex: 1 },
  calendar: { marginHorizontal: 16, marginTop: 16, borderRadius: 12, elevation: 2 },
  scheduleContainer: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1f2937", marginBottom: 16, marginTop: 8 },
  classCard: { marginBottom: 12, borderRadius: 12, elevation: 2, backgroundColor: "#fff" },
  classCardCompact: { marginBottom: 8, borderRadius: 8, elevation: 1, backgroundColor: "#fff" },
  classHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  classInfo: { flex: 1, marginRight: 12 },
  className: { fontSize: 16, fontWeight: "bold", color: "#1f2937", marginBottom: 4 },
  sessionTitle: { fontSize: 14, color: "#6b7280" },
  classChip: { height: 28 },
  chipText: { fontSize: 11, color: "#fff", fontWeight: "600" },
  divider: { marginVertical: 12, backgroundColor: "#e5e7eb" },
  timeContainer: { gap: 8 },
  timeRow: { flexDirection: "row", alignItems: "center" },
  timeLabel: { fontSize: 14, marginRight: 8 },
  timeValue: { fontSize: 14, fontWeight: "600", color: "#1f2937" },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  emptyText: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: "bold", color: "#1f2937", marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: "#6b7280", textAlign: "center" },
  daySection: { marginBottom: 16, backgroundColor: "#fff", borderRadius: 12, padding: 12, elevation: 1 },
  daySectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  dayName: { fontSize: 16, fontWeight: "bold", color: "#1f2937", width: 50 },
  dayDate: { fontSize: 14, color: "#6b7280", flex: 1 },
  classCount: { fontSize: 12, color: "#6366f1", fontWeight: "600" },
  compactCard: { marginTop: 8 },
  noDayClass: { fontSize: 14, color: "#9ca3af", fontStyle: "italic", paddingVertical: 8 },
  monthSummary: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, gap: 16 },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryValue: { fontSize: 32, fontWeight: "bold", color: "#6366f1", marginBottom: 4 },
  summaryLabel: { fontSize: 12, color: "#6b7280" },
  monthDaySection: { marginBottom: 12, backgroundColor: "#fff", borderRadius: 12, padding: 12, elevation: 1 },
  monthDayHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  monthDayDate: { fontSize: 15, fontWeight: "600", color: "#1f2937", flex: 1 },
  monthDayCount: { fontSize: 13, color: "#6366f1", fontWeight: "600" },
  monthClassItem: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  monthClassDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  monthClassInfo: { flex: 1 },
  monthClassName: { fontSize: 14, fontWeight: "500", color: "#1f2937", marginBottom: 2 },
  monthClassTime: { fontSize: 12, color: "#6b7280" },
});

export default TeacherScheduleScreen;