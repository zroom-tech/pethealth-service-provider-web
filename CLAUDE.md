# PetHealth Service Provider Web — CLAUDE.md

## 프로젝트 개요

반려동물 건강 관리 서비스 **PetHealth**의 **서비스 제공자(동물병원, 미용샵, 호텔) 어드민 웹 애플리케이션**.
사업체가 고객의 반려동물에 대한 진단기록, 미용기록, 호텔링기록을 관리하고 유저에게 전송하는 서비스 제공자 전용 관리 도구.

**반응형 웹 애플리케이션** — 데스크톱과 모바일 모두 지원하는 반응형 디자인으로 구현.

### 핵심 기능

- **진단 기록 관리** — 동물병원에서 검진/진단 결과를 기록하고 보호자에게 전송
- **미용 기록 관리** — 미용샵에서 미용 내역(사진 포함)을 기록하고 보호자에게 전송
- **호텔링 기록 관리** — 반려동물 호텔에서 호텔링 기간 중 관리 기록을 보호자에게 전송
- **고객(보호자) 연결** — 반려동물 보호자의 PetHealth 앱과 연동
- **사업체 프로필 관리** — 사업체 정보, 직원 관리

### 관련 프로젝트

- **pethealth** — Flutter 모바일 앱 (보호자용)
- **pethealth-admin** — 내부 운영 어드민 (동일한 프로젝트 구조 참고)

## 기술 스택

| 항목 | 기술 |
|------|------|
| Framework | Next.js 16+ (App Router) |
| Language | TypeScript 5 (strict mode) |
| React | React 19 |
| Styling | Tailwind CSS v4 + PostCSS |
| UI Components | Shadcn/ui (new-york style, Radix UI 기반) |
| Icons | lucide-react |
| Toast | sonner |
| Theme | next-themes |
| Backend/DB | Supabase (PostgreSQL + Auth + Storage) |
| Package Manager | npm |

## 프로젝트 구조

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # 루트 레이아웃 (Toaster, AdminShell)
│   ├── page.tsx                 # 대시보드
│   ├── globals.css              # 글로벌 스타일 (Tailwind)
│   ├── error.tsx                # 에러 바운더리
│   ├── loading.tsx              # 로딩 상태
│   │
│   ├── login/                   # 로그인
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── actions.ts           # 서버 액션
│   │
│   ├── [기능별 라우트]/          # 각 기능 페이지
│   │   ├── page.tsx             # 목록 (Server Component)
│   │   ├── actions.ts           # 서버 액션 (mutations)
│   │   └── [id]/
│   │       ├── page.tsx         # 상세 페이지
│   │       └── client.tsx       # 클라이언트 컴포넌트
│   │
│   └── api/                     # API Route Handlers (필요 시)
│
├── components/
│   ├── layout/
│   │   ├── admin-shell.tsx      # 메인 레이아웃 (조건부 사이드바)
│   │   ├── sidebar.tsx          # 네비게이션 사이드바
│   │   └── header.tsx           # 모바일 헤더
│   │
│   ├── ui/                      # Shadcn/ui 컴포넌트
│   │   └── *.tsx
│   │
│   └── shared/                  # 공통 컴포넌트
│       ├── data-table.tsx       # 범용 테이블 + 페이지네이션
│       ├── image-preview.tsx    # 이미지 모달 뷰어
│       └── confirm-dialog.tsx   # 확인 다이얼로그
│
├── lib/
│   ├── constants.ts             # 네비게이션 아이템, PAGE_SIZE 등
│   ├── utils.ts                 # cn(), formatDate(), truncate()
│   ├── database.types.ts        # Supabase 자동 생성 타입
│   └── supabase/
│       └── server.ts            # createAdminClient()
│
└── middleware.ts                # 인증 미들웨어
```

## 코딩 컨벤션

### 네이밍

- **컴포넌트**: PascalCase (`AdminShell`, `DataTable`)
- **파일**: kebab-case (`admin-shell.tsx`, `data-table.tsx`)
- **함수**: camelCase (`createAdminClient`, `formatDate`)
- **상수**: UPPER_SNAKE_CASE (`PAGE_SIZE`, `COOKIE_NAME`)
- **타입/인터페이스**: PascalCase (`Tables<"users">`)

### 컴포넌트 패턴

- **Server Component** (기본) — 페이지 레벨, 데이터 페칭
- **Client Component** (`"use client"`) — 인터랙티브 UI만
- **Server Action** (`"use server"`) — 데이터 변경(mutations)
- 상태 관리 라이브러리 없음 — Server Components + Server Actions 패턴 사용
- 클라이언트 상태: `useState`, `useTransition` 사용

### 데이터 패턴

```typescript
// 목록 조회 (Server Component)
const supabase = createAdminClient();
const { data, count } = await supabase
  .from("table_name")
  .select("*", { count: "exact" })
  .order("created_at", { ascending: false })
  .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

// 데이터 변경 (Server Action)
"use server";
export async function updateRecord(id: number, data: Partial<Record>) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("table").update(data).eq("id", id);
  if (error) throw error;
  revalidatePath("/records");
}
```

### Import 규칙

- 경로 alias: `@/` → `src/`
- 예: `import { Button } from "@/components/ui/button"`
- Supabase 타입: `import { Tables } from "@/lib/database.types"`

### UI 패턴

- 목록 페이지: `DataTable` 컴포넌트 + 검색/필터 + 페이지네이션
- 상세 페이지: `Card` 레이아웃 + 필드별 표시
- 폼: Server Action 연동 + `useTransition` 로딩 상태
- 알림: `sonner` toast (`toast.success()`, `toast.error()`)
- 반응형: 모바일 우선 + `md:` 브레이크포인트

## Supabase 연동

- 클라이언트: `createAdminClient()` (service role key 사용)
- 환경 변수:
  - `NEXT_PUBLIC_SUPABASE_URL` — Supabase 프로젝트 URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — 클라이언트 키
  - `SUPABASE_SERVICE_ROLE_KEY` — 서버 전용 관리자 키
- 타입: `database.types.ts`에서 자동 생성된 타입 사용
- 이미지: Supabase Storage 사용 (`pet-health-images` 등)

## 인증

- 쿠키 기반 세션 (HMAC-SHA256)
- `admin_session` 쿠키 (httpOnly, 7일 만료)
- 미들웨어에서 보호 라우트 검증 → 미인증 시 `/login` 리다이렉트

## 핵심 문서

- [docs/FEATURES.md](docs/FEATURES.md) — PetHealth 앱 기능 명세 (모바일 앱 기준)
- [docs/SCHEMA.md](docs/SCHEMA.md) — 데이터베이스 스키마 (로컬 DB + Supabase)
- [docs/SUPABASE.md](docs/SUPABASE.md) — Supabase RPC, Edge Functions, Storage 설정

## 개발 명령어

```bash
npm run dev      # 개발 서버 시작
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # ESLint 검사
```

## Supabase 관리 (중앙화)

**DB 마이그레이션은 `pethealth` 프로젝트에서 중앙 관리합니다. 이 프로젝트에는 마이그레이션 파일이 없습니다.**

- 마이그레이션 생성/push: `pethealth/supabase/migrations/`에서 수행
- 스키마 타입: `src/lib/database.types.ts` (자동 생성 파일, 직접 수정 금지)
- 타입 재생성: `pethealth/`에서 `npx supabase gen types typescript --linked` 실행 후 복사

### 관련 프로젝트

| 프로젝트 | 역할 |
|---------|------|
| **pethealth** | Flutter 모바일 앱 + DB 마이그레이션 관리 |
| **pethealth-partners** (현재) | 서비스 제공자 웹 |
| **pethealth-admin** | 내부 운영 어드민 웹 + Edge Functions |

## 작업 시 주의사항

- Shadcn/ui 컴포넌트 추가 시: `npx shadcn@latest add [component]`
- 새 라우트 추가 시 `src/lib/constants.ts`의 네비게이션 아이템에도 추가
- **DB 스키마 변경이 필요하면 `pethealth` 프로젝트에서 마이그레이션 생성 후 타입 재생성**
- 이미지 URL은 `next.config.ts`의 `remotePatterns`에 Supabase 도메인 등록 필요
- 서버 컴포넌트에서 직접 데이터 페칭, 클라이언트 컴포넌트는 인터랙션만 담당
