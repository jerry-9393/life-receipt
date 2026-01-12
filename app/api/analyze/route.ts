import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

// 천간 (10개)
const TIANGAN = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];

// 지지 (12개)
const DIZHI = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];

// 오행 매핑
const ELEMENT_MAP: Record<string, string> = {
  // 천간 (10개)
  갑: "목", 을: "목", 병: "화", 정: "화", 무: "토", 기: "토", 경: "금", 신: "금", 임: "수", 계: "수",
  // 지지 (12개) - '신'은 위에서 정의했으니 생략해도 '금'으로 인식됨
  자: "수", 축: "토", 인: "목", 묘: "목", 진: "토", 사: "화", 오: "화", 미: "토", 유: "금", 술: "토", 해: "수",
};

// 60갑자 일주 계산 함수
function calculateSaju(year: number, month: number, day: number): {
  일주: string;
  천간: string;
  지지: string;
  천간오행: string;
  지지오행: string;
  일주오행: string;
} {
  // 기준일: 1900년 1월 1일 (무자일, 戊子日)
  // 무(戊)는 천간 인덱스 4, 자(子)는 지지 인덱스 0
  const baseDate = new Date(1900, 0, 1); // 1900-01-01
  const targetDate = new Date(year, month - 1, day);
  
  // 일수 차이 계산
  const diffTime = targetDate.getTime() - baseDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // 기준일의 갑자 인덱스 (무자 = 4, 0)
  const baseTianganIndex = 4;
  const baseDizhiIndex = 0;
  
  // 일주 계산 (60갑자 순환)
  const tianganIndex = (baseTianganIndex + diffDays) % 10;
  const dizhiIndex = (baseDizhiIndex + diffDays) % 12;
  
  const 천간 = TIANGAN[tianganIndex];
  const 지지 = DIZHI[dizhiIndex];
  const 일주 = `${천간}${지지}`;
  const 천간오행 = ELEMENT_MAP[천간] || "";
  const 지지오행 = ELEMENT_MAP[지지] || "";
  
  // 일주 오행 (천간 오행이 주 오행)
  const 일주오행 = 천간오행;

  return {
    일주,
    천간,
    지지,
    천간오행,
    지지오행,
    일주오행,
  };
}

// MBTI 기반 분석 더미 함수
function analyzeMBTI(mbti: string | null): string[] {
  if (!mbti) return [];
  
  const mbtiFacts: Record<string, string[]> = {
    ISTJ: ["계획 없이는 살 수 없는 타입", "마감일 전에 미리미리 끝내는 스타일", "규칙을 지키는 게 최고"],
    ISFJ: ["남 챙기느라 정신없음", "배려심이 넘쳐서 가끔 본인 손해", "기억력이 좋아서 과거 일 잘 기억함"],
    INFJ: ["직감이 쩔어서 사람 보는 눈이 있음", "완벽주의자라 스트레스 많음", "혼자 있는 시간이 필수"],
    INTJ: ["전략가 타입이라 계획 짜는 거 좋아함", "감정 표현이 서툴러서 오해받기 쉬움", "효율성 중시해서 불필요한 건 싫어함"],
    ISTP: ["손재주 좋아서 뭐든 고칠 수 있음", "감정보다 논리로 판단", "혼자만의 시간이 최고"],
    ISFP: ["예술적 감각이 뛰어남", "갈등 싫어해서 피하는 스타일", "자기만의 세계가 있음"],
    INFP: ["이상주의자라 현실과 타협 어려움", "창의력이 넘쳐남", "감수성이 풍부해서 쉽게 상처받음"],
    INTP: ["호기심 많아서 이것저것 관심 많음", "논리적 사고로 모든 걸 분석", "감정 표현이 서툴러서 오해받음"],
    ESTP: ["즉흥적이라 계획 없이 살아도 됨", "액션 좋아해서 모험 추구", "현실적이라 이상한 건 싫어함"],
    ESFP: ["분위기 메이커라 어디 가든 인기", "즉흥적이라 계획 세우는 거 싫어함", "즐거운 게 최고"],
    ENFP: ["아이디어가 넘쳐서 이것저것 시작함", "열정적이라 뭐든 할 수 있다고 생각", "루틴한 거 싫어해서 지루하면 바로 포기"],
    ENTP: ["토론 좋아해서 말싸움 자주 함", "새로운 거 도전하는 거 좋아함", "규칙에 얽매이는 거 싫어함"],
    ESTJ: ["리더십 있어서 팀장 하기 좋음", "효율성 중시해서 비효율적인 거 못 참음", "전통과 규칙을 중시"],
    ESFJ: ["사교적이라 사람들과 어울리는 거 좋아함", "남 배려 잘해서 인기 많음", "갈등 싫어해서 중재 역할 자주 함"],
    ENFJ: ["카리스마 있어서 사람들 이끄는 거 잘함", "이상주의자라 완벽 추구", "남 챙기느라 본인 챙길 시간 없음"],
    ENTJ: ["야망 있어서 목표 달성 위해 노력", "리더십 있어서 팀 이끄는 거 잘함", "감정보다 논리로 판단"],
  };

  return mbtiFacts[mbti] || [];
}

// OpenAI로 인생 견적 생성
async function generateLifeReceipt(
  name: string,
  year: string,
  month: string,
  day: string,
  isLunar: boolean,
  birthTime: string,
  gender: string,
  mbti: string | null,
  saju: {
    일주: string;
    천간: string;
    지지: string;
    천간오행: string;
    지지오행: string;
    일주오행: string;
  }
): Promise<any> {
  // 더미 데이터 생성 함수
  const generateDummyData = () => {
    const itemNames = [
      ["똥고집 레벨", "사회생활 능력치", "자존심 게이지"],
      ["고집불통 스킬", "눈치코칭 필요도", "에고 충전량"],
      ["완고함 수치", "인간관계 민감도", "자아도취 지수"],
    ];
    const selectedItems = itemNames[Math.floor(Math.random() * itemNames.length)];
    
    const items = [
      { name: selectedItems[0], qty: Math.floor(Math.random() * 50) + 50, price: "$Max" },
      { name: selectedItems[1], qty: Math.floor(Math.random() * 30), price: "$Zero" },
      { name: selectedItems[2], qty: Math.floor(Math.random() * 40) + 60, price: "$Over" },
    ];

    return {
      receipt_header: {
        type_name: ["방구석 흥선대원군", "입만 산 잡스", "쿨찐 화산", "소심한 용", "똥차 인생", "갓생 시도자"][Math.floor(Math.random() * 6)],
        total_score: ["갱생 불가", "텅장 확정", "알빠노", "똥차 인증", "갓생 가능"][Math.floor(Math.random() * 5)],
        items,
      },
      detail_analysis: {
        headline: `${name}님은 속은 단단한 돌덩이인데 겉은 귀찮은 거 딱 질색인 쿨가이임. 그래서 남이 뭐라 하면 '어쩌라고' 하면서 귀 닫아버림. 밤마다 이불킥하면서도 아침엔 또 쿨한 척하는 이중생활의 달인임.`,
        pros: ["겉으론 쿨한 척 잘함. 진짜로 쿨한 건 아니지만 연기력은 오스카급임", "혼자서도 잘 놂. 외로움 따위는 모르는 척하는 프로 독립러", "효율성 중시해서 불필요한 인간관계는 과감히 차단함"],
        cons: ["속은 용암인데 겉은 얼음. 감정 폭발 직전까지 참다가 한 번에 터뜨림", "밤마다 이불킥하면서 과거 회상에 빠져있음. 아침엔 또 멀쩡한 척", "소심한 게 문제. 상대방이 무슨 생각하는지 궁금한데 물어보기엔 자존심이 발목을 잡음"],
        career: "상사 들이박을 상이니 혼자 일하셈. 팀 프로젝트는 답답해서 못 참음. 프리랜서나 창업이 답임. 하지만 창업은 또 귀찮아서 안 함.",
        money: "소비는 즉흥적, 저축은 꿈도 못 꿈. 월급 들어오면 3일 안에 반 이상 날림. 나머지 27일은 라면으로 버팀. 그래도 후회 안 함.",
        love_flaw: "감정 표현이 서툴러서 오해받기 쉬움. 좋아하는데도 '괜찮아'라고만 함. 상대방이 떠나면 그제서야 후회하는 타입.",
        best_match: "상대방이 먼저 다가와주고 감정을 표현해주는 타입. 답답해하지 않고 기다려줄 수 있는 사람.",
        worst_match: "또 다른 고집쟁이. 둘 다 먼저 안 하려고 해서 영원히 멀어짐. 감정 표현 못하는 사람끼리 만나면 재앙.",
        healing: "술 한 잔, 금융치료(쇼핑), 혼자만의 시간. 스트레스 받으면 혼자 카페 가서 핸드폰만 봄. 사람 만나는 건 에너지 소모가 심해서 기피함.",
        year_2026: "2026년은 변화의 해. 하지만 갱생은 어려울 듯. 새로운 시작을 시도하지만 3개월 못 버팀. 그래도 시도는 함. 그게 용기임.",
      },
    };
  };

  if (!openai || !process.env.OPENAI_API_KEY) {
    // API 키가 없으면 더미 데이터 반환
    return generateDummyData();
  }

  try {
    const systemPrompt = `당신은 30년 경력의 신세대 역술가이자, 무자비한 '팩트 폭격기'입니다.
사용자의 **[사주 일주(Day Pillar)]**와 **[MBTI]**를 결합하여 입체적으로 분석해야 합니다.

⚠️ [핵심 규칙] 전문 용어 절대 금지 (Easy Metaphor)

절대로 '토(土) 오행이 강해서...', '금(金) 기운 때문에...', '편관격이라...' 같은 전문 용어를 쓰지 마세요.

대신 현대적이고 구체적인 비유를 사용하세요:

- 토(土) 오행 → '고집불통 돌덩이', '움직이지 않는 산', '완고한 벽돌', '고정관념의 감옥'
- 금(金) 오행 → '차가운 칼날', '예리한 가위', '차갑고 날카로운 메탈', '감정 차단 장치'
- 화(火) 오행 → '걸어 다니는 용광로', '폭발 직전 화약고', '열정의 불꽃', '에너지 과다충전'
- 목(木) 오행 → '자라나는 나무', '유연한 대나무', '성장 욕구 폭발', '새싹 같은 에너지'
- 수(水) 오행 → '흐르는 강물', '깊은 바다', '감정의 파도', '변화무쌍한 물'

나쁜 예: "토 오행이 강한데 ISTP라서 충돌함"
좋은 예: "님은 속은 단단한 돌덩이인데 겉은 귀찮은 거 딱 질색인 쿨가이임. 그래서 남이 뭐라 하면 '어쩌라고' 하면서 귀 닫아버림."

나쁜 예: "편관격이라 자존심이 셉니다."
좋은 예: "님 자존심은 에베레스트급이라 누가 지적질하면 표정 관리 안 됨. 겉으론 '네~' 하는데 속으론 데스노트 적고 있음."

분석 지침
1. 결합 분석: 사주의 오행 특징을 비유로 풀어내고, MBTI 성향과 충돌/시너지를 구체적으로 묘사하세요.

2. 말투 (Tone & Manner):
- 절대 존댓말 금지. 무조건 음슴체(~함, ~임) 사용.
- 친절함 금지. 비꼬고, 조롱하듯 재밌게, 하지만 소름 돋게 정확한 통찰력을 보여주세요.
- MZ세대 은어(갓생, 텅장, 똥차, 알빠노, 쿨찐, 이불킥 등)를 적재적소에 섞으세요.

3. 내용 깊이 & 분량:
- "착하다", "성실하다" 같은 뻔한 말 절대 금지.
- "넌 겉으론 쿨한 척하지만 밤마다 이불킥하는 소심쟁이임"처럼 구체적인 상황을 묘사하세요.
- 모든 설명은 인스타그램 2030 유저가 읽자마자 '헐 이거 내 얘기ㅋㅋ' 하고 퍼가고 싶게 구체적이고 자극적이어야 합니다.
- headline은 최소 2문장 이상으로 길게 작성. 상황 묘사를 구체적으로.
- 각 항목(pros, cons, career 등)도 최소 1-2문장으로 길게, 구체적으로 작성하세요.

출력 데이터 가이드 (JSON)
반드시 다음 JSON 형식으로만 응답하세요. 다른 설명 없이 순수 JSON만 반환하세요.

{
  "receipt_header": {
    "type_name": "사주+MBTI를 섞은 4~6글자 별명 (예: 방구석 흥선대원군, 입만 산 잡스, 쿨찐 화산)",
    "total_score": "한 줄 평가 (예: 갱생 불가, 텅장 확정)",
    "items": [
      {"name": "똥고집 레벨", "qty": 99, "price": "$Max"},
      {"name": "사회생활 능력치", "qty": 0, "price": "$Zero"},
      {"name": "자존심 게이지", "qty": 85, "price": "$Over"}
    ]
    주의: items의 name은 창의적으로 바꿔주세요. (고집→똥고집 레벨, 눈치→사회생활 능력치, 자존심→자존심 게이지 등)
  },
  "detail_analysis": {
    "headline": "최소 2문장 이상으로 길게 작성. 구체적인 상황 묘사 포함. (예: 님은 속은 단단한 돌덩이인데 겉은 귀찮은 거 딱 질색인 쿨가이임. 그래서 남이 뭐라 하면 '어쩌라고' 하면서 귀 닫아버림. 밤마다 이불킥하면서도 아침엔 또 쿨한 척하는 이중생활의 달인임.)",
    "pros": ["칭찬인 척하면서 돌려 까기 (장점 3개, 각각 1-2문장으로 길게)"],
    "cons": ["숨기고 싶은 치부 들춰내기 (단점 3개, 각각 1-2문장으로 길게)"],
    "career": "현실적인 직업 팩폭 (최소 2문장 이상, 구체적으로)",
    "money": "소비 습관 저격 (최소 2문장 이상, 구체적인 상황 묘사)",
    "love_flaw": "연애할 때 문제점 (최소 2문장 이상, 구체적인 상황)",
    "best_match": "잘 맞는 유형 (1-2문장, 구체적으로)",
    "worst_match": "안 맞는 유형 (1-2문장, 구체적으로)",
    "healing": "스트레스 해소법 (1-2문장, 구체적인 방법)",
    "year_2026": "2026년(병오년) 운세 (희망 고문 대신 현실적 조언, 최소 2문장 이상)"
  }
}`;

    const userPrompt = `다음 정보를 바탕으로 ${name}님의 인생 견적서를 작성해주세요.

**사주 일주 (Day Pillar)**: ${saju.일주} (${saju.천간}${saju.지지})
- 천간: ${saju.천간} (${saju.천간오행} 오행)
- 지지: ${saju.지지} (${saju.지지오행} 오행)
- 일주 오행: ${saju.일주오행}

**생년월일**: ${year}년 ${month}월 ${day}일 (${isLunar ? "음력" : "양력"})
**태어난 시간**: ${birthTime}
**성별**: ${gender}
${mbti ? `**MBTI**: ${mbti}` : "**MBTI**: 모름 (사주만으로 분석)"}

위 정보를 바탕으로 JSON 형식으로 응답해주세요.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      max_tokens: 3000,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content || "";
    
    // JSON 파싱
    try {
      const parsed = JSON.parse(content);
      return parsed;
    } catch (parseError) {
      console.error("JSON 파싱 오류:", parseError);
      console.error("받은 내용:", content);
      // 파싱 실패 시 더미 데이터 반환
      return generateDummyData();
    }
  } catch (error) {
    console.error("OpenAI API 오류:", error);
    // 에러 시 더미 데이터 반환
    return generateDummyData();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, year, month, day, isLunar, birthTime, gender, mbti } = body;

    console.log("받은 데이터:", { name, year, month, day, isLunar, birthTime, gender, mbti });

    if (!name || !year || !month || !day) {
      return NextResponse.json(
        { error: "필수 정보가 누락되었습니다." },
        { status: 400 }
      );
    }

    // 숫자로 변환
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);
    const dayNum = parseInt(day, 10);

    if (isNaN(yearNum) || isNaN(monthNum) || isNaN(dayNum)) {
      return NextResponse.json(
        { error: "생년월일 형식이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    // 사주 일주 계산
    const saju = calculateSaju(yearNum, monthNum, dayNum);
    console.log("계산된 사주:", saju);

    // MBTI 분석
    const mbtiFacts = analyzeMBTI(mbti);

    // OpenAI로 인생 견적 생성
    const receiptData = await generateLifeReceipt(
      name,
      year,
      month,
      day,
      isLunar,
      birthTime,
      gender,
      mbti,
      saju
    );

    return NextResponse.json({
      saju,
      mbtiFacts,
      receipt: receiptData,
    });
  } catch (error) {
    console.error("서버 오류:", error);
    console.error("에러 상세:", error instanceof Error ? error.message : String(error));
    console.error("에러 스택:", error instanceof Error ? error.stack : "");
    return NextResponse.json(
      { 
        error: "서버 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
