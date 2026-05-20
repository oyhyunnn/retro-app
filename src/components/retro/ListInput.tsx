"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  description?: string;
  accentClass: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}

export function ListInput({
  title,
  description,
  accentClass,
  items,
  onChange,
  placeholder,
}: Props) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const value = draft.trim();
    if (!value) return;
    onChange([...items, value]);
    setDraft("");
  };

  const update = (idx: number, value: string) => {
    onChange(items.map((it, i) => (i === idx ? value : it)));
  };

  const remove = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  return (
    <section
      className={cn(
        "flex flex-col gap-3 rounded-2xl border bg-gradient-to-br p-4",
        accentClass,
      )}
    >
      <header>
        <h3 className="text-sm font-semibold">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </header>

      {items.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-1.5">
              <Input
                value={item}
                onChange={(e) => update(idx, e.target.value)}
                className="flex-1 bg-background"
              />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => remove(idx)}
                aria-label="항목 삭제"
                type="button"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-1.5">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder ?? "항목을 입력하고 Enter"}
          className="flex-1 bg-background"
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={add}
          disabled={!draft.trim()}
          className="gap-1"
        >
          <Plus className="h-3.5 w-3.5" />
          추가
        </Button>
      </div>
    </section>
  );
}
