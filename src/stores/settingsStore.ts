import { create } from "zustand";

import { settingsRepository } from "@/lib/repositories";
import type { Settings } from "@/types/retro";

interface SettingsState {
  settings: Settings;
  loaded: boolean;
  loading: boolean;
  error?: string;
}

interface SettingsActions {
  load: () => Promise<void>;
  update: (patch: Partial<Settings>) => Promise<void>;
  reset: () => Promise<void>;
  markBackupNow: () => Promise<void>;
}

const initialSettings: Settings = {
  theme: "system",
  defaultTimerMinutes: 10,
};

export const useSettingsStore = create<SettingsState & SettingsActions>(
  (set, get) => ({
    settings: initialSettings,
    loaded: false,
    loading: false,
    error: undefined,

    load: async () => {
      if (get().loading) return;
      set({ loading: true, error: undefined });
      try {
        const settings = await settingsRepository.get();
        set({ settings, loaded: true, loading: false });
      } catch (err) {
        set({ loading: false, error: (err as Error).message });
      }
    },

    update: async (patch) => {
      const updated = await settingsRepository.update(patch);
      set({ settings: updated });
    },

    reset: async () => {
      const fresh = await settingsRepository.reset();
      set({ settings: fresh });
    },

    markBackupNow: async () => {
      await get().update({ lastBackupAt: new Date().toISOString() });
    },
  }),
);
