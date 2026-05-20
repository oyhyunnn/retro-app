"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Download, Pencil, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ContentView } from "@/components/retro/ContentView";
import { ProjectOverviewPanel } from "@/components/retro/ProjectOverviewPanel";
import { RetroPDFView } from "@/components/retro/RetroPDFView";
import { StickyBoard } from "@/components/retro/StickyBoard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRetroStore } from "@/stores/retroStore";

export default function RetroDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const items = useRetroStore((s) => s.items);
  const loaded = useRetroStore((s) => s.loaded);
  const loading = useRetroStore((s) => s.loading);
  const load = useRetroStore((s) => s.load);
  const update = useRetroStore((s) => s.update);
  const remove = useRetroStore((s) => s.remove);

  useEffect(() => {
    if (!loaded && !loading) void load();
  }, [load, loaded, loading]);

  const retro = useMemo(
    () => items.find((r) => r.id === id),
    [items, id],
  );

  const [closing, setClosing] = useState("");
  const [closingSaving, setClosingSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (retro) setClosing(retro.closing ?? "");
  }, [retro]);

  useEffect(() => {
    if (!retro) return;
    const stored = retro.closing ?? "";
    if (closing === stored) return;

    const timer = setTimeout(async () => {
      setClosingSaving(true);
      try {
        await update(retro.id, {
          closing: closing.trim() || undefined,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setClosingSaving(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [closing, retro, update]);

  const handleExportPDF = async () => {
    if (!retro || !pdfRef.current) return;
    setPdfBusy(true);
    try {
      const { exportRetroToPDF } = await import("@/lib/pdf/export");
      await exportRetroToPDF({ retro, element: pdfRef.current });
      toast.success("PDF 다운로드를 시작했어요.");
    } catch (err) {
      console.error(err);
      toast.error("PDF 생성에 실패했어요.");
    } finally {
      setPdfBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!retro) return;
    try {
      await remove(retro.id);
      toast.success("회고를 삭제했어요.");
      router.push("/list");
    } catch {
      toast.error("삭제에 실패했어요.");
    }
  };

  if (!loaded) {
    return (
      <main className="container mx-auto flex w-full max-w-3xl flex-1 items-center justify-center px-4 py-10">
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      </main>
    );
  }

  if (!retro) {
    return (
      <main className="container mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-10">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm font-medium">회고를 찾을 수 없어요</p>
            <p className="text-xs text-muted-foreground">
              삭제되었거나 잘못된 주소일 수 있습니다.
            </p>
            <Button size="sm" render={<Link href="/" />}>
              홈으로
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit gap-1 px-0"
          render={<Link href="/list" />}
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </Button>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            render={<Link href={`/retro/${id}/session`} />}
          >
            <Play className="h-3.5 w-3.5" />
            세션 진행
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            render={<Link href={`/retro/${id}/edit`} />}
          >
            <Pencil className="h-3.5 w-3.5" />
            수정
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={handleExportPDF}
            disabled={pdfBusy}
          >
            <Download className="h-3.5 w-3.5" />
            {pdfBusy ? "생성 중..." : "PDF"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-destructive hover:text-destructive"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            삭제
          </Button>
        </div>
      </header>

      <ProjectOverviewPanel retro={retro} />

      <ContentView method={retro.method} content={retro.content} />

      {retro.type === "team" && (
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">포스트잇 보드</h3>
          <StickyBoard
            method={retro.method}
            notes={retro.stickyNotes ?? []}
            participants={retro.teamInfo?.participants ?? []}
            readOnly
          />
        </section>
      )}

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="closing">마무리 메모</Label>
          {closingSaving && (
            <span className="text-xs text-muted-foreground">저장 중...</span>
          )}
        </div>
        <Textarea
          id="closing"
          value={closing}
          onChange={(e) => setClosing(e.target.value)}
          placeholder="회고를 마치며 떠오른 생각이나 결심을 남겨보세요."
          rows={4}
        />
      </section>

      <div
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: "-10000px",
          pointerEvents: "none",
        }}
      >
        <div ref={pdfRef}>
          <RetroPDFView retro={retro} />
        </div>
      </div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>회고를 삭제하시겠어요?</DialogTitle>
            <DialogDescription>
              <span className="font-medium text-foreground">
                {retro.title}
              </span>{" "}
              회고가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(false)}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
