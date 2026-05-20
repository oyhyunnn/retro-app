"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useRetroStore } from "@/stores/retroStore";
import type { RetroContent, StickyNote } from "@/types/retro";

import type { AutoSaveStatus } from "./use-auto-save";

const AUTOSAVE_DELAY_MS = 600;

interface Params {
  retroId: string;
  content: RetroContent | null;
  stickyNotes?: StickyNote[];
  enabled: boolean;
}

export function useSessionAutoSave({
  retroId,
  content,
  stickyNotes,
  enabled,
}: Params) {
  const [status, setStatus] = useState<AutoSaveStatus>("idle");
  const inFlightRef = useRef(false);
  const lastSerializedRef = useRef<string>("");
  const update = useRetroStore((s) => s.update);

  const persist = useCallback(async () => {
    if (!enabled || !content) return;

    const patch: { content: RetroContent; stickyNotes?: StickyNote[] } = {
      content,
    };
    if (stickyNotes !== undefined) {
      patch.stickyNotes = stickyNotes;
    }

    const serialized = JSON.stringify(patch);
    if (serialized === lastSerializedRef.current) return;
    if (inFlightRef.current) return;

    inFlightRef.current = true;
    setStatus("saving");
    try {
      await update(retroId, patch);
      lastSerializedRef.current = serialized;
      setStatus("saved");
    } catch (err) {
      console.error("[useSessionAutoSave] failed", err);
      setStatus("error");
    } finally {
      inFlightRef.current = false;
    }
  }, [content, stickyNotes, enabled, retroId, update]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void persist();
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [persist]);

  return { status, flush: persist };
}
