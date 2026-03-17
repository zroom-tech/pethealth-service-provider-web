import { getCheckupRecord, getUserPets } from "../actions";
import { CheckupDetailForm } from "./client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CheckupDetailPage({ params }: Props) {
  const { id } = await params;
  const record = await getCheckupRecord(Number(id));

  const user = record.users as unknown as {
    id: number;
    name: string | null;
    user_name: string | null;
  };
  const pet = record.pet_profiles as unknown as {
    id: number;
    name: string | null;
    species: string | null;
    breed: string | null;
  } | null;

  const pets = await getUserPets(user.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">진단 기록 상세</h1>
        <p className="text-sm text-muted-foreground">
          진단 기록을 확인하고 수정할 수 있습니다
        </p>
      </div>

      <CheckupDetailForm
        record={{
          id: record.id,
          checkupDate: record.checkup_date,
          description: record.description,
          imageUrls: (record.image_urls ?? []) as string[],
          petProfileId: record.pet_profile_id,
        }}
        customer={{ id: user.id, name: user.name, userName: user.user_name }}
        pet={pet as { id: number; name: string; species: string | null; breed: string | null } | null}
        pets={pets as { id: number; name: string; species: string | null; breed: string | null }[]}
      />
    </div>
  );
}
