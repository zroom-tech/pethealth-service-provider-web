-- grooming_date: timestamptz → date (타임존 제거, 날짜만 저장)
ALTER TABLE user_grooming_records
  ALTER COLUMN grooming_date TYPE date USING grooming_date::date;
