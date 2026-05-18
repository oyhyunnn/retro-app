import { PageStub } from "@/components/common/PageStub";

export default async function RetroSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <PageStub
      title="회고 진행 대시보드"
      phase="Phase 4"
      description={`회고 ID: ${id} — 타이머, 방법론별 작성 영역, 팀 회고용 포스트잇 화이트보드를 제공합니다.`}
    />
  );
}
