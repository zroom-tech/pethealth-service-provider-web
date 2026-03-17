import { getPartner } from "./actions";
import { SettingsForm } from "./client";

export default async function SettingsPage() {
  const partner = await getPartner();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">설정</h1>
        <p className="text-sm text-muted-foreground">
          파트너 정보 및 계정 설정을 관리합니다
        </p>
      </div>

      <SettingsForm partner={partner} />
    </div>
  );
}
