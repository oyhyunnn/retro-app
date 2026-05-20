"use client";

import { useFormContext } from "react-hook-form";

import { ContextAccordion } from "@/components/retro/ContextAccordion";
import { MethodSelector } from "@/components/retro/MethodSelector";
import { TeamInfoSection } from "@/components/retro/TeamInfoSection";
import { TypeSelector } from "@/components/retro/TypeSelector";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RetroFormValues } from "@/lib/retro/form-schema";

export function RetroFormFields() {
  const { register, watch, setValue, formState } =
    useFormContext<RetroFormValues>();
  const type = watch("type");
  const method = watch("method");
  const title = watch("title") ?? "";

  return (
    <div className="flex flex-col gap-6">
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
          <span className="text-muted-foreground">{title.length}/100</span>
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
    </div>
  );
}
