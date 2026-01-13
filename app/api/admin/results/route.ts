import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET() {
  try {
    const results = await sql`
      SELECT 
        id,
        name,
        birth_date,
        birth_time,
        gender,
        mbti,
        result_json,
        created_at
      FROM analysis_results
      ORDER BY created_at DESC
      LIMIT 50
    `;

    return NextResponse.json(results.rows);
  } catch (error) {
    console.error("Results Fetch Error:", error);
    return NextResponse.json(
      { error: "데이터를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
