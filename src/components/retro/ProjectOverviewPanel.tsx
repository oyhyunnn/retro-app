"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, User, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { METHOD_META } from "@/lib/retro/method-meta";
import { cn } from "@/lib/utils";
import { formatRetroDate, formatRetroDateLong } from "@/lib/utils/date";
import type { Milestone, Retrospective, TeamTimeline } from "@/types/retro";

interface Props {
  retro: Retrospective;
}

export function ProjectOverviewPanel({ retro }: Props) {
  const [expanded, setExpanded] = useState(true);
  const meta = METHOD_META[retro.method];

  const hasContextSummary = Boolean(
    retro.context || retro.goal || retro.analysis,
  );

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={cn(meta.badgeClass)}>
                {meta.label}
              </Badge>
              <Badge variant="secondary" className="gap-1">
                {retro.type === "team" ? (
                  <Users className="h-3 w-3" />
                ) : (
                  <User className="h-3 w-3" />
                )}
                {retro.type === "team" ? "팀 회고" : "개인 회고"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatRetroDateLong(retro.retroDate)}
              </span>
            </div>
            <h2 className="line-clamp-2 text-lg font-semibold sm:text-xl">
              {retro.title}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "개요 접기" : "개요 펼치기"}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {expanded && (
          <div className="flex flex-col gap-4 border-t pt-4">
            {retro.type === "team" && retro.teamInfo?.timeline && (
              <TimelineBar timeline={retro.teamInfo.timeline} />
            )}

            {retro.type === "team" &&
              retro.teamInfo?.teamName?.trim() && (
                <p className="text-sm">
                  <span className="text-muted-foreground">팀: </span>
                  <span className="font-medium">
                    {retro.teamInfo.teamName}
                  </span>
                </p>
              )}

            {retro.type === "team" &&
              retro.teamInfo?.participants &&
              retro.teamInfo.participants.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">참여자</span>
                  {retro.teamInfo.participants.map((name) => (
                    <Badge key={name} variant="outline" className="text-xs">
                      {name}
                    </Badge>
                  ))}
                </div>
              )}

            {hasContextSummary && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {retro.context && (
                  <OverviewBlock label="배경" content={retro.context} />
                )}
                {retro.goal && (
                  <OverviewBlock label="목표" content={retro.goal} />
                )}
                {retro.analysis && (
                  <OverviewBlock label="분석" content={retro.analysis} />
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function OverviewBlock({
  label,
  content,
}: {
  label: string;
  content: string;
}) {
  return (
    <div className="rounded-xl border bg-muted/30 p-3">
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      <p className="line-clamp-4 whitespace-pre-wrap text-xs leading-relaxed">
        {content}
      </p>
    </div>
  );
}

function TimelineBar({ timeline }: { timeline: TeamTimeline }) {
  if (!timeline.startDate || !timeline.endDate) return null;

  const start = new Date(timeline.startDate).getTime();
  const end = new Date(timeline.endDate).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return null;
  const total = end - start;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatRetroDate(timeline.startDate)}</span>
        <span>{formatRetroDate(timeline.endDate)}</span>
      </div>
      <div className="relative h-2 rounded-full bg-muted">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/60 to-primary" />
        {timeline.milestones.map((m) => {
          const t = new Date(m.date).getTime();
          if (Number.isNaN(t)) return null;
          const ratio = Math.max(0, Math.min(1, (t - start) / total));
          return (
            <div
              key={m.id}
              className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-amber-400 shadow"
              style={{ left: `${ratio * 100}%` }}
              aria-label={`${m.name} 마일스톤`}
              title={`${m.name} · ${formatRetroDate(m.date)}`}
            />
          );
        })}
      </div>
      {timeline.milestones.length > 0 && (
        <ul className="flex flex-wrap gap-1.5 text-xs">
          {timeline.milestones.map((m: Milestone) => (
            <li
              key={m.id}
              className="flex items-center gap-1 rounded-md bg-muted/60 px-1.5 py-0.5"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span className="font-medium">{m.name}</span>
              <span className="text-muted-foreground">
                {formatRetroDate(m.date)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
