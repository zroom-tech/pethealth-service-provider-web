import { CheckupRecordForm } from "./client";

export default function NewCheckupRecordPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">진단 기록 등록</h1>
        <p className="text-sm text-muted-foreground">
          고객의 반려동물 진단 기록을 등록합니다
        </p>
      </div>

      <CheckupRecordForm />
    </div>
  );
}
