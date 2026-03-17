-- partner_customers 테이블 + register_partner_customer RPC

-- 1. 테이블 생성
CREATE TABLE IF NOT EXISTS partner_customers (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  partner_id  bigint NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  user_id     bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(partner_id, user_id)
);

-- 2. 인덱스
CREATE INDEX IF NOT EXISTS idx_partner_customers_partner_id ON partner_customers(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_customers_user_id ON partner_customers(user_id);

-- 3. RLS
ALTER TABLE partner_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own partner connections"
  ON partner_customers FOR SELECT
  USING (user_id = current_user_id());

CREATE POLICY "No direct insert"
  ON partner_customers FOR INSERT
  WITH CHECK (false);

-- 4. RPC: 앱에서 QR 스캔 시 호출
CREATE OR REPLACE FUNCTION register_partner_customer(p_partner_id bigint)
RETURNS jsonb AS $$
DECLARE
  v_user_id bigint;
  v_partner record;
BEGIN
  v_user_id := current_user_id();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'authentication required';
  END IF;

  SELECT id, name, category INTO v_partner
  FROM partners
  WHERE id = p_partner_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'partner not found';
  END IF;

  INSERT INTO partner_customers (partner_id, user_id)
  VALUES (p_partner_id, v_user_id)
  ON CONFLICT (partner_id, user_id) DO NOTHING;

  RETURN jsonb_build_object(
    'partner_id', v_partner.id,
    'partner_name', v_partner.name,
    'category', v_partner.category
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
