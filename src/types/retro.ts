export type RetroType = "personal" | "team";

export type RetroMethod = "KPT" | "4L" | "5Whys" | "StartStopContinue";

export type StickyColor = "yellow" | "pink" | "blue" | "green" | "purple";

export type ThemeMode = "light" | "dark" | "system";

export interface Milestone {
  id: string;
  name: string;
  date: string;
  description?: string;
}

export interface TeamTimeline {
  startDate: string;
  endDate: string;
  milestones: Milestone[];
}

export interface TeamInfo {
  teamName?: string;
  participants: string[];
  timeline: TeamTimeline;
}

export interface KPTContent {
  keep: string[];
  problem: string[];
  try: string[];
}

export interface FourLContent {
  liked: string[];
  learned: string[];
  lacked: string[];
  longedFor: string[];
}

export interface FiveWhysContent {
  problem: string;
  whys: string[];
  rootCause?: string;
  solution?: string;
}

export interface SSCContent {
  start: string[];
  stop: string[];
  continueItems: string[];
}

export type RetroContent =
  | KPTContent
  | FourLContent
  | FiveWhysContent
  | SSCContent;

export interface StickyNote {
  id: string;
  category: string;
  author: string;
  content: string;
  color: StickyColor;
  position: { x: number; y: number };
  createdAt: string;
}

export interface Retrospective {
  id: string;
  title: string;
  type: RetroType;
  method: RetroMethod;
  retroDate: string;

  context?: string;
  goal?: string;
  analysis?: string;
  closing?: string;

  teamInfo?: TeamInfo;

  content: RetroContent;

  stickyNotes?: StickyNote[];

  timerDurationMinutes?: number;

  /**
   * 자동 저장된 작성 중 상태. 사용자가 "임시 저장" 또는 "회고하기 시작" 액션을
   * 누르기 전까지 true. 홈/목록/통계에서 노출하지 않는다.
   */
  isDraft?: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  theme: ThemeMode;
  defaultTimerMinutes: number;
  lastBackupAt?: string;
}

export const RETRO_METHODS: Record<RetroMethod, { label: string; description: string }> = {
  KPT: {
    label: "KPT",
    description: "Keep / Problem / Try",
  },
  "4L": {
    label: "4L",
    description: "Liked / Learned / Lacked / Longed for",
  },
  "5Whys": {
    label: "5 Whys",
    description: "문제의 근본 원인 분석",
  },
  StartStopContinue: {
    label: "Start / Stop / Continue",
    description: "시작 / 중단 / 계속",
  },
};

export function createEmptyContent(method: RetroMethod): RetroContent {
  switch (method) {
    case "KPT":
      return { keep: [], problem: [], try: [] } satisfies KPTContent;
    case "4L":
      return {
        liked: [],
        learned: [],
        lacked: [],
        longedFor: [],
      } satisfies FourLContent;
    case "5Whys":
      return { problem: "", whys: [] } satisfies FiveWhysContent;
    case "StartStopContinue":
      return { start: [], stop: [], continueItems: [] } satisfies SSCContent;
  }
}
