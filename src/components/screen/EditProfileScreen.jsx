import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Card, Divider } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import moment from "moment";
import { useNavigation } from "@react-navigation/native";

import { useSelector, useDispatch } from "react-redux";
import MainLayout from "../layout/MainLayout";
import api from "../../api/APIClient";

/**
 * ====== IMPORTANT: ĐỔI ENDPOINT CHO KHỚP BACKEND ======
 * Ví dụ hay gặp:
 * - PUT /users/:id
 * - PATCH /users/:id
 * - PUT /auth/profile
 * - PATCH /auth/profile
 */
const buildUpdateEndpoint = (userId) => `/users/${userId}`;
// const buildUpdateEndpoint = () => `/auth/profile`;

function getApiList(data) {
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return null;
}

function extractUserFromResponse(resData) {
  // Ưu tiên các kiểu response phổ biến:
  // 1) { status: true, data: { user: {...} } }
  // 2) { status: true, data: {...userFields} }
  // 3) { user: {...} }
  // 4) trả thẳng {...userFields}
  if (resData?.data?.user) return resData.data.user;
  if (resData?.user) return resData.user;
  if (resData?.data && typeof resData.data === "object") return resData.data;
  if (resData && typeof resData === "object") return resData;
  return null;
}

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const userId = user?.id;

  // Form state
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState(null); // boolean | null
  const [dob, setDob] = useState(""); // YYYY-MM-DD
  const [avatar, setAvatar] = useState("");

  const [saving, setSaving] = useState(false);

  // Fill initial values
  useEffect(() => {
    if (!user) return;
    setFullname(user?.fullname ?? "");
    setPhone(user?.phone ?? "");
    setGender(user?.gender ?? null);
    setDob(user?.dob ? moment(user.dob).format("YYYY-MM-DD") : "");
    setAvatar(user?.avatar ?? "");
  }, [user]);

  const isDobValid = useMemo(() => {
    if (!dob) return true; // cho phép rỗng
    return moment(dob, "YYYY-MM-DD", true).isValid();
  }, [dob]);

  const buildPayload = () => {
    // Chỉ gửi các field cần sửa (bạn có thể mở rộng thêm)
    const payload = {
      fullname: fullname?.trim(),
      phone: phone?.trim() || null,
      gender: gender, // true/false/null (tùy BE cho phép)
      dob: dob ? new Date(dob).toISOString() : null,
      avatar: avatar?.trim() || null,
    };
    return payload;
  };

  const onSave = async () => {
    if (!userId) {
      Alert.alert("Lỗi", "Không tìm thấy thông tin user.");
      return;
    }

    if (!fullname?.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập họ và tên.");
      return;
    }

    if (!isDobValid) {
      Alert.alert("Sai định dạng", "Ngày sinh phải theo định dạng YYYY-MM-DD (vd: 1990-01-01).");
      return;
    }

    setSaving(true);
    try {
      const endpoint = buildUpdateEndpoint(userId);

      // Tuỳ BE: dùng PUT hoặc PATCH. Nếu BE của bạn partial update, ưu tiên PATCH.
      // const res = await api.patch(endpoint, buildPayload());
      const res = await api.put(endpoint, buildPayload());

      const updatedUser = extractUserFromResponse(res?.data);

      if (!updatedUser) {
        Alert.alert("Cập nhật thất bại", "Không đọc được dữ liệu user trả về từ server.");
        return;
      }

      /**
       * ====== IMPORTANT: cập nhật Redux user ======
       * Bạn thay dòng dispatch này bằng action thật của authSlice bạn đang dùng.
       *
       * Ví dụ:
       * dispatch(setUser(updatedUser));
       * dispatch(updateUser(updatedUser));
       */
      dispatch({ type: "auth/setUser", payload: updatedUser });

      Alert.alert("Thành công", "Đã cập nhật thông tin cá nhân.");
      navigation.goBack();
    } catch (err) {
      console.error("❌ Update profile error:", err?.response?.data || err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể cập nhật. Vui lòng thử lại.";
      Alert.alert("Lỗi", msg);
    } finally {
      setSaving(false);
    }
  };

  const onCancel = () => navigation.goBack();

  return (
    <MainLayout>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Chỉnh sửa thông tin</Text>
          <Text style={styles.subtitle}>Cập nhật hồ sơ cá nhân của bạn</Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
            <Divider style={{ marginVertical: 10 }} />

            {/* Fullname */}
            <Text style={styles.label}>Họ và tên</Text>
            <View style={styles.inputWrap}>
              <Icon name="user" size={16} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                value={fullname}
                onChangeText={setFullname}
                placeholder="Nhập họ và tên"
                style={styles.input}
              />
            </View>

            {/* Phone */}
            <Text style={styles.label}>Số điện thoại</Text>
            <View style={styles.inputWrap}>
              <Icon name="phone" size={16} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Nhập số điện thoại"
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>

            {/* Gender */}
            <Text style={styles.label}>Giới tính</Text>
            <View style={styles.genderRow}>
              <TouchableOpacity
                style={[styles.genderBtn, gender === true && styles.genderBtnActive]}
                onPress={() => setGender(true)}
              >
                <Text style={[styles.genderText, gender === true && styles.genderTextActive]}>
                  Nam
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.genderBtn, gender === false && styles.genderBtnActive]}
                onPress={() => setGender(false)}
              >
                <Text style={[styles.genderText, gender === false && styles.genderTextActive]}>
                  Nữ
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.genderBtn, gender === null && styles.genderBtnActive]}
                onPress={() => setGender(null)}
              >
                <Text style={[styles.genderText, gender === null && styles.genderTextActive]}>
                  Không rõ
                </Text>
              </TouchableOpacity>
            </View>

            {/* DOB */}
            <Text style={styles.label}>Ngày sinh (YYYY-MM-DD)</Text>
            <View style={styles.inputWrap}>
              <Icon name="birthday-cake" size={16} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                value={dob}
                onChangeText={setDob}
                placeholder="1990-01-01"
                style={[styles.input, !isDobValid && { borderColor: "#EF4444" }]}
              />
            </View>
            {!isDobValid ? (
              <Text style={styles.errorText}>Ngày sinh không hợp lệ. Dùng định dạng YYYY-MM-DD.</Text>
            ) : null}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Nâng cao</Text>
            <Divider style={{ marginVertical: 10 }} />

            {/* Avatar */}
            <Text style={styles.label}>Avatar URL</Text>
            <View style={styles.inputWrap}>
              <Icon name="image" size={16} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                value={avatar}
                onChangeText={setAvatar}
                placeholder="https://..."
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            {/* Email + PID (readonly) */}
            <Text style={styles.label}>Email (không chỉnh sửa)</Text>
            <View style={[styles.inputWrap, styles.readonlyWrap]}>
              <Icon name="envelope" size={16} color="#9CA3AF" style={styles.inputIcon} />
              <Text style={styles.readonlyText}>{user?.email || "Chưa cập nhật"}</Text>
            </View>

            <Text style={styles.label}>PID (không chỉnh sửa)</Text>
            <View style={[styles.inputWrap, styles.readonlyWrap]}>
              <Icon name="id-card" size={16} color="#9CA3AF" style={styles.inputIcon} />
              <Text style={styles.readonlyText}>{user?.pID || "Chưa cập nhật"}</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={onCancel} disabled={saving}>
            <Text style={[styles.btnText, styles.btnGhostText]}>Hủy</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={onSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="save" size={16} color="#fff" />
                <Text style={styles.btnText}>Lưu thay đổi</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16 },

  header: { marginBottom: 10 },
  title: { fontSize: 20, fontWeight: "800", color: "#111827" },
  subtitle: { marginTop: 4, color: "#6B7280" },

  card: { borderRadius: 14, elevation: 1, marginTop: 10 },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: "#111827" },

  label: { marginTop: 10, marginBottom: 6, fontSize: 13, fontWeight: "700", color: "#374151" },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  inputIcon: { width: 22 },
  input: { flex: 1, fontSize: 14, color: "#111827" },

  genderRow: { flexDirection: "row", gap: 8, marginTop: 2 },
  genderBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  genderBtnActive: { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" },
  genderText: { fontSize: 13, fontWeight: "800", color: "#374151" },
  genderTextActive: { color: "#3730A3" },

  readonlyWrap: { backgroundColor: "#F3F4F6" },
  readonlyText: { flex: 1, fontSize: 14, color: "#6B7280", fontWeight: "600" },

  errorText: { marginTop: 6, color: "#EF4444", fontSize: 12, fontWeight: "600" },

  actions: { flexDirection: "row", gap: 10, marginTop: 14 },
  btn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  btnPrimary: { backgroundColor: "#4F46E5" },
  btnGhost: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#E5E7EB" },
  btnText: { color: "#fff", fontWeight: "800" },
  btnGhostText: { color: "#111827" },
});
