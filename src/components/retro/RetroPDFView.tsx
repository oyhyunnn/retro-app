"use client";

import { METHOD_META } from "@/lib/retro/method-meta";
import { formatRetroDate, formatRetroDateLong } from "@/lib/utils/date";
import type {
  FiveWhysContent,
  FourLContent,
  KPTContent,
  Retrospective,
  SSCContent,
} from "@/types/retro";

const COLORS = {
  bg: "#FFFFFF",
  fg: "#0A0A0A",
  muted: "#6B7280",
  border: "#E5E7EB",
  accent: "#6366F1",
  cardBg: "#F9FAFB",
};

const FONT_FAMILY =
  "Pretendard, -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', sans-serif";

const baseStyles: Record<string, React.CSSProperties> = {
  container: {
    width: "800px",
    padding: "40px",
    backgroundColor: COLORS.bg,
    color: COLORS.fg,
    fontFamily: FONT_FAMILY,
    fontSize: "14px",
    lineHeight: 1.6,
  },
  header: {
    borderBottom: `2px solid ${COLORS.accent}`,
    paddingBottom: "16px",
    marginBottom: "24px",
  },
  metaRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "10px",
    flexWrap: "wrap",
  },
  badge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 600,
    backgroundColor: `${COLORS.accent}15`,
    color: COLORS.accent,
  },
  badgeMuted: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 500,
    backgroundColor: "#F3F4F6",
    color: COLORS.muted,
  },
  title: {
    fontSize: "26px",
    fontWeight: 700,
    margin: "8px 0 4px",
    color: COLORS.fg,
  },
  retroDate: {
    fontSize: "13px",
    color: COLORS.muted,
    margin: 0,
  },
  section: {
    marginBottom: "24px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: 700,
    marginBottom: "10px",
    color: COLORS.fg,
  },
  overviewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
  },
  overviewBox: {
    backgroundColor: COLORS.cardBg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "10px",
    padding: "10px 12px",
  },
  overviewLabel: {
    fontSize: "11px",
    fontWeight: 600,
    color: COLORS.muted,
    margin: "0 0 4px",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  overviewText: {
    fontSize: "13px",
    color: COLORS.fg,
    margin: 0,
    whiteSpace: "pre-wrap",
  },
  methodColumns: {
    display: "grid",
    gap: "10px",
  },
  columnBox: {
    border: `1px solid ${COLORS.border}`,
    borderRadius: "10px",
    padding: "12px",
    backgroundColor: COLORS.cardBg,
  },
  columnTitle: {
    fontSize: "13px",
    fontWeight: 700,
    margin: "0 0 8px",
    color: COLORS.fg,
  },
  columnItem: {
    fontSize: "13px",
    backgroundColor: COLORS.bg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "6px",
    padding: "6px 10px",
    margin: "0 0 6px",
    color: COLORS.fg,
    whiteSpace: "pre-wrap",
  },
  emptyHint: {
    fontSize: "12px",
    fontStyle: "italic",
    color: COLORS.muted,
    margin: 0,
  },
  whyRow: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
    marginBottom: "6px",
  },
  whyBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "22px",
    height: "22px",
    borderRadius: "11px",
    backgroundColor: "#FEF3C7",
    color: "#92400E",
    fontSize: "11px",
    fontWeight: 700,
    flexShrink: 0,
  },
  whyText: {
    fontSize: "13px",
    color: COLORS.fg,
    margin: 0,
    whiteSpace: "pre-wrap",
    flex: 1,
    backgroundColor: COLORS.bg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "6px",
    padding: "6px 10px",
  },
  stickyGroup: {
    border: `1px solid ${COLORS.border}`,
    borderRadius: "10px",
    padding: "12px",
    marginBottom: "10px",
    backgroundColor: COLORS.cardBg,
  },
  stickyItem: {
    fontSize: "13px",
    margin: "0 0 4px",
    color: COLORS.fg,
  },
  stickyAuthor: {
    color: COLORS.muted,
    fontWeight: 500,
  },
  closingBox: {
    border: `1px solid ${COLORS.border}`,
    borderRadius: "10px",
    padding: "14px",
    backgroundColor: COLORS.cardBg,
    fontSize: "13px",
    whiteSpace: "pre-wrap",
    color: COLORS.fg,
  },
  footer: {
    marginTop: "24px",
    paddingTop: "12px",
    borderTop: `1px solid ${COLORS.border}`,
    fontSize: "11px",
    color: COLORS.muted,
    textAlign: "center",
  },
};

export function RetroPDFView({ retro }: { retro: Retrospective }) {
  const meta = METHOD_META[retro.method];
  const hasOverview = Boolean(
    retro.context || retro.goal || retro.analysis,
  );
  const hasTeamInfo =
    retro.type === "team" &&
    Boolean(
      retro.teamInfo?.teamName ||
        (retro.teamInfo?.participants?.length ?? 0) > 0 ||
        retro.teamInfo?.timeline?.startDate,
    );

  return (
    <div style={baseStyles.container}>
      <header style={baseStyles.header}>
        <div style={baseStyles.metaRow}>
          <span style={baseStyles.badge}>{meta.label}</span>
          <span style={baseStyles.badgeMuted}>
            {retro.type === "team" ? "팀 회고" : "개인 회고"}
          </span>
        </div>
        <h1 style={baseStyles.title}>{retro.title}</h1>
        <p style={baseStyles.retroDate}>
          {formatRetroDateLong(retro.retroDate)}
        </p>
      </header>

      {(hasOverview || hasTeamInfo) && (
        <section style={baseStyles.section}>
          <h2 style={baseStyles.sectionTitle}>프로젝트 개요</h2>

          {hasTeamInfo && (
            <div style={{ marginBottom: "12px" }}>
              {retro.teamInfo?.teamName && (
                <p style={{ margin: "0 0 4px", fontSize: "13px" }}>
                  <span style={{ color: COLORS.muted }}>팀: </span>
                  <strong>{retro.teamInfo.teamName}</strong>
                </p>
              )}
              {retro.teamInfo?.timeline?.startDate &&
                retro.teamInfo?.timeline?.endDate && (
                  <p style={{ margin: "0 0 4px", fontSize: "13px" }}>
                    <span style={{ color: COLORS.muted }}>기간: </span>
                    {formatRetroDate(retro.teamInfo.timeline.startDate)} ~{" "}
                    {formatRetroDate(retro.teamInfo.timeline.endDate)}
                  </p>
                )}
              {(retro.teamInfo?.participants?.length ?? 0) > 0 && (
                <p style={{ margin: "0 0 4px", fontSize: "13px" }}>
                  <span style={{ color: COLORS.muted }}>참여자: </span>
                  {retro.teamInfo!.participants.join(", ")}
                </p>
              )}
              {(retro.teamInfo?.timeline?.milestones?.length ?? 0) > 0 && (
                <div style={{ marginTop: "6px" }}>
                  <p style={{ ...baseStyles.overviewLabel, marginBottom: "4px" }}>
                    마일스톤
                  </p>
                  <ul style={{ paddingLeft: "18px", margin: 0 }}>
                    {retro.teamInfo!.timeline.milestones.map((m) => (
                      <li
                        key={m.id}
                        style={{ fontSize: "13px", marginBottom: "2px" }}
                      >
                        <strong>{m.name}</strong>{" "}
                        <span style={{ color: COLORS.muted }}>
                          ({formatRetroDate(m.date)})
                        </span>
                        {m.description && (
                          <>
                            {" — "}
                            {m.description}
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {hasOverview && (
            <div style={baseStyles.overviewGrid}>
              {retro.context && (
                <div style={baseStyles.overviewBox}>
                  <p style={baseStyles.overviewLabel}>배경</p>
                  <p style={baseStyles.overviewText}>{retro.context}</p>
                </div>
              )}
              {retro.goal && (
                <div style={baseStyles.overviewBox}>
                  <p style={baseStyles.overviewLabel}>목표</p>
                  <p style={baseStyles.overviewText}>{retro.goal}</p>
                </div>
              )}
              {retro.analysis && (
                <div style={baseStyles.overviewBox}>
                  <p style={baseStyles.overviewLabel}>분석</p>
                  <p style={baseStyles.overviewText}>{retro.analysis}</p>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      <section style={baseStyles.section}>
        <h2 style={baseStyles.sectionTitle}>회고 본문</h2>
        <ContentBlock retro={retro} />
      </section>

      {retro.type === "team" &&
        (retro.stickyNotes?.length ?? 0) > 0 && (
          <section style={baseStyles.section}>
            <h2 style={baseStyles.sectionTitle}>팀 포스트잇</h2>
            <StickyTextList retro={retro} />
          </section>
        )}

      {retro.closing?.trim() && (
        <section style={baseStyles.section}>
          <h2 style={baseStyles.sectionTitle}>마무리 메모</h2>
          <div style={baseStyles.closingBox}>{retro.closing}</div>
        </section>
      )}

      <footer style={baseStyles.footer}>
        회고 앱 · {formatRetroDateLong(new Date().toISOString())} 내보내기
      </footer>
    </div>
  );
}

function ContentBlock({ retro }: { retro: Retrospective }) {
  if (retro.method === "KPT") {
    const c = retro.content as KPTContent;
    return (
      <Columns
        columns={[
          { title: "Keep (잘하고 있는 것)", items: c.keep },
          { title: "Problem (문제점)", items: c.problem },
          { title: "Try (시도해볼 것)", items: c.try },
        ]}
        gridCols={3}
      />
    );
  }
  if (retro.method === "4L") {
    const c = retro.content as FourLContent;
    return (
      <Columns
        columns={[
          { title: "Liked (좋았던 것)", items: c.liked },
          { title: "Learned (배운 것)", items: c.learned },
          { title: "Lacked (부족했던 것)", items: c.lacked },
          { title: "Longed for (바랐던 것)", items: c.longedFor },
        ]}
        gridCols={2}
      />
    );
  }
  if (retro.method === "StartStopContinue") {
    const c = retro.content as SSCContent;
    return (
      <Columns
        columns={[
          { title: "Start (시작할 것)", items: c.start },
          { title: "Stop (중단할 것)", items: c.stop },
          { title: "Continue (계속할 것)", items: c.continueItems },
        ]}
        gridCols={3}
      />
    );
  }
  const c = retro.content as FiveWhysContent;
  const whys = c.whys.filter((w) => w?.trim());
  return (
    <div>
      {c.problem && (
        <div style={{ ...baseStyles.columnBox, marginBottom: "10px" }}>
          <p style={baseStyles.columnTitle}>문제 정의</p>
          <p
            style={{
              fontSize: "13px",
              margin: 0,
              whiteSpace: "pre-wrap",
            }}
          >
            {c.problem}
          </p>
        </div>
      )}
      {whys.map((why, idx) => (
        <div key={idx} style={baseStyles.whyRow}>
          <span style={baseStyles.whyBadge}>{idx + 1}</span>
          <p style={baseStyles.whyText}>{why}</p>
        </div>
      ))}
      {(c.rootCause?.trim() || c.solution?.trim()) && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            marginTop: "10px",
          }}
        >
          {c.rootCause?.trim() && (
            <div style={baseStyles.columnBox}>
              <p style={baseStyles.columnTitle}>근본 원인</p>
              <p
                style={{
                  fontSize: "13px",
                  margin: 0,
                  whiteSpace: "pre-wrap",
                }}
              >
                {c.rootCause}
              </p>
            </div>
          )}
          {c.solution?.trim() && (
            <div style={baseStyles.columnBox}>
              <p style={baseStyles.columnTitle}>해결 방안</p>
              <p
                style={{
                  fontSize: "13px",
                  margin: 0,
                  whiteSpace: "pre-wrap",
                }}
              >
                {c.solution}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Columns({
  columns,
  gridCols,
}: {
  columns: Array<{ title: string; items: string[] }>;
  gridCols: number;
}) {
  return (
    <div
      style={{
        ...baseStyles.methodColumns,
        gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
      }}
    >
      {columns.map((col) => {
        const items = col.items.filter((t) => t.trim());
        return (
          <div key={col.title} style={baseStyles.columnBox}>
            <p style={baseStyles.columnTitle}>{col.title}</p>
            {items.length === 0 ? (
              <p style={baseStyles.emptyHint}>작성된 항목 없음</p>
            ) : (
              <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
                {items.map((item, idx) => (
                  <li key={idx} style={baseStyles.columnItem}>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StickyTextList({ retro }: { retro: Retrospective }) {
  const notes = retro.stickyNotes ?? [];
  const grouped = notes.reduce<Record<string, typeof notes>>((acc, note) => {
    (acc[note.category] ??= []).push(note);
    return acc;
  }, {});

  const CATEGORY_LABELS: Record<string, string> = {
    keep: "Keep",
    problem: "Problem",
    try: "Try",
    liked: "Liked",
    learned: "Learned",
    lacked: "Lacked",
    longedFor: "Longed for",
    start: "Start",
    stop: "Stop",
    continueItems: "Continue",
    general: "포스트잇",
  };

  return (
    <div>
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} style={baseStyles.stickyGroup}>
          <p style={baseStyles.columnTitle}>
            {CATEGORY_LABELS[category] ?? category} ({items.length})
          </p>
          <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
            {items.map((n) => (
              <li key={n.id} style={baseStyles.stickyItem}>
                • {n.content}{" "}
                {n.author && (
                  <span style={baseStyles.stickyAuthor}>— {n.author}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
