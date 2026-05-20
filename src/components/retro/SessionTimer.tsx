"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Timer as TimerIcon } from "lucide-react";

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
import { cn } from "@/lib/utils";

const PRESETS = [5, 10, 15, 30] as const;

interface Props {
  defaultMinutes?: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function vibrate(pattern: number[]) {
  if (typeof navigator === "undefined") return;
  if (typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* unsupported */
    }
  }
}

export function SessionTimer({ defaultMinutes = 10 }: Props) {
  const [durationSec, setDurationSec] = useState(defaultMinutes * 60);
  const [remainingSec, setRemainingSec] = useState(defaultMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [showFinished, setShowFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemainingSec((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setIsRunning(false);
          setShowFinished(true);
          vibrate([220, 120, 220, 120, 320]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const setMinutes = (minutes: number) => {
    const safe = Math.max(1, Math.min(120, Math.floor(minutes)));
    const sec = safe * 60;
    setDurationSec(sec);
    setRemainingSec(sec);
    setIsRunning(false);
    setShowFinished(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemainingSec(durationSec);
    setShowFinished(false);
  };

  const handleToggle = () => {
    if (remainingSec === 0) {
      handleReset();
      return;
    }
    setIsRunning((v) => !v);
  };

  const activeMinutes = Math.floor(durationSec / 60);
  const isCritical = isRunning && remainingSec > 0 && remainingSec <= 10;

  return (
    <>
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <TimerIcon className="h-3.5 w-3.5" />
            타이머
          </div>

          <p
            className={cn(
              "font-mono text-5xl font-bold tabular-nums sm:text-6xl",
              remainingSec === 0 && "text-destructive",
              isCritical && "animate-pulse text-destructive",
            )}
            aria-live="polite"
          >
            {formatTime(remainingSec)}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {PRESETS.map((m) => (
              <Button
                key={m}
                variant={activeMinutes === m ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setMinutes(m)}
                disabled={isRunning}
              >
                {m}분
              </Button>
            ))}
            <div className="flex items-center gap-1">
              <Input
                type="number"
                min={1}
                max={120}
                value={activeMinutes}
                onChange={(e) => setMinutes(Number(e.target.value) || 1)}
                disabled={isRunning}
                className="h-7 w-16 text-center text-xs"
                aria-label="타이머 분"
              />
              <span className="text-xs text-muted-foreground">분</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={isRunning ? "secondary" : "default"}
              size="sm"
              className="gap-1.5"
              onClick={handleToggle}
            >
              {isRunning ? (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  일시정지
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  {remainingSec === durationSec ? "시작" : "계속"}
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={handleReset}
              disabled={!isRunning && remainingSec === durationSec}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              리셋
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showFinished} onOpenChange={setShowFinished}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>⏰ 타이머 종료</DialogTitle>
            <DialogDescription>
              설정한 시간이 모두 지났어요. 회고를 마무리하거나 다시 시작할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowFinished(false)}
            >
              닫기
            </Button>
            <Button
              onClick={() => {
                setShowFinished(false);
                handleReset();
              }}
            >
              다시 시작
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
