"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import {
  ArrowRight,
  CalendarDays,
  ListChecks,
  Plus,
  Settings as SettingsIcon,
  Sparkles,
} from "lucide-react";

import { ThemeToggle } from "@/components/common/ThemeToggle";
import { RetroCard } from "@/components/retro/RetroCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isInCurrentMonth } from "@/lib/utils/date";
import { useRetroStore } from "@/stores/retroStore";

export default function HomePage() {
  const items = useRetroStore((s) => s.items);
  const loaded = useRetroStore((s) => s.loaded);
  const loading = useRetroStore((s) => s.loading);
  const load = useRetroStore((s) => s.load);

  useEffect(() => {
    if (!loaded && !loading) {
      void load();
    }
  }, [load, loaded, loading]);

  const visibleItems = useMemo(
    () => items.filter((r) => !r.isDraft),
    [items],
  );

  const stats = useMemo(() => {
    const total = visibleItems.length;
    const thisMonth = visibleItems.filter((r) =>
      isInCurrentMonth(r.createdAt),
    ).length;
    return { total, thisMonth };
  }, [visibleItems]);

  const recents = useMemo(() => {
    return [...visibleItems]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 3);
  }, [visibleItems]);

  return (
    <main className="container mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-bold tracking-tight">
            회고
          </div>
          <div>
            <h1 className="text-xl font-semibold leading-tight tracking-tight">
              RE:
            </h1>
            <p className="text-xs text-muted-foreground">
              꾸준한 회고로 더 나은 다음을 만듭니다
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label="설정"
            render={<Link href="/settings" />}
          >
            <SettingsIcon className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        <Card className="sm:col-span-2 sm:row-span-2 relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent">
          <CardHeader>
            <Badge variant="secondary" className="w-fit">
              메인
            </Badge>
            <CardTitle className="mt-3 text-2xl sm:text-3xl">
              새 회고 시작하기
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <p className="text-sm text-muted-foreground sm:text-base">
              KPT, 4L, 5Whys, Start/Stop/Continue 중 원하는 방법론으로
              개인 또는 팀 회고를 진행해 보세요.
            </p>
            <Button
              size="lg"
              className="w-fit gap-2"
              render={<Link href="/retro/new" />}
            >
              <Plus className="h-4 w-4" />
              회고 시작
            </Button>
          </CardContent>
        </Card>

        <Card className="transition hover:border-primary/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ListChecks className="h-4 w-4 text-primary" />
              나의 회고
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="text-3xl font-semibold leading-none">
              {loaded ? stats.total : "—"}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                개
              </span>
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="w-fit gap-1 px-0"
              render={<Link href="/list" />}
            >
              전체 보기
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              이번 달
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold leading-none">
              {loaded ? stats.thisMonth : "—"}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                회
              </span>
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              이번 달 작성한 회고
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <header className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            최근 회고
          </h2>
          {recents.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 px-0"
              render={<Link href="/list" />}
            >
              모두 보기
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </header>

        {!loaded ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              불러오는 중...
            </CardContent>
          </Card>
        ) : recents.length === 0 ? (
          <Card className="bg-muted/30">
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">아직 작성된 회고가 없어요</p>
                <p className="text-xs text-muted-foreground">
                  첫 회고를 시작해 보세요.
                </p>
              </div>
              <Button
                size="sm"
                className="gap-1"
                render={<Link href="/retro/new" />}
              >
                <Plus className="h-3.5 w-3.5" />
                회고 시작
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {recents.map((retro) => (
              <li key={retro.id}>
                <RetroCard retro={retro} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
