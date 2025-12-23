import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Card, Divider } from "react-native-paper";
import { useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import Animated, { FadeInDown } from "react-native-reanimated";
import Icon from "react-native-vector-icons/FontAwesome";

import MainLayout from "../../components/layout/MainLayout";
import api from "../../api/APIClient";

export default function CourseDetailScreen() {
  const route = useRoute();
  const { courseId } = route.params || {};

  const baseUrl = useSelector(
    (state) => state.config?.baseUrl || "http://localhost:3000"
  );

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [course, setCourse] = useState(null);

  const buildImageUrl = useCallback(
    (coverImage, fallbackSeed) => {
      let imageUrl = `https://picsum.photos/seed/${fallbackSeed || courseId}/800/500`;

      if (!coverImage) return imageUrl;

      if (typeof coverImage === "string" && coverImage.startsWith("http")) {
        return coverImage;
      }

      // coverImage dạng "/public/..." -> nối baseUrl
      const cleanBaseUrl = (baseUrl || "").replace(/\/$/, "");
      const cleanPath = String(coverImage).replace(/^\//, "");
      return `${cleanBaseUrl}/${cleanPath}`;
    },
    [baseUrl, courseId]
  );

  // ========= GIỮ NGUYÊN fetchCourseDetail CỦA BẠN =========
  const fetchCourseDetail = useCallback(async () => {
    if (!courseId) return;

    try {
      const res = await api.get(`/courses/${courseId}`);

      // ResponseModel thường là: response.data.data = course
      const raw = res?.data?.data ?? res?.data;

      // raw có thể vẫn là ResponseModel -> fallback thêm
      const courseData = raw?.data ?? raw;

    //   console.log("Data: " + JSON.stringify(courseData));
      if (courseData && courseData.id) {
        const image = buildImageUrl(courseData.coverImage, courseData.id);

        setCourse({
          ...courseData,
          image,
        });
      } else {
        setCourse(null);
      }
    } catch (err) {
      console.error("❌ Lỗi lấy course detail:", err);
      setCourse(null);
    } finally {
      setLoading(false);
    }
  }, [courseId, buildImageUrl]);
  // =======================================================

  useEffect(() => {
    setLoading(true);
    fetchCourseDetail();
  }, [fetchCourseDetail]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCourseDetail();
    setRefreshing(false);
  }, [fetchCourseDetail]);

  // Map status number -> label
  const statusLabel = useMemo(() => {
    const s = course?.status;
    if (s === 0) return "Đang mở";
    if (s === 1) return "Tạm dừng";
    if (s === 2) return "Đã đóng";
    return "Chưa cập nhật";
  }, [course?.status]);

  const safeArr = (v) => (Array.isArray(v) ? v : []);

  const meta = useMemo(() => {
    if (!course) return [];
    return [
      { icon: "tag", label: "Mã môn", value: course.code || "Chưa cập nhật" },
      { icon: "clock-o", label: "Thời lượng", value: course.duration || "Chưa cập nhật" },
      { icon: "info-circle", label: "Trạng thái", value: statusLabel },
    ];
  }, [course, statusLabel]);

  const objectives = safeArr(course?.objectives);
  const audiences = safeArr(course?.audiences);
  const requirements = safeArr(course?.requirements);
  const schedules = safeArr(course?.schedule);
  const locations = safeArr(course?.locations);
  const instructors = safeArr(course?.instructors);
  const contents = safeArr(course?.contents);

  return (
    <MainLayout>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.loadingText}>Đang tải chi tiết khóa học...</Text>
          </View>
        ) : !course ? (
          <View style={styles.center}>
            <Text style={styles.emptyTitle}>Không tìm thấy khóa học</Text>
            <Text style={styles.emptySub}>Vui lòng kéo xuống để tải lại.</Text>
          </View>
        ) : (
          <>
            {/* Cover */}
            <Animated.View entering={FadeInDown.duration(350)} style={styles.coverWrap}>
              <Image source={{ uri: course.image }} style={styles.cover} resizeMode="cover" />
              <View style={styles.coverOverlay} />
              <View style={styles.coverTextWrap}>
                <Text style={styles.courseName} numberOfLines={3}>
                  {course.name || "Khóa học"}
                </Text>
                <View style={styles.coverBadges}>
                  <View style={styles.codeBadge}>
                    <Text style={styles.codeText}>{course.code || "—"}</Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{statusLabel}</Text>
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* Meta */}
            <Animated.View entering={FadeInDown.delay(80).duration(350)} style={styles.section}>
              <Card style={styles.card}>
                <Card.Content style={{ gap: 10 }}>
                  {meta.map((m, idx) => (
                    <View key={idx} style={styles.metaRow}>
                      <View style={styles.metaLeft}>
                        <Icon name={m.icon} size={16} color="#6B7280" style={{ width: 20 }} />
                        <Text style={styles.metaLabel}>{m.label}</Text>
                      </View>
                      <Text style={styles.metaValue} numberOfLines={1}>
                        {m.value}
                      </Text>
                    </View>
                  ))}
                </Card.Content>
              </Card>
            </Animated.View>

            {/* Description */}
            <Animated.View entering={FadeInDown.delay(140).duration(350)} style={styles.section}>
              <Text style={styles.sectionTitle}>Mô tả</Text>
              <Card style={styles.card}>
                <Card.Content>
                  <Text style={styles.descText}>
                    {course.description || "Chưa có mô tả cho khóa học này."}
                  </Text>
                </Card.Content>
              </Card>
            </Animated.View>

            {/* Objectives */}
            <Section title="Mục tiêu" delay={200}>
              <Card style={styles.card}>
                <Card.Content>
                  <BulletList items={objectives} emptyText="Chưa có mục tiêu." />
                </Card.Content>
              </Card>
            </Section>

            {/* Audiences */}
            <Section title="Đối tượng học viên" delay={240}>
              <Card style={styles.card}>
                <Card.Content>
                  <BulletList items={audiences} emptyText="Chưa có thông tin đối tượng." />
                </Card.Content>
              </Card>
            </Section>

            {/* Requirements */}
            <Section title="Yêu cầu" delay={280}>
              <Card style={styles.card}>
                <Card.Content>
                  <BulletList items={requirements} emptyText="Không có yêu cầu đặc biệt." />
                </Card.Content>
              </Card>
            </Section>

            {/* Schedule */}
            <Section title="Khung lịch (tuỳ chọn)" delay={320}>
              <Card style={styles.card}>
                <Card.Content>
                  <BulletList items={schedules} emptyText="Chưa có lịch học." />
                </Card.Content>
              </Card>
            </Section>

            {/* Locations */}
            <Section title="Địa điểm" delay={360}>
              <Card style={styles.card}>
                <Card.Content>
                  <BulletList items={locations} emptyText="Chưa có địa điểm." />
                </Card.Content>
              </Card>
            </Section>

            {/* Instructors */}
            <Section title="Giảng viên" delay={400}>
              <Card style={styles.card}>
                <Card.Content>
                  <BulletList items={instructors} emptyText="Chưa có giảng viên." />
                </Card.Content>
              </Card>
            </Section>

            {/* Assessment */}
            <Section title="Đánh giá / Kiểm tra" delay={440}>
              <Card style={styles.card}>
                <Card.Content>
                  <InfoRow
                    icon="check-circle"
                    label="Hình thức"
                    value={course?.assessment?.method || "Chưa cập nhật"}
                    multiline
                  />
                </Card.Content>
              </Card>
            </Section>

            {/* Materials */}
            <Section title="Tài liệu" delay={480}>
              <Card style={styles.card}>
                <Card.Content style={{ gap: 10 }}>
                  <InfoRow
                    icon="laptop"
                    label="Công cụ / phần mềm"
                    value={course?.materials?.software || "—"}
                  />
                  <Divider />
                  <InfoRow
                    icon="book"
                    label="Tài liệu bắt buộc"
                    value={course?.materials?.mandatory || "—"}
                    multiline
                  />
                  <Divider />
                  <InfoRow
                    icon="bookmark"
                    label="Tài liệu tham khảo"
                    value={course?.materials?.references || "—"}
                    multiline
                  />
                </Card.Content>
              </Card>
            </Section>

            {/* Contents */}
            <Section title="Nội dung từng buổi" delay={520}>
              {contents.length > 0 ? (
                contents.map((session, idx) => (
                  <Animated.View
                    key={`${session?.title || "session"}-${idx}`}
                    entering={FadeInDown.delay(idx * 80).duration(250)}
                    style={{ marginBottom: 12 }}
                  >
                    <Card style={styles.card}>
                      <Card.Content>
                        <Text style={styles.sessionTitle}>
                          {String(session?.title || `Buổi ${idx + 1}`).toUpperCase()}
                        </Text>
                        <View style={{ marginTop: 10 }}>
                          <BulletList
                            items={safeArr(session?.topics)}
                            emptyText="Chưa có nội dung buổi học."
                          />
                        </View>
                      </Card.Content>
                    </Card>
                  </Animated.View>
                ))
              ) : (
                <Card style={styles.card}>
                  <Card.Content>
                    <Text style={styles.descText}>Chưa có nội dung chương trình.</Text>
                  </Card.Content>
                </Card>
              )}
            </Section>
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </MainLayout>
  );
}

/* ----------------- helpers ----------------- */

function Section({ title, delay = 0, children }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(350)} style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </Animated.View>
  );
}

function BulletList({ items, emptyText }) {
  if (!items || items.length === 0) {
    return <Text style={styles.descText}>{emptyText}</Text>;
  }
  return (
    <View>
      {items.map((t, i) => (
        <View key={i} style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>{String(t)}</Text>
        </View>
      ))}
    </View>
  );
}

function InfoRow({ icon, label, value, multiline = false }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Icon name={icon} size={16} color="#6B7280" style={{ width: 20 }} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>

      <Text
        style={[styles.infoValue, multiline && { maxWidth: "65%" }]}
        numberOfLines={multiline ? 6 : 1}
      >
        {value}
      </Text>
    </View>
  );
}

/* ----------------- styles ----------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  center: { padding: 20, alignItems: "center", justifyContent: "center", gap: 8 },
  loadingText: { color: "#6B7280" },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  emptySub: { fontSize: 13, color: "#6B7280" },

  coverWrap: { margin: 16, borderRadius: 14, overflow: "hidden", backgroundColor: "#fff", elevation: 3 },
  cover: { width: "100%", height: 220 },
  coverOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.30)" },
  coverTextWrap: { position: "absolute", left: 14, right: 14, bottom: 14, gap: 10 },
  courseName: { fontSize: 18, fontWeight: "900", color: "#FFFFFF", lineHeight: 24 },

  coverBadges: { flexDirection: "row", alignItems: "center", gap: 8 },
  codeBadge: {
    backgroundColor: "rgba(255,255,255,0.16)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  codeText: { color: "#fff", fontWeight: "900", fontSize: 12 },
  statusBadge: {
    backgroundColor: "rgba(79,70,229,0.85)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: { color: "#fff", fontWeight: "900", fontSize: 12 },

  section: { paddingHorizontal: 16, marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#1F2937", marginBottom: 10 },

  card: { borderRadius: 12, elevation: 2 },

  metaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  metaLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  metaLabel: { fontSize: 13, color: "#6B7280" },
  metaValue: { fontSize: 13, fontWeight: "700", color: "#111827", maxWidth: "55%" },

  descText: { fontSize: 14, lineHeight: 20, color: "#374151" },

  bulletRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  bulletDot: { width: 16, fontSize: 18, lineHeight: 20, color: "#111827" },
  bulletText: { flex: 1, fontSize: 14, lineHeight: 20, color: "#374151" },

  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  infoLeft: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  infoLabel: { fontSize: 13, color: "#6B7280" },
  infoValue: { fontSize: 13, fontWeight: "800", color: "#111827", maxWidth: "55%", textAlign: "right" },

  sessionTitle: { fontSize: 13, fontWeight: "900", color: "#111827" },
});
