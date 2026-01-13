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
    당신은 한국의 2030 MZ세대를 위한 '현실 팩폭러' AI입니다.
    문학적이거나 시적인 표현은 절대 쓰지 마세요. 친구랑 술자리에서 뒷담화하듯 **직설적이고 현실적인** 말투를 쓰세요.

    [분석 대상]
    - 일주: ${sajuResult.text} (${sajuResult.ganElement} / ${sajuResult.jiElement} 기운)
    - MBTI: ${mbti}

    [말투 가이드라인 - 매우 중요]
    1. **추상적 비유 금지:** "도쿄타워 세우기", "귀걸이처럼 흘리기" 같은 표현 절대 금지. 이해하기 어려움.
    2. **현실 밀착형 예시 사용:** 
       - (X) "신뢰를 쌓는 게 어렵다"
       - (O) "약속 시간 10분 늦는 게 기본 패시브임. 친구들이 너 믿고 식당 예약 절대 안 함."
       - (X) "통장 잔고는 매번 3000원"
       - (O) "월급 들어오면 3일 만에 '퍼가요~' 당함. 지금 통장에 치킨 한 마리 값도 없을 듯."
    3. **어조:** 시니컬하고 짧게 치고 빠지기. (~함, ~임 체)

    [출력 JSON 포맷]
    {
      "receipt_header": {
        "type_name": "4~6글자 현실적 별명 (예: 아가리 다이어터)",
        "total_score": "한 줄 요약 (예: 숨만 쉬어도 돈 나감)",
        "items": [
           {"name": "고집", "qty": "Lv.999", "price": "노답"},
           {"name": "실행력", "qty": "바닥", "price": "재활필요"},
           {"name": "눈치", "qty": "없음", "price": "품절"}
        ]
      },
      "detail_analysis": {
        "headline": "직설적인 팩폭 한마디. (예: 님은 입만 열면 거짓말임. 계획은 NASA급인데 실행은 신생아 수준.)",
        "pros": "장점 (예: 그래도 돈 안 드는 취미 하나는 기가 막히게 잘 찾음)",
        "cons": "단점 (예: 남이 충고하면 겉으로만 '네~' 하고 속으론 욕함)",
        "career": "직업 (예: 상사 눈치 안 보고 마이웨이 할 수 있는 유튜버나 하셈)",
        "money": "돈 (예: 배달앱 VIP 등급 유지하느라 적금 깰 상임)",
        "love_flaw": "연애 (예: 썸만 타다가 혼자 김칫국 마시고 끝남)",
        "best_match": "잘 맞는 유형 (구체적)",
        "worst_match": "안 맞는 유형 (구체적)",
        "healing": "해소법 (예: 엽떡 오리지널 먹고 유튜브 숏츠 3시간 보기)",
        "year_2026": "2026년 운세 (예: 로또 될 생각 말고 주식이나 빼셈)"
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