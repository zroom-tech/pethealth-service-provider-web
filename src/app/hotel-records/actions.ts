"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { COOKIE_PROVIDER_ID } from "@/lib/auth";
import { PAGE_SIZE } from "@/lib/constants";

async function getProviderId() {
  const cookieStore = await cookies();
  const id = cookieStore.get(COOKIE_PROVIDER_ID)?.value;
  if (!id) throw new Error("인증이 필요합니다.");
  return Number(id);
}

export async function getHotelRecords(page: number) {
  const providerId = await getProviderId();
  const supabase = createAdminClient();

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count, error } = await supabase
    .from("user_walk_records")
    .select(
      "id, started_at, ended_at, memo, image_urls, created_at, user_id, pet_profile_id, users(name, user_name), pet_profiles(name, species)",
      { count: "exact" },
    )
    .eq("partner_id", providerId)
    .order("started_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("getHotelRecords error:", error);
    throw new Error("호텔링 기록을 불러올 수 없습니다.");
  }

  return { records: data ?? [], total: count ?? 0 };
}

export async function searchPartnerCustomers(query: string) {
  const providerId = await getProviderId();
  const supabase = createAdminClient();

  let request = supabase
    .from("partner_customers")
    .select("user_id, users!inner(id, name, user_name)")
    .eq("partner_id", providerId);

  if (query.trim()) {
    request = request.or(
      `name.ilike.%${query.trim()}%,user_name.ilike.%${query.trim()}%`,
      { referencedTable: "users" },
    );
  }

  const { data, error } = await request
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("searchPartnerCustomers error:", error);
    return [];
  }

  return (data ?? []).map((row) => {
    const user = row.users as unknown as {
      id: number;
      name: string | null;
      user_name: string | null;
    };
    return { id: user.id, name: user.name, userName: user.user_name };
  });
}

export async function getUserPets(userId: number) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("pet_profiles")
    .select("id, name, species, breed")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getUserPets error:", error);
    return [];
  }

  return data ?? [];
}

export async function getHotelRecord(id: number) {
  const providerId = await getProviderId();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("user_walk_records")
    .select(
      "id, started_at, ended_at, memo, image_urls, user_id, pet_profile_id, created_at, users(id, name, user_name), pet_profiles(id, name, species, breed)",
    )
    .eq("id", id)
    .eq("partner_id", providerId)
    .single();

  if (error || !data) throw new Error("호텔링 기록을 찾을 수 없습니다.");
  return data;
}

export async function updateHotelRecord(
  _prev: { success?: boolean; error?: string } | null,
  formData: FormData,
) {
  const providerId = await getProviderId();
  const supabase = createAdminClient();

  const recordId = Number(formData.get("record_id"));
  const checkinDate = formData.get("checkin_date") as string;
  const checkoutDate = formData.get("checkout_date") as string;
  const memo = (formData.get("memo") as string)?.trim() || null;
  const existingUrls = formData.getAll("existing_urls") as string[];

  if (!recordId || !checkinDate || !checkoutDate) {
    return { error: "체크인/체크아웃 날짜는 필수 항목입니다." };
  }

  const imageFiles = formData.getAll("images") as File[];
  const newUrls: string[] = [];

  for (const file of imageFiles) {
    if (!file.size) continue;
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `hotels/${providerId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("pet-health-images")
      .upload(path, buffer, { contentType: file.type });

    if (uploadError) {
      console.error("upload error:", uploadError);
      continue;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("pet-health-images").getPublicUrl(path);
    newUrls.push(publicUrl);
  }

  const allUrls = [...existingUrls, ...newUrls];

  const { error } = await supabase
    .from("user_walk_records")
    .update({
      started_at: `${checkinDate}T12:00:00`,
      ended_at: `${checkoutDate}T12:00:00`,
      memo,
      image_urls: allUrls.length > 0 ? allUrls : null,
    })
    .eq("id", recordId)
    .eq("partner_id", providerId);

  if (error) {
    console.error("updateHotelRecord error:", error);
    return { error: `수정에 실패했습니다: ${error.message}` };
  }

  revalidatePath("/hotel-records");
  revalidatePath(`/hotel-records/${recordId}`);
  return { success: true };
}

export async function createHotelRecord(
  _prev: { success?: boolean; error?: string } | null,
  formData: FormData,
) {
  const providerId = await getProviderId();
  const supabase = createAdminClient();

  const userId = Number(formData.get("user_id"));
  const petProfileId = Number(formData.get("pet_profile_id")) || null;
  const checkinDate = formData.get("checkin_date") as string;
  const checkoutDate = formData.get("checkout_date") as string;
  const memo = (formData.get("memo") as string)?.trim() || null;

  if (!userId || !checkinDate || !checkoutDate) {
    return { error: "고객과 체크인/체크아웃 날짜는 필수 항목입니다." };
  }

  const { data: partner } = await supabase
    .from("partners")
    .select("name")
    .eq("id", providerId)
    .single();

  const imageFiles = formData.getAll("images") as File[];
  const imageUrls: string[] = [];

  for (const file of imageFiles) {
    if (!file.size) continue;
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `hotels/${providerId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("pet-health-images")
      .upload(path, buffer, { contentType: file.type });

    if (uploadError) {
      console.error("upload error:", uploadError);
      continue;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("pet-health-images").getPublicUrl(path);
    imageUrls.push(publicUrl);
  }

  // started_at/ended_at에 날짜를 타임스탬프로 저장 (정오 기준)
  const { error } = await supabase.from("user_walk_records").insert({
    user_id: userId,
    pet_profile_id: petProfileId,
    started_at: `${checkinDate}T12:00:00`,
    ended_at: `${checkoutDate}T12:00:00`,
    duration_seconds: 0,
    distance_meters: 0,
    steps: 0,
    memo,
    partner_name: partner?.name ?? null,
    image_urls: imageUrls.length > 0 ? imageUrls : null,
    partner_id: providerId,
  });

  if (error) {
    console.error("createHotelRecord error:", error);
    return { error: `호텔링 기록 등록에 실패했습니다: ${error.message}` };
  }

  revalidatePath("/hotel-records");
  return { success: true };
}
