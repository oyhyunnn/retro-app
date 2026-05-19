import { db, SETTINGS_ROW_ID, type SettingsRow } from "@/lib/db";
import type { Retrospective, Settings } from "@/types/retro";

import type {
  CreateRetroInput,
  ImportMode,
  RetroRepository,
  SettingsRepository,
  UpdateRetroInput,
} from "./interface";

const DEFAULT_SETTINGS: Settings = {
  theme: "system",
  defaultTimerMinutes: 10,
};

function nowISO(): string {
  return new Date().toISOString();
}

function newId(): string {
  return crypto.randomUUID();
}

export class LocalRetroRepository implements RetroRepository {
  async list(): Promise<Retrospective[]> {
    return db.retrospectives.orderBy("retroDate").reverse().toArray();
  }

  async get(id: string): Promise<Retrospective | undefined> {
    return db.retrospectives.get(id);
  }

  async create(input: CreateRetroInput): Promise<Retrospective> {
    const timestamp = nowISO();
    const retro: Retrospective = {
      ...input,
      id: newId(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await db.retrospectives.add(retro);
    return retro;
  }

  async update(id: string, patch: UpdateRetroInput): Promise<Retrospective> {
    const existing = await db.retrospectives.get(id);
    if (!existing) {
      throw new Error(`회고를 찾을 수 없습니다: ${id}`);
    }
    const updated: Retrospective = {
      ...existing,
      ...patch,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: nowISO(),
    };
    await db.retrospectives.put(updated);
    return updated;
  }

  async remove(id: string): Promise<void> {
    await db.retrospectives.delete(id);
  }

  async exportAll(): Promise<Retrospective[]> {
    return db.retrospectives.toArray();
  }

  async importAll(items: Retrospective[], mode: ImportMode): Promise<void> {
    await db.transaction("rw", db.retrospectives, async () => {
      if (mode === "overwrite") {
        await db.retrospectives.clear();
        await db.retrospectives.bulkAdd(items);
      } else {
        await db.retrospectives.bulkPut(items);
      }
    });
  }

  async clear(): Promise<void> {
    await db.retrospectives.clear();
  }
}

export class LocalSettingsRepository implements SettingsRepository {
  async get(): Promise<Settings> {
    const row = await db.settings.get(SETTINGS_ROW_ID);
    if (!row) return { ...DEFAULT_SETTINGS };
    const { id: _id, ...settings } = row;
    return settings;
  }

  async update(patch: Partial<Settings>): Promise<Settings> {
    const current = await this.get();
    const next: Settings = { ...current, ...patch };
    const row: SettingsRow = { id: SETTINGS_ROW_ID, ...next };
    await db.settings.put(row);
    return next;
  }

  async reset(): Promise<Settings> {
    await db.settings.delete(SETTINGS_ROW_ID);
    return { ...DEFAULT_SETTINGS };
  }
}
