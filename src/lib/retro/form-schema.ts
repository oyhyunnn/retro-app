import { z } from "zod";

const milestoneSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "마일스톤 이름을 입력해 주세요"),
  date: z.string().min(1, "날짜를 선택해 주세요"),
  description: z.string().max(500).optional(),
});

export const retroFormSchema = z
  .object({
    title: z
      .string()
      .min(1, "제목을 입력해 주세요")
      .max(100, "제목은 100자 이내로 작성해 주세요"),
    type: z.enum(["personal", "team"]),
    method: z.enum(["KPT", "4L", "5Whys", "StartStopContinue"]),
    retroDate: z.string().min(1, "회고 일자를 선택해 주세요"),

    context: z.string().max(2000, "2000자 이내로 작성해 주세요").optional(),
    goal: z.string().max(2000, "2000자 이내로 작성해 주세요").optional(),
    analysis: z.string().max(2000, "2000자 이내로 작성해 주세요").optional(),

    teamInfo: z
      .object({
        teamName: z.string().max(50, "50자 이내로 작성해 주세요").optional(),
        participants: z.array(z.string()),
        timeline: z.object({
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          milestones: z.array(milestoneSchema),
        }),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type !== "team") return;
    const timeline = data.teamInfo?.timeline;
    if (!timeline?.startDate) {
      ctx.addIssue({
        code: "custom",
        path: ["teamInfo", "timeline", "startDate"],
        message: "프로젝트 시작일을 선택해 주세요",
      });
    }
    if (!timeline?.endDate) {
      ctx.addIssue({
        code: "custom",
        path: ["teamInfo", "timeline", "endDate"],
        message: "프로젝트 종료일을 선택해 주세요",
      });
    }
    if (
      timeline?.startDate &&
      timeline?.endDate &&
      timeline.startDate > timeline.endDate
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["teamInfo", "timeline", "endDate"],
        message: "종료일은 시작일 이후여야 합니다",
      });
    }
  });

export type RetroFormValues = z.infer<typeof retroFormSchema>;

export const EMPTY_TEAM_INFO: NonNullable<RetroFormValues["teamInfo"]> = {
  teamName: "",
  participants: [],
  timeline: {
    startDate: "",
    endDate: "",
    milestones: [],
  },
};
