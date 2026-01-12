import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 천간, 지지 배열 (계산용)
const HEAVENLY_STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
const EARTHLY_BRANCHES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];

// 오행 매핑
const ELEMENT_MAP: Record<string, string> = {
  갑: "목", 을: "목", 병: "화", 정: "화", 무: "토", 기: "토", 경: "금", 신: "금", 임: "수", 계: "수",
  자: "수", 축: "토", 인: "목", 묘: "목", 진: "토", 사: "화", 오: "화", 미: "토", 유: "금", 술: "토", 해: "수",
};

// [핵심] 일주 계산 함수 (1900년 1월 1일 기준 알고리즘)
function calculateSaju(birthDate: string) {
  const target = new Date(birthDate);
  const base = new Date(1900, 0, 1); // 1900년 1월 1일 (갑술일)
  
  // 날짜 차이 계산
  const diffTime = target.getTime() - base.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // 60갑자 계산
  // 1900.1.1은 갑술(10)일. 갑(0), 술(10) -> 인덱스 보정 필요
  // 간단하게 오프셋으로 계산
  const ganIndex = (diffDays + 0) % 10; // 갑(0)부터 시작
  const jiIndex = (diffDays + 10) % 12; // 술(10)부터 시작

  // 음수 처리 (1900년 이전 생일 대비)
  const finalGan = ganIndex < 0 ? ganIndex + 10 : ganIndex;
  const finalJi = jiIndex < 0 ? jiIndex + 12 : jiIndex;

  const gan = HEAVENLY_STEMS[finalGan];
  const ji = EARTHLY_BRANCHES[finalJi];
  
  return {
    gan,
    ji,
    ganElement: ELEMENT_MAP[gan],
    jiElement: ELEMENT_MAP[ji],
    text: `${gan}${ji}일주` // 예: 갑자일주
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, birthDate, birthTime, mbti } = body;

    // 1. 진짜 사주 계산 (여기서 매번 달라짐)
    const sajuResult = calculateSaju(birthDate);

    // 2. 프롬프트 구성
    const systemPrompt = `
    당신은 30년 경력의 무자비한 '팩트 폭격기' AI 점술가입니다.
    전문 용어(토 오행, 충돌 등)는 절대 쓰지 말고, 2030세대가 쓰는 **현대적인 비유**를 사용하세요.
    
    [분석 대상]
    - 일주: ${sajuResult.text} (${sajuResult.ganElement} / ${sajuResult.jiElement} 기운)
    - MBTI: ${mbti}
    
    [작성 규칙]
    1. 말투: 음슴체, 반말, 시니컬함, MZ 은어 사용 (갓생, 텅장, 알빠노 등).
    2. 비유 필수: '토 기운' 대신 '똥고집 바위', '화 기운' 대신 '급발진 용광로' 처럼 표현.
    3. 팩폭 강도: 칭찬하는 척하다가 돌려 까기.
    
    [출력 JSON 포맷]
    {
      "receipt_header": {
        "type_name": "4~6글자 킹받는 별명",
        "total_score": "한 줄 요약 (예: 회생 불가)",
        "items": [
           {"name": "창의적특성1", "qty": 99, "price": "$Max"},
           {"name": "창의적특성2", "qty": 10, "price": "$Low"},
           {"name": "창의적특성3", "qty": 0, "price": "$Zero"}
        ]
      },
      "detail_analysis": {
        "headline": "2문장 이상의 구체적인 상황 묘사 팩폭",
        "pros": "장점 (비꼬면서 칭찬)",
        "cons": "단점 (숨기고 싶은 치부)",
        "career": "직업 팩폭",
        "money": "돈 관리 팩폭",
        "love_flaw": "연애 문제점",
        "best_match": "잘 맞는 유형",
        "worst_match": "안 맞는 유형",
        "healing": "스트레스 해소법",
        "year_2026": "2026년 운세 (현실적 조언)"
      }
    }`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `이름: ${name}, 생년월일: ${birthDate}, MBTI: ${mbti} 분석해줘.` },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return NextResponse.json(result);

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "분석 중 에러가 발생했습니다." }, { status: 500 });
  }
}