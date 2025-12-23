import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Card, Divider } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import moment from "moment";
import { useSelector } from "react-redux";
import MainLayout from "../layout/MainLayout";

const FALLBACK_AVATAR_BG = "#4F46E5";

function safeText(v, fallback = "Chưa cập nhật") {
  if (v === null || v === undefined || v === "") return fallback;
  return String(v);
}

function formatDate(v) {
  if (!v) return "Chưa cập nhật";
  const m = moment(v);
  return m.isValid() ? m.format("DD/MM/YYYY") : "Chưa cập nhật";
}

function formatDateTime(v) {
  if (!v) return "Chưa cập nhật";
  const m = moment(v);
  return m.isValid() ? m.format("DD/MM/YYYY HH:mm") : "Chưa cập nhật";
}

// Nếu backend của bạn quy ước gender khác, bạn sửa mapping tại đây cho đúng.
function formatGender(gender) {
  if (gender === null || gender === undefined) return "Chưa cập nhật";
  // Ví dụ: boolean -> Nam/Nữ (bạn chỉnh theo hệ thống của bạn)
  return gender ? "Nam" : "Nữ";
}

const InfoRow = ({ icon, label, value }) => {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Icon name={icon} size={16} color="#6B7280" style={{ width: 22 }} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.value} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
};

export default function ProfileScreen() {
  const { user } = useSelector((state) => state.auth);

  const initials = useMemo(() => {
    const name = user?.fullname || user?.username || "";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "U";
    const first = parts[0]?.[0] || "U";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    return (first + last).toUpperCase();
  }, [user?.fullname, user?.username]);

  const roles = Array.isArray(user?.roles) ? user.roles : [];

  return (
    <MainLayout>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header card */}
        <Card style={styles.headerCard}>
          <Card.Content style={styles.headerContent}>
            <View style={styles.avatarWrap}>
              {user?.avatar ? (
                // Nếu avatar là URL string
                <View style={styles.avatarImgWrap}>
                  {/* Bạn đang dùng Image ở HomeScreen; ở đây giữ đơn giản.
                      Nếu muốn hiển thị ảnh thật, import Image và render Image source={{uri: user.avatar}} */}
                  <Text style={styles.avatarInitials}>{initials}</Text>
                </View>
              ) : (
                <View style={[styles.avatarFallback, { backgroundColor: FALLBACK_AVATAR_BG }]}>
                  <Text style={styles.avatarInitials}>{initials}</Text>
                </View>
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.fullname}>{safeText(user?.fullname, "Người dùng")}</Text>
              <Text style={styles.subLine}>@{safeText(user?.username, "unknown")}</Text>

              <View style={styles.badgesRow}>
                <View style={[styles.badge, user?.isEmailVerified ? styles.badgeOk : styles.badgeWarn]}>
                  <Icon
                    name={user?.isEmailVerified ? "check-circle" : "exclamation-circle"}
                    size={12}
                    color="#fff"
                  />
                  <Text style={styles.badgeText}>
                    {user?.isEmailVerified ? "Email đã xác thực" : "Email chưa xác thực"}
                  </Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Roles */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Vai trò</Text>
            <View style={styles.rolesWrap}>
              {roles.length > 0 ? (
                roles.map((r, idx) => (
                  <View key={`${r}-${idx}`} style={styles.roleChip}>
                    <Text style={styles.roleText}>{String(r)}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.muted}>Chưa có vai trò</Text>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Basic Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Thông tin cá nhân</Text>
            <Divider style={{ marginVertical: 10 }} />

            <InfoRow icon="id-card" label="PID" value={safeText(user?.pID)} />
            <InfoRow icon="user" label="User ID" value={safeText(user?.id)} />
            <InfoRow icon="envelope" label="Email" value={safeText(user?.email)} />
            <InfoRow icon="phone" label="Số điện thoại" value={safeText(user?.phone)} />
            <InfoRow icon="transgender" label="Giới tính" value={formatGender(user?.gender)} />
            <InfoRow icon="birthday-cake" label="Ngày sinh" value={formatDate(user?.dob)} />
          </Card.Content>
        </Card>

        {/* System Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Thông tin hệ thống</Text>
            <Divider style={{ marginVertical: 10 }} />

            <InfoRow icon="lock" label="Lockout End" value={safeText(user?.lockoutEnd)} />
            <InfoRow icon="calendar" label="Created At" value={formatDateTime(user?.createdAt)} />
            <InfoRow icon="refresh" label="Updated At" value={formatDateTime(user?.updatedAt)} />
          </Card.Content>
        </Card>

        {/* Actions (tuỳ chọn) */}
       <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Hành động</Text>
            <Divider style={{ marginVertical: 10 }} />

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate("EditProfile")}
            >
              <Icon name="pencil" size={16} color="#fff" />
              <Text style={styles.actionText}>Chỉnh sửa thông tin</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>

      </ScrollView>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16 },

  headerCard: { borderRadius: 14, elevation: 2, marginBottom: 12 },
  headerContent: { flexDirection: "row", gap: 12, alignItems: "center" },

  avatarWrap: { width: 64, height: 64, borderRadius: 32, overflow: "hidden" },
  avatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImgWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: FALLBACK_AVATAR_BG,
  },
  avatarInitials: { color: "#fff", fontSize: 18, fontWeight: "800" },

  fullname: { fontSize: 18, fontWeight: "800", color: "#111827" },
  subLine: { marginTop: 2, fontSize: 13, color: "#6B7280" },

  badgesRow: { flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeOk: { backgroundColor: "#10B981" },
  badgeWarn: { backgroundColor: "#F59E0B" },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  card: { borderRadius: 14, elevation: 1, marginTop: 10 },
  cardTitle: { fontSize: 15, fontWeight: "800", color: "#111827" },
  muted: { color: "#6B7280", marginTop: 6 },

  rolesWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  roleChip: {
    backgroundColor: "#EEF2FF",
    borderColor: "#C7D2FE",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  roleText: { color: "#3730A3", fontWeight: "700", fontSize: 12 },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 10,
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  label: { color: "#374151", fontSize: 13, fontWeight: "700" },
  value: { color: "#111827", fontSize: 13, fontWeight: "600", flex: 1, textAlign: "right" },

  actionBtn: {
    marginTop: 10,
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  actionText: { color: "#fff", fontWeight: "800" },
});
