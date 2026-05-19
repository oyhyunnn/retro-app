"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Check,
  CircleAlert,
  Loader2,
  Play,
  Save,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ContextAccordion } from "@/components/retro/ContextAccordion";
import { MethodSelector } from "@/components/retro/MethodSelector";
import { TeamInfoSection } from "@/components/retro/TeamInfoSection";
import { TypeSelector } from "@/components/retro/TypeSelector";
import {
  EMPTY_TEAM_INFO,
  retroFormSchema,
  type RetroFormValues,
} from "@/lib/retro/form-schema";
import {
  useAutoSaveRetro,
  type AutoSaveStatus,
} from "@/lib/retro/use-auto-save";
import { todayISODate } from "@/lib/utils/date";
import { cn } from "@/lib/utils";

export default function NewRetroPage() {
  const router = useRouter();

  const form = useForm<RetroFormValues>({
    resolver: zodResolver(retroFormSchema),
    mode: "onTouched",
    defaultValues: {
      title: "",
      type: "personal",
      method: "KPT",
      retroDate: todayISODate(),
      context: "",
      goal: "",
      analysis: "",
      teamInfo: EMPTY_TEAM_INFO,
    },
  });

  const { register, watch, setValue, handleSubmit, formState } = form;
  const type = watch("type");
  const method = watch("method");
  const title = watch("title");

  const { status, flush } = useAutoSaveRetro(form);

  const handleTemporarySave = async () => {
    if (!title.trim()) {
      toast.warning("제목을 입력하면 자동으로 저장돼요.");
      return;
    }
    const id = await flush();
    if (id) {
      toast.success("회고를 임시 저장했어요.");
      router.push("/");
    } else {
      toast.error("저장에 실패했어요. 다시 시도해 주세요.");
    }
  };

  const handleStartSession = handleSubmit(
    async () => {
      const id = await flush();
      if (id) {
        router.push(`/retro/${id}/session`);
      } else {
        toast.error("저장에 실패했어요. 다시 시도해 주세요.");
      }
    },
    () => {
      toast.warning("입력값을 확인해 주세요.");
    },
  );

  return (
    <main className="container mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
      <header className="flex items-center justify-between">
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

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold sm:text-3xl">새 회고 시작</h1>
        <p className="text-sm text-muted-foreground">
          제목을 입력하는 순간부터 자동 저장돼요. 천천히 적어보세요.
        </p>
      </div>

      <FormProvider {...form}>
        <form
          onSubmit={handleStartSession}
          className="flex flex-col gap-6"
          noValidate
        >
          <div className="grid gap-2">
            <Label htmlFor="title">회고 제목</Label>
            <Input
              id="title"
              placeholder="예: 결제 모듈 v2 출시 회고"
              maxLength={100}
              autoComplete="off"
              {...register("title")}
            />
            <div className="flex justify-between text-xs">
              <span className="text-destructive">
                {formState.errors.title?.message}
              </span>
              <span className="text-muted-foreground">
                {title.length}/100
              </span>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="retroDate">회고 일자</Label>
            <Input
              id="retroDate"
              type="date"
              className="w-fit"
              {...register("retroDate")}
            />
            {formState.errors.retroDate?.message && (
              <p className="text-xs text-destructive">
                {formState.errors.retroDate.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>회고 유형</Label>
            <TypeSelector
              value={type}
              onChange={(value) =>
                setValue("type", value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label>회고 방법론</Label>
            <MethodSelector
              value={method}
              onChange={(value) =>
                setValue("method", value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
          </div>

          {type === "team" && <TeamInfoSection />}

          <div className="grid gap-2">
            <Label>추가 정보 (선택)</Label>
            <p className="text-xs text-muted-foreground">
              배경·목표·분석은 회고 진행 화면에서도 다시 보입니다.
            </p>
            <ContextAccordion />
          </div>

          <div className="sticky bottom-4 z-10 mt-2 flex flex-col gap-2 rounded-2xl border bg-background/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="gap-1.5"
              onClick={handleTemporarySave}
              disabled={status === "saving" || !title.trim()}
            >
              <Save className="h-4 w-4" />
              임시 저장 후 홈으로
            </Button>
            <Button
              type="submit"
              className="gap-1.5"
              disabled={status === "saving"}
            >
              <Play className="h-4 w-4" />
              회고하기 시작
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
