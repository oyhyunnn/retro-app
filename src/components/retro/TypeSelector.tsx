"use client";

import { Users, User } from "lucide-react";

import { cn } from "@/lib/utils";
import type { RetroType } from "@/types/retro";

interface TypeSelectorProps {
  value: RetroType;
  onChange: (value: RetroType) => void;
  disabled?: boolean;
}

const OPTIONS: Array<{
  value: RetroType;
  label: string;
  description: string;
  Icon: typeof User;
}> = [
  {
    value: "personal",
    label: "개인 회고",
    description: "혼자 차분하게 돌아보기",
    Icon: User,
  },
  {
    value: "team",
    label: "팀 회고",
    description: "팀원과 함께 화이트보드로",
    Icon: Users,
  },
];

export function TypeSelector({ value, onChange, disabled }: TypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition",
              "hover:border-primary/40",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "disabled:cursor-not-allowed disabled:opacity-50",
              active
                ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                : "border-border bg-card",
            )}
            aria-pressed={active}
          >
            <opt.Icon
              className={cn(
                "h-5 w-5",
                active ? "text-primary" : "text-muted-foreground",
              )}
            />
            <div>
              <p className="text-sm font-semibold">{opt.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {opt.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
