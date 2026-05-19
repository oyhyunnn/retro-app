import { LocalRetroRepository, LocalSettingsRepository } from "./local";
import type { RetroRepository, SettingsRepository } from "./interface";

export const retroRepository: RetroRepository = new LocalRetroRepository();
export const settingsRepository: SettingsRepository =
  new LocalSettingsRepository();

export type {
  CreateRetroInput,
  ImportMode,
  RetroRepository,
  SettingsRepository,
  UpdateRetroInput,
} from "./interface";
