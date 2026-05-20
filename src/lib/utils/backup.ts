import { retroRepository } from "@/lib/repositories";
import type { ImportMode } from "@/lib/repositories";
import type { Retrospective } from "@/types/retro";

const EXPORT_VERSION = 1;

interface ExportPayload {
  version: number;
  exportedAt: string;
  retros: Retrospective[];
}

export async function exportAllToJsonFile(): Promise<{ count: number }> {
  const items = await retroRepository.exportAll();
  const payload: ExportPayload = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    retros: items,
  };

  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const today = new Date().toISOString().slice(0, 10);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `retro-app-backup-${today}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);

  return { count: items.length };
}

export async function readBackupFile(
  file: File,
): Promise<Retrospective[]> {
  const text = await file.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("JSON 형식이 아닌 파일이에요.");
  }

  let retros: unknown;
  if (Array.isArray(data)) {
    retros = data;
  } else if (
    data &&
    typeof data === "object" &&
    "retros" in data &&
    Array.isArray((data as { retros: unknown }).retros)
  ) {
    retros = (data as { retros: unknown[] }).retros;
  } else {
    throw new Error("올바른 백업 파일 형식이 아니에요.");
  }

  if (!Array.isArray(retros)) {
    throw new Error("올바른 백업 파일 형식이 아니에요.");
  }

  for (const item of retros) {
    if (!isValidRetro(item)) {
      throw new Error("회고 데이터에 필수 필드가 누락되었어요.");
    }
  }

  return retros as Retrospective[];
}

export async function applyImport(
  retros: Retrospective[],
  mode: ImportMode,
): Promise<{ count: number }> {
  await retroRepository.importAll(retros, mode);
  return { count: retros.length };
}

function isValidRetro(input: unknown): boolean {
  if (!input || typeof input !== "object") return false;
  const r = input as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    typeof r.title === "string" &&
    (r.type === "personal" || r.type === "team") &&
    typeof r.method === "string" &&
    typeof r.retroDate === "string" &&
    typeof r.content === "object"
  );
}
