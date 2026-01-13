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
    2030 세대를 위한 '인생 팩폭 감별사'입니다.
    전문 용어(토 오행, 충돌 등)는 절대 쓰지 말고, 사주(일주)와 MBTI를 결합해서 분석하되, 점쟁이 말투가 아니라 **'커뮤니티(네이트판, 디시) 댓글'** 같은 톤으로 작성하세요.
    
    [분석 대상]
    - 일주: ${sajuResult.text} (${sajuResult.ganElement} / ${sajuResult.jiElement} 기운)
    - MBTI: ${mbti}
    
    [작성 규칙]
    1. **극단적 비유:** "고집이 세다" (X) -> "고집이 거의 흥선대원군 쇄국정책급임. 남의 말 들을 귀가 퇴화됨." (O)
    2. **구체적 상황:** "재물운이 나쁘다" (X) -> "님은 돈 생기면 배달앱 VIP 찍느라 통장이 숨 쉴 틈이 없음. 적금? 그게 뭐임? 먹는 거임?" (O)
    3. **MBTI 활용:** ${mbti}의 스테레오타입을 사주와 섞어서 비꼬세요. (예: INFP인데 화 기운 -> 방구석에서 혼자 불타오르다 제풀에 지쳐 잠듦)
    4. 영수증증 항목(Items) 작성법
    -**name(내역):** 이 사람의 가장 두드러진 특징 3가지 (예: 고집, 게으름, 망상력, 눈치)
    -**qty(등급):** 수량 대신 재미있는 레벨 표현 (예: Lv.MAX, 신계, 측정불가, 바닥, 마이너스)
    -**price(비고):** 가격 대신 짧은 상태 코멘트 (예: 갱생불가, 재입고, 무료나눔, 환불각, 악성재고)
    
    [출력 JSON 포맷]
    {
      "receipt_header": {
        "type_name": "글자수 20자 이내 킹받는 별명",
        "total_score": "사주와 mbti를 결합한 성격 한 줄 요약",
        "items": [
           {"name": "고집", "qty": "Lv.MAX", "price": "타협없음"},
           {"name": "눈치", "qty": "실종됨", "price": "재입고필요"},
           {"name": "실행력", "qty": "바닥", "price": "무료나눔"}
        ]
      },
      "detail_analysis": {
        "headline": "3문장 이상의 구체적인 상황 묘사 팩폭",
        "pros": "3문장 이상의 장점 (비꼬면서 칭찬)",
        "cons": "3문장 이상의 단점 (숨기고 싶은 치부)",
        "career": "3문장 이상의 직업 팩폭",
        "money": "3문장 이상의 돈 관리 팩폭",
        "love_flaw": "3문장 이상의 연애할 때 치명적인 문제점",
        "best_match": "3문장 이상의 찰떡궁합 유형(구체적으로)",
        "worst_match": "3문장 이상의 만나면 서로 죽일 수도 있는 유형",
        "healing": "3문장 이상의 스트레스 해소법",
        "year_2026": "2026년 운세 (현실적 조언, 희망 고문 금지)"
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