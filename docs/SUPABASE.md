# SUPABASE.md — Supabase 설정

## SQL Functions (RPC)

### 인증/사용자

| 함수 | 설명 | 비고 |
|------|------|------|
| `current_user_id()` | `auth.uid()` (UUID) → `users.id` (BIGINT) 변환 | RLS에서 표준으로 사용 |
| `handle_new_auth_user()` | auth.users 생성 시 `public.users` 자동 생성 (트리거) | Google 로그인 시 자동 실행 |
| `fetch_user_stats(p_user_id)` | total_exp, total_points, total_gems, membership_expires_at 조회 | |

### 재화 관리

| 함수 | 설명 | 비고 |
|------|------|------|
| `add_exp(p_user_id, p_amount)` | EXP 추가 | total_exp에 누적 |
| `add_points(p_user_id, p_amount, p_reason)` | 포인트 추가 + 거래 기록 | amount > 0 검증 |
| `add_gems(p_user_id, p_amount, p_reason)` | 젬 추가 + 거래 기록 | amount > 0 검증 |
| `add_reward(p_user_id, p_exp, p_points)` | EXP + 포인트 동시 추가 | 미션 완료 보상용 |
| `spend_points(p_user_id, p_amount, p_reason)` | 포인트 차감 + 거래 기록 | 잔액 부족 시 에러 |
| `spend_gems(p_user_id, p_amount, p_reason)` | 젬 차감 + 거래 기록 | 잔액 부족 시 에러 |

### 멤버십

| 함수 | 설명 | 비고 |
|------|------|------|
| `activate_membership(p_user_id, p_days)` | 멤버십 활성화 (기본 30일) | 시간 23:59:59 UTC 고정 |
| `set_membership_expiry(p_user_id, p_expires_at)` | 멤버십 만료일 직접 설정 | RevenueCat 구독 연동용 |

### 계정 관리

| 함수 | 설명 | 비고 |
|------|------|------|
| `check_deleted_account(p_provider, p_provider_id)` | 탈퇴 계정 재가입 제한 확인 | `{ blocked: bool, remaining_days: int }` 반환 |

### 메일/마이그레이션

| 함수 | 설명 | 비고 |
|------|------|------|
| `claim_mail(p_user_id, p_mail_ids)` | 메일 보상 일괄 수령 | points/gems/exp/items 지원, 만료 체크 |
| `migrate_local_stats(p_user_id, p_exp, p_points, p_gems)` | 로컬 재화 → 서버 마이그레이션 (1회성) | 서버에 이미 데이터 있으면 스킵 |

### 파트너 연동

| 함수 | 설명 | 비고 |
|------|------|------|
| `register_partner_customer(p_partner_id)` | QR 스캔으로 파트너-사용자 연결 등록 | SECURITY DEFINER, 중복 시 무시, 파트너 정보 jsonb 반환 |

---

## Edge Functions (Deno)

### delete-account
- **경로**: `supabase/functions/delete-account/index.ts`
- **역할**: 계정 완전 삭제
- **처리 순서**:
  1. JWT 토큰 검증
  2. Storage 파일 삭제 (community-images, food-images)
  3. `deleted_accounts` 기록 (7일 재가입 제한)
  4. 관련 테이블 전체 삭제 (산책/식단/체중/대변/미용/검진/인벤토리/거래/메일/커뮤니티/미션/펫프로필)
  5. auth user 삭제

### write-pet-friend-comment
- **경로**: `supabase/functions/write-pet-friend-comment/index.ts`
- **역할**: AI 반려일기에 친구 펫 댓글 생성
- **AI 모델**: Gemini 2.0 Flash
- **입력**: diaryContent, myPetName, myPetPersonalityNames, friendPetName
- **출력**: `{ comment: string, comment_en: string }` (한국어/영어)

---

## Storage 버킷

| 버킷 | 용도 | 접근 |
|------|------|------|
| `community-images` | 커뮤니티 게시글 이미지 | 인증 사용자 업로드, 공개 읽기 |
| `food-images` | 사료 촬영 이미지 | 인증 사용자 업로드 |
| `poop-bags` | 배변봉투 인증 이미지 | 인증 사용자 업로드 |
| `pet-health-images` | 범용 이미지 (프로필, 산책, 문의 등) | 인증 사용자 업로드, 공개 읽기 |

---

## CORS

`supabase/functions/_shared/cors.ts`에서 공통 CORS 헤더 관리:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
