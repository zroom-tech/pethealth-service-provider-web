-- =============================================
-- partner_customers 테이블 + RPC
-- Supabase SQL Editor에서 실행
-- =============================================

-- 1. 테이블 생성
CREATE TABLE partner_customers (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  partner_id  bigint NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  user_id     bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(partner_id, user_id)
);

-- 2. 인덱스 (양방향 조회 최적화)
CREATE INDEX idx_partner_customers_partner_id ON partner_customers(partner_id);
CREATE INDEX idx_partner_customers_user_id ON partner_customers(user_id);

-- 3. RLS 활성화
ALTER TABLE partner_customers ENABLE ROW LEVEL SECURITY;

-- 사용자는 자기 데이터만 조회 가능
CREATE POLICY "Users can view own partner connections"
  ON partner_customers FOR SELECT
  USING (user_id = current_user_id());

-- INSERT는 RPC를 통해서만 (SECURITY DEFINER)
-- 직접 INSERT 차단
CREATE POLICY "No direct insert"
  ON partner_customers FOR INSERT
  WITH CHECK (false);

-- 4. RPC: 앱에서 QR 스캔 시 호출
CREATE OR REPLACE FUNCTION register_partner_customer(p_partner_id bigint)
RETURNS jsonb AS $$
DECLARE
  v_user_id bigint;
  v_partner  record;
BEGIN
  -- 현재 로그인 사용자
  v_user_id := current_user_id();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'authentication required';
  END IF;

  -- 파트너 존재 확인
  SELECT id, name, category INTO v_partner
  FROM partners
  WHERE id = p_partner_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'partner not found';
  END IF;

  -- 등록 (중복 시 무시)
  INSERT INTO partner_customers (partner_id, user_id)
  VALUES (p_partner_id, v_user_id)
  ON CONFLICT (partner_id, user_id) DO NOTHING;

  -- 파트너 정보 반환 (앱에서 등록 완료 화면에 표시)
  RETURN jsonb_build_object(
    'partner_id', v_partner.id,
    'partner_name', v_partner.name,
    'category', v_partner.category
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
