"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Check,
  CircleAlert,
  Loader2,
  Save,
} from "lucide-react";
import { toast } from "sonner";

import { RetroFormFields } from "@/components/retro/RetroFormFields";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { UpdateRetroInput } from "@/lib/repositories";
import {
  EMPTY_TEAM_INFO,
  retroFormSchema,
  type RetroFormValues,
} from "@/lib/retro/form-schema";
import type { AutoSaveStatus } from "@/lib/retro/use-auto-save";
import { cn } from "@/lib/utils";
import { useRetroStore } from "@/stores/retroStore";
import type { Retrospective } from "@/types/retro";

function retroToFormValues(retro: Retrospective): RetroFormValues {
  return {
    title: retro.title,
    type: retro.type,
    method: retro.method,
    retroDate: retro.retroDate.length > 10
      ? retro.retroDate.slice(0, 10)
      : retro.retroDate,
    context: retro.context ?? "",
    goal: retro.goal ?? "",
    analysis: retro.analysis ?? "",
    teamInfo: retro.teamInfo
      ? {
          teamName: retro.teamInfo.teamName ?? "",
          participants: retro.teamInfo.participants ?? [],
          timeline: {
            startDate: retro.teamInfo.timeline?.startDate ?? "",
            endDate: retro.teamInfo.timeline?.endDate ?? "",
            milestones: retro.teamInfo.timeline?.milestones ?? [],
          },
        }
      : EMPTY_TEAM_INFO,
  };
}

function toUpdateInput(values: RetroFormValues): UpdateRetroInput {
  return {
    title: values.title.trim(),
    type: values.type,
    method: values.method,
    retroDate: values.retroDate,
    context: values.context?.trim() || undefined,
    goal: values.goal?.trim() || undefined,
    analysis: values.analysis?.trim() || undefined,
    teamInfo:
      values.type === "team"
        ? {
            teamName: values.teamInfo?.teamName?.trim() || undefined,
            participants: values.teamInfo?.participants ?? [],
            timeline: {
              startDate: values.teamInfo?.timeline?.startDate ?? "",
              endDate: values.teamInfo?.timeline?.endDate ?? "",
              milestones: values.teamInfo?.timeline?.milestones ?? [],
            },
          }
        : undefined,
  };
}

export default function EditRetroPage({
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
  const update = useRetroStore((s) => s.update);

  useEffect(() => {
    if (!loaded && !loading) void load();
  }, [load, loaded, loading]);

  const retro = useMemo(
    () => items.find((r) => r.id === id),
    [items, id],
  );

  const form = useForm<RetroFormValues>({
    resolver: zodResolver(retroFormSchema),
    mode: "onTouched",
    defaultValues: {
      title: "",
      type: "personal",
      method: "KPT",
      retroDate: "",
      context: "",
      goal: "",
      analysis: "",
      teamInfo: EMPTY_TEAM_INFO,
    },
  });

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (retro && !hydrated) {
      form.reset(retroToFormValues(retro));
      setHydrated(true);
    }
  }, [retro, form, hydrated]);

  const watched = useWatch({ control: form.control });
  const [status, setStatus] = useState<AutoSaveStatus>("idle");
  const lastSerializedRef = useRef("");
  const inFlightRef = useRef(false);

  const persist = useCallback(async () => {
    if (!hydrated || !retro) return;
    const values = form.getValues();
    if (!values.title?.trim()) return;

    const serialized = JSON.stringify(values);
    if (serialized === lastSerializedRef.current) return;
    if (inFlightRef.current) return;

    inFlightRef.current = true;
    setStatus("saving");
    try {
      await update(retro.id, toUpdateInput(values));
      lastSerializedRef.current = serialized;
      setStatus("saved");
    } catch (err) {
      console.error(err);
      setStatus("error");
    } finally {
      inFlightRef.current = false;
    }
  }, [hydrated, retro, form, update]);

  useEffect(() => {
    const timer = setTimeout(() => void persist(), 500);
    return () => clearTimeout(timer);
  }, [watched, persist]);

  const handleDone = form.handleSubmit(
    async () => {
      await persist();
      if (retro) {
        router.push(`/retro/${retro.id}`);
      }
    },
    () => {
      toast.warning("입력값을 확인해 주세요.");
    },
  );

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
            <Button size="sm" render={<Link href="/list" />}>
              목록으로
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
      <header className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit gap-1 px-0"
          render={<Link href={`/retro/${id}`} />}
        >
          <ArrowLeft className="h-4 w-4" />
          취소
        </Button>
        <SaveStatusBadge status={status} />
      </header>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold sm:text-3xl">회고 수정</h1>
        <p className="text-sm text-muted-foreground">
          변경 사항은 자동으로 저장됩니다.
        </p>
      </div>

      <FormProvider {...form}>
        <form
          onSubmit={handleDone}
          className="flex flex-col gap-6"
          noValidate
        >
          <RetroFormFields />

          <div className="sticky bottom-4 z-10 mt-2 flex flex-col gap-2 rounded-2xl border bg-background/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:justify-end">
            <Button
              type="submit"
              className="gap-1.5"
              disabled={status === "saving"}
            >
              <Save className="h-4 w-4" />
              저장 후 상세 보기
            </Button>
          </div>
        </form>
      </FormProvider>
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
