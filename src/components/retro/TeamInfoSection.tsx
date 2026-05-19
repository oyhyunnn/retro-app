"use client";

import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { RetroFormValues } from "@/lib/retro/form-schema";

export function TeamInfoSection() {
  const { register, control, watch, setValue, formState } =
    useFormContext<RetroFormValues>();
  const [participantDraft, setParticipantDraft] = useState("");

  const participants = watch("teamInfo.participants") ?? [];

  const milestonesArray = useFieldArray({
    control,
    name: "teamInfo.timeline.milestones",
  });

  const addParticipant = () => {
    const name = participantDraft.trim();
    if (!name) return;
    if (participants.includes(name)) {
      setParticipantDraft("");
      return;
    }
    setValue("teamInfo.participants", [...participants, name], {
      shouldDirty: true,
    });
    setParticipantDraft("");
  };

  const removeParticipant = (name: string) => {
    setValue(
      "teamInfo.participants",
      participants.filter((p) => p !== name),
      { shouldDirty: true },
    );
  };

  const timelineErrors = formState.errors.teamInfo?.timeline;

  return (
    <section className="flex flex-col gap-6 rounded-2xl border bg-card p-4 sm:p-5">
      <header>
        <h3 className="text-sm font-semibold">팀 정보</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          팀명·참여자·프로젝트 타임라인을 함께 기록합니다.
        </p>
      </header>

      <div className="grid gap-2">
        <Label htmlFor="teamName" className="text-xs">
          팀명 (선택)
        </Label>
        <Input
          id="teamName"
          placeholder="예: 결제 플랫폼 팀"
          {...register("teamInfo.teamName")}
        />
      </div>

      <div className="grid gap-2">
        <Label className="text-xs">참여자 닉네임</Label>
        <div className="flex gap-2">
          <Input
            value={participantDraft}
            onChange={(e) => setParticipantDraft(e.target.value)}
            placeholder="닉네임 입력 후 Enter"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addParticipant();
              }
            }}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addParticipant}
            disabled={!participantDraft.trim()}
          >
            추가
          </Button>
        </div>
        {participants.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {participants.map((name) => (
              <Badge
                key={name}
                variant="secondary"
                className="gap-1 pr-1.5"
              >
                {name}
                <button
                  type="button"
                  onClick={() => removeParticipant(name)}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10"
                  aria-label={`${name} 제거`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="startDate" className="text-xs">
            프로젝트 시작일
          </Label>
          <Input
            id="startDate"
            type="date"
            {...register("teamInfo.timeline.startDate")}
          />
          {timelineErrors?.startDate?.message && (
            <p className="text-xs text-destructive">
              {timelineErrors.startDate.message}
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="endDate" className="text-xs">
            프로젝트 종료일
          </Label>
          <Input
            id="endDate"
            type="date"
            {...register("teamInfo.timeline.endDate")}
          />
          {timelineErrors?.endDate?.message && (
            <p className="text-xs text-destructive">
              {timelineErrors.endDate.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs">마일스톤 (선택)</Label>
            <p className="text-xs text-muted-foreground">
              주요 시점을 추가하면 타임라인에 표시됩니다.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="gap-1"
            onClick={() =>
              milestonesArray.append({
                id: crypto.randomUUID(),
                name: "",
                date: "",
                description: "",
              })
            }
          >
            <Plus className="h-3.5 w-3.5" />
            추가
          </Button>
        </div>

        {milestonesArray.fields.length === 0 ? (
          <p className="rounded-xl border border-dashed bg-muted/30 px-3 py-4 text-center text-xs text-muted-foreground">
            아직 추가된 마일스톤이 없어요.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {milestonesArray.fields.map((field, index) => {
              const error =
                formState.errors.teamInfo?.timeline?.milestones?.[index];
              return (
                <li
                  key={field.id}
                  className="grid gap-2 rounded-xl border bg-background p-3"
                >
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      placeholder="마일스톤 이름"
                      className="flex-1"
                      {...register(
                        `teamInfo.timeline.milestones.${index}.name` as const,
                      )}
                    />
                    <Input
                      type="date"
                      className="sm:w-44"
                      {...register(
                        `teamInfo.timeline.milestones.${index}.date` as const,
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="마일스톤 삭제"
                      onClick={() => milestonesArray.remove(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea
                    rows={2}
                    placeholder="설명 (선택)"
                    {...register(
                      `teamInfo.timeline.milestones.${index}.description` as const,
                    )}
                  />
                  {error?.name?.message && (
                    <p className="text-xs text-destructive">
                      {error.name.message}
                    </p>
                  )}
                  {error?.date?.message && (
                    <p className="text-xs text-destructive">
                      {error.date.message}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
