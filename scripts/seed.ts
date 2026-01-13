import { sql } from '@vercel/postgres';

async function createTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS analysis_results (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        birth_date TEXT NOT NULL,
        birth_time TEXT,
        gender TEXT NOT NULL,
        mbti TEXT,
        result_json JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    // 인덱스 생성 (조회 성능 향상)
    await sql`
      CREATE INDEX IF NOT EXISTS idx_analysis_results_created_at 
      ON analysis_results(created_at DESC);
    `;
    
    console.log('✅ 테이블 생성 완료: analysis_results');
  } catch (error) {
    console.error('❌ 테이블 생성 실패:', error);
    throw error;
  }
}

createTable();
