"use client";

import Link from "next/link";
import { MoreVertical, Pencil, Trash2, User, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { METHOD_META } from "@/lib/retro/method-meta";
import { cn } from "@/lib/utils";
import { formatRetroDate } from "@/lib/utils/date";
import type {
  FiveWhysContent,
  FourLContent,
  KPTContent,
  Retrospective,
  SSCContent,
} from "@/types/retro";

interface Props {
  retro: Retrospective;
  showActions?: boolean;
  onDelete?: (retro: Retrospective) => void;
}

export function RetroCard({ retro, showActions = false, onDelete }: Props) {
  const meta = METHOD_META[retro.method];
  const preview = buildPreview(retro);

  return (
    <Card className="group relative h-full overflow-hidden transition hover:border-primary/40">
      <CardContent className="flex h-full flex-col gap-2 py-4">
        <div className="flex items-center justify-between gap-2 pr-7">
          <Badge variant="outline" className={cn("text-xs", meta.badgeClass)}>
            {meta.short}
          </Badge>
          <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
            {retro.type === "team" ? (
              <>
                <Users className="h-3 w-3" />팀
              </>
            ) : (
              <>
                <User className="h-3 w-3" />개인
              </>
            )}
          </span>
        </div>

        <p className="line-clamp-2 text-sm font-medium leading-snug">
          {retro.title}
        </p>

        {preview && (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {preview}
          </p>
        )}

        <p className="mt-auto text-xs text-muted-foreground">
          {formatRetroDate(retro.retroDate)}
        </p>
      </CardContent>

      <Link
        href={`/retro/${retro.id}`}
        className="absolute inset-0 z-10 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={`${retro.title} 상세 보기`}
      />

      {showActions && (
        <div className="absolute right-2 top-2 z-20">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="더보기"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="min-w-32">
              <DropdownMenuItem
                render={<Link href={`/retro/${retro.id}/edit`} />}
              >
                <Pencil className="h-3.5 w-3.5" />
                수정
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete?.(retro)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </Card>
  );
}

function buildPreview(retro: Retrospective): string {
  const items: string[] = [];

  switch (retro.method) {
    case "KPT": {
      const c = retro.content as KPTContent;
      items.push(...c.keep, ...c.problem, ...c.try);
      break;
    }
    case "4L": {
      const c = retro.content as FourLContent;
      items.push(...c.liked, ...c.learned, ...c.lacked, ...c.longedFor);
      break;
    }
    case "5Whys": {
      const c = retro.content as FiveWhysContent;
      if (c.problem) return c.problem;
      break;
    }
    case "StartStopContinue": {
      const c = retro.content as SSCContent;
      items.push(...c.start, ...c.stop, ...c.continueItems);
      break;
    }
  }

  const meaningful = items.filter((t) => t.trim());
  if (meaningful.length > 0) {
    return meaningful.slice(0, 3).join(" · ");
  }
  return retro.context?.trim() || retro.goal?.trim() || "";
}
