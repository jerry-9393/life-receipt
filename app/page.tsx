"use client";

import { useState, useEffect } from "react";
import html2canvas from "html2canvas";

type PageState = "input" | "loading" | "result";

const MBTI_TYPES = [
  "ISTJ", "ISFJ", "INFJ", "INTJ",
  "ISTP", "ISFP", "INFP", "INTP",
  "ESTP", "ESFP", "ENFP", "ENTP",
  "ESTJ", "ESFJ", "ENFJ", "ENTJ",
];

const TIME_OPTIONS = [
  "모름",
  "자시 (23:00-01:00)",
  "축시 (01:00-03:00)",
  "인시 (03:00-05:00)",
  "묘시 (05:00-07:00)",
  "진시 (07:00-09:00)",
  "사시 (09:00-11:00)",
  "오시 (11:00-13:00)",
  "미시 (13:00-15:00)",
  "신시 (15:00-17:00)",
  "유시 (17:00-19:00)",
  "술시 (19:00-21:00)",
  "해시 (21:00-23:00)",
];

const getLoadingMessages = (name: string) => [
  `${name}님의 과거 세탁 중...`,
  "사주팔자 데이터 털어보는 중...",
  "MBTI랑 대조해서 팩트 체크 중...",
  "견적서 뽑는 중... (마음의 준비 하셈)",
];

export default function Home() {
  const [pageState, setPageState] = useState<PageState>("input");
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [isLunar, setIsLunar] = useState(false);
  const [birthTime, setBirthTime] = useState("모름");
  const [gender, setGender] = useState<"남" | "여">("남");
  const [mbti, setMbti] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // 로딩 메시지 롤링
  useEffect(() => {
    if (pageState === "loading") {
      const messages = getLoadingMessages(name || "님");
      let index = 0;
      setLoadingMessage(messages[0]);
      const interval = setInterval(() => {
        index = (index + 1) % messages.length;
        setLoadingMessage(messages[index]);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [pageState, name]);

  const handleSubmit = async () => {
    if (!name || name.length > 3) {
      alert("이름을 3글자 이내로 입력해주세요.");
      return;
    }
    if (!year || !month || !day) {
      alert("생년월일을 모두 입력해주세요.");
      return;
    }

    setPageState("loading");

    try {
      // 생년월일을 YYYY-MM-DD 형식으로 변환
      const birthDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          birthDate,
          birthTime,
          mbti: mbti || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.details || "분석에 실패했습니다.";
        console.error("API 에러:", errorData);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("받은 데이터:", data);
      console.log("receipt_header 존재:", !!data.receipt_header);
      console.log("detail_analysis 존재:", !!data.detail_analysis);
      
      setResult(data);
      
      // 로딩 후 결과 페이지로
      setTimeout(() => {
        setPageState("result");
      }, 3000);
    } catch (error) {
      console.error("에러 발생:", error);
      const errorMessage = error instanceof Error ? error.message : "오류가 발생했습니다.";
      alert(errorMessage);
      setPageState("input");
    }
  };

  const handleCapture = async () => {
    const element = document.getElementById("receipt-card");
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: "#F4F4F0",
        scale: 2,
      });
      const imageData = canvas.toDataURL("image/png");
      setCapturedImage(imageData);
    } catch (error) {
      console.error("캡처 실패:", error);
    }
  };

  const handleReset = () => {
    setPageState("input");
    setName("");
    setYear("");
    setMonth("");
    setDay("");
    setIsLunar(false);
    setBirthTime("모름");
    setGender("남");
    setMbti(null);
    setResult(null);
    setCapturedImage(null);
  };

  // 입력 페이지
  if (pageState === "input") {
    return (
      <div className="min-h-screen bg-[#F4F4F0] p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4 tracking-tight" style={{ letterSpacing: "-0.5px" }}>
              님 인생 견적 뽑아드림. 팩트로만.
            </h1>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 space-y-6">
            {/* 이름 */}
            <div>
              <label className="block text-sm font-bold text-[#1A1A1A] mb-2" style={{ letterSpacing: "-0.5px" }}>
                이름
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 3))}
                placeholder="3글자 이내"
                maxLength={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF3B30] font-mono text-[#1A1A1A]"
              />
            </div>

            {/* 생년월일 */}
            <div>
              <label className="block text-sm font-bold text-[#1A1A1A] mb-2" style={{ letterSpacing: "-0.5px" }}>
                생년월일
              </label>
              <div className="flex gap-2 items-center mb-2">
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="YYYY"
                  className="w-24 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF3B30] font-mono text-center"
                />
                <span className="text-[#1A1A1A] font-mono">/</span>
                <input
                  type="text"
                  value={month}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 2);
                    setMonth(val && parseInt(val) <= 12 ? val : month);
                  }}
                  placeholder="MM"
                  className="w-20 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF3B30] font-mono text-center"
                />
                <span className="text-[#1A1A1A] font-mono">/</span>
                <input
                  type="text"
                  value={day}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 2);
                    setDay(val && parseInt(val) <= 31 ? val : day);
                  }}
                  placeholder="DD"
                  className="w-20 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF3B30] font-mono text-center"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsLunar(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !isLunar
                      ? "bg-[#FF3B30] text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  양력
                </button>
                <button
                  type="button"
                  onClick={() => setIsLunar(true)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isLunar
                      ? "bg-[#FF3B30] text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  음력
                </button>
              </div>
            </div>

            {/* 태어난 시간 */}
            <div>
              <label className="block text-sm font-bold text-[#1A1A1A] mb-2" style={{ letterSpacing: "-0.5px" }}>
                태어난 시간
              </label>
              <select
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF3B30] font-mono text-[#1A1A1A]"
              >
                {TIME_OPTIONS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            {/* 성별 */}
            <div>
              <label className="block text-sm font-bold text-[#1A1A1A] mb-2" style={{ letterSpacing: "-0.5px" }}>
                성별
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGender("남")}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                    gender === "남"
                      ? "bg-[#FF3B30] text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  남
                </button>
                <button
                  type="button"
                  onClick={() => setGender("여")}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                    gender === "여"
                      ? "bg-[#FF3B30] text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  여
                </button>
              </div>
            </div>

            {/* MBTI */}
            <div>
              <label className="block text-sm font-bold text-[#1A1A1A] mb-2" style={{ letterSpacing: "-0.5px" }}>
                MBTI
              </label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {MBTI_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setMbti(type)}
                    className={`px-3 py-2 rounded-lg text-sm font-mono font-medium transition-colors ${
                      mbti === type
                        ? "bg-[#FF3B30] text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setMbti(null)}
                className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  mbti === null
                    ? "bg-[#FF3B30] text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                모름
              </button>
            </div>

            {/* CTA 버튼 */}
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-[#FF3B30] text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-[#E6342A] transition-colors"
              style={{ letterSpacing: "-0.5px" }}
            >
              영수증 발급하기 (환불 불가)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 로딩 페이지
  if (pageState === "loading") {
    return (
      <div className="min-h-screen bg-[#F4F4F0] flex items-center justify-center p-4">
        <div className="text-center">
          {/* 프린터 애니메이션 */}
          <div className="mb-8 relative" style={{ height: "200px" }}>
            {/* 프린터 본체 */}
            <div className="w-64 h-32 mx-auto bg-gray-800 rounded-lg relative overflow-hidden shadow-lg">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-16 bg-gray-700 rounded"></div>
              </div>
              {/* 프린터 슬롯 */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-36 h-2 bg-gray-600"></div>
            </div>
            {/* 종이 출력 애니메이션 */}
            <div className="absolute top-32 left-1/2 transform -translate-x-1/2 w-40 h-20 bg-white border-2 border-gray-400 animate-slide-up shadow-md">
              <div className="h-full bg-gradient-to-b from-transparent via-gray-50 to-transparent flex items-center justify-center">
                <div className="w-32 h-16 border border-dashed border-gray-300"></div>
              </div>
            </div>
            {/* 종이 출력 효과 (지연) */}
            <div className="absolute top-32 left-1/2 transform -translate-x-1/2 w-40 h-20 bg-white border-2 border-gray-400 animate-slide-up-delayed shadow-md">
              <div className="h-full bg-gradient-to-b from-transparent via-gray-50 to-transparent flex items-center justify-center">
                <div className="w-32 h-16 border border-dashed border-gray-300"></div>
              </div>
            </div>
          </div>
          <p className="text-xl font-bold text-[#1A1A1A]" style={{ letterSpacing: "-0.5px" }}>
            {loadingMessage || getLoadingMessages(name || "님")[0]}
          </p>
        </div>
      </div>
    );
  }

  // 결과 페이지 - 안전한 조건부 렌더링
  if (pageState === "result" && result && (result.receipt_header || result.detail_analysis)) {
    console.log("결과 페이지 렌더링:", { 
      hasReceiptHeader: !!result.receipt_header, 
      hasDetailAnalysis: !!result.detail_analysis,
      result 
    });
    
    return (
      <div className="min-h-screen bg-[#F4F4F0] p-4 md:p-8 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* 영수증 카드 */}
          <div
            id="receipt-card"
            className="bg-white rounded-lg shadow-2xl p-8 md:p-12 relative receipt-card"
          >
            {/* Zigzag 상단 */}
            <div className="absolute top-0 left-0 right-0 h-4 receipt-zigzag-top"></div>
            
            <div className="space-y-6">
              {/* 헤더 */}
              <div className="text-center border-b-2 border-dashed border-gray-400 pb-4">
                <h2 className="text-3xl font-bold text-[#1A1A1A] mb-2 font-mono" style={{ letterSpacing: "-0.5px" }}>
                  인생 견적서
                </h2>
                <p className="text-sm text-gray-600 font-mono">
                  {new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })}
                </p>
              </div>

              {/* 기본 정보 */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold text-[#1A1A1A]" style={{ letterSpacing: "-0.5px" }}>이름:</span>
                  <span className="font-mono">{name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-[#1A1A1A]" style={{ letterSpacing: "-0.5px" }}>생년월일:</span>
                  <span className="font-mono">{year} / {month} / {day} ({isLunar ? "음력" : "양력"})</span>
                </div>
                {birthTime !== "모름" && (
                  <div className="flex justify-between">
                    <span className="font-bold text-[#1A1A1A]" style={{ letterSpacing: "-0.5px" }}>태어난 시간:</span>
                    <span className="font-mono">{birthTime}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-bold text-[#1A1A1A]" style={{ letterSpacing: "-0.5px" }}>성별:</span>
                  <span className="font-mono">{gender}</span>
                </div>
                {mbti && (
                  <div className="flex justify-between">
                    <span className="font-bold text-[#1A1A1A]" style={{ letterSpacing: "-0.5px" }}>MBTI:</span>
                    <span className="font-mono bg-[#FF3B30] text-white px-2 py-1 rounded">{mbti}</span>
                  </div>
                )}
              </div>

              {/* 영수증 헤더 - 안전한 조건부 렌더링 */}
              {result && result.receipt_header && (
                <div className="border-t-2 border-dashed border-gray-400 pt-4">
                  <div className="bg-[#FF3B30] text-white p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-medium" style={{ letterSpacing: "-0.5px" }}>
                        사주+MBTI 별명:
                      </span>
                      <span className="text-2xl font-bold text-right" style={{ letterSpacing: "-0.5px" }}>
                        {result?.receipt_header?.type_name || "타입명 없음"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base font-medium" style={{ letterSpacing: "-0.5px" }}>
                        사주+MBTI 한줄평:
                      </span>
                      <span className="text-lg font-mono text-right">
                        {result?.receipt_header?.total_score || "평가 없음"}
                      </span>
                    </div>
                  </div>
                  
                  {/* 영수증 항목 */}
                  {result.receipt_header?.items && result.receipt_header.items.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {/* 헤더 */}
                      <div className="grid grid-cols-[1fr_90px_140px] md:grid-cols-[1fr_120px_180px] items-center border-b-2 border-gray-300 pb-2 font-bold gap-2">
                        <span className="font-mono text-[#1A1A1A] text-left">항목</span>
                        <span className="font-mono text-gray-600 text-right">등급</span>
                        <span className="font-mono text-gray-600 text-right">비고</span>
                      </div>
                      {result.receipt_header.items.map((item: any, index: number) => (
                        <div key={index} className="grid grid-cols-[1fr_90px_140px] md:grid-cols-[1fr_120px_180px] items-center border-b border-gray-200 pb-2 gap-2">
                          <span className="font-mono text-[#1A1A1A] text-left truncate">{item.name}</span>
                          <span className="font-mono text-gray-600 text-right">{item.qty}</span>
                          <span className="font-mono text-[#FF3B30] font-bold text-right truncate">{item.price}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 상세 분석 - 안전한 조건부 렌더링 */}
              {result && result.detail_analysis && (
                <div className="border-t-2 border-dashed border-gray-400 pt-4 space-y-4">
                  <h3 className="text-xl font-bold text-[#1A1A1A] mb-4" style={{ letterSpacing: "-0.5px" }}>
                    팩폭 상세
                  </h3>
                  
                  {result.detail_analysis && result.detail_analysis.headline && (
                    <div className="bg-yellow-50 border-l-4 border-[#FF3B30] p-4 rounded">
                      <p className="font-bold text-[#1A1A1A]" style={{ letterSpacing: "-0.5px" }}>
                        {result.detail_analysis.headline}
                      </p>
                    </div>
                  )}

                  {result.detail_analysis && result.detail_analysis.pros && (
                    <div>
                      <h4 className="font-bold text-[#1A1A1A] mb-2" style={{ letterSpacing: "-0.5px" }}>장점 (칭찬인 척)</h4>
                      {Array.isArray(result.detail_analysis.pros) ? (
                        <ul className="space-y-1">
                          {result.detail_analysis.pros.map((pro: string, index: number) => (
                            <li key={index} className="text-[#1A1A1A] flex items-start gap-2">
                              <span className="text-[#FF3B30]">•</span>
                              <span style={{ letterSpacing: "-0.5px" }}>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[#1A1A1A]" style={{ letterSpacing: "-0.5px" }}>
                          {result.detail_analysis.pros}
                        </p>
                      )}
                    </div>
                  )}

                  {result.detail_analysis && result.detail_analysis.cons && (
                    <div>
                      <h4 className="font-bold text-[#1A1A1A] mb-2" style={{ letterSpacing: "-0.5px" }}>단점 (치부)</h4>
                      {Array.isArray(result.detail_analysis.cons) ? (
                        <ul className="space-y-1">
                          {result.detail_analysis.cons.map((con: string, index: number) => (
                            <li key={index} className="text-[#1A1A1A] flex items-start gap-2">
                              <span className="text-[#FF3B30]">•</span>
                              <span style={{ letterSpacing: "-0.5px" }}>{con}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[#1A1A1A]" style={{ letterSpacing: "-0.5px" }}>
                          {result.detail_analysis.cons}
                        </p>
                      )}
                    </div>
                  )}

                  {result.detail_analysis && result.detail_analysis.career && (
                    <div>
                      <h4 className="font-bold text-[#1A1A1A] mb-2" style={{ letterSpacing: "-0.5px" }}>직업 팩폭</h4>
                      <p className="text-[#1A1A1A]" style={{ letterSpacing: "-0.5px" }}>
                        {result.detail_analysis.career}
                      </p>
                    </div>
                  )}

                  {result.detail_analysis && result.detail_analysis.money && (
                    <div>
                      <h4 className="font-bold text-[#1A1A1A] mb-2" style={{ letterSpacing: "-0.5px" }}>소비 습관</h4>
                      <p className="text-[#1A1A1A]" style={{ letterSpacing: "-0.5px" }}>
                        {result.detail_analysis.money}
                      </p>
                    </div>
                  )}

                  {result.detail_analysis && result.detail_analysis.love_flaw && (
                    <div>
                      <h4 className="font-bold text-[#1A1A1A] mb-2" style={{ letterSpacing: "-0.5px" }}>연애 문제점</h4>
                      <p className="text-[#1A1A1A]" style={{ letterSpacing: "-0.5px" }}>
                        {result.detail_analysis.love_flaw}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {result.detail_analysis && result.detail_analysis.best_match && (
                      <div>
                        <h4 className="font-bold text-[#1A1A1A] mb-2" style={{ letterSpacing: "-0.5px" }}>잘 맞는 타입</h4>
                        <p className="text-[#1A1A1A]" style={{ letterSpacing: "-0.5px" }}>
                          {result.detail_analysis.best_match}
                        </p>
                      </div>
                    )}
                    {result.detail_analysis && result.detail_analysis.worst_match && (
                      <div>
                        <h4 className="font-bold text-[#1A1A1A] mb-2" style={{ letterSpacing: "-0.5px" }}>안 맞는 타입</h4>
                        <p className="text-[#1A1A1A]" style={{ letterSpacing: "-0.5px" }}>
                          {result.detail_analysis.worst_match}
                        </p>
                      </div>
                    )}
                  </div>

                  {result.detail_analysis && result.detail_analysis.healing && (
                    <div>
                      <h4 className="font-bold text-[#1A1A1A] mb-2" style={{ letterSpacing: "-0.5px" }}>스트레스 해소법</h4>
                      <p className="text-[#1A1A1A]" style={{ letterSpacing: "-0.5px" }}>
                        {result.detail_analysis.healing}
                      </p>
                    </div>
                  )}

                  {result.detail_analysis && result.detail_analysis.year_2026 && (
                    <div className="bg-gray-50 border border-gray-300 p-4 rounded">
                      <h4 className="font-bold text-[#1A1A1A] mb-2" style={{ letterSpacing: "-0.5px" }}>2026년 운세</h4>
                      <p className="text-[#1A1A1A]" style={{ letterSpacing: "-0.5px" }}>
                        {result.detail_analysis.year_2026}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 하단 스탬프 */}
              <div className="text-center pt-4 border-t-2 border-dashed border-gray-400">
                <div className="inline-block border-2 border-[#FF3B30] rounded-full px-6 py-2">
                  <span className="text-[#FF3B30] font-bold font-mono text-sm">환불 불가</span>
                </div>
              </div>
            </div>

            {/* Zigzag 하단 */}
            <div className="absolute bottom-0 left-0 right-0 h-4 receipt-zigzag-bottom"></div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-4 justify-center">
            <button
              type="button"
              onClick={handleCapture}
              className="bg-[#FF3B30] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#E6342A] transition-colors"
              style={{ letterSpacing: "-0.5px" }}
            >
              이미지 저장
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-300 transition-colors"
              style={{ letterSpacing: "-0.5px" }}
            >
              다시하기
            </button>
          </div>

          {/* 캡처된 이미지 */}
          {capturedImage && (
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 mb-2">저장된 이미지:</p>
              <img src={capturedImage} alt="저장된 영수증" className="max-w-full h-auto mx-auto border border-gray-300 rounded-lg" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
