-- 제주 퀴즈 애플리케이션용 데이터베이스 테이블 생성

-- 1. 각 질문별 응답을 저장하는 테이블
CREATE TABLE IF NOT EXISTS quiz_responses (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  question_id INTEGER NOT NULL,
  axis TEXT NOT NULL,
  selected_option TEXT NOT NULL,
  final_result TEXT,
  question_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 최종 결과를 저장하는 테이블
CREATE TABLE IF NOT EXISTS quiz_results (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  final_result TEXT NOT NULL,
  answers JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_quiz_responses_session_id ON quiz_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_created_at ON quiz_responses(created_at);
CREATE INDEX IF NOT EXISTS idx_quiz_results_completed_at ON quiz_results(completed_at);
CREATE INDEX IF NOT EXISTS idx_quiz_results_final_result ON quiz_results(final_result);

-- RLS (Row Level Security) 정책 설정 (보안)
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 자유롭게 삽입할 수 있도록 정책 생성
CREATE POLICY IF NOT EXISTS "Allow insert for quiz_responses" ON quiz_responses
  FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow select for quiz_responses" ON quiz_responses
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Allow insert for quiz_results" ON quiz_results
  FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow select for quiz_results" ON quiz_results
  FOR SELECT USING (true); 