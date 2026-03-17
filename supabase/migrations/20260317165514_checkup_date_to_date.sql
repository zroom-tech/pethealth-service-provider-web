-- checkup_date: timestamptz → date (타임존 제거, 날짜만 저장)
ALTER TABLE user_checkup_records
  ALTER COLUMN checkup_date TYPE date USING checkup_date::date;
