"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, CircleAlert, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProjectOverviewPanel } from "@/components/retro/ProjectOverviewPanel";
import { SessionTimer } from "@/components/retro/SessionTimer";
import { MethodSection } from "@/components/retro/MethodSection";
import { StickyBoard } from "@/components/retro/StickyBoard";
import { cn } from "@/lib/utils";
import { useSessionAutoSave } from "@/lib/retro/use-session-auto-save";
import type { AutoSaveStatus } from "@/lib/retro/use-auto-save";
import { useRetroStore } from "@/stores/retroStore";
import { createEmptyContent, type RetroContent, type StickyNote } from "@/types/retro";

export default function RetroSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const items = useRetroStore((s) => s.items);
  const loaded = useRetroStore((s) => s.loaded);
  const loading = useRetroStore((s) => s.loading);
  const load = useRetroStore((s) => s.load);

  useEffect(() => {
    if (!loaded && !loading) {
      void load();
    }
  }, [load, loaded, loading]);

  const retro = useMemo(
    () => items.find((r) => r.id === id),
    [items, id],
  );

  const [content, setContent] = useState<RetroContent | null>(null);
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([]);

  useEffect(() => {
    if (!retro) return;
    setContent(retro.content ?? createEmptyContent(retro.method));
    setStickyNotes(retro.stickyNotes ?? []);
  }, [retro]);

  const { status, flush } = useSessionAutoSave({
    retroId: id,
    content,
    stickyNotes: retro?.type === "team" ? stickyNotes : undefined,
    enabled: Boolean(retro),
  });

  const handleSaveAndExit = async () => {
    await flush();
    toast.success("회고를 저장했어요.");
    router.push("/");
  };

  const handleGoToDetail = async () => {
    await flush();
    router.push(`/retro/${id}`);
  };

  if (!loaded) {
    return (
      <main className="container mx-auto flex w-full max-w-3xl flex-1 items-center justify-center px-4 py-10">
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      </main>
    );
  }

  if (!retro) {
    return (
      <main className="container mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-10">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm font-medium">회고를 찾을 수 없어요</p>
            <p className="text-xs text-muted-foreground">
              삭제되었거나 잘못된 주소일 수 있습니다.
            </p>
            <Button size="sm" render={<Link href="/" />}>
              홈으로
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
      <header className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit gap-1 px-0"
          render={<Link href="/" />}
        >
          <ArrowLeft className="h-4 w-4" />
          홈으로
        </Button>
        <SaveStatusBadge status={status} />
      </header>

      <ProjectOverviewPanel retro={retro} />

      <SessionTimer
        defaultMinutes={retro.timerDurationMinutes ?? 10}
      />

      {retro.type === "personal" && content ? (
        <MethodSection
          method={retro.method}
          content={content}
          onChange={setContent}
        />
      ) : retro.type === "team" ? (
        <StickyBoard
          method={retro.method}
          notes={stickyNotes}
          participants={retro.teamInfo?.participants ?? []}
          onChange={setStickyNotes}
        />
      ) : null}

      <div className="sticky bottom-4 z-10 mt-2 flex flex-col gap-2 rounded-2xl border bg-background/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={handleSaveAndExit}
          disabled={status === "saving"}
        >
          저장 후 종료
        </Button>
        <Button
          type="button"
          onClick={handleGoToDetail}
          disabled={status === "saving"}
        >
          회고 보기로 이동
        </Button>
      </div>
    </main>
  );
}

function SaveStatusBadge({ status }: { status: AutoSaveStatus }) {
  if (status === "idle") return null;

  const config: Record<
    Exclude<AutoSaveStatus, "idle">,
    { icon: React.ReactNode; label: string; className: string }
  > = {
    saving: {
      icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
      label: "저장 중...",
      className: "text-muted-foreground",
    },
    saved: {
      icon: <Check className="h-3.5 w-3.5" />,
      label: "자동 저장됨",
      className: "text-emerald-600 dark:text-emerald-400",
    },
    error: {
      icon: <CircleAlert className="h-3.5 w-3.5" />,
      label: "저장 실패",
      className: "text-destructive",
    },
  };

  const { icon, label, className } = config[status];
  return (
    <span className={cn("flex items-center gap-1.5 text-xs", className)}>
      {icon}
      {label}
    </span>
  );
}
