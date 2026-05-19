"use client";

import { useFormContext } from "react-hook-form";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import type { RetroFormValues } from "@/lib/retro/form-schema";

interface SectionDef {
  value: keyof Pick<RetroFormValues, "context" | "goal" | "analysis">;
  label: string;
  hint: string;
  placeholder: string;
}

const SECTIONS: SectionDef[] = [
  {
    value: "context",
    label: "배경 (Context)",
    hint: "어떤 상황에서 이 회고를 하나요?",
    placeholder: "예: 2주 스프린트가 끝났고, 신규 결제 모듈 출시 직후입니다.",
  },
  {
    value: "goal",
    label: "목표 (Goal)",
    hint: "이 회고로 무엇을 얻고 싶나요?",
    placeholder: "예: 다음 스프린트에서 적용할 개선점 3가지를 도출.",
  },
  {
    value: "analysis",
    label: "분석 (Analysis)",
    hint: "참고할 사전 분석이나 데이터가 있나요?",
    placeholder: "예: 결제 성공률 12% 증가, 응답시간 평균 80ms 감소.",
  },
];

export function ContextAccordion() {
  const { register, formState } = useFormContext<RetroFormValues>();

  return (
    <Accordion className="overflow-hidden rounded-2xl border bg-card">
      {SECTIONS.map((section, idx) => {
        const error = formState.errors[section.value];
        return (
          <AccordionItem
            key={section.value}
            value={section.value}
            className={idx === SECTIONS.length - 1 ? "border-b-0" : undefined}
          >
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-sm font-medium">{section.label}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {section.hint}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <Textarea
                placeholder={section.placeholder}
                rows={4}
                className="resize-y"
                {...register(section.value)}
              />
              {error?.message && (
                <p className="mt-1.5 text-xs text-destructive">
                  {error.message}
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
