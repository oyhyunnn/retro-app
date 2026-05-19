import type { Retrospective, Settings } from "@/types/retro";

export type CreateRetroInput = Omit<
  Retrospective,
  "id" | "createdAt" | "updatedAt"
>;

export type UpdateRetroInput = Partial<
  Omit<Retrospective, "id" | "createdAt">
>;

export type ImportMode = "overwrite" | "merge";

export interface RetroRepository {
  list(): Promise<Retrospective[]>;
  get(id: string): Promise<Retrospective | undefined>;
  create(input: CreateRetroInput): Promise<Retrospective>;
  update(id: string, patch: UpdateRetroInput): Promise<Retrospective>;
  remove(id: string): Promise<void>;
  exportAll(): Promise<Retrospective[]>;
  importAll(items: Retrospective[], mode: ImportMode): Promise<void>;
  clear(): Promise<void>;
}

export interface SettingsRepository {
  get(): Promise<Settings>;
  update(patch: Partial<Settings>): Promise<Settings>;
  reset(): Promise<Settings>;
}
