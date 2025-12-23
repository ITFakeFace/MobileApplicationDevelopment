import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Platform,
} from "react-native";

const COLORS = {
  bg: "#F6F7FB",
  card: "#FFFFFF",
  text: "#111827",
  subtext: "#374151",
  muted: "#6B7280",
  line: "#E5E7EB",

  // One subtle accent
  accent: "#2563EB",
  accentSoft: "rgba(37,99,235,0.10)",
  accentSoft2: "rgba(37,99,235,0.06)",

  // Neutrals for UI states
  surface: "#F9FAFB",
  press: "#F3F4F6",
};

const SHADOW = Platform.select({
  ios: {
    shadowColor: "#111827",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  android: { elevation: 2 },
  default: {},
});

const phones = [
  { dept: "Hotline tư vấn 24/7", number: "1900 6886", tone: "cyan", badge: "24/7" },
  { dept: "Phòng Tuyển sinh", number: "028 7300 6886", tone: "purple" },
  { dept: "Chăm sóc học viên", number: "028 7300 6999", tone: "pink" },
  { dept: "Mobile CSKH", number: "0908 456 688", tone: "green" },
  { dept: "Mobile Doanh nghiệp", number: "0933 225 688", tone: "amber" },
];

const emails = [
  { need: "Tư vấn khóa học", email: "info@hrc.edu.vn", tone: "cyan" },
  { need: "Tuyển sinh", email: "admission@hrc.edu.vn", tone: "purple" },
  { need: "Hợp tác doanh nghiệp", email: "corporate@hrc.edu.vn", tone: "pink" },
  { need: "Hỗ trợ học viên", email: "support@hrc.edu.vn", tone: "green" },
  { need: "Nhân sự & Tuyển dụng", email: "hr@hrc.edu.vn", tone: "amber" },
];

const socials = [
  { label: "Website", value: "www.hrc.edu.vn", tone: "cyan" },
  { label: "Fanpage", value: "facebook.com/hrc.training.center", tone: "pink" },
  { label: "LinkedIn", value: "linkedin.com/company/hrc-training-center", tone: "purple" },
  { label: "YouTube", value: "youtube.com/@hrctrainingcenter", tone: "green" },
];

const offices = [
  { area: "Hà Nội", address: "Tầng 5 – 72 Trần Thái Tông, Cầu Giấy" },
  { area: "Đà Nẵng", address: "Tầng 6 – 118 Nguyễn Văn Linh, Hải Châu" },
  { area: "Singapore", address: "10 Anson Road, #23-14, International Plaza" },
];

// Keep signature but make it minimal: always return same accent palette
function toneColors(_) {
  return { main: COLORS.accent, tint: COLORS.accentSoft2, glow: "transparent" };
}

function NeonSection({ icon, title, subtitle, tone = "cyan", children }) {
  const t = toneColors(tone);
  return (
    <View style={styles.sectionCard}>
      <View style={[styles.sectionTopBar, { backgroundColor: t.main }]} />
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {icon} {title}
        </Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function NeonChip({ text, tone = "cyan" }) {
  const t = toneColors(tone);
  return (
    <View style={[styles.chip, { backgroundColor: COLORS.surface, borderColor: COLORS.line }]}>
      <View style={[styles.chipDot, { backgroundColor: t.main }]} />
      <Text style={styles.chipText}>{text}</Text>
    </View>
  );
}

function NeonActionRow({ label, value, tone = "cyan", badge }) {
  const t = toneColors(tone);
  return (
    <Pressable
      style={({ pressed }) => [
        styles.actionRow,
        pressed && { backgroundColor: COLORS.press, borderColor: COLORS.line },
      ]}
    >
      <View style={[styles.actionAccent, { backgroundColor: t.main }]} />
      <View style={{ flex: 1, paddingLeft: 10 }}>
        <View style={styles.actionTop}>
          <Text style={styles.actionLabel}>{label}</Text>
          {badge ? (
            <View style={[styles.badge, { backgroundColor: COLORS.accentSoft, borderColor: "transparent" }]}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.actionValue}>{value}</Text>
      </View>

      <View style={styles.chevPill}>
        <Text style={styles.chev}>›</Text>
      </View>
    </Pressable>
  );
}

function NeonRow({ left, right, tone = "cyan" }) {
  const t = toneColors(tone);
  return (
    <View style={styles.workRow}>
      <Text style={styles.workLeft}>{left}</Text>
      <Text style={styles.workRight}>{right}</Text>
      <View style={[styles.workUnderline, { backgroundColor: t.main }]} />
    </View>
  );
}

export default function ContactUsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO */}
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <Text style={styles.heroKicker}>HRC TRAINING CENTER</Text>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillText}>CONTACT</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>Contact Us</Text>
          <Text style={styles.heroSubtitle}>
            Kết nối nhanh với đội ngũ HRC để được tư vấn, hỗ trợ học viên, và hợp tác doanh nghiệp.
          </Text>

          <View style={styles.heroChips}>
            <NeonChip text="Hotline 24/7" tone="cyan" />
            <NeonChip text="Tuyển sinh" tone="purple" />
            <NeonChip text="CSKH" tone="pink" />
            <NeonChip text="Doanh nghiệp" tone="amber" />
          </View>

          <View style={styles.heroQuick}>
            <View style={styles.quickCard}>
              <View style={[styles.quickBar, { backgroundColor: COLORS.accent }]} />
              <Text style={styles.quickK}>Hotline</Text>
              <Text style={styles.quickV}>1900 6886</Text>
            </View>

            <View style={styles.quickCard}>
              <View style={[styles.quickBar, { backgroundColor: COLORS.accent }]} />
              <Text style={styles.quickK}>Email</Text>
              <Text style={styles.quickV}>info@hrc.edu.vn</Text>
            </View>
          </View>
        </View>

        {/* TRỤ SỞ CHÍNH */}
        <NeonSection
          icon="🏢"
          title="Trụ Sở Chính"
          subtitle="Địa chỉ văn phòng chính tại TP. Hồ Chí Minh"
          tone="cyan"
        >
          <View style={styles.addressCard}>
            <View style={[styles.addressBar, { backgroundColor: COLORS.accent }]} />

            <Text style={styles.orgName}>HRC Training Center</Text>
            <Text style={styles.addressText}>Tòa nhà HRC Tower, Tầng 8</Text>
            <Text style={styles.addressText}>
              Số 125 Nguyễn Đình Chiểu, Phường Đa Kao, Quận 1, TP. Hồ Chí Minh, Việt Nam
            </Text>

            <View style={styles.addressHint}>
              <Text style={styles.hintText}>
                Gợi ý: Bạn có thể gắn “Mở bản đồ” bằng Linking để mở Google Maps.
              </Text>
            </View>
          </View>
        </NeonSection>

        {/* HOTLINE */}
        <NeonSection
          icon="📱"
          title="Hotline – Mobile"
          subtitle="Các đầu mối liên hệ theo từng bộ phận"
          tone="pink"
        >
          {phones.map((p) => (
            <NeonActionRow
              key={p.number}
              label={p.dept}
              value={p.number}
              tone={p.tone}
              badge={p.badge}
            />
          ))}
        </NeonSection>

        {/* EMAIL */}
        <NeonSection icon="📧" title="Email" subtitle="Email theo nhu cầu liên hệ" tone="purple">
          {emails.map((e) => (
            <NeonActionRow key={e.email} label={e.need} value={e.email} tone={e.tone} />
          ))}
        </NeonSection>

        {/* WEBSITE / SOCIAL */}
        <NeonSection
          icon="🌐"
          title="Website – Social"
          subtitle="Kênh thông tin chính thức của HRC"
          tone="cyan"
        >
          {socials.map((s) => (
            <NeonActionRow key={s.value} label={s.label} value={s.value} tone={s.tone} />
          ))}
        </NeonSection>

        {/* GIỜ LÀM VIỆC */}
        <NeonSection
          icon="⏰"
          title="Thời Gian Làm Việc"
          subtitle="Lịch làm việc của HRC"
          tone="green"
        >
          <View style={styles.workBox}>
            <NeonRow left="Thứ 2 – Thứ 7" right="08:00 – 20:00" tone="green" />
            <View style={styles.workDivider} />
            <NeonRow left="Chủ Nhật" right="Nghỉ (trừ lớp đặc biệt & workshop)" tone="amber" />
          </View>
        </NeonSection>

        {/* VĂN PHÒNG KHU VỰC */}
        <NeonSection
          icon="🗺️"
          title="Văn Phòng Khu Vực"
          subtitle="Các văn phòng khu vực & quốc tế"
          tone="amber"
        >
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.thLeft}>Khu vực</Text>
              <Text style={styles.thRight}>Địa chỉ</Text>
            </View>

            {offices.map((o) => (
              <View key={o.area} style={styles.tableRow}>
                <View style={[styles.tableAccent, { backgroundColor: COLORS.accent }]} />
                <Text style={styles.tdLeft}>{o.area}</Text>
                <Text style={styles.tdRight}>{o.address}</Text>
              </View>
            ))}
          </View>
        </NeonSection>

        <View style={{ height: 14 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  screen: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 16, paddingBottom: 28 },

  // HERO
  hero: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    ...SHADOW,
    marginBottom: 12,
    overflow: "hidden",
  },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  heroKicker: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  heroPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.surface,
  },
  heroPillText: { fontSize: 11, fontWeight: "700", color: COLORS.accent, letterSpacing: 0.4 },

  heroTitle: { fontSize: 26, fontWeight: "800", color: COLORS.text, marginTop: 10, marginBottom: 6 },
  heroSubtitle: { fontSize: 14, lineHeight: 20, color: COLORS.subtext, marginBottom: 12 },

  heroChips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipDot: { width: 8, height: 8, borderRadius: 8 },
  chipText: { fontSize: 12, fontWeight: "700", color: COLORS.text },

  heroQuick: { flexDirection: "row", justifyContent: "space-between" },
  quickCard: {
    width: "48%",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.card,
    padding: 12,
    overflow: "hidden",
  },
  quickBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    opacity: 0.95,
  },
  quickK: { fontSize: 12, fontWeight: "700", color: COLORS.muted, marginBottom: 6 },
  quickV: { fontSize: 16, fontWeight: "800", color: COLORS.text },

  // SECTION
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 16,
    marginTop: 10,
    ...SHADOW,
    overflow: "hidden",
  },
  sectionTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    opacity: 0.95,
  },
  sectionHeader: { marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: COLORS.text, marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, lineHeight: 18, color: COLORS.muted },

  // ADDRESS CARD
  addressCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.card,
    padding: 14,
    overflow: "hidden",
    position: "relative",
  },
  addressBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    opacity: 0.95,
  },
  orgName: { fontSize: 15, fontWeight: "800", color: COLORS.text, marginBottom: 6 },
  addressText: { fontSize: 14, lineHeight: 20, color: COLORS.subtext, marginBottom: 4 },
  addressHint: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    paddingTop: 10,
  },
  hintText: { fontSize: 12, color: COLORS.muted, lineHeight: 16 },

  // ACTION ROW
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.card,
    marginBottom: 10,
  },
  actionAccent: {
    width: 3,
    borderRadius: 999,
    alignSelf: "stretch",
    opacity: 0.95,
  },
  actionTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  actionLabel: { fontSize: 13, fontWeight: "800", color: COLORS.text },
  actionValue: { fontSize: 14, lineHeight: 19, color: COLORS.subtext, marginTop: 4 },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: { fontSize: 11, fontWeight: "800", color: COLORS.accent },

  chevPill: {
    width: 34,
    height: 34,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: COLORS.line,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    backgroundColor: COLORS.surface,
  },
  chev: { fontSize: 22, marginTop: -2, color: COLORS.muted },

  // WORK TIME
  workBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.card,
    padding: 12,
  },
  workRow: { paddingVertical: 10, position: "relative" },
  workLeft: { fontSize: 13, fontWeight: "800", color: COLORS.text, marginBottom: 6 },
  workRight: { fontSize: 13, lineHeight: 18, color: COLORS.subtext },
  workUnderline: {
    position: "absolute",
    left: 0,
    bottom: 0,
    height: 2,
    width: 70,
    borderRadius: 2,
    opacity: 0.9,
  },
  workDivider: { height: 1, backgroundColor: COLORS.line },

  // TABLE
  table: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    overflow: "hidden",
    backgroundColor: COLORS.card,
  },
  tableRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    position: "relative",
  },
  tableHeader: { borderTopWidth: 0, backgroundColor: COLORS.surface },
  thLeft: { width: "28%", fontSize: 12, fontWeight: "800", color: COLORS.text },
  thRight: { width: "72%", fontSize: 12, fontWeight: "800", color: COLORS.text },
  tdLeft: { width: "28%", fontSize: 13, fontWeight: "800", color: COLORS.text },
  tdRight: { width: "72%", fontSize: 13, lineHeight: 18, color: COLORS.subtext },
  tableAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    opacity: 0.9,
  },
});
