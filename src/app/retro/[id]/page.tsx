import { PageStub } from "@/components/common/PageStub";

export default async function RetroDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <PageStub
      title="회고 상세 보기"
      phase="Phase 5"
      description={`회고 ID: ${id} — 상세 내용을 표시하고 수정·삭제·PDF 다운로드를 제공합니다.`}
    />
  );
}
