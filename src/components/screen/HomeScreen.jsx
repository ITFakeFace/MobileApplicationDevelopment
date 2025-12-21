import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { Card, Avatar } from "react-native-paper";
import { Calendar } from "react-native-calendars";
import Animated, { FadeInDown } from "react-native-reanimated";
import Icon from "react-native-vector-icons/FontAwesome";
import MainLayout from "../layout/MainLayout";

// Mock Database
const mockSchedule = {
  "2025-12-22": [
    {
      id: 1,
      subject: "Lập trình React Native",
      time: "08:00 - 10:00",
      room: "A201",
      teacher: "Nguyễn Văn A",
    },
    {
      id: 2,
      subject: "Cơ sở dữ liệu",
      time: "13:00 - 15:00",
      room: "B105",
      teacher: "Trần Thị B",
    },
  ],
  "2025-12-23": [
    {
      id: 3,
      subject: "Thiết kế giao diện",
      time: "09:00 - 11:00",
      room: "C302",
      teacher: "Lê Văn C",
    },
  ],
  "2025-12-24": [
    {
      id: 4,
      subject: "Phát triển ứng dụng di động",
      time: "14:00 - 16:00",
      room: "A105",
      teacher: "Phạm Thị D",
    },
  ],
  "2025-12-25": [
    {
      id: 5,
      subject: "Kiểm thử phần mềm",
      time: "10:00 - 12:00",
      room: "B201",
      teacher: "Hoàng Văn E",
    },
  ],
};

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
  {
    id: 3,
    name: "UI/UX Design",
    image: "https://picsum.photos/seed/design1/300/200",
    progress: 40,
    lessons: 20,
  },
  {
    id: 4,
    name: "Mobile App Development",
    image: "https://picsum.photos/seed/mobile1/300/200",
    progress: 85,
    lessons: 30,
  },
];

const HomeScreen = () => {
  const today = "2025-12-22";
  const [selectedDate, setSelectedDate] = useState(today);
  const [markedDates, setMarkedDates] = useState({
    "2025-12-22": { marked: true, dotColor: "#4F46E5" },
    "2025-12-23": { marked: true, dotColor: "#4F46E5" },
    "2025-12-24": { marked: true, dotColor: "#4F46E5" },
    "2025-12-25": { marked: true, dotColor: "#4F46E5" },
  });

  const handleDateSelect = (date) => {
    setSelectedDate(date.dateString);
  };

  const getScheduleForDate = (date) => {
    return mockSchedule[date] || [];
  };

  const menuItems = [
    { id: 1, name: "Thời Khóa Biểu", icon: "calendar", color: "#4F46E5" },
    { id: 2, name: "Điểm Danh", icon: "check-circle", color: "#10B981" },
    { id: 3, name: "Profile", icon: "user", color: "#F59E0B" },
    { id: 4, name: "Chat", icon: "comments", color: "#EF4444" },
  ];

  return (
    <MainLayout>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Trang Chủ</Text>
          <Icon name="bell" size={24} color="#4F46E5" />
        </View>

        {/* Calendar Section */}
        <View style={styles.calendarContainer}>
          <Calendar
            current={today}
            onDayPress={handleDateSelect}
            markedDates={{
              ...markedDates,
              [selectedDate]: {
                ...markedDates[selectedDate],
                selected: true,
                selectedColor: "#4F46E5",
              },
            }}
            theme={{
              selectedDayBackgroundColor: "#4F46E5",
              todayTextColor: "#4F46E5",
              dotColor: "#4F46E5",
              arrowColor: "#4F46E5",
            }}
          />
        </View>

        {/* Schedule Detail Section */}
        <Animated.View
          entering={FadeInDown.duration(500)}
          style={styles.scheduleSection}
        >
          <Text style={styles.sectionTitle}>
            Lịch học ngày {selectedDate === today ? "hôm nay" : selectedDate}
          </Text>
          {getScheduleForDate(selectedDate).length > 0 ? (
            getScheduleForDate(selectedDate).map((item) => (
              <Card key={item.id} style={styles.scheduleCard}>
                <Card.Content>
                  <View style={styles.scheduleContent}>
                    <View style={styles.timeBadge}>
                      <Icon name="clock-o" size={14} color="#fff" />
                      <Text style={styles.timeText}>{item.time}</Text>
                    </View>
                    <Text style={styles.subjectText}>{item.subject}</Text>
                    <View style={styles.scheduleInfo}>
                      <View style={styles.infoRow}>
                        <Icon name="map-marker" size={14} color="#6B7280" />
                        <Text style={styles.infoText}>{item.room}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Icon name="user" size={14} color="#6B7280" />
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
                  Không có lịch học trong ngày này
                </Text>
              </Card.Content>
            </Card>
          )}
        </Animated.View>

        {/* Menu Buttons */}
        <View style={styles.menuSection}>
          <View style={styles.menuGrid}>
            {menuItems.map((item) => (
              <TouchableOpacity key={item.id} style={styles.menuButton}>
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

        {/* Courses Section */}
        <View style={styles.coursesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Khóa Học Của Tôi</Text>
            <TouchableOpacity>
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
                  <Image
                    source={{ uri: course.image }}
                    style={styles.courseImage}
                  />
                  <View style={styles.courseContent}>
                    <Text style={styles.courseName}>{course.name}</Text>
                    <Text style={styles.courseLessons}>
                      {course.lessons} bài học
                    </Text>
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${course.progress}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {course.progress}%
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 40,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
  calendarContainer: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scheduleSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  scheduleCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  scheduleContent: {
    gap: 8,
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4F46E5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    gap: 6,
  },
  timeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  subjectText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  scheduleInfo: {
    gap: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#6B7280",
  },
  emptyCard: {
    borderRadius: 12,
    elevation: 1,
  },
  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 14,
  },
  menuSection: {
    padding: 16,
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  menuButton: {
    width: "23%",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  menuText: {
    fontSize: 12,
    color: "#4B5563",
    textAlign: "center",
  },
  coursesSection: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  seeAllText: {
    color: "#4F46E5",
    fontSize: 14,
    fontWeight: "600",
  },
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
  },
  courseImage: {
    width: "100%",
    height: 160,
  },
  courseContent: {
    padding: 12,
  },
  courseName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  courseLessons: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4F46E5",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4F46E5",
  },
});

export default HomeScreen;
