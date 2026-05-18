import { PageStub } from "@/components/common/PageStub";

export default async function EditRetroPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <PageStub
      title="회고 수정"
      phase="Phase 5"
      description={`회고 ID: ${id} — 등록 화면과 동일한 UI로 기존 데이터를 수정합니다.`}
    />
  );
}
