"use server";

import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import { COOKIE_PROVIDER_ID } from "@/lib/auth";
import { PAGE_SIZE } from "@/lib/constants";

async function getProviderId() {
  const cookieStore = await cookies();
  const id = cookieStore.get(COOKIE_PROVIDER_ID)?.value;
  if (!id) throw new Error("인증이 필요합니다.");
  return Number(id);
}

export async function getCustomers(page: number, search?: string) {
  const providerId = await getProviderId();
  const supabase = createAdminClient();

  // partner_customers에서 user_id 목록 조회
  let query = supabase
    .from("partner_customers")
    .select("user_id, created_at, users!inner(id, name, user_name, email, phone)", {
      count: "exact",
    })
    .eq("partner_id", providerId)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,user_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`,
      { referencedTable: "users" },
    );
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, count, error } = await query.range(from, to);

  if (error) {
    console.error("getCustomers error:", error);
    throw new Error("고객 목록을 불러올 수 없습니다.");
  }

  const customers = (data ?? []).map((row) => {
    const user = row.users as unknown as {
      id: number;
      name: string | null;
      user_name: string | null;
      email: string | null;
      phone: string | null;
    };
    return {
      id: user.id,
      name: user.name,
      userName: user.user_name,
      email: user.email,
      phone: user.phone,
      registeredAt: row.created_at,
    };
  });

  return { customers, total: count ?? 0 };
}

export async function getCustomerDetail(userId: number) {
  const providerId = await getProviderId();
  const supabase = createAdminClient();

  // 해당 파트너의 고객인지 확인
  const { data: link } = await supabase
    .from("partner_customers")
    .select("id")
    .eq("partner_id", providerId)
    .eq("user_id", userId)
    .single();

  if (!link) throw new Error("고객 정보를 찾을 수 없습니다.");

  // 사용자 정보
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, name, user_name, email, phone, created_at")
    .eq("id", userId)
    .single();

  if (userError || !user) throw new Error("사용자 정보를 불러올 수 없습니다.");

  // 반려동물 목록
  const { data: pets, error: petsError } = await supabase
    .from("pet_profiles")
    .select(
      "id, name, species, breed, gender, birth_date, weight_kg, created_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (petsError) {
    console.error("getCustomerDetail pets error:", petsError);
  }

  return { user, pets: pets ?? [] };
}
