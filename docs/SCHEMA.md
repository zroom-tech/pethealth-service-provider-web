# SCHEMA.md — 데이터베이스 스키마

## 로컬 DB (Drift / SQLite)

### PetProfiles — 반려동물 프로필

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| id | int | PK | autoIncrement | |
| userId | text | nullable | | Supabase auth UUID |
| name | text | O | | 반려동물 이름 |
| gender | text | O | | male / female |
| species | text | O | | dog / cat |
| breed | text | O | | 견종/묘종 |
| birthDate | datetime | O | | 생년월일 |
| weightKg | real | O | | 체중 (kg) |
| foodBrand | text | | `''` | 사료 브랜드 |
| foodAmountG | real | | `0` | 일일 급여량 (g) |
| foodCalPer100g | real | | `0` | 100g당 칼로리 |
| personalityTags | text | | `''` | 성격 태그 JSON 배열 |
| personalityDescription | text | | `''` | 성격 설명 |
| photoPath | text | nullable | | 프로필 사진 경로 |
| homeLatitude | real | nullable | | 위도 |
| homeLongitude | real | nullable | | 경도 |
| countryCode | text | nullable | | 국가 코드 |
| createdAt | datetime | | `currentDateAndTime` | 생성일 |

### UserProfiles — 사용자 프로필 (Supabase users 로컬 캐시)

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| id | int | PK | | Supabase users.id (BIGINT) |
| userName | text | | `''` | 보호자 이름 (실명) |
| nickname | text | | `''` | 보호자 호칭 (엄마, 아빠 등) |
| homeLatitude | real | nullable | | 위도 |
| homeLongitude | real | nullable | | 경도 |
| countryCode | text | nullable | | 국가 코드 |

### FoodRecords — 식단 기록

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| id | int | PK | autoIncrement | |
| registrationType | text | O | | `ai` / `manual` / `quick` |
| foodItemsJson | text | O | | 음식 항목 JSON 배열 |
| totalAmountG | real | O | | 총 그램 수 |
| totalCalories | real | | `0` | 총 칼로리 |
| imagePath | text | nullable | | AI 인식 이미지 로컬 경로 |
| imageUrl | text | nullable | | Supabase Storage URL |
| analysisJson | text | nullable | | AI 분석 결과 JSON |
| recordDate | datetime | O | | 기록 대상 날짜 |
| memo | text | nullable | | 메모 |
| petComment | text | nullable | | 펫 댓글 (한국어) |
| petCommentEn | text | nullable | | 펫 댓글 (영어) |
| petProfileId | int | nullable | | FK → PetProfiles.id |
| createdAt | datetime | | `currentDateAndTime` | 생성일 |

### WalkRecords — 산책 기록

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| id | int | PK | autoIncrement | |
| startedAt | datetime | O | | 산책 시작 시간 |
| endedAt | datetime | O | | 산책 종료 시간 |
| durationSeconds | int | O | | 소요 시간 (초) |
| distanceMeters | real | O | | 거리 (m) |
| steps | int | O | | 걸음수 |
| memo | text | nullable | | 메모 |
| imagePathsJson | text | nullable | | 이미지 경로 JSON 배열 |
| petComment | text | nullable | | 펫 댓글 (한국어) |
| petCommentEn | text | nullable | | 펫 댓글 (영어) |
| petProfileId | int | nullable | | FK → PetProfiles.id |

### WeightRecords — 체중 기록

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| id | int | PK | autoIncrement | |
| weightKg | real | O | | 체중 (kg) |
| recordDate | datetime | O | | 기록 날짜 |
| petProfileId | int | nullable | | FK → PetProfiles.id |
| createdAt | datetime | | `currentDateAndTime` | 생성일 |

### StoolRecords — 배변 분석 기록

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| id | int | PK | autoIncrement | |
| healthScore | int | nullable | | 건강 점수 (1~10) |
| color | text | nullable | | 색상 (갈색, 짙은 갈색 등) |
| consistency | text | nullable | | 형태 (정상, 딱딱함 등) |
| shape | text | nullable | | 모양 (통나무형, 덩어리형 등) |
| size | text | nullable | | 크기 (정상, 작음, 큼) |
| hasBlood | bool | | `false` | 혈변 여부 |
| hasMucus | bool | | `false` | 점액 여부 |
| urgencyLevel | text | nullable | | 긴급도 (normal/caution/urgent) |
| healthSummary | text | nullable | | 건강 요약 (한국어) |
| healthSummaryEn | text | nullable | | 건강 요약 (영어) |
| analysisJson | text | nullable | | 전체 분석 JSON |
| imagePath | text | nullable | | 이미지 경로 |
| recordDate | datetime | O | | 기록 날짜 |
| petProfileId | int | nullable | | FK → PetProfiles.id |
| createdAt | datetime | | `currentDateAndTime` | 생성일 |

### GroomingRecords — 미용 기록

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| id | int | PK | autoIncrement | |
| groomingDate | datetime | O | | 미용 날짜 |
| imagePathsJson | text | nullable | | 미용 사진 경로 JSON 배열 |
| description | text | nullable | | 보호자 작성글 |
| shopName | text | nullable | | 미용업체명 |
| petProfileId | int | nullable | | FK → PetProfiles.id |
| createdAt | datetime | | `currentDateAndTime` | 생성일 |

### CheckupRecords — 예방접종/검진 기록

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| id | int | PK | autoIncrement | |
| checkupDate | datetime | O | | 검진 날짜 |
| hospitalName | text | nullable | | 동물병원 이름 |
| description | text | nullable | | 보호자 작성글 |
| imagePathsJson | text | nullable | | 서류 사진 JSON 배열 (다중) |
| petProfileId | int | nullable | | FK → PetProfiles.id |
| createdAt | datetime | | `currentDateAndTime` | 생성일 |

### PoopBagRecords — 배변봉투 인증 기록 (dog 전용)

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| id | int | PK | autoIncrement | |
| imagePath | text | nullable | | 인증 사진 경로 |
| recordDate | datetime | O | | 인증 날짜/시간 |
| petProfileId | int | nullable | | FK → PetProfiles.id |
| createdAt | datetime | | `currentDateAndTime` | 생성일 |

### InventoryRecords — 인벤토리

| 컬럼 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| id | int | PK | autoIncrement | |
| itemId | text | O | | 아이템 ID (shop_items.json) |
| quantity | int | | `0` | 보유 수량 |

---

## Supabase 테이블 (원격)

| 테이블 | 용도 | RLS |
|--------|------|-----|
| `users` | 사용자 정보 (EXP, 포인트, 젬, 멤버십, 스트릭) | 자기 데이터만 |
| `pet_profiles` | 반려동물 프로필 (멀티펫 지원) | 자기 데이터만 CRUD |
| `pet_foods` | 사료 제품 DB | 누구나 읽기 |
| `mission_completions` | 미션 완료 기록 (일일/월간) | 자기 데이터만 CRUD |
| `community_posts` | 커뮤니티 게시글 (pet/user/walk 타입) | 누구나 읽기, 자기 글 CUD |
| `community_comments` | 게시글 댓글 | 누구나 읽기, 자기 댓글 CD |
| `community_post_participants` | 산책팟 참여자 | 누구나 읽기, 자기 참여 ID |
| `user_food_records` | 식단 기록 (클라우드) | 자기 데이터만 CRUD |
| `user_walk_records` | 산책 기록 (클라우드, `image_urls` JSONB) | 자기 데이터만 CRUD |
| `user_weight_records` | 체중 기록 (클라우드) | 자기 데이터만 CRUD |
| `user_stool_records` | 대변 체크 (클라우드) | 자기 데이터만 CRUD |
| `user_grooming_records` | 미용 기록 (클라우드, `image_urls` JSONB) | 자기 데이터만 CRUD |
| `user_checkup_records` | 검진 기록 (클라우드, `image_urls` JSONB) | 자기 데이터만 CRUD |
| `user_poop_bag_records` | 배변봉투 인증 (클라우드, dog 전용) | 자기 데이터만 CRUD |
| `food_analyses` | AI 사료 분석 결과 | 자기 데이터만 |
| `stool_analyses` | AI 대변 분석 결과 | 자기 데이터만 |
| `streak_check_ins` | 연속 출석 체크인 | 자기 데이터만 CRUD |
| `user_inventory` | 아이템 인벤토리 | 자기 데이터만 CRUD |
| `point_transactions` | 포인트 거래 내역 | 자기 데이터만 |
| `gem_transactions` | 젬 거래 내역 | 자기 데이터만 |
| `user_mails` | 인앱 메일/알림 | 자기 데이터만 |
| `deleted_accounts` | 계정 삭제 기록 | - |
| `inquiry` | 문의 | 자기 데이터만 SELECT/INSERT |
| `partners` | 서비스 제공자 (동물병원, 미용샵, 호텔) | service role만 접근 |
| `partner_customers` | 파트너-사용자 연결 (QR 등록) | 자기 데이터만 SELECT, INSERT는 RPC만 |

- RLS 사용자 ID: `public.current_user_id()` 함수 (auth.uid() → users.id BIGINT 변환)

---