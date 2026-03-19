import { getHotelRecord, getUserPets } from "../actions";
import { HotelDetailForm } from "./client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function HotelDetailPage({ params }: Props) {
  const { id } = await params;
  const record = await getHotelRecord(Number(id));

  const user = record.users as unknown as {
    id: number;
    name: string | null;
    user_name: string | null;
  };

  const pets = await getUserPets(user.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">호텔링 기록 상세</h1>
        <p className="text-sm text-muted-foreground">
          호텔링 기록을 확인하고 수정할 수 있습니다
        </p>
      </div>

      <HotelDetailForm
        record={{
          id: record.id,
          checkinDate: record.started_at?.slice(0, 10) ?? "",
          checkoutDate: record.ended_at?.slice(0, 10) ?? "",
          memo: record.memo,
          imageUrls: (record.image_urls ?? []) as string[],
          petProfileId: record.pet_profile_id,
        }}
        customer={{ id: user.id, name: user.name, userName: user.user_name }}
        pets={pets as { id: number; name: string; species: string | null; breed: string | null }[]}
      />
    </div>
  );
}
