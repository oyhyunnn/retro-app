"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import {
  ArrowLeft,
  Download,
  Monitor,
  Moon,
  Sun,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { retroRepository } from "@/lib/repositories";
import {
  applyImport,
  exportAllToJsonFile,
  readBackupFile,
} from "@/lib/utils/backup";
import { cn } from "@/lib/utils";
import { useRetroStore } from "@/stores/retroStore";
import type { Retrospective } from "@/types/retro";

type BusyAction = "export" | "import" | "reset" | null;

const THEME_OPTIONS: Array<{
  value: "light" | "dark" | "system";
  label: string;
  Icon: typeof Sun;
}> = [
  { value: "light", label: "라이트", Icon: Sun },
  { value: "dark", label: "다크", Icon: Moon },
  { value: "system", label: "시스템 자동", Icon: Monitor },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const items = useRetroStore((s) => s.items);
  const loaded = useRetroStore((s) => s.loaded);
  const loading = useRetroStore((s) => s.loading);
  const load = useRetroStore((s) => s.load);
  const refresh = useRetroStore((s) => s.refresh);

  const [mounted, setMounted] = useState(false);
  const [busy, setBusy] = useState<BusyAction>(null);
  const [pendingImport, setPendingImport] = useState<
    Retrospective[] | null
  >(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loaded && !loading) void load();
  }, [load, loaded, loading]);

  const handleExport = async () => {
    setBusy("export");
    try {
      const { count } = await exportAllToJsonFile();
      toast.success(`${count}개의 회고를 백업 파일로 내보냈어요.`);
    } catch (err) {
      console.error(err);
      toast.error("내보내기에 실패했어요.");
    } finally {
      setBusy(null);
    }
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const retros = await readBackupFile(file);
      if (retros.length === 0) {
        toast.warning("파일에 회고가 없어요.");
        return;
      }
      setPendingImport(retros);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleApplyImport = async (mode: "overwrite" | "merge") => {
    if (!pendingImport) return;
    setBusy("import");
    try {
      const { count } = await applyImport(pendingImport, mode);
      await refresh();
      toast.success(
        `${count}개의 회고를 ${
          mode === "overwrite" ? "덮어쓰기로 " : "병합으로 "
        }가져왔어요.`,
      );
      setPendingImport(null);
    } catch (err) {
      console.error(err);
      toast.error("가져오기에 실패했어요.");
    } finally {
      setBusy(null);
    }
  };

  const handleReset = async () => {
    setBusy("reset");
    try {
      await retroRepository.clear();
      await refresh();
      toast.success("모든 회고를 삭제했어요.");
      setConfirmReset(false);
    } catch (err) {
      console.error(err);
      toast.error("삭제에 실패했어요.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <main className="container mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
      <header className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit gap-1 px-0"
          render={<Link href="/" />}
        >
          <ArrowLeft className="h-4 w-4" />
          홈으로
        </Button>
      </header>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold sm:text-3xl">설정</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>테마</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-3">
          {THEME_OPTIONS.map((opt) => {
            const active = mounted && theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTheme(opt.value)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-2xl border p-4 transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                    : "border-border hover:border-primary/40",
                )}
                aria-pressed={active}
              >
                <opt.Icon
                  className={cn(
                    "h-5 w-5",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                />
                <span className="text-sm font-medium">{opt.label}</span>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>데이터 관리</CardTitle>
          <p className="text-xs text-muted-foreground">
            {loaded
              ? `현재 ${items.length}개의 회고가 브라우저에 저장되어 있어요.`
              : "회고 정보를 불러오는 중..."}
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={busy === "export" || items.length === 0}
            className="justify-start gap-2"
          >
            <Download className="h-4 w-4" />
            JSON 내보내기 (백업)
          </Button>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy === "import"}
            className="justify-start gap-2"
          >
            <Upload className="h-4 w-4" />
            JSON 가져오기
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            variant="outline"
            onClick={() => setConfirmReset(true)}
            disabled={busy === "reset" || items.length === 0}
            className="justify-start gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            전체 데이터 삭제
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>앱 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">버전</span> · 1.0.0
            MVP
          </p>
          <p>
            회고 데이터는 브라우저의 IndexedDB에 저장되며 외부 서버로 전송되지
            않습니다.
          </p>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(pendingImport)}
        onOpenChange={(open) => !open && setPendingImport(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>가져오기 모드 선택</DialogTitle>
            <DialogDescription>
              파일에서 {pendingImport?.length}개의 회고를 발견했어요. 기존
              데이터를 어떻게 처리할까요?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => handleApplyImport("merge")}
              disabled={busy === "import"}
            >
              병합 (같은 ID는 덮어쓰고, 새 ID는 추가)
            </Button>
            <Button
              variant="destructive"
              className="justify-start"
              onClick={() => handleApplyImport("overwrite")}
              disabled={busy === "import"}
            >
              덮어쓰기 (기존 회고를 모두 지우고 가져옴)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmReset} onOpenChange={setConfirmReset}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>전체 데이터를 삭제하시겠어요?</DialogTitle>
            <DialogDescription>
              저장된 모든 회고가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수
              없어요. 먼저 JSON 내보내기로 백업을 권장합니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmReset(false)}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleReset}
              disabled={busy === "reset"}
              className="gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
              모두 삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
