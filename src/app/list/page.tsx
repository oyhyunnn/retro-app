"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { ArrowLeft, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { RetroCard } from "@/components/retro/RetroCard";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { METHOD_META, METHOD_ORDER } from "@/lib/retro/method-meta";
import {
  selectFilteredRetros,
  useRetroStore,
  type RetroFilter,
} from "@/stores/retroStore";
import type { Retrospective } from "@/types/retro";

export default function ListPage() {
  const items = useRetroStore((s) => s.items);
  const loaded = useRetroStore((s) => s.loaded);
  const loading = useRetroStore((s) => s.loading);
  const filter = useRetroStore((s) => s.filter);
  const setFilter = useRetroStore((s) => s.setFilter);
  const load = useRetroStore((s) => s.load);
  const remove = useRetroStore((s) => s.remove);

  const filtered = useRetroStore(useShallow(selectFilteredRetros));

  useEffect(() => {
    if (!loaded && !loading) void load();
  }, [load, loaded, loading]);

  const [pendingDelete, setPendingDelete] =
    useState<Retrospective | null>(null);

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await remove(pendingDelete.id);
      toast.success("회고를 삭제했어요.");
      setPendingDelete(null);
    } catch {
      toast.error("삭제에 실패했어요. 다시 시도해 주세요.");
    }
  };

  return (
    <main className="container mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
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
        <Button
          size="sm"
          className="gap-1"
          render={<Link href="/retro/new" />}
        >
          <Plus className="h-3.5 w-3.5" />
          새 회고
        </Button>
      </header>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold sm:text-3xl">나의 회고</h1>
        <p className="text-sm text-muted-foreground">
          작성한 회고를 검색하고 필터링할 수 있어요.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filter.query}
              onChange={(e) => setFilter({ query: e.target.value })}
              placeholder="제목으로 검색"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select
              value={filter.type}
              onValueChange={(value) =>
                setFilter({
                  type: ((value ?? "all") as RetroFilter["type"]),
                })
              }
            >
              <SelectTrigger className="w-32" aria-label="유형 필터">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">유형 전체</SelectItem>
                <SelectItem value="personal">개인</SelectItem>
                <SelectItem value="team">팀</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filter.method}
              onValueChange={(value) =>
                setFilter({
                  method: ((value ?? "all") as RetroFilter["method"]),
                })
              }
            >
              <SelectTrigger className="w-40" aria-label="방법론 필터">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">방법론 전체</SelectItem>
                {METHOD_ORDER.map((m) => (
                  <SelectItem key={m} value={m}>
                    {METHOD_META[m].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filter.sort}
              onValueChange={(value) =>
                setFilter({
                  sort: ((value ?? "newest") as RetroFilter["sort"]),
                })
              }
            >
              <SelectTrigger className="w-32" aria-label="정렬">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">최신순</SelectItem>
                <SelectItem value="oldest">오래된순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {!loaded ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          불러오는 중...
        </p>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm font-medium">아직 작성된 회고가 없어요</p>
            <Button
              size="sm"
              className="gap-1"
              render={<Link href="/retro/new" />}
            >
              <Plus className="h-3.5 w-3.5" />
              첫 회고 시작
            </Button>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            검색·필터 결과에 해당하는 회고가 없어요.
          </CardContent>
        </Card>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((retro) => (
            <li key={retro.id}>
              <RetroCard
                retro={retro}
                showActions
                onDelete={setPendingDelete}
              />
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>회고를 삭제하시겠어요?</DialogTitle>
            <DialogDescription>
              <span className="font-medium text-foreground">
                {pendingDelete?.title}
              </span>{" "}
              회고가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPendingDelete(null)}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
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
