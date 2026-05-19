import { format, formatDistanceToNowStrict, isThisMonth, parseISO } from "date-fns";
import { ko } from "date-fns/locale";

export function todayISODate(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function toISODate(value: string | Date): string {
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, "yyyy-MM-dd");
}

export function formatRetroDate(value: string): string {
  return format(parseISO(value), "yyyy.MM.dd");
}

export function formatRetroDateLong(value: string): string {
  return format(parseISO(value), "yyyy년 M월 d일 (E)", { locale: ko });
}

export function formatRelative(value: string): string {
  return formatDistanceToNowStrict(parseISO(value), {
    addSuffix: true,
    locale: ko,
  });
}

export function isInCurrentMonth(value: string): boolean {
  return isThisMonth(parseISO(value));
}
