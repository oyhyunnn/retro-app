"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
  FiveWhysContent,
  FourLContent,
  KPTContent,
  RetroContent,
  RetroMethod,
  SSCContent,
} from "@/types/retro";

import { ListInput } from "./ListInput";

interface Props {
  method: RetroMethod;
  content: RetroContent;
  onChange: (content: RetroContent) => void;
}

const KPT_COLORS = {
  keep: "border-emerald-500/30 from-emerald-500/10 to-transparent",
  problem: "border-rose-500/30 from-rose-500/10 to-transparent",
  try: "border-sky-500/30 from-sky-500/10 to-transparent",
};

const FOUR_L_COLORS = {
  liked: "border-violet-500/30 from-violet-500/10 to-transparent",
  learned: "border-sky-500/30 from-sky-500/10 to-transparent",
  lacked: "border-orange-500/30 from-orange-500/10 to-transparent",
  longedFor: "border-pink-500/30 from-pink-500/10 to-transparent",
};

const SSC_COLORS = {
  start: "border-emerald-500/30 from-emerald-500/10 to-transparent",
  stop: "border-rose-500/30 from-rose-500/10 to-transparent",
  continueItems: "border-amber-500/30 from-amber-500/10 to-transparent",
};

export function MethodSection({ method, content, onChange }: Props) {
  if (method === "KPT") {
    const kpt = content as KPTContent;
    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <ListInput
          title="Keep"
          description="잘하고 있는 것"
          accentClass={KPT_COLORS.keep}
          items={kpt.keep}
          onChange={(items) => onChange({ ...kpt, keep: items })}
          placeholder="유지하고 싶은 점"
        />
        <ListInput
          title="Problem"
          description="문제점"
          accentClass={KPT_COLORS.problem}
          items={kpt.problem}
          onChange={(items) => onChange({ ...kpt, problem: items })}
          placeholder="개선이 필요한 점"
        />
        <ListInput
          title="Try"
          description="시도해볼 것"
          accentClass={KPT_COLORS.try}
          items={kpt.try}
          onChange={(items) => onChange({ ...kpt, try: items })}
          placeholder="다음에 시도할 것"
        />
      </div>
    );
  }

  if (method === "4L") {
    const fl = content as FourLContent;
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ListInput
          title="Liked"
          description="좋았던 것"
          accentClass={FOUR_L_COLORS.liked}
          items={fl.liked}
          onChange={(items) => onChange({ ...fl, liked: items })}
        />
        <ListInput
          title="Learned"
          description="배운 것"
          accentClass={FOUR_L_COLORS.learned}
          items={fl.learned}
          onChange={(items) => onChange({ ...fl, learned: items })}
        />
        <ListInput
          title="Lacked"
          description="부족했던 것"
          accentClass={FOUR_L_COLORS.lacked}
          items={fl.lacked}
          onChange={(items) => onChange({ ...fl, lacked: items })}
        />
        <ListInput
          title="Longed for"
          description="바랐던 것"
          accentClass={FOUR_L_COLORS.longedFor}
          items={fl.longedFor}
          onChange={(items) => onChange({ ...fl, longedFor: items })}
        />
      </div>
    );
  }

  if (method === "StartStopContinue") {
    const ssc = content as SSCContent;
    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <ListInput
          title="Start"
          description="시작할 것"
          accentClass={SSC_COLORS.start}
          items={ssc.start}
          onChange={(items) => onChange({ ...ssc, start: items })}
        />
        <ListInput
          title="Stop"
          description="중단할 것"
          accentClass={SSC_COLORS.stop}
          items={ssc.stop}
          onChange={(items) => onChange({ ...ssc, stop: items })}
        />
        <ListInput
          title="Continue"
          description="계속할 것"
          accentClass={SSC_COLORS.continueItems}
          items={ssc.continueItems}
          onChange={(items) => onChange({ ...ssc, continueItems: items })}
        />
      </div>
    );
  }

  const fw = content as FiveWhysContent;
  const setWhy = (idx: number, value: string) => {
    const next = [...fw.whys];
    while (next.length <= idx) next.push("");
    next[idx] = value;
    onChange({ ...fw, whys: next });
  };

  return (
    <section className="flex flex-col gap-4 rounded-2xl border bg-gradient-to-br from-amber-500/10 to-transparent p-4">
      <header>
        <h3 className="text-sm font-semibold">5 Whys</h3>
        <p className="text-xs text-muted-foreground">
          문제를 정의하고 “왜?”를 5번 반복하며 근본 원인을 찾아보세요.
        </p>
      </header>

      <div className="grid gap-1.5">
        <Label htmlFor="fw-problem">문제 정의</Label>
        <Textarea
          id="fw-problem"
          rows={3}
          value={fw.problem}
          onChange={(e) => onChange({ ...fw, problem: e.target.value })}
          placeholder="해결하고 싶은 문제를 한 문장으로 정의해 주세요."
          className="bg-background"
        />
      </div>

      <ul className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, idx) => (
          <li key={idx} className="grid gap-1.5">
            <Label className="text-xs">왜? #{idx + 1}</Label>
            <Textarea
              rows={2}
              value={fw.whys[idx] ?? ""}
              onChange={(e) => setWhy(idx, e.target.value)}
              placeholder={
                idx === 0
                  ? "위 문제는 왜 발생했나요?"
                  : "그것은 또 왜 그런가요?"
              }
              className="bg-background"
            />
          </li>
        ))}
      </ul>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label className="text-xs">근본 원인 (선택)</Label>
          <Textarea
            rows={2}
            value={fw.rootCause ?? ""}
            onChange={(e) => onChange({ ...fw, rootCause: e.target.value })}
            className="bg-background"
          />
        </div>
        <div className="grid gap-1.5">
          <Label className="text-xs">해결 방안 (선택)</Label>
          <Textarea
            rows={2}
            value={fw.solution ?? ""}
            onChange={(e) => onChange({ ...fw, solution: e.target.value })}
            className="bg-background"
          />
        </div>
      </div>
    </section>
  );
}
