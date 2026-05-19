"use client";

import { cn } from "@/lib/utils";
import { METHOD_META, METHOD_ORDER } from "@/lib/retro/method-meta";
import type { RetroMethod } from "@/types/retro";

interface MethodSelectorProps {
  value: RetroMethod;
  onChange: (value: RetroMethod) => void;
  disabled?: boolean;
}

export function MethodSelector({
  value,
  onChange,
  disabled,
}: MethodSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {METHOD_ORDER.map((method) => {
        const meta = METHOD_META[method];
        const active = value === method;
        return (
          <button
            key={method}
            type="button"
            disabled={disabled}
            onClick={() => onChange(method)}
            className={cn(
              "group flex flex-col items-start gap-1 rounded-2xl border bg-gradient-to-br p-4 text-left transition",
              "hover:border-primary/40",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "disabled:cursor-not-allowed disabled:opacity-50",
              active
                ? "border-primary ring-2 ring-primary/30 " + meta.cardAccentClass
                : "border-border bg-card",
            )}
            aria-pressed={active}
          >
            <span className="text-sm font-semibold">{meta.label}</span>
            <span className="text-xs text-muted-foreground">
              {meta.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
