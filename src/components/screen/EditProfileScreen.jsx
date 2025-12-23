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
  Image,
} from "react-native";
import { Card, Divider } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import moment from "moment";
import { useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";

import MainLayout from "../layout/MainLayout";
import api from "../../api/APIClient";
import * as ImagePicker from "expo-image-picker";

const buildUpdateEndpoint = (userId) => `/users/${userId}`;

/**
 * Helper: đọc user từ response (giữ lại để bạn dùng khi gắn API thật)
 */
function extractUserFromResponse(resData) {
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

  // Avatar upload state (Expo ImagePicker)
  const [avatarUri, setAvatarUri] = useState(user?.avatar ?? ""); // preview (local uri hoặc remote url)
  const [avatarFile, setAvatarFile] = useState(null); // { uri, name, type }

  const [saving, setSaving] = useState(false);

  // Fill initial values
  useEffect(() => {
    if (!user) return;
    setFullname(user?.fullname ?? "");
    setPhone(user?.phone ?? "");
    setGender(user?.gender ?? null);
    setDob(user?.dob ? moment(user.dob).format("YYYY-MM-DD") : "");
    setAvatarUri(user?.avatar ?? "");
    setAvatarFile(null);
  }, [user]);

  const isDobValid = useMemo(() => {
    if (!dob) return true;
    return moment(dob, "YYYY-MM-DD", true).isValid();
  }, [dob]);

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Thiếu quyền", "Bạn cần cấp quyền truy cập thư viện ảnh.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85,
      aspect: [1, 1],
    });

    if (result.canceled) return;

    const asset = result.assets?.[0];
    if (!asset?.uri) return;

    const name = asset.fileName || `avatar_${Date.now()}.jpg`;
    const type = asset.mimeType || "image/jpeg";

    setAvatarUri(asset.uri);
    setAvatarFile({ uri: asset.uri, name, type });
  };

  const clearAvatar = () => {
    // Xoá avatar đang chọn (chỉ xoá local selection, không gọi API)
    setAvatarUri("");
    setAvatarFile(null);
  };

  const buildPayloadForConsole = (finalAvatarUrl) => {
    return {
      fullname: fullname?.trim(),
      phone: phone?.trim() || null,
      gender: gender,
      dob: dob ? new Date(dob).toISOString() : null,
      avatar: finalAvatarUrl ?? null, // URL sau khi upload (tạm thời console)
    };
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

      // ===== 1) CONSOLE LOG TRƯỚC (như bạn yêu cầu) =====
      console.log("===== [EditProfile] BEFORE SAVE =====");
      console.log("userId:", userId); 
      console.log("avatarFile (picked):", avatarFile);
      console.log("endpoint:", endpoint);
      console.log("userId:", userId);
      console.log("fullname:", fullname);
      console.log("phone:", phone);
      console.log("gender:", gender);
      console.log("dob:", dob);
      console.log("avatarUri (preview):", avatarUri);
      console.log("avatarFile (picked):", avatarFile);


      // ===== 2) GIẢ LẬP FLOW: upload avatar -> lấy avatarUrl =====
      // Nếu user chọn ảnh mới -> bạn sẽ upload để lấy URL
      // Nếu không chọn ảnh mới -> giữ URL cũ (user.avatar) hoặc null nếu user xoá
      let avatarUrl = null;

      if (avatarFile) {
        console.log("👉 Cần upload avatarFile để lấy avatarUrl (bạn tự gắn API).");

        // ====== API UPLOAD AVATAR (BẠN GẮN SAU) ======
        // const form = new FormData();
        // form.append("file", {
        //   uri: avatarFile.uri,
        //   name: avatarFile.name,
        //   type: avatarFile.type,
        // });
        //
        // const uploadRes = await api.post("/files/upload-avatar", form, {
        //   headers: { "Content-Type": "multipart/form-data" },
        // });
        //
        // avatarUrl = uploadRes?.data?.url || uploadRes?.data?.data?.url;
        // if (!avatarUrl) throw new Error("Upload avatar failed: missing url in response");
        // =============================================

        // Tạm thời: để bạn thấy payload, mình giả lập avatarUrl = "(uploaded_url_here)"
        avatarUrl = "(uploaded_url_here)";
      } else {
        // Không chọn ảnh mới
        // - nếu avatarUri rỗng => user xoá avatar => avatarUrl = null
        // - nếu avatarUri còn => có thể là URL cũ => dùng lại
        avatarUrl = avatarUri ? avatarUri : null;
      }

      const payload = buildPayloadForConsole(avatarUrl);

      // ===== 3) CONSOLE LOG SAU: payload cuối cùng =====
      console.log("===== [EditProfile] AFTER PREPARE PAYLOAD =====");
      console.log("final avatarUrl:", avatarUrl);
      console.log("payload:", payload);

      // ===== 4) API UPDATE PROFILE (BẠN GẮN SAU) =====
      // Tuỳ BE: PUT hoặc PATCH
      // const res = await api.put(endpoint, payload);
      // const updatedUser = extractUserFromResponse(res?.data);
      // if (!updatedUser) {
      //   Alert.alert("Cập nhật thất bại", "Không đọc được dữ liệu user trả về từ server.");
      //   return;
      // }
      //
      // dispatch({ type: "auth/setUser", payload: updatedUser });
      // Alert.alert("Thành công", "Đã cập nhật thông tin cá nhân.");
      // navigation.goBack();
      // ==============================================

      // Tạm thời để test UI: báo thành công giả lập
      Alert.alert("Đã log payload", "Mở console để xem BEFORE/AFTER. Bạn gắn API sau.");
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
                <Text style={[styles.genderText, gender === true && styles.genderTextActive]}>Nam</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.genderBtn, gender === false && styles.genderBtnActive]}
                onPress={() => setGender(false)}
              >
                <Text style={[styles.genderText, gender === false && styles.genderTextActive]}>Nữ</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.genderBtn, gender === null && styles.genderBtnActive]}
                onPress={() => setGender(null)}
              >
                <Text style={[styles.genderText, gender === null && styles.genderTextActive]}>Không rõ</Text>
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
            <Text style={styles.sectionTitle}>Avatar</Text>
            <Divider style={{ marginVertical: 10 }} />

            <View style={styles.avatarRow}>
              <View style={styles.avatarPreview}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Icon name="user" size={18} color="#fff" />
                  </View>
                )}
              </View>

              <TouchableOpacity style={styles.pickBtn} onPress={pickAvatar} disabled={saving}>
                <Icon name="image" size={16} color="#fff" />
                <Text style={styles.pickBtnText}>Chọn ảnh</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.pickBtn, { backgroundColor: "#6B7280" }]}
                onPress={clearAvatar}
                disabled={saving}
              >
                <Icon name="trash" size={16} color="#fff" />
                <Text style={styles.pickBtnText}>Xoá</Text>
              </TouchableOpacity>
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
          <TouchableOpacity
            style={[styles.btn, styles.btnGhost]}
            onPress={onCancel}
            disabled={saving}
          >
            <Text style={[styles.btnText, styles.btnGhostText]}>Hủy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary]}
            onPress={onSave}
            disabled={saving}
          >
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

  // Avatar UI
  avatarRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatarPreview: { width: 56, height: 56, borderRadius: 28, overflow: "hidden" },
  avatarImg: { width: 56, height: 56 },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
  },
  pickBtn: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pickBtnText: { color: "#fff", fontWeight: "800" },

  hintText: { marginTop: 10, color: "#6B7280", fontSize: 12, lineHeight: 18 },
});
