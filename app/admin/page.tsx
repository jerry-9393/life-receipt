"use client";

import { useState } from "react";

interface AnalysisResult {
  id: string;
  name: string;
  birth_date: string;
  birth_time: string | null;
  gender: string;
  mbti: string | null;
  result_json: any;
  created_at: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    const response = await fetch("/api/admin/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (response.ok) {
      setIsAuthenticated(true);
      fetchResults();
    } else {
      setError("비밀번호가 올바르지 않습니다.");
    }
  };

  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/results");
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      } else {
        setError("데이터를 불러오는데 실패했습니다.");
      }
    } catch (err) {
      setError("데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-slate-800 mb-6 text-center">
            관리자 로그인
          </h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="비밀번호를 입력하세요"
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            <button
              onClick={handleLogin}
              className="w-full bg-violet-600 text-white py-2 rounded-lg hover:bg-violet-700 transition-colors font-medium"
            >
              로그인
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            분석 결과 관리
          </h1>
          <p className="text-slate-600 text-sm">
            총 {results.length}개의 결과
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-slate-600">로딩 중...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">
                      이름
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">
                      생년월일
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">
                      성별
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">
                      MBTI
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">
                      생성일시
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {results.map((result) => (
                    <tr key={result.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-800">
                        {result.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {result.birth_date}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {result.gender}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {result.mbti || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {new Date(result.created_at).toLocaleString("ko-KR")}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedResult(result)}
                          className="text-violet-600 hover:text-violet-700 text-sm font-medium"
                        >
                          상세보기
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 상세 모달 */}
        {selectedResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">
                  분석 결과 상세
                </h2>
                <button
                  onClick={() => setSelectedResult(null)}
                  className="text-slate-500 hover:text-slate-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">이름</p>
                    <p className="font-medium text-slate-800">
                      {selectedResult.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">생년월일</p>
                    <p className="font-medium text-slate-800">
                      {selectedResult.birth_date}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">태어난 시간</p>
                    <p className="font-medium text-slate-800">
                      {selectedResult.birth_time || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">성별</p>
                    <p className="font-medium text-slate-800">
                      {selectedResult.gender}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">MBTI</p>
                    <p className="font-medium text-slate-800">
                      {selectedResult.mbti || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">생성일시</p>
                    <p className="font-medium text-slate-800">
                      {new Date(selectedResult.created_at).toLocaleString(
                        "ko-KR"
                      )}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">
                    분석 결과
                  </h3>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <pre className="text-sm text-slate-700 whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(selectedResult.result_json, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
