"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac } from "crypto";
import bcrypt from "bcrypt";
import { createAdminClient } from "@/lib/supabase/server";
import { COOKIE_SESSION, COOKIE_PROVIDER_ID, COOKIE_MAX_AGE } from "@/lib/auth";

const SESSION_SECRET =
  process.env.SESSION_SECRET ?? "pethealth-provider-session-secret";

function makeToken(providerId: string): string {
  return createHmac("sha256", SESSION_SECRET)
    .update(providerId)
    .digest("hex");
}

async function setSessionCookies(providerId: number) {
  const token = makeToken(String(providerId));
  const cookieStore = await cookies();
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  };

  cookieStore.set(COOKIE_SESSION, token, options);
  cookieStore.set(COOKIE_PROVIDER_ID, String(providerId), options);
}

export async function login(
  _prev: { error: string } | null,
  formData: FormData,
) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력해주세요." };
  }

  const supabase = createAdminClient();
  const { data: provider, error } = await supabase
    .from("partners")
    .select("id, password")
    .eq("email", email)
    .single();

  if (error || !provider) {
    return { error: "이메일 또는 비밀번호가 일치하지 않습니다." };
  }

  const passwordMatch = await bcrypt.compare(password, provider.password);
  if (!passwordMatch) {
    return { error: "이메일 또는 비밀번호가 일치하지 않습니다." };
  }

  await setSessionCookies(provider.id);
  redirect("/");
}

export async function signup(
  _prev: { error: string } | null,
  formData: FormData,
) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const passwordConfirm = formData.get("passwordConfirm") as string;
  const name = (formData.get("name") as string)?.trim();
  const category = formData.get("category") as string;
  const country = (formData.get("country") as string)?.trim() || null;
  const city = (formData.get("city") as string)?.trim() || null;
  const address1 = (formData.get("address1") as string)?.trim() || null;
  const address2 = (formData.get("address2") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const instagramUrl =
    (formData.get("instagram_url") as string)?.trim() || null;
  const websiteUrl = (formData.get("website_url") as string)?.trim() || null;
  const description =
    (formData.get("description") as string)?.trim() || null;

  if (!email || !password || !name || !category) {
    return { error: "필수 항목을 모두 입력해주세요." };
  }

  if (password.length < 8) {
    return { error: "비밀번호는 8자 이상이어야 합니다." };
  }

  if (password !== passwordConfirm) {
    return { error: "비밀번호가 일치하지 않습니다." };
  }

  const validCategories = ["동물미용", "동물병원", "동물호텔", "용품판매점"];
  if (!validCategories.includes(category)) {
    return { error: "올바른 업종을 선택해주세요." };
  }

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("partners")
    .select("id")
    .eq("email", email)
    .single();

  if (existing) {
    return { error: "이미 등록된 이메일입니다." };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const { data: newProvider, error: insertError } = await supabase
    .from("partners")
    .insert({
      email,
      password: hashedPassword,
      name,
      category,
      country,
      city,
      address1,
      address2,
      phone,
      instagram_url: instagramUrl,
      website_url: websiteUrl,
      description,
    })
    .select("id")
    .single();

  if (insertError || !newProvider) {
    return { error: "회원가입에 실패했습니다. 다시 시도해주세요." };
  }

  await setSessionCookies(newProvider.id);
  redirect("/");
}

export async function checkEmail(email: string): Promise<{ available: boolean; message: string }> {
  const trimmed = email?.trim().toLowerCase();
  if (!trimmed) {
    return { available: false, message: "이메일을 입력해주세요." };
  }

  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("partners")
    .select("id")
    .eq("email", trimmed)
    .single();

  if (existing) {
    return { available: false, message: "이미 등록된 이메일입니다." };
  }

  return { available: true, message: "사용 가능한 이메일입니다." };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_SESSION);
  cookieStore.delete(COOKIE_PROVIDER_ID);
  redirect("/login");
}
