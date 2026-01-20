
-- Supabase SQL Editor에서 이 코드를 실행하세요.

-- 1. todos 테이블 생성
CREATE TABLE IF NOT EXISTS todos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  title text NOT NULL,
  description text,
  is_completed boolean DEFAULT false,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  category text DEFAULT 'Personal'
);

-- 2. Row Level Security(RLS) 활성화
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- 3. 익명 사용자 접근 허용 정책 (테스트용)
-- 주의: 실제 서비스에서는 auth.uid()를 체크하는 정책으로 변경해야 합니다.
DROP POLICY IF EXISTS "Public Access" ON todos;
CREATE POLICY "Public Access" ON todos FOR ALL USING (true) WITH CHECK (true);
