"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
import { createAdminClient } from "@/lib/supabase/server";
import { COOKIE_PROVIDER_ID } from "@/lib/auth";

async function getProviderId() {
  const cookieStore = await cookies();
  const id = cookieStore.get(COOKIE_PROVIDER_ID)?.value;
  if (!id) throw new Error("인증이 필요합니다.");
  return Number(id);
}

export async function getPartner() {
  const providerId = await getProviderId();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("partners")
    .select(
      "id, email, name, category, phone, country, city, address1, address2, instagram_url, website_url, description",
    )
    .eq("id", providerId)
    .single();

  if (error || !data) throw new Error("파트너 정보를 불러올 수 없습니다.");
  return data;
}

export async function updatePartner(
  _prev: { success?: boolean; error?: string } | null,
  formData: FormData,
) {
  const providerId = await getProviderId();
  const name = (formData.get("name") as string)?.trim();
  const category = formData.get("category") as string;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const country = (formData.get("country") as string)?.trim() || null;
  const city = (formData.get("city") as string)?.trim() || null;
  const address1 = (formData.get("address1") as string)?.trim() || null;
  const address2 = (formData.get("address2") as string)?.trim() || null;
  const instagramUrl =
    (formData.get("instagram_url") as string)?.trim() || null;
  const websiteUrl = (formData.get("website_url") as string)?.trim() || null;
  const description =
    (formData.get("description") as string)?.trim() || null;

  if (!name || !category) {
    return { error: "사업체명과 업종은 필수 항목입니다." };
  }

  const validCategories = ["동물미용", "동물병원", "동물호텔", "용품판매점"];
  if (!validCategories.includes(category)) {
    return { error: "올바른 업종을 선택해주세요." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("partners")
    .update({
      name,
      category,
      phone,
      country,
      city,
      address1,
      address2,
      instagram_url: instagramUrl,
      website_url: websiteUrl,
      description,
    })
    .eq("id", providerId);

  if (error) {
    console.error("updatePartner error:", error);
    return { error: `정보 수정에 실패했습니다: ${error.message}` };
  }

  revalidatePath("/settings");
  return { success: true };
}

export async function changePassword(
  _prev: { success?: boolean; error?: string } | null,
  formData: FormData,
) {
  const providerId = await getProviderId();
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const newPasswordConfirm = formData.get("newPasswordConfirm") as string;

  if (!currentPassword || !newPassword || !newPasswordConfirm) {
    return { error: "모든 항목을 입력해주세요." };
  }

  if (newPassword.length < 8) {
    return { error: "새 비밀번호는 8자 이상이어야 합니다." };
  }

  if (newPassword !== newPasswordConfirm) {
    return { error: "새 비밀번호가 일치하지 않습니다." };
  }

  const supabase = createAdminClient();
  const { data: partner, error: fetchError } = await supabase
    .from("partners")
    .select("password")
    .eq("id", providerId)
    .single();

  if (fetchError || !partner) {
    return { error: "계정 정보를 확인할 수 없습니다." };
  }

  const passwordMatch = await bcrypt.compare(currentPassword, partner.password);
  if (!passwordMatch) {
    return { error: "현재 비밀번호가 일치하지 않습니다." };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  const { error: updateError } = await supabase
    .from("partners")
    .update({ password: hashedPassword })
    .eq("id", providerId);

  if (updateError) {
    return { error: "비밀번호 변경에 실패했습니다. 다시 시도해주세요." };
  }

  return { success: true };
}
