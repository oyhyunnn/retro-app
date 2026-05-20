"use client";

import { cn } from "@/lib/utils";
import type {
  FiveWhysContent,
  FourLContent,
  KPTContent,
  RetroContent,
  RetroMethod,
  SSCContent,
} from "@/types/retro";

interface Props {
  method: RetroMethod;
  content: RetroContent;
}

interface ColumnDef {
  title: string;
  description?: string;
  items: string[];
  accent: string;
}

export function ContentView({ method, content }: Props) {
  if (method === "KPT") {
    const c = content as KPTContent;
    return (
      <ColumnsView
        columns={[
          {
            title: "Keep",
            description: "잘하고 있는 것",
            items: c.keep,
            accent: "from-emerald-500/10 border-emerald-500/20",
          },
          {
            title: "Problem",
            description: "문제점",
            items: c.problem,
            accent: "from-rose-500/10 border-rose-500/20",
          },
          {
            title: "Try",
            description: "시도해볼 것",
            items: c.try,
            accent: "from-sky-500/10 border-sky-500/20",
          },
        ]}
      />
    );
  }

  if (method === "4L") {
    const c = content as FourLContent;
    return (
      <ColumnsView
        columns={[
          {
            title: "Liked",
            description: "좋았던 것",
            items: c.liked,
            accent: "from-violet-500/10 border-violet-500/20",
          },
          {
            title: "Learned",
            description: "배운 것",
            items: c.learned,
            accent: "from-sky-500/10 border-sky-500/20",
          },
          {
            title: "Lacked",
            description: "부족했던 것",
            items: c.lacked,
            accent: "from-orange-500/10 border-orange-500/20",
          },
          {
            title: "Longed for",
            description: "바랐던 것",
            items: c.longedFor,
            accent: "from-pink-500/10 border-pink-500/20",
          },
        ]}
      />
    );
  }

  if (method === "StartStopContinue") {
    const c = content as SSCContent;
    return (
      <ColumnsView
        columns={[
          {
            title: "Start",
            description: "시작할 것",
            items: c.start,
            accent: "from-emerald-500/10 border-emerald-500/20",
          },
          {
            title: "Stop",
            description: "중단할 것",
            items: c.stop,
            accent: "from-rose-500/10 border-rose-500/20",
          },
          {
            title: "Continue",
            description: "계속할 것",
            items: c.continueItems,
            accent: "from-amber-500/10 border-amber-500/20",
          },
        ]}
      />
    );
  }

  return <FiveWhysView content={content as FiveWhysContent} />;
}

function ColumnsView({ columns }: { columns: ColumnDef[] }) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3",
        columns.length === 3 && "md:grid-cols-3",
        columns.length === 4 && "sm:grid-cols-2",
      )}
    >
      {columns.map((col) => (
        <section
          key={col.title}
          className={cn(
            "rounded-2xl border bg-gradient-to-br to-transparent p-4",
            col.accent,
          )}
        >
          <header className="mb-3">
            <h3 className="text-sm font-semibold">{col.title}</h3>
            {col.description && (
              <p className="text-xs text-muted-foreground">{col.description}</p>
            )}
          </header>
          {col.items.filter((t) => t.trim()).length === 0 ? (
            <p className="text-xs italic text-muted-foreground">
              작성된 항목 없음
            </p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {col.items
                .filter((t) => t.trim())
                .map((item, idx) => (
                  <li
                    key={idx}
                    className="rounded-lg bg-background/80 px-3 py-2 text-sm whitespace-pre-wrap"
                  >
                    {item}
                  </li>
                ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}

function FiveWhysView({ content }: { content: FiveWhysContent }) {
  const whys = content.whys.filter((w) => w?.trim());

  return (
    <section className="flex flex-col gap-4 rounded-2xl border bg-gradient-to-br from-amber-500/10 to-transparent p-4">
      <header>
        <h3 className="text-sm font-semibold">5 Whys</h3>
      </header>

      {content.problem ? (
        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            문제 정의
          </p>
          <p className="whitespace-pre-wrap rounded-lg bg-background/80 px-3 py-2 text-sm">
            {content.problem}
          </p>
        </div>
      ) : (
        <p className="text-xs italic text-muted-foreground">
          문제 정의가 입력되지 않았어요.
        </p>
      )}

      {whys.length > 0 && (
        <ol className="flex flex-col gap-2">
          {whys.map((why, idx) => (
            <li key={idx} className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-xs font-semibold text-amber-700 dark:text-amber-300">
                {idx + 1}
              </div>
              <p className="flex-1 whitespace-pre-wrap rounded-lg bg-background/80 px-3 py-2 text-sm">
                {why}
              </p>
            </li>
          ))}
        </ol>
      )}

      {(content.rootCause?.trim() || content.solution?.trim()) && (
        <div className="grid gap-3 border-t pt-3 sm:grid-cols-2">
          {content.rootCause?.trim() && (
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                근본 원인
              </p>
              <p className="whitespace-pre-wrap rounded-lg bg-background/80 px-3 py-2 text-sm">
                {content.rootCause}
              </p>
            </div>
          )}
          {content.solution?.trim() && (
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                해결 방안
              </p>
              <p className="whitespace-pre-wrap rounded-lg bg-background/80 px-3 py-2 text-sm">
                {content.solution}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
