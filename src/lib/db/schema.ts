import Dexie, { type Table } from "dexie";

import type { Retrospective, Settings } from "@/types/retro";

export const SETTINGS_ROW_ID = "user";

export interface SettingsRow extends Settings {
  id: string;
}

export class RetroDatabase extends Dexie {
  retrospectives!: Table<Retrospective, string>;
  settings!: Table<SettingsRow, string>;

  constructor() {
    super("RetroAppDB");
    this.version(1).stores({
      retrospectives:
        "id, retroDate, method, type, createdAt, updatedAt",
      settings: "id",
    });
  }
}
