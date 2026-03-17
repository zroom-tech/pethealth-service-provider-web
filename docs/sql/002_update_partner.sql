-- =============================================
-- update_partner RPC (enum 캐스팅 포함)
-- Supabase SQL Editor에서 실행
-- =============================================

CREATE OR REPLACE FUNCTION update_partner(
  p_id          bigint,
  p_name        text,
  p_category    text,
  p_phone       text DEFAULT NULL,
  p_country     text DEFAULT NULL,
  p_city        text DEFAULT NULL,
  p_address1    text DEFAULT NULL,
  p_address2    text DEFAULT NULL,
  p_instagram_url text DEFAULT NULL,
  p_website_url text DEFAULT NULL,
  p_description text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE partners
  SET
    name          = p_name,
    category      = p_category::partner_category,
    phone         = p_phone,
    country       = p_country,
    city          = p_city,
    address1      = p_address1,
    address2      = p_address2,
    instagram_url = p_instagram_url,
    website_url   = p_website_url,
    description   = p_description
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
