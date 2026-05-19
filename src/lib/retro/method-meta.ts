import type { RetroMethod } from "@/types/retro";

interface MethodMeta {
  label: string;
  short: string;
  description: string;
  badgeClass: string;
  cardAccentClass: string;
}

export const METHOD_META: Record<RetroMethod, MethodMeta> = {
  KPT: {
    label: "KPT",
    short: "KPT",
    description: "Keep · Problem · Try",
    badgeClass:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    cardAccentClass:
      "from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20",
  },
  "4L": {
    label: "4L",
    short: "4L",
    description: "Liked · Learned · Lacked · Longed for",
    badgeClass:
      "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
    cardAccentClass:
      "from-violet-500/10 via-violet-500/5 to-transparent border-violet-500/20",
  },
  "5Whys": {
    label: "5 Whys",
    short: "5Whys",
    description: "5번의 Why로 근본 원인 찾기",
    badgeClass:
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    cardAccentClass:
      "from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20",
  },
  StartStopContinue: {
    label: "Start · Stop · Continue",
    short: "SSC",
    description: "시작 · 중단 · 계속",
    badgeClass:
      "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    cardAccentClass:
      "from-sky-500/10 via-sky-500/5 to-transparent border-sky-500/20",
  },
};

export const METHOD_ORDER: RetroMethod[] = [
  "KPT",
  "4L",
  "5Whys",
  "StartStopContinue",
];
