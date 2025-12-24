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
import { useNavigation } from "@react-navigation/native"; // THÊM IMPORT
import api from "../../../api/APIClient";

const StudentScheduleScreen = () => {
  const navigation = useNavigation(); // KHỞI TẠO NAVIGATION
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [markedDates, setMarkedDates] = useState({});
  const [viewMode, setViewMode] = useState("day"); // 'day', 'week', 'month'
  const { user } = useSelector((state) => state.auth);
  const studentId = user?.id;

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);

      const today = new Date();
      const fromDate = new Date(today.getFullYear(), today.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      const toDate = new Date(today.getFullYear(), today.getMonth() + 2, 0)
        .toISOString()
        .split("T")[0];

      const response = await api.get(
        `/enrollments/schedule?studentId=${studentId}&fromDate=${fromDate}&toDate=${toDate}`
      );
      console.log("Schedule response:", response);
      // SỬA: Lấy data từ response (phòng trường hợp bọc trong ResponseModel)
      const data = response.data?.data || response.data;
      setScheduleData(data);

      const marks = {};
      data.forEach((item) => {
        const dateKey = item.date.split("T")[0];
        if (!marks[dateKey]) {
          marks[dateKey] = { marked: true, dotColor: "#6366f1" };
        }
      });
      setMarkedDates(marks);

      const todayStr = today.toISOString().split("T")[0];
      setSelectedDate(todayStr);
    } catch (error) {
      console.error("Error fetching schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  // THÊM HÀM XỬ LÝ NHẤN VÀO BUỔI HỌC
  const handleSessionPress = (sessionId) => {
    console.log("Navigating to session detail for ID:", sessionId);
    if (!sessionId) return;
    navigation.navigate("SessionDetail", { sessionId: sessionId });
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatShortDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
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
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const dates = [];
    for (let d = firstDay; d <= lastDay; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().split("T")[0]);
    }
    return dates;
  };

  const getFilteredSchedule = () => {
    if (!selectedDate) return [];

    if (viewMode === "day") {
      return scheduleData.filter((item) => item.date.startsWith(selectedDate));
    } else if (viewMode === "week") {
      const weekDates = getWeekDates(selectedDate);
      return scheduleData.filter((item) =>
        weekDates.some((date) => item.date.startsWith(date))
      );
    } else if (viewMode === "month") {
      const monthDates = getMonthDates(selectedDate);
      return scheduleData.filter((item) =>
        monthDates.some((date) => item.date.startsWith(date))
      );
    }
    return [];
  };

  const groupScheduleByDate = (schedule) => {
    const grouped = {};
    schedule.forEach((item) => {
      const dateKey = item.date.split("T")[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(item);
    });
    return grouped;
  };

  const getClassColor = (classCode) => {
    if (!classCode) return "#8b5cf6";
    if (classCode.includes("RS")) return "#6366f1";
    if (classCode.includes("P0")) return "#ec4899";
    return "#8b5cf6";
  };

  const renderDayView = (filteredSchedule) => {
    return (
      <>
        <Animated.Text
          entering={FadeIn.duration(400)}
          style={styles.sectionTitle}
        >
          {formatDate(selectedDate)}
        </Animated.Text>

        {filteredSchedule.length === 0 ? (
          <Animated.View
            entering={FadeIn.duration(400)}
            style={styles.emptyState}
          >
            <Text style={styles.emptyText}>📅</Text>
            <Text style={styles.emptyTitle}>Không có lịch học</Text>
            <Text style={styles.emptySubtitle}>
              Chọn ngày khác để xem lịch học
            </Text>
          </Animated.View>
        ) : (
          filteredSchedule.map((item, index) => {
            console.log("Rendering class item:", item);
            return (
            <Animated.View
              key={`${item.id}-${index}`}
              entering={FadeInDown.duration(400).delay(index * 50)}
              layout={Layout.springify()}
            >
              <ClassCard
                item={item}
                getClassColor={getClassColor}
                formatTime={formatTime}
                onPress={() => handleSessionPress(item.id)} // GẮN ONPRESS
              />
            </Animated.View>
          );
          })
        )}
      </>
    );
  };

  const renderWeekView = (filteredSchedule) => {
    const groupedSchedule = groupScheduleByDate(filteredSchedule);
    const weekDates = getWeekDates(selectedDate);

    return (
      <>
        <Animated.Text
          entering={FadeIn.duration(400)}
          style={styles.sectionTitle}
        >
          Tuần {formatShortDate(weekDates[0])} - {formatShortDate(weekDates[6])}
        </Animated.Text>

        {weekDates.map((date, dateIndex) => {
          const daySchedule = groupedSchedule[date] || [];
          const dateObj = new Date(date);
          const dayName = dateObj.toLocaleDateString("vi-VN", {
            weekday: "short",
          });

          return (
            <Animated.View
              key={date}
              entering={FadeInDown.duration(400).delay(dateIndex * 100)}
              style={styles.daySection}
            >
              <View style={styles.daySectionHeader}>
                <Text style={styles.dayName}>{dayName}</Text>
                <Text style={styles.dayDate}>{formatShortDate(date)}</Text>
                <Text style={styles.classCount}>{daySchedule.length} buổi</Text>
              </View>

              {daySchedule.length > 0 ? (
                daySchedule.map((item, index) => (
                  <View
                    key={`${item.id}-${index}`}
                    style={styles.compactCard}
                  >
                    <ClassCard
                      item={item}
                      getClassColor={getClassColor}
                      formatTime={formatTime}
                      compact
                      onPress={() => handleSessionPress(item.id)} // GẮN ONPRESS
                    />
                  </View>
                ))
              ) : (
                <Text style={styles.noDayClass}>Không có lịch</Text>
              )}
            </Animated.View>
          );
        })}
      </>
    );
  };

  const renderMonthView = (filteredSchedule) => {
    const groupedSchedule = groupScheduleByDate(filteredSchedule);
    const dateObj = new Date(selectedDate);
    const monthName = dateObj.toLocaleDateString("vi-VN", {
      month: "long",
      year: "numeric",
    });

    const datesWithClasses = Object.keys(groupedSchedule).sort();

    return (
      <>
        <Animated.Text
          entering={FadeIn.duration(400)}
          style={styles.sectionTitle}
        >
          {monthName}
        </Animated.Text>

        <Animated.View
          entering={FadeIn.duration(400)}
          style={styles.monthSummary}
        >
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{filteredSchedule.length}</Text>
            <Text style={styles.summaryLabel}>Tổng buổi học</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{datesWithClasses.length}</Text>
            <Text style={styles.summaryLabel}>Ngày có lịch</Text>
          </View>
        </Animated.View>

        {datesWithClasses.map((date, dateIndex) => {
          const daySchedule = groupedSchedule[date];

          return (
            <Animated.View
              key={date}
              entering={FadeInDown.duration(400).delay(dateIndex * 50)}
              style={styles.monthDaySection}
            >
              <TouchableOpacity
                onPress={() => {
                  setSelectedDate(date);
                  setViewMode("day");
                }}
                style={styles.monthDayHeader}
              >
                <Text style={styles.monthDayDate}>{formatDate(date)}</Text>
                <Text style={styles.monthDayCount}>
                  {daySchedule.length} buổi →
                </Text>
              </TouchableOpacity>

              {daySchedule.map((item, index) => (
                <TouchableOpacity // SỬA VIEW THÀNH TOUCHABLEOPACITY
                  key={`${item.id}-${index}`}
                  style={styles.monthClassItem}
                  onPress={() => handleSessionPress(item.id)} // GẮN ONPRESS
                >
                  <View
                    style={[
                      styles.monthClassDot,
                      { backgroundColor: getClassColor(item.classCode) },
                    ]}
                  />
                  <View style={styles.monthClassInfo}>
                    <Text style={styles.monthClassName} numberOfLines={1}>
                      {item.className}
                    </Text>
                    <Text style={styles.monthClassTime}>
                      {formatTime(item.startTime)} - {formatTime(item.endTime)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </Animated.View>
          );
        })}
      </>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Đang tải lịch học...</Text>
      </View>
    );
  }

  const filteredSchedule = getFilteredSchedule();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
        <Text style={styles.headerTitle}>Lịch Học Của Tôi</Text>
        <Text style={styles.headerSubtitle}>
          {scheduleData.length} buổi học
        </Text>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(600).delay(100)}
        style={styles.segmentedContainer}
      >
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
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {viewMode === "day" && (
          <Animated.View entering={FadeInDown.duration(600).delay(200)}>
            <Calendar
              current={selectedDate}
              onDayPress={(day) => setSelectedDate(day.dateString)}
              markedDates={{
                ...markedDates,
                [selectedDate]: {
                  ...markedDates[selectedDate],
                  selected: true,
                  selectedColor: "#6366f1",
                },
              }}
              theme={{
                todayTextColor: "#6366f1",
                arrowColor: "#6366f1",
                monthTextColor: "#1f2937",
                textMonthFontWeight: "bold",
                textDayFontSize: 14,
                textMonthFontSize: 16,
              }}
              style={styles.calendar}
            />
          </Animated.View>
        )}

        <View style={styles.scheduleContainer}>
          {viewMode === "day" && renderDayView(filteredSchedule)}
          {viewMode === "week" && renderWeekView(filteredSchedule)}
          {viewMode === "month" && renderMonthView(filteredSchedule)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// SỬA COMPONENT CON ĐỂ NHẬN ONPRESS
const ClassCard = ({ item, getClassColor, formatTime, compact = false, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8}> 
    <Card style={compact ? styles.classCardCompact : styles.classCard}>
      <Card.Content>
        <View style={styles.classHeader}>
          <View style={styles.classInfo}>
            <Text style={styles.className} numberOfLines={compact ? 1 : 2}>
              {item.className}
            </Text>
            <Text style={styles.sessionTitle}>{item.sessionTitle || `Buổi số ${item.sessionNumber || ''}`}</Text>
            {/* HIỂN THỊ TÊN GIẢNG VIÊN NẾU CÓ */}
            {item.teacherName && (
              <Text style={{fontSize: 12, color: '#6366f1', marginTop: 4}}>👨‍🏫 {item.teacherName}</Text>
            )}
          </View>
          <Chip
            mode="flat"
            style={[
              styles.classChip,
              { backgroundColor: getClassColor(item.classCode) },
            ]}
            textStyle={styles.chipText}
          >
            {item.classCode}
          </Chip>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.timeContainer}>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>⏰</Text>
            <Text style={styles.timeValue}>
              {formatTime(item.startTime)} - {formatTime(item.endTime)}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  </TouchableOpacity>
);

// PHẦN STYLE GIỮ NGUYÊN 100% NHƯ CŨ CỦA BẠN
const styles = StyleSheet.create({
  // ... Paste nguyên phần styles cũ của bạn vào đây ...
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  segmentedContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  segmentedButtons: {
    backgroundColor: "#f3f4f6",
  },
  scrollView: {
    flex: 1,
  },
  calendar: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scheduleContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
    marginTop: 8,
  },
  classCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: "#fff",
  },
  classCardCompact: {
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
    backgroundColor: "#fff",
  },
  classHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  classInfo: {
    flex: 1,
    marginRight: 12,
  },
  className: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  sessionTitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  classChip: {
    height: 28,
  },
  chipText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "600",
  },
  divider: {
    marginVertical: 12,
    backgroundColor: "#e5e7eb",
  },
  timeContainer: {
    gap: 8,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  daySection: {
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    elevation: 1,
  },
  daySectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  dayName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    width: 50,
  },
  dayDate: {
    fontSize: 14,
    color: "#6b7280",
    flex: 1,
  },
  classCount: {
    fontSize: 12,
    color: "#6366f1",
    fontWeight: "600",
  },
  compactCard: {
    marginTop: 8,
  },
  noDayClass: {
    fontSize: 14,
    color: "#9ca3af",
    fontStyle: "italic",
    paddingVertical: 8,
  },
  monthSummary: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    gap: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#6366f1",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  monthDaySection: {
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    elevation: 1,
  },
  monthDayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  monthDayDate: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
  },
  monthDayCount: {
    fontSize: 13,
    color: "#6366f1",
    fontWeight: "600",
  },
  monthClassItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  monthClassDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  monthClassInfo: {
    flex: 1,
  },
  monthClassName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
    marginBottom: 2,
  },
  monthClassTime: {
    fontSize: 12,
    color: "#6b7280",
  },
});

export default StudentScheduleScreen;