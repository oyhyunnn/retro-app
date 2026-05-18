import Link from "next/link";
import { ArrowRight, ListChecks, Plus, Settings as SettingsIcon } from "lucide-react";

import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="container mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
            R
          </div>
          <div>
            <h1 className="text-xl font-semibold leading-tight">회고 앱</h1>
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
        <Card className="sm:col-span-2 sm:row-span-2 group relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
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

        <Card className="group transition hover:border-primary/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ListChecks className="h-4 w-4 text-primary" />
              나의 회고 보기
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-xs text-muted-foreground">
              지금까지 작성한 회고를 확인하고 정리하세요.
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="w-fit gap-1 px-0"
              render={<Link href="/list" />}
            >
              바로 가기
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">최근 회고</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              아직 작성된 회고가 없어요. 첫 회고를 시작해 보세요.
            </p>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="bg-muted/30">
          <CardContent className="flex flex-col gap-1 py-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Phase 1 셋업 완료
            </p>
            <p className="text-sm">
              Next.js 16 · Tailwind 4 · shadcn/ui · PWA · 다크모드 · 타입 정의
              완료. 다음 Phase에서 데이터 레이어와 회고 등록 화면을 구현합니다.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
