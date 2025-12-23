import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import {
  ActivityIndicator,
  Button,
  Divider,
  Modal,
  Portal,
  Text,
  TextInput,
  TouchableRipple,
} from "react-native-paper";

/** ---------- STATUS (3 trạng thái) -> Tiếng Việt ---------- **/
const STATUS_VI = {
  PENDING: "Đang chờ xử lý",
  RESOLVED: "Đã giải quyết", // nếu muốn: "Đã duyệt"
  REJECTED: "Đã từ chối",
};

function normalizeStatus(statusRaw) {
  const s = String(statusRaw || "PENDING").trim().toUpperCase();
  if (s === "PENDING" || s === "RESOLVED" || s === "REJECTED") return s;
  return "PENDING";
}

function statusLabelVi(statusRaw) {
  const k = normalizeStatus(statusRaw);
  return STATUS_VI[k] || STATUS_VI.PENDING;
}

/** ---------- UI helpers ---------- **/
const ShadowCard = React.memo(function ShadowCard({ children, style }) {
  return (
    <View style={[styles.cardShadow, style]}>
      <View style={styles.cardInner}>{children}</View>
    </View>
  );
});

function statusTone(statusRaw) {
  const k = normalizeStatus(statusRaw);

  // RESOLVED: xanh
  if (k === "RESOLVED") return { bg: "#ECFDF3", fg: "#027A48", bd: "#ABEFC6" };

  // REJECTED: đỏ
  if (k === "REJECTED") return { bg: "#FEF3F2", fg: "#B42318", bd: "#FECDCA" };

  // PENDING: vàng
  return { bg: "#FFFAEB", fg: "#B54708", bd: "#FEC84B" };
}

const StatusPill = React.memo(function StatusPill({ status }) {
  const t = statusTone(status);
  return (
    <View style={[styles.pill, { backgroundColor: t.bg, borderColor: t.bd }]}>
      <View style={[styles.pillDot, { backgroundColor: t.fg }]} />
      <Text style={[styles.pillText, { color: t.fg }]} numberOfLines={1}>
        {statusLabelVi(status)}
      </Text>
    </View>
  );
});

/** ---------- Form card (memo) ---------- **/
const CreateFormCard = React.memo(function CreateFormCard({
  title,
  content,
  setTitle,
  setContent,
  submitting,
  onSubmit,
}) {
  return (
    <ShadowCard>
      <Text style={styles.sectionTitle}>Thông tin yêu cầu</Text>

      <View style={styles.field}>
        <TextInput
          label="Tiêu đề"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          autoCapitalize="sentences"
          outlineStyle={styles.inputOutline}
          style={styles.input}
          contentStyle={styles.inputContent}
          returnKeyType="next"
          blurOnSubmit={false}
        />
      </View>

      <View style={styles.field}>
        <TextInput
          label="Nội dung"
          value={content}
          onChangeText={setContent}
          mode="outlined"
          multiline
          numberOfLines={7}
          autoCapitalize="sentences"
          outlineStyle={styles.inputOutline}
          style={[styles.input, styles.textarea]}
          contentStyle={[styles.inputContent, { minHeight: 120 }]}
        />
      </View>

      <Button
        mode="contained"
        onPress={onSubmit}
        disabled={submitting}
        buttonColor="#5B47B6"
        style={styles.submitBtn}
        contentStyle={styles.submitBtnContent}
        labelStyle={styles.submitBtnLabel}
      >
        {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
      </Button>

      {submitting && (
        <View style={styles.loadingRow}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Đang gửi dữ liệu...</Text>
        </View>
      )}
    </ShadowCard>
  );
});

/** ---------- List card (memo) ---------- **/
const ListCard = React.memo(function ListCard({
  loadingList,
  requests,
  onRefreshPress,
  onOpenDetail,
}) {
  return (
    <ShadowCard style={{ marginTop: 14 }}>
      <View style={styles.listHeaderRow}>
        <Text style={styles.sectionTitle}>Các yêu cầu đã gửi</Text>

        <Button
          mode="outlined"
          onPress={onRefreshPress}
          disabled={loadingList}
          style={styles.refreshBtn}
          textColor="#374151"
          compact
        >
          {loadingList ? "Đang tải..." : "Tải lại"}
        </Button>
      </View>

      <Divider style={{ marginBottom: 10 }} />

      {loadingList ? (
        <View style={styles.centerBox}>
          <ActivityIndicator />
          <Text style={styles.centerText}>Đang tải danh sách...</Text>
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.centerBox}>
          <Text style={styles.centerText}>Chưa có yêu cầu nào.</Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {requests.map((item, idx) => (
            <View key={item?.id ?? String(idx)}>
              <TouchableRipple
                onPress={() => onOpenDetail(item?.id)}
                rippleColor="rgba(0,0,0,0.06)"
                style={styles.listItem}
              >
                <View style={styles.listItemInner}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle} numberOfLines={1}>
                      {item?.title || "(Không có tiêu đề)"}
                    </Text>

                    <View style={{ marginTop: 6, flexDirection: "row", alignItems: "center" }}>
                      <StatusPill status={item?.status || "PENDING"} />
                    </View>
                  </View>

                  <Text style={styles.itemChevron}>›</Text>
                </View>
              </TouchableRipple>

              {idx !== requests.length - 1 && <Divider style={{ marginLeft: 12 }} />}
            </View>
          ))}
        </View>
      )}
    </ShadowCard>
  );
});

export default function RequestFormScreen() {
  const baseUrl = useSelector((state) => state.config?.baseUrl || "http://localhost:3000");
  const token = useSelector((state) => state.auth?.accessToken || state.auth?.token);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [loadingList, setLoadingList] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState([]);

  const [detailVisible, setDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  const apiHeaders = useMemo(() => {
    if (!token) return null;
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  const fetchList = useCallback(
    async (isRefresh = false) => {
      if (!apiHeaders) return;

      if (isRefresh) setRefreshing(true);
      else setLoadingList(true);

      try {
        const res = await fetch(`${baseUrl}/form-requests`, {
          method: "GET",
          headers: apiHeaders,
        });

        const data = await res.json();

        if (!res.ok || data?.status === false) {
          Alert.alert("Lỗi", data?.message || "Không thể lấy danh sách yêu cầu");
          return;
        }

        const arr = Array.isArray(data?.data) ? data.data : [];
        setRequests(arr);
      } catch (e) {
        Alert.alert("Lỗi", e?.message || "Không thể kết nối server");
      } finally {
        setLoadingList(false);
        setRefreshing(false);
      }
    },
    [apiHeaders, baseUrl]
  );

  const openDetail = useCallback(
    async (id) => {
      if (!apiHeaders) {
        Alert.alert("Lỗi", "Bạn chưa đăng nhập (thiếu token).");
        return;
      }

      setDetailVisible(true);
      setDetailLoading(true);
      setSelected(null);

      try {
        const res = await fetch(`${baseUrl}/form-requests/${id}`, {
          method: "GET",
          headers: apiHeaders,
        });

        const data = await res.json();

        if (!res.ok || data?.status === false) {
          Alert.alert("Lỗi", data?.message || "Không thể lấy chi tiết yêu cầu");
          setDetailVisible(false);
          return;
        }

        setSelected(data?.data || null);
      } catch (e) {
        Alert.alert("Lỗi", e?.message || "Không thể kết nối server");
        setDetailVisible(false);
      } finally {
        setDetailLoading(false);
      }
    },
    [apiHeaders, baseUrl]
  );

  useEffect(() => {
    fetchList(false);
  }, [fetchList]);

  const doSubmit = useCallback(async () => {
    if (!apiHeaders) {
      Alert.alert("Lỗi", "Bạn chưa đăng nhập (thiếu token).");
      return;
    }

    setSubmitting(true);
    try {
      const payload = { title, content };

      const res = await fetch(`${baseUrl}/form-requests`, {
        method: "POST",
        headers: { ...apiHeaders, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || data?.status === false) {
        Alert.alert("Gửi yêu cầu thất bại", data?.message || "Có lỗi xảy ra");
        return;
      }

      Alert.alert("Thành công", data?.message || "Gửi yêu cầu thành công");
      setTitle("");
      setContent("");
      fetchList(false);
    } catch (e) {
      Alert.alert("Lỗi", e?.message || "Không thể kết nối server");
    } finally {
      setSubmitting(false);
    }
  }, [apiHeaders, baseUrl, content, fetchList, title]);

  const handleSubmit = useCallback(() => {
    const isEmptyTitle = !String(title || "").trim();
    const isEmptyContent = !String(content || "").trim();

    if (isEmptyTitle && isEmptyContent) {
      Alert.alert(
        "Gửi yêu cầu rỗng?",
        "Bạn chưa nhập tiêu đề và nội dung. Vẫn muốn gửi chứ?",
        [
          { text: "Hủy", style: "cancel" },
          { text: "Vẫn gửi", style: "destructive", onPress: doSubmit },
        ]
      );
      return;
    }

    doSubmit();
  }, [content, doSubmit, title]);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchList(true)}
            tintColor="#5B47B6"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            Gửi yêu cầu
          </Text>
          <Text style={styles.subtitle}>Điền thông tin và gửi yêu cầu lên hệ thống.</Text>
        </View>

        <CreateFormCard
          title={title}
          content={content}
          setTitle={setTitle}
          setContent={setContent}
          submitting={submitting}
          onSubmit={handleSubmit}
        />

        <ListCard
          loadingList={loadingList}
          requests={requests}
          onRefreshPress={() => fetchList(false)}
          onOpenDetail={openDetail}
        />

        <View style={{ height: 18 }} />
      </ScrollView>

      {/* Detail Modal */}
      <Portal>
        <Modal
          visible={detailVisible}
          onDismiss={() => setDetailVisible(false)}
          contentContainerStyle={styles.modalOuter}
        >
          <View style={styles.modalInner}>
            <Text style={styles.modalTitle}>Chi tiết yêu cầu</Text>
            <Divider style={{ marginVertical: 10 }} />

            {detailLoading ? (
              <View style={styles.centerBox}>
                <ActivityIndicator />
                <Text style={styles.centerText}>Đang tải chi tiết...</Text>
              </View>
            ) : !selected ? (
              <Text style={styles.centerText}>Không có dữ liệu.</Text>
            ) : (
              <ScrollView
                style={{ maxHeight: 360 }}
                contentContainerStyle={{ paddingBottom: 6 }}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>ID</Text>
                  <Text style={styles.detailValue}>{selected.id}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Tiêu đề</Text>
                  <Text style={styles.detailValue}>{selected.title || "(Không có tiêu đề)"}</Text>
                </View>

                <View style={[styles.detailRow, { alignItems: "center" }]}>
                  <Text style={styles.detailLabel}>Trạng thái</Text>
                  <View style={{ alignItems: "flex-end" }}>
                    <StatusPill status={selected.status || "PENDING"} />
                  </View>
                </View>

                <View style={{ marginTop: 10 }}>
                  <Text style={styles.detailLabel}>Nội dung</Text>
                  <Text style={styles.detailContent}>{selected.content || "(Không có nội dung)"}</Text>
                </View>
              </ScrollView>
            )}

            <Button
              mode="contained"
              buttonColor="#5B47B6"
              style={styles.closeBtn}
              contentStyle={{ height: 46 }}
              onPress={() => setDetailVisible(false)}
            >
              Đóng
            </Button>
          </View>
        </Modal>
      </Portal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F6F7FB" },
  scrollContent: { padding: 16, paddingBottom: 28 },

  header: { marginTop: 4, marginBottom: 12, paddingHorizontal: 2 },
  title: { fontWeight: "800", marginBottom: 6, textAlign: "center" },
  subtitle: { opacity: 0.75, lineHeight: 18, textAlign: "center" },

  // ShadowCard 2 lớp (tránh “bể”)
  cardShadow: {
    borderRadius: 18,
    backgroundColor: "transparent",
    shadowColor: "#111827",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  cardInner: {
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6E8F0",
    padding: 14,
  },

  sectionTitle: { fontSize: 14, fontWeight: "800", color: "#111827" },

  field: { marginTop: 12 },
  input: { backgroundColor: "white" },
  inputOutline: { borderRadius: 12, borderColor: "#D1D5DB" },
  inputContent: { fontSize: 15 },
  textarea: { minHeight: 140 },

  submitBtn: { borderRadius: 14, marginTop: 12 },
  submitBtnContent: { height: 50 },
  submitBtnLabel: { fontWeight: "800" },

  loadingRow: { marginTop: 12, flexDirection: "row", alignItems: "center" },
  loadingText: { marginLeft: 10, opacity: 0.75 },

  listHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  refreshBtn: { borderRadius: 12 },

  listContainer: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  listItem: { paddingVertical: 12, paddingHorizontal: 12 },
  listItemInner: { flexDirection: "row", alignItems: "center" },

  itemTitle: { fontWeight: "800", color: "#111827" },
  itemChevron: { fontSize: 24, opacity: 0.35, paddingHorizontal: 6 },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    maxWidth: 200,
  },
  pillDot: { width: 8, height: 8, borderRadius: 8, marginRight: 8 },
  pillText: { fontSize: 12, fontWeight: "800" },

  centerBox: { paddingVertical: 18, alignItems: "center" },
  centerText: { marginTop: 8, opacity: 0.7 },

  // Modal
  modalOuter: { marginHorizontal: 18 },
  modalInner: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E6E8F0",
  },
  modalTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  detailLabel: { fontSize: 12, opacity: 0.6 },
  detailValue: { flex: 1, textAlign: "right", color: "#111827", marginLeft: 12 },
  detailContent: { marginTop: 6, lineHeight: 20, color: "#111827" },

  closeBtn: { marginTop: 14, borderRadius: 14 },
});
