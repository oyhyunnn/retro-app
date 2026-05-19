import { RetroDatabase } from "./schema";

export const db = new RetroDatabase();

export { RetroDatabase, SETTINGS_ROW_ID } from "./schema";
export type { SettingsRow } from "./schema";
