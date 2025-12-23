import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";

/**
 * Timeline style options:
 *  - "pastel"   : dịu, nhiều màu nhưng vẫn sạch sẽ
 *  - "neon"     : rực hơn, nổi bật hơn
 *  - "corporate": màu “doanh nghiệp” hơn, ít chói
 */
const TIMELINE_STYLE = "neon"; // đổi sang "neon" hoặc "corporate" nếu bạn thích

const timeline = [
  {
    year: "2004",
    icon: "🏛️",
    milestone:
      "Thành lập tại TP.HCM với 2 chương trình cốt lõi: Tuyển dụng & Tiền lương",
  },
  {
    year: "2008",
    icon: "📚",
    milestone:
      "Mở rộng đào tạo Quản trị nhân sự, C&B, Luật Lao động, Quản lý hiệu suất",
  },
  {
    year: "2012",
    icon: "🤝",
    milestone:
      "Đạt mốc 2.000+ học viên và ký kết hợp đồng đào tạo doanh nghiệp đầu tiên",
  },
  {
    year: "2016",
    icon: "🎓",
    milestone: "Ra mắt chương trình chứng chỉ HR Business Partner (HRBP)",
  },
  {
    year: "2019",
    icon: "🧩",
    milestone: "Thành lập bộ phận Tư vấn Nhân sự Doanh nghiệp",
  },
  {
    year: "2021",
    icon: "💻",
    milestone: "Chuyển đổi sang mô hình học Online – Hybrid trên toàn quốc",
  },
  {
    year: "2023",
    icon: "🌏",
    milestone: "Mở rộng thị trường ASEAN (Thái Lan, Singapore, Malaysia)",
  },
  {
    year: "2025",
    icon: "🏆",
    milestone: "Cán mốc 10.000+ cựu học viên và 350+ đối tác doanh nghiệp",
  },
];

const coreValues = [
  "Chính trực",
  "Thực tiễn",
  "Đổi mới",
  "Con người là trọng tâm",
  "Học tập suốt đời",
];

const partners = [
  "HR Institute Singapore",
  "Mạng lưới HR ASEAN",
  "Trung tâm đào tạo ILO (Ý)",
  "350+ doanh nghiệp trong các lĩnh vực sản xuất, ngân hàng, CNTT, logistics và bán lẻ",
];

const impacts = [
  { k: "10.000+", v: "học viên đã tốt nghiệp" },
  { k: "350+", v: "doanh nghiệp đối tác" },
  { k: "96%", v: "học viên cải thiện cơ hội việc làm trong vòng 6 tháng" },
  { k: "150+", v: "hội thảo HR công khai mỗi năm" },
];

const COLORS = {
  bg: "#F6F7FB",
  card: "#FFFFFF",
  text: "#111827",
  subtext: "#4B5563",
  muted: "#6B7280",
  line: "#E5E7EB",
  accent: "#2F6BFF",
  accentSoft: "#EEF3FF",
};

const SHADOW = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  android: { elevation: 4 },
  default: {},
});

function getTimelinePalette(mode) {
  if (mode === "neon") {
    return [
      { main: "#00D4FF", soft: "#E6FBFF", border: "#B7F1FF" }, // cyan
      { main: "#8B5CF6", soft: "#F1E9FF", border: "#DDCFFF" }, // violet
      { main: "#FF2D9A", soft: "#FFE6F3", border: "#FFC2E3" }, // hot pink
      { main: "#22C55E", soft: "#E9FFEF", border: "#BFF5CF" }, // neon green
      { main: "#FFB020", soft: "#FFF3DD", border: "#FFE0A8" }, // neon amber
    ];
  }

  if (mode === "corporate") {
    return [
      { main: "#1D4ED8", soft: "#EEF3FF", border: "#D6E2FF" }, // blue
      { main: "#0F766E", soft: "#E6FFFB", border: "#BFF5EE" }, // teal
      { main: "#B45309", soft: "#FFF7ED", border: "#FED7AA" }, // amber
      { main: "#374151", soft: "#F3F4F6", border: "#E5E7EB" }, // gray
      { main: "#6D28D9", soft: "#F5F3FF", border: "#E9D5FF" }, // purple
    ];
  }

  // pastel (default)
  return [
    { main: "#2F6BFF", soft: "#EEF3FF", border: "#D6E2FF" }, // blue
    { main: "#7C3AED", soft: "#F3E8FF", border: "#E9D5FF" }, // purple
    { main: "#DB2777", soft: "#FCE7F3", border: "#FBCFE8" }, // pink
    { main: "#059669", soft: "#ECFDF5", border: "#A7F3D0" }, // green
    { main: "#D97706", soft: "#FFFBEB", border: "#FDE68A" }, // amber
  ];
}

function Section({ title, children }) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View>{children}</View>
    </View>
  );
}

function BulletList({ items }) {
  return (
    <View style={styles.list}>
      {items.map((t, idx) => (
        <View key={`${t}-${idx}`} style={styles.listRow}>
          <View style={styles.bulletDot} />
          <Text style={styles.li}>{t}</Text>
        </View>
      ))}
    </View>
  );
}

function Chip({ text }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{text}</Text>
    </View>
  );
}

function QuoteCard({ text, by }) {
  return (
    <View style={styles.quoteCard}>
      <View style={styles.quoteAccent} />
      <View style={styles.quoteInner}>
        <View style={styles.quoteHeader}>
          <Text style={styles.quoteIcon}>“</Text>
          <Text style={styles.quoteLabel}>Thông điệp</Text>
        </View>

        <Text style={styles.quoteText}>{text}</Text>

        <View style={styles.quoteFooter}>
          <View style={styles.quoteDivider} />
          <Text style={styles.quoteBy}>{by}</Text>
        </View>
      </View>
    </View>
  );
}

function Timeline({ items }) {
  const palette = getTimelinePalette(TIMELINE_STYLE);

  return (
    <View style={styles.timelineWrap}>
      {items.map((item, idx) => {
        const pal = palette[idx % palette.length];
        const isFirst = idx === 0;
        const isLast = idx === items.length - 1;

        return (
          <View key={`${item.year}-${idx}`} style={styles.timelineRow}>
            {/* LEFT RAIL: line segment đổi màu theo từng đoạn + icon */}
            <View style={styles.rail}>
              {!isFirst ? (
                <View style={[styles.railLine, { backgroundColor: pal.main }]} />
              ) : (
                <View style={[styles.railLine, { backgroundColor: "transparent" }]} />
              )}

              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: pal.main,
                    borderColor: pal.soft,
                  },
                ]}
              >
                <Text style={styles.dotIcon}>{item.icon}</Text>
              </View>

              {!isLast ? (
                <View style={[styles.railLine, { backgroundColor: pal.main }]} />
              ) : (
                <View style={[styles.railLine, { backgroundColor: "transparent" }]} />
              )}
            </View>

            {/* RIGHT CARD */}
            <View
              style={[
                styles.timelineCard,
                {
                  backgroundColor: pal.soft,
                  borderColor: pal.border,
                },
              ]}
            >
              {/* “Top bar” màu để nhìn nổi */}
              <View style={[styles.timelineTopBar, { backgroundColor: pal.main }]} />

              <View style={styles.timelineCardHeader}>
                <View
                  style={[
                    styles.yearBadge,
                    { backgroundColor: "#FFFFFF", borderColor: pal.border },
                  ]}
                >
                  <Text style={[styles.yearText, { color: pal.main }]}>
                    {item.year}
                  </Text>
                </View>

                <View style={[styles.timelineTag, { backgroundColor: pal.main }]}>
                  <Text style={styles.timelineTagText}>Cột mốc</Text>
                </View>
              </View>

              <Text style={styles.timelineText}>{item.milestone}</Text>

              {/* Glow để “màu mè” hơn */}
              <View style={[styles.timelineGlow, { backgroundColor: pal.main }]} />
              <View style={[styles.timelineGlow2, { backgroundColor: pal.main }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default function AboutUsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO */}
        <View style={styles.hero}>
          <Text style={styles.heroKicker}>HRC Training Center</Text>
          <Text style={styles.heroTitle}>Giới thiệu</Text>
          <Text style={styles.heroSubtitle}>
            Xây dựng Con người – Nâng tầm Doanh nghiệp – Kiến tạo Tương lai.
          </Text>

          <View style={styles.heroPills}>
            <Chip text="Thành lập 2004" />
            <Chip text="10.000+ học viên" />
            <Chip text="350+ doanh nghiệp" />
          </View>
        </View>

        {/* CHÚNG TÔI LÀ AI */}
        <Section title="🌟 Chúng Tôi Là Ai">
          <Text style={styles.p}>
            HRC Training Center là trung tâm đào tạo Nhân sự (HR) được thành lập từ
            năm 2004, chuyên cung cấp các chương trình đào tạo và phát triển năng
            lực nhân sự theo chuẩn quốc tế cho cá nhân và doanh nghiệp tại Việt
            Nam và khu vực Đông Nam Á.
          </Text>
          <Text style={styles.p}>
            Trải qua hơn 20 năm phát triển liên tục, HRC đã đào tạo hơn 10.000+
            học viên, hợp tác với 350+ doanh nghiệp, và trở thành một trong những
            học viện đào tạo HR uy tín hàng đầu khu vực.
          </Text>
          <Text style={[styles.p, { marginBottom: 0 }]}>
            HRC đào tạo từ sinh viên mới ra trường đến các cấp quản lý nhân sự cấp
            cao, trang bị cho học viên năng lực thực tiễn, tư duy quản trị hiện
            đại và góc nhìn kinh doanh thực tế.
          </Text>
        </Section>

        {/* HÀNH TRÌNH */}
        <Section title="📜 Hành Trình Phát Triển">
          <Timeline items={timeline} />
        </Section>

        {/* TẦM NHÌN / SỨ MỆNH / GIÁ TRỊ */}
        <Section title="🎯 Tầm Nhìn – Sứ Mệnh – Giá Trị Cốt Lõi">
          <Text style={styles.h2}>Tầm nhìn</Text>
          <Text style={styles.p}>
            Trở thành trung tâm phát triển năng lực HR đáng tin cậy nhất Đông Nam Á.
          </Text>

          <Text style={styles.h2}>Sứ mệnh</Text>
          <BulletList
            items={[
              "Cung cấp đào tạo HR theo chuẩn quốc tế",
              "Kết nối lý thuyết với thực tiễn doanh nghiệp",
              "Xây dựng đội ngũ HR bền vững cho tổ chức",
            ]}
          />

          <Text style={styles.h2}>Giá trị cốt lõi</Text>
          <View style={styles.chipsGrid}>
            {coreValues.map((t) => (
              <Chip key={t} text={t} />
            ))}
          </View>
        </Section>

        {/* NHÀ SÁNG LẬP */}
        <Section title="👥 Nhà Sáng Lập">
          <Text style={styles.h2}>
            Đỗ Thanh Hùng – Đồng sáng lập & Giám đốc Chiến lược
          </Text>
          <Text style={styles.p}>
            Với hơn 22 năm kinh nghiệm trong chuyển đổi nhân sự và phát triển tổ
            chức, ông Đỗ Thanh Hùng từng giữ vị trí Giám đốc Nhân sự tại các tập
            đoàn sản xuất đa quốc gia tại Việt Nam và Singapore.
          </Text>
          <Text style={styles.p}>
            Ông là chuyên gia được chứng nhận SHRM-SCP, HRCI SPHR, và là diễn giả
            thường xuyên tại HR Summit Châu Á. Ông là người đặt nền móng cho hệ
            thống đào tạo theo khung năng lực và mô hình tư vấn doanh nghiệp của HRC.
          </Text>

          <QuoteCard
            text="HR không còn là bộ phận hỗ trợ – HR là động cơ chiến lược của tăng trưởng bền vững."
            by="Đỗ Thanh Hùng"
          />

          <Text style={[styles.h2, { marginTop: 14 }]}>
            Lâm Xuân Hùng – Đồng sáng lập & Giám đốc Học thuật
          </Text>
          <Text style={styles.p}>
            Ông Lâm Xuân Hùng là chuyên gia đào tạo nhân sự và kiến trúc sư chương
            trình học với hơn 20 năm kinh nghiệm trong thiết kế đào tạo và giảng dạy.
          </Text>
          <Text style={styles.p}>
            Ông là tác giả nhiều bộ tài liệu nội bộ HR cho doanh nghiệp Việt Nam
            và từng là chuyên gia tư vấn đào tạo cho các tổ chức phi chính phủ quốc tế.
          </Text>
          <Text style={styles.p}>
            Ông trực tiếp chỉ đạo phát triển toàn bộ hệ thống chứng chỉ HRC theo
            chuẩn SHRM, CIPD và ILO.
          </Text>

          <QuoteCard
            text="Giáo dục phải chuyển hóa cả năng lực lẫn tư duy."
            by="Lâm Xuân Hùng"
          />
        </Section>

        {/* ĐỐI TÁC */}
        <Section title="🌏 Toàn Cầu Hóa & Đối Tác">
          <Text style={styles.p}>
            HRC Training Center duy trì hợp tác đào tạo và học thuật với:
          </Text>
          <BulletList items={partners} />
          <Text style={[styles.p, { marginBottom: 0 }]}>
            Chứng chỉ của HRC được công nhận bởi các đối tác tại Việt Nam, Singapore và Malaysia.
          </Text>
        </Section>

        {/* TÁC ĐỘNG */}
        <Section title="📊 Tác Động">
          <View style={styles.statsGrid}>
            {impacts.map((it) => (
              <View key={it.k} style={styles.statCard}>
                <Text style={styles.statK}>{it.k}</Text>
                <Text style={styles.statV}>{it.v}</Text>
              </View>
            ))}
          </View>
        </Section>

        {/* CAM KẾT */}
        <Section title="🚀 Cam Kết">
          <Text style={styles.p}>
            HRC cam kết đào tạo thế hệ lãnh đạo nhân sự tương lai với phương pháp thực tiễn,
            chuẩn mực đạo đức và tư duy sẵn sàng cho kỷ nguyên số.
          </Text>
          <View style={styles.taglineBox}>
            <Text style={styles.tagline}>
              Xây dựng Con người – Nâng tầm Doanh nghiệp – Kiến tạo Tương lai.
            </Text>
          </View>
        </Section>

        <View style={{ height: 12 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  screen: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 16, paddingBottom: 28 },

  hero: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    ...SHADOW,
    marginBottom: 12,
  },
  heroKicker: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  heroTitle: { fontSize: 26, fontWeight: "900", color: COLORS.text, marginBottom: 6 },
  heroSubtitle: { fontSize: 14, lineHeight: 20, color: COLORS.subtext, marginBottom: 12 },
  heroPills: { flexDirection: "row", flexWrap: "wrap" },

  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 16,
    marginTop: 10,
    ...SHADOW,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 10,
    letterSpacing: 0.2,
  },

  h2: { fontSize: 14, fontWeight: "900", color: COLORS.text, marginTop: 6, marginBottom: 6 },
  p: { fontSize: 14, lineHeight: 21, color: COLORS.subtext, marginBottom: 10 },

  list: { marginTop: 2, marginBottom: 8 },
  listRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  bulletDot: {
    width: 7,
    height: 7,
    borderRadius: 7,
    backgroundColor: COLORS.accent,
    marginTop: 7,
    marginRight: 10,
  },
  li: { flex: 1, fontSize: 14, lineHeight: 21, color: COLORS.subtext },

  chip: {
    backgroundColor: COLORS.accentSoft,
    borderColor: "#D6E2FF",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: { fontSize: 12, fontWeight: "800", color: COLORS.accent },
  chipsGrid: { flexDirection: "row", flexWrap: "wrap" },

  // Timeline (segment line đổi màu + icon)
  timelineWrap: { paddingTop: 2 },
  timelineRow: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingVertical: 8, // dùng padding để line segment “liền” theo từng đoạn
  },
  rail: {
    width: 36,
    alignItems: "center",
  },
  railLine: {
    flex: 1,
    width: 3,
    borderRadius: 3,
    opacity: 0.9,
  },
  dot: {
    width: 26,
    height: 26,
    borderRadius: 26,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  dotIcon: {
    fontSize: 14,
    lineHeight: 16,
  },

  timelineCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    position: "relative",
    overflow: "hidden",
  },
  timelineTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    opacity: 0.95,
  },
  timelineCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingTop: 2,
  },
  yearBadge: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  yearText: { fontSize: 12, fontWeight: "900" },

  timelineTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  timelineTagText: { color: "#FFFFFF", fontSize: 11, fontWeight: "900", letterSpacing: 0.2 },

  timelineText: { fontSize: 14, lineHeight: 21, color: "#111827", fontWeight: "700" },

  // glow 1: dưới phải
  timelineGlow: {
    position: "absolute",
    right: -28,
    bottom: -28,
    width: 130,
    height: 130,
    borderRadius: 130,
    opacity: 0.14,
  },
  // glow 2: trên trái (nhẹ hơn)
  timelineGlow2: {
    position: "absolute",
    left: -40,
    top: -40,
    width: 110,
    height: 110,
    borderRadius: 110,
    opacity: 0.08,
  },

  // Quote (FOUNDERS)
  quoteCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E3EAFF",
    backgroundColor: "#F7F9FF",
    overflow: "hidden",
    marginTop: 10,
  },
  quoteAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: COLORS.accent,
  },
  quoteInner: { paddingVertical: 14, paddingHorizontal: 14, paddingLeft: 16 },
  quoteHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  quoteIcon: {
    fontSize: 28,
    lineHeight: 28,
    fontWeight: "900",
    color: "#B6C8FF",
    marginRight: 8,
    marginTop: -2,
  },
  quoteLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.accent,
    backgroundColor: "#EEF3FF",
    borderWidth: 1,
    borderColor: "#D6E2FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  quoteText: { fontSize: 14, lineHeight: 21, color: COLORS.text, fontStyle: "italic" },
  quoteFooter: { marginTop: 12 },
  quoteDivider: { height: 1, backgroundColor: "#DDE6FF", marginBottom: 8 },
  quoteBy: { fontSize: 12, fontWeight: "800", color: COLORS.subtext, alignSelf: "flex-end" },

  // Stats
  statsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  statCard: {
    width: "48%",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
  },
  statK: { fontSize: 20, fontWeight: "900", color: COLORS.text, marginBottom: 6 },
  statV: { fontSize: 13, lineHeight: 18, color: COLORS.subtext },

  // Tagline
  taglineBox: {
    marginTop: 8,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: COLORS.text,
  },
  tagline: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
    textAlign: "center",
  },
});
