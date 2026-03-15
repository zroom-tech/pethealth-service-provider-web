import { NextRequest, NextResponse } from "next/server";

const COOKIE_SESSION = "provider_session";
const COOKIE_PROVIDER_ID = "provider_id";

async function makeToken(providerId: string): Promise<string> {
  const secret =
    process.env.SESSION_SECRET ?? "pethealth-provider-session-secret";
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(providerId),
  );
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_SESSION)?.value;
  const providerId = request.cookies.get(COOKIE_PROVIDER_ID)?.value;

  if (!token || !providerId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const expected = await makeToken(providerId);
  if (token !== expected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
