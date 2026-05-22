"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";

import { useRetroStore } from "@/stores/retroStore";
import { createEmptyContent } from "@/types/retro";
import type {
  CreateRetroInput,
  UpdateRetroInput,
} from "@/lib/repositories";
import type { RetroFormValues } from "@/lib/retro/form-schema";

export type AutoSaveStatus = "idle" | "saving" | "saved" | "error";

const AUTOSAVE_DELAY_MS = 500;

function toCreateInput(values: RetroFormValues): CreateRetroInput {
  const trimmedContext = values.context?.trim();
  const trimmedGoal = values.goal?.trim();
  const trimmedAnalysis = values.analysis?.trim();

  const teamInfo =
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
      : undefined;

  return {
    title: values.title.trim(),
    type: values.type,
    method: values.method,
    retroDate: values.retroDate,
    context: trimmedContext || undefined,
    goal: trimmedGoal || undefined,
    analysis: trimmedAnalysis || undefined,
    teamInfo,
    content: createEmptyContent(values.method),
    isDraft: true,
  };
}

function toUpdateInput(values: RetroFormValues): UpdateRetroInput {
  const { content: _content, ...rest } = toCreateInput(values);
  return rest;
}

export function useAutoSaveRetro(form: UseFormReturn<RetroFormValues>) {
  const watched = useWatch({ control: form.control });

  const [retroId, setRetroId] = useState<string | null>(null);
  const [status, setStatus] = useState<AutoSaveStatus>("idle");
  const inFlightRef = useRef(false);
  const lastSerializedRef = useRef<string>("");
  const createRetro = useRetroStore((s) => s.create);
  const updateRetro = useRetroStore((s) => s.update);

  const persist = useCallback(async (): Promise<string | null> => {
    const values = form.getValues();
    const title = values.title?.trim();
    if (!title) return retroId;
    if (inFlightRef.current) return retroId;

    const serialized = JSON.stringify({ retroId, values });
    if (serialized === lastSerializedRef.current) return retroId;

    inFlightRef.current = true;
    setStatus("saving");
    try {
      let id = retroId;
      if (!id) {
        const created = await createRetro(toCreateInput(values));
        id = created.id;
        setRetroId(id);
      } else {
        await updateRetro(id, toUpdateInput(values));
      }
      lastSerializedRef.current = serialized;
      setStatus("saved");
      return id;
    } catch (err) {
      console.error("[useAutoSaveRetro] failed to persist", err);
      setStatus("error");
      return retroId;
    } finally {
      inFlightRef.current = false;
    }
  }, [createRetro, form, retroId, updateRetro]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void persist();
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [watched, persist]);

  const promote = useCallback(async (): Promise<string | null> => {
    const id = await persist();
    if (!id) return null;
    try {
      await updateRetro(id, { isDraft: false });
    } catch (err) {
      console.error("[useAutoSaveRetro] promote failed", err);
    }
    return id;
  }, [persist, updateRetro]);

  return {
    retroId,
    status,
    flush: persist,
    promote,
  };
}
