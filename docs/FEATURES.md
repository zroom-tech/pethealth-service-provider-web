# FEATURES.md — 기능 명세

## 온보딩 플로우

```
Step 0: IntroScreen (Google 로그인 버튼)
  ↓ 로그인 성공
Step 1: PermissionScreen (카메라, 사진, 위치, 알림 권한)
  ├─ 복귀 유저 → Supabase에서 기존 데이터 복원 → /health
  └─ 신규 유저 → Step 2
Step 2: PetProfileSetupScreen (7페이지 프로필 폼)
  ↓
Step 3: WelcomeScreen → 로컬 DB + Supabase 저장 → /health
```

- 미인증 상태에서 앱 접근 시 → `/onboarding/intro?reason=auth_required` 리다이렉트 + 스낵바 피드백

## 메인 네비게이션 (4탭 + FAB)

| 탭 | 경로 | 화면 | 아이콘 |
|----|------|------|--------|
| 건강 | `/health` | HealthScreen | heart |
| 미션 | `/mission` | MissionScreen | flag |
| 샵 | `/shop` | ShopScreen | shoppingBag |
| 커뮤니티 | `/community` | CommunityScreen | messagesSquare |
| (FAB) | `/walk`, `/food` 등 | 산책, 식단 등 빠른 접근 | plus |

## 전체 라우트

```
/health                        # 건강 대시보드
/streak                        # 연속 출석
/stool-check, /stool-history   # 대변 체크
/grooming-record, /grooming-history  # 미용 기록
/checkup-record, /checkup-history    # 검진 기록
/poop-bag, /poop-bag-history, /poop-bag-detail  # 배변봉투 인증 (dog 전용)
/food, /food-history           # 식단
/walk, /walk-history           # 산책
/weight                        # 체중
/mission                       # 미션
/shop                          # 샵
/mail                          # 메일함
/community                     # 커뮤니티
/community/write               # 보호자 게시글 작성
/community/walk/write          # 산책팟 개설
/community/post/:postId        # 게시글 상세
/settings                      # 설정
/settings/pet-info             # 펫 정보
/settings/switch-pet           # 펫 전환
/settings/add-pet              # 펫 추가
/settings/guardian-info        # 보호자 정보
/onboarding/intro              # 로그인
/onboarding/permission         # 권한
/onboarding/pet-profile        # 펫 프로필 설정
/onboarding/welcome            # 환영
/farewell                      # 계정 삭제
```

## 기능 상세

### 1. 건강 대시보드 (`/health`)
- 반려동물 프로필 요약 (이름, 사진, 나이)
- 오늘의 산책/식단/체중 요약 카드
  - 산책 카드: 일기 건수 + 산책/놀이 시간 (0이면 숨김)
  - 식단 카드: 펫별 칼로리 요약
  - 체중 카드: 선택된 펫의 최근 체중
- 빠른 액션 버튼 (산책, 식단, 체중, 대변, 미용, 검진 기록)
- 연속 출석 (스트릭) 표시
- 날짜 선택으로 과거 기록 조회 가능

### 2. 식단 관리 (`/food`, `/food-history`)
- 사료 등록 (사진 촬영 또는 수동 입력)
- AI 사료 분석 (Supabase `food_analyses`)
- 급여량(g), 칼로리, 메모 기록
- 일별 식단 기록 히스토리

### 3. 산책 & 운동 (`/walk`, `/walk-history`)
- GPS 기반 산책 트래킹 (거리, 시간, 걸음수)
- flutter_map으로 산책 경로 지도 표시
- 산책 히스토리 조회

### 4. 체중 관리 (`/weight`)
- 일별 체중 기록 (선택된 펫 기준 필터링)
- 체중 눈금자(룰러) 위젯으로 체중 입력
- 월간 캘린더에 일별 체중 표시 (멀티펫 시 펫 이름 병기)
- 펫 변경 시 해당 펫의 마지막 체중이 기본값으로 세팅

### 5. 건강 기록
- **대변 체크** (`/stool-check`): 색상, 형태, 경도, 점액/혈변 등 기록 + AI 분석
- **미용 기록** (`/grooming-record`): 미용 내역 기록
- **검진 기록** (`/checkup-record`): 동물병원 검진 기록
- **배변봉투 인증** (`/poop-bag`): 산책 후 배변봉투 사용 사진 인증 (dog 전용), 일일 미션 연동

### 6. 미션 시스템 (`/mission`)
- 일일/월간 미션 (산책, 식단 기록 등)
- 미션 완료 시 펫경험치 + 포인트 보상
- Supabase `mission_completions` 테이블에 기록

### 7. 연속 출석 (`/streak`)
- 매일 체크인 시스템
- 연속 출석 일수에 따른 보상
- Supabase `streak_check_ins` 테이블

### 8. 샵 (`/shop`)
- 포인트/젬 재화로 아이템 구매
- EXP → 레벨 시스템 (Level n→n+1 필요 EXP = n * 100)
- 인벤토리 시스템 (`user_inventory`)
- 멤버십 구독 (RevenueCat `purchases_flutter`)

### 9. 커뮤니티 (`/community`)

게시판 탭 (2탭: 게시판 / {펫이름}의 글)

게시판 내 필터 칩: **전체 / 우리동네 / 산책팟**

| 게시판 타입 | board_type | 설명 |
|------------|------------|------|
| 펫 게시판 | `pet` | AI 반려일기 (Supabase Edge Function `write-pet-diary`) |
| 보호자 게시판 | `user` | 보호자가 직접 작성하는 게시글 + 이미지 |
| 산책팟 | `walk` | 산책 모임 모집 (시간/장소 + 참여/취소 투표), GPS 근처 필터링 |

- 댓글 시스템 (`community_comments`)
- 이미지 업로드 (Supabase Storage `community-images`)
- 우리동네 필터: GPS 기반 10km 반경 bounding box 필터링
- 산책팟: 항상 GPS 근처 필터링, 참여자 관리 (`community_post_participants`)

### 10. 메일함 (`/mail`)
- 인앱 알림/메일 시스템
- Supabase `user_mails` 테이블

### 11. 반려동물 프로필 (멀티펫 지원)
- 이름, 성별, 종, 견종, 생년월일, 체중, 사료, 성격태그
- 온보딩 시 설정, 설정 화면에서 수정 가능
- 복수 반려동물 등록 (`/settings/add-pet`, 최대 3마리) 및 전환 (`/settings/switch-pet`)
- 모든 건강 기록 테이블에 `petProfileId` FK로 펫별 데이터 분리
- 로컬 Drift DB + Supabase 클라우드 동기화
- 펫 삭제 시 관련 기록 전체 삭제 (Supabase 7개 테이블 + 로컬 Drift, 트랜잭션)
- 마지막 1마리는 삭제 불가

### 12. 인증 및 세션 관리
- Google 로그인 (google_sign_in + Supabase signInWithIdToken)
- 세션 토큰: SharedPreferences에 `sb-*` 키로 저장 (앱 데이터 초기화 시 보존)
- Access Token 1시간 만료 → SDK 자동 갱신 (Refresh Token 기반)
- 재가입 제한: 탈퇴 후 7일간 재가입 차단 (`check_deleted_account` RPC)
- 복귀 유저: 로그인 시 Supabase에서 기존 펫 프로필 및 기록 자동 복원
