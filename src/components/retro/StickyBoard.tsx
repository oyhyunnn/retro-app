"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { RetroMethod, StickyColor, StickyNote } from "@/types/retro";

interface CategoryDef {
  key: string;
  label: string;
  hint?: string;
  headerClass: string;
}

const CATEGORIES: Record<RetroMethod, CategoryDef[]> = {
  KPT: [
    {
      key: "keep",
      label: "Keep",
      hint: "잘하고 있는 것",
      headerClass:
        "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    },
    {
      key: "problem",
      label: "Problem",
      hint: "문제점",
      headerClass: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    },
    {
      key: "try",
      label: "Try",
      hint: "시도해볼 것",
      headerClass: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    },
  ],
  "4L": [
    {
      key: "liked",
      label: "Liked",
      hint: "좋았던 것",
      headerClass:
        "bg-violet-500/15 text-violet-700 dark:text-violet-300",
    },
    {
      key: "learned",
      label: "Learned",
      hint: "배운 것",
      headerClass: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    },
    {
      key: "lacked",
      label: "Lacked",
      hint: "부족했던 것",
      headerClass:
        "bg-orange-500/15 text-orange-700 dark:text-orange-300",
    },
    {
      key: "longedFor",
      label: "Longed for",
      hint: "바랐던 것",
      headerClass: "bg-pink-500/15 text-pink-700 dark:text-pink-300",
    },
  ],
  StartStopContinue: [
    {
      key: "start",
      label: "Start",
      hint: "시작할 것",
      headerClass:
        "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    },
    {
      key: "stop",
      label: "Stop",
      hint: "중단할 것",
      headerClass: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    },
    {
      key: "continueItems",
      label: "Continue",
      hint: "계속할 것",
      headerClass:
        "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    },
  ],
  "5Whys": [
    {
      key: "general",
      label: "포스트잇",
      hint: "5 Whys 토론 메모",
      headerClass:
        "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    },
  ],
};

const COLORS: StickyColor[] = ["yellow", "pink", "blue", "green", "purple"];

const COLOR_CLASS: Record<StickyColor, string> = {
  yellow: "bg-yellow-200 text-yellow-950",
  pink: "bg-pink-200 text-pink-950",
  blue: "bg-sky-200 text-sky-950",
  green: "bg-emerald-200 text-emerald-950",
  purple: "bg-violet-200 text-violet-950",
};

const COLOR_LABEL: Record<StickyColor, string> = {
  yellow: "노랑",
  pink: "분홍",
  blue: "하늘",
  green: "초록",
  purple: "보라",
};

interface DraftNote {
  id?: string;
  category: string;
  author: string;
  content: string;
  color: StickyColor;
}

interface Props {
  method: RetroMethod;
  notes: StickyNote[];
  participants: string[];
  onChange: (notes: StickyNote[]) => void;
}

export function StickyBoard({
  method,
  notes,
  participants,
  onChange,
}: Props) {
  const categories = CATEGORIES[method];

  const notesByCategory = useMemo(() => {
    const map: Record<string, StickyNote[]> = {};
    for (const cat of categories) map[cat.key] = [];
    for (const note of notes) {
      if (map[note.category] === undefined) {
        map[categories[0].key].push({ ...note, category: categories[0].key });
      } else {
        map[note.category].push(note);
      }
    }
    return map;
  }, [notes, categories]);

  const [draft, setDraft] = useState<DraftNote | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeIdx = notes.findIndex((n) => n.id === activeId);
    if (activeIdx === -1) return;
    const activeNote = notes[activeIdx];

    const overNote = notes.find((n) => n.id === overId);
    const overCategory = overNote?.category ?? overId;
    if (!categories.some((c) => c.key === overCategory)) return;

    let next = [...notes];

    if (activeNote.category !== overCategory) {
      next = next.map((n) =>
        n.id === activeId ? { ...n, category: overCategory } : n,
      );
    }

    if (overNote) {
      const fromIdx = next.findIndex((n) => n.id === activeId);
      const toIdx = next.findIndex((n) => n.id === overId);
      if (fromIdx !== -1 && toIdx !== -1) {
        next = arrayMove(next, fromIdx, toIdx);
      }
    }

    onChange(next);
  };

  const openCreate = (category: string) => {
    setDraft({
      category,
      author: participants[0] ?? "",
      content: "",
      color: "yellow",
    });
  };

  const openEdit = (note: StickyNote) => {
    setDraft({
      id: note.id,
      category: note.category,
      author: note.author,
      content: note.content,
      color: note.color,
    });
  };

  const saveDraft = () => {
    if (!draft) return;
    const trimmed = draft.content.trim();
    if (!trimmed) return;
    if (draft.id) {
      onChange(
        notes.map((n) =>
          n.id === draft.id
            ? {
                ...n,
                category: draft.category,
                author: draft.author,
                content: trimmed,
                color: draft.color,
              }
            : n,
        ),
      );
    } else {
      const newNote: StickyNote = {
        id: crypto.randomUUID(),
        category: draft.category,
        author: draft.author,
        content: trimmed,
        color: draft.color,
        position: { x: 0, y: 0 },
        createdAt: new Date().toISOString(),
      };
      onChange([...notes, newNote]);
    }
    setDraft(null);
  };

  const deleteCurrent = () => {
    if (!draft?.id) return;
    onChange(notes.filter((n) => n.id !== draft.id));
    setDraft(null);
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <div
          className={cn(
            "grid grid-cols-1 gap-3",
            categories.length === 3 && "lg:grid-cols-3",
            categories.length === 4 && "lg:grid-cols-2 xl:grid-cols-4",
          )}
        >
          {categories.map((cat) => (
            <StickyColumn
              key={cat.key}
              category={cat}
              notes={notesByCategory[cat.key] ?? []}
              onAdd={() => openCreate(cat.key)}
              onEdit={openEdit}
            />
          ))}
        </div>
      </DndContext>

      <Dialog
        open={Boolean(draft)}
        onOpenChange={(open) => !open && setDraft(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {draft?.id ? "포스트잇 수정" : "포스트잇 추가"}
            </DialogTitle>
          </DialogHeader>

          {draft && (
            <div className="flex flex-col gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="sticky-content">내용</Label>
                <Textarea
                  id="sticky-content"
                  rows={4}
                  value={draft.content}
                  onChange={(e) =>
                    setDraft({ ...draft, content: e.target.value })
                  }
                  autoFocus
                  placeholder="포스트잇에 적을 내용"
                />
              </div>

              <div className="grid gap-1.5">
                <Label>작성자</Label>
                {participants.length > 0 ? (
                  <Select
                    value={draft.author || undefined}
                    onValueChange={(value) =>
                      setDraft({ ...draft, author: value ?? "" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="참여자 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {participants.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={draft.author}
                    onChange={(e) =>
                      setDraft({ ...draft, author: e.target.value })
                    }
                    placeholder="작성자 이름 입력"
                  />
                )}
              </div>

              <div className="grid gap-1.5">
                <Label>색상</Label>
                <div className="flex flex-wrap gap-1.5">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setDraft({ ...draft, color })}
                      className={cn(
                        "h-8 w-8 rounded-full border-2 transition",
                        COLOR_CLASS[color],
                        draft.color === color
                          ? "border-foreground"
                          : "border-transparent hover:border-muted-foreground",
                      )}
                      aria-label={COLOR_LABEL[color]}
                      title={COLOR_LABEL[color]}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-row items-center justify-between sm:justify-between">
            {draft?.id ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="gap-1"
                onClick={deleteCurrent}
              >
                <Trash2 className="h-3.5 w-3.5" />
                삭제
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDraft(null)}
              >
                취소
              </Button>
              <Button
                type="button"
                onClick={saveDraft}
                disabled={!draft?.content.trim()}
              >
                저장
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function StickyColumn({
  category,
  notes,
  onAdd,
  onEdit,
}: {
  category: CategoryDef;
  notes: StickyNote[];
  onAdd: () => void;
  onEdit: (note: StickyNote) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: category.key });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col gap-3 rounded-2xl border bg-muted/30 p-3 transition",
        isOver && "ring-2 ring-primary/40",
      )}
    >
      <header className="flex items-center justify-between">
        <div
          className={cn(
            "rounded-md px-2 py-0.5 text-xs font-semibold",
            category.headerClass,
          )}
        >
          <span>{category.label}</span>
          {category.hint && (
            <span className="ml-1.5 font-normal opacity-80">
              {category.hint}
            </span>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground">
          {notes.length}개
        </span>
      </header>

      <SortableContext
        items={notes.map((n) => n.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="flex min-h-[80px] flex-col gap-2">
          {notes.map((note, idx) => (
            <SortableSticky
              key={note.id}
              note={note}
              index={idx}
              onClick={() => onEdit(note)}
            />
          ))}
        </ul>
      </SortableContext>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="gap-1"
        onClick={onAdd}
      >
        <Plus className="h-3.5 w-3.5" />
        포스트잇 추가
      </Button>
    </div>
  );
}

function SortableSticky({
  note,
  index,
  onClick,
}: {
  note: StickyNote;
  index: number;
  onClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id });

  const rotate = ((note.id.charCodeAt(0) + index) % 5) - 2;

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    rotate: `${rotate}deg`,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "cursor-grab rounded-md p-3 shadow-md transition select-none",
        "hover:scale-[1.02] hover:shadow-lg active:cursor-grabbing",
        COLOR_CLASS[note.color],
        isDragging && "opacity-50",
      )}
    >
      <p className="whitespace-pre-wrap text-sm leading-snug">
        {note.content}
      </p>
      {note.author && (
        <p className="mt-2 text-[10px] font-medium opacity-70">
          — {note.author}
        </p>
      )}
    </li>
  );
}
