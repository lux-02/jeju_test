import Head from "next/head";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function ResultDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [deletingIds, setDeletingIds] = useState(new Set());

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard-data");
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setLastUpdated(new Date(result.data.lastUpdated));
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("데이터 조회 중 오류가 발생했습니다.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 초기 데이터 로드
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 자동 새로고침 (10초마다)
  useEffect(() => {
    if (!isAutoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
    }, 10000);

    return () => clearInterval(interval);
  }, [isAutoRefresh, fetchData]);

  // 개별 응답 삭제 함수
  const deleteResponse = async (responseId) => {
    if (!confirm("이 응답을 삭제하시겠습니까?")) return;

    setDeletingIds((prev) => new Set([...prev, responseId]));

    try {
      const response = await fetch(
        `/api/delete-response?response_id=${responseId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (result.success) {
        alert("응답이 삭제되었습니다.");
        fetchData(); // 데이터 새로고침
      } else {
        alert(`삭제 실패: ${result.error}`);
      }
    } catch (error) {
      alert("삭제 중 오류가 발생했습니다.");
      console.error("Delete error:", error);
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(responseId);
        return newSet;
      });
    }
  };

  // 세션 전체 삭제 함수
  const deleteSession = async (sessionId) => {
    if (!confirm("이 세션의 모든 응답을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(
        `/api/delete-response?session_id=${sessionId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (result.success) {
        alert("세션이 삭제되었습니다.");
        fetchData(); // 데이터 새로고침
      } else {
        alert(`삭제 실패: ${result.error}`);
      }
    } catch (error) {
      alert("삭제 중 오류가 발생했습니다.");
      console.error("Delete error:", error);
    }
  };

  // 커스텀 툴팁 컴포넌트
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}명 (${(
                (entry.value / entry.payload.total) *
                100
              ).toFixed(1)}%)`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = data.payload.value;
      const percentage = ((total / data.payload.totalResponses) * 100).toFixed(
        1
      );

      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{data.name} 유형</p>
          <p className="text-sm text-gray-300">{`${total}명 (${percentage}%)`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Head>
        <title>제주 퀴즈 결과 대시보드 - 실시간 모니터링</title>
        <meta
          name="description"
          content="제주 여행유형 테스트 결과를 실시간으로 모니터링하는 대시보드"
        />
      </Head>

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <div className="group flex items-center text-gray-400 hover:text-white transition-colors cursor-pointer">
                <div className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center mr-3 transition-colors">
                  <span className="text-xl">←</span>
                </div>
                <span className="font-medium">홈으로</span>
              </div>
            </Link>

            <div className="h-8 w-px bg-gray-700"></div>

            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              📊 실시간 결과 대시보드
              <div className="flex items-center gap-2 text-sm font-normal">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400">LIVE</span>
              </div>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* 자동 새로고침 토글 */}
            <button
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                isAutoRefresh
                  ? "bg-green-600 border-green-500 text-white"
                  : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {isAutoRefresh ? "🔄 자동새고침 ON" : "⏸️ 자동새고침 OFF"}
            </button>

            {/* 수동 새로고침 버튼 */}
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 border border-blue-500 rounded-lg transition-colors"
            >
              {loading ? "⏳ 로딩중..." : "🔄 새로고침"}
            </button>
          </div>
        </div>

        {/* 마지막 업데이트 시간 */}
        {lastUpdated && (
          <div className="mb-6 text-center">
            <span className="text-gray-400 text-sm">
              마지막 업데이트: {lastUpdated.toLocaleString("ko-KR")}
            </span>
          </div>
        )}

        {loading && !data ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <p className="mt-4 text-gray-400">데이터 로딩 중...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 text-center">
            <h3 className="text-red-400 font-bold text-lg mb-2">
              ❌ 오류 발생
            </h3>
            <p className="text-red-300">{error}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 전체 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-blue-400 mb-2">
                  {data?.totalResponses || 0}
                </div>
                <div className="text-gray-300">총 참여자 수</div>
              </div>
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">
                  {Object.keys(data?.finalResultStats || {}).length}
                </div>
                <div className="text-gray-300">발견된 유형 수</div>
              </div>
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-purple-400 mb-2">
                  {isAutoRefresh ? "10초" : "수동"}
                </div>
                <div className="text-gray-300">업데이트 간격</div>
              </div>
            </div>

            {/* 차트 영역 */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* 막대그래프 - Q1~Q9 질문별 응답 비율 */}
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  📊 Q1~Q9 질문별 응답 비율
                  <span className="text-sm font-normal text-gray-400">
                    (막대그래프)
                  </span>
                </h3>

                {data?.barChartData && (
                  <ResponsiveContainer width="100%" height={500}>
                    <BarChart
                      data={data.barChartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="name"
                        stroke="#9CA3AF"
                        fontSize={11}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip content={<CustomTooltip />} />
                      {/* 모든 질문에서 사용되는 모든 키를 수집해서 Bar 생성 */}
                      {data.barChartData.length > 0 &&
                        (() => {
                          const allKeys = new Set();
                          data.barChartData.forEach((item) => {
                            Object.keys(item).forEach((key) => {
                              if (key !== "name" && key !== "total") {
                                allKeys.add(key);
                              }
                            });
                          });

                          return Array.from(allKeys).map((key, index) => (
                            <Bar
                              key={key}
                              dataKey={key}
                              fill={index % 2 === 0 ? "#60A5FA" : "#F87171"}
                              name={key}
                            />
                          ));
                        })()}
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* 원형그래프 - 최종 결과 비율 */}
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  🥧 최종 결과 비율
                  <span className="text-sm font-normal text-gray-400">
                    (원형그래프)
                  </span>
                </h3>

                {data?.pieChartData && data.pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={data.pieChartData.map((item) => ({
                          ...item,
                          totalResponses: data.totalResponses,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }) =>
                          `${name}: ${(percent * 100).toFixed(1)}%`
                        }
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {data.pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Legend
                        wrapperStyle={{ color: "#9CA3AF", fontSize: "12px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[400px] flex items-center justify-center text-gray-500">
                    아직 데이터가 없습니다
                  </div>
                )}
              </div>
            </div>

            {/* 상세 통계 테이블 */}
            {data?.finalResultStats &&
              Object.keys(data.finalResultStats).length > 0 && (
                <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6">
                    📋 유형별 상세 통계
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 px-4 text-gray-300">
                            순위
                          </th>
                          <th className="text-left py-3 px-4 text-gray-300">
                            유형
                          </th>
                          <th className="text-right py-3 px-4 text-gray-300">
                            참여자 수
                          </th>
                          <th className="text-right py-3 px-4 text-gray-300">
                            비율
                          </th>
                          <th className="text-left py-3 px-4 text-gray-300">
                            그래프
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(data.finalResultStats)
                          .sort(([, a], [, b]) => b - a)
                          .map(([type, count], index) => {
                            const percentage = (
                              (count / data.totalResponses) *
                              100
                            ).toFixed(1);
                            return (
                              <tr
                                key={type}
                                className="border-b border-gray-800 hover:bg-gray-800/50"
                              >
                                <td className="py-3 px-4 text-gray-400">
                                  #{index + 1}
                                </td>
                                <td className="py-3 px-4 font-medium text-white">
                                  {type}
                                </td>
                                <td className="py-3 px-4 text-right text-blue-400 font-bold">
                                  {count}명
                                </td>
                                <td className="py-3 px-4 text-right text-green-400 font-medium">
                                  {percentage}%
                                </td>
                                <td className="py-3 px-4">
                                  <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            {/* 세부 응답 데이터 테이블 */}
            {data?.detailedResponses && data.detailedResponses.length > 0 && (
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center justify-between">
                  <span>📝 세부 응답 데이터</span>
                  <span className="text-sm font-normal text-gray-400">
                    (최근 50개)
                  </span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-300">
                          ID
                        </th>
                        <th className="text-left py-3 px-4 text-gray-300">
                          세션 ID
                        </th>
                        <th className="text-center py-3 px-4 text-gray-300">
                          질문
                        </th>
                        <th className="text-center py-3 px-4 text-gray-300">
                          선택
                        </th>
                        <th className="text-center py-3 px-4 text-gray-300">
                          응답 시간
                        </th>
                        <th className="text-center py-3 px-4 text-gray-300">
                          관리
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.detailedResponses.map((response) => (
                        <tr
                          key={response.id}
                          className="border-b border-gray-800 hover:bg-gray-800/50"
                        >
                          <td className="py-3 px-4 text-gray-400 font-mono">
                            #{response.id}
                          </td>
                          <td className="py-3 px-4 text-gray-400 font-mono text-xs">
                            {response.session_id.split("_")[1]}...
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded-full text-xs font-medium">
                              Q{response.question_id}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                ["A", "C", "E"].includes(
                                  response.selected_option
                                )
                                  ? "bg-green-600/20 text-green-300"
                                  : "bg-red-600/20 text-red-300"
                              }`}
                            >
                              {response.selected_option}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-gray-300 text-xs">
                            {new Date(response.created_at).toLocaleString(
                              "ko-KR",
                              {
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => deleteResponse(response.id)}
                                disabled={deletingIds.has(response.id)}
                                className="px-3 py-1 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 hover:border-red-500/50 text-red-300 rounded-lg text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {deletingIds.has(response.id)
                                  ? "삭제중..."
                                  : "🗑️ 삭제"}
                              </button>
                              <button
                                onClick={() =>
                                  deleteSession(response.session_id)
                                }
                                className="px-3 py-1 bg-orange-600/20 hover:bg-orange-600/40 border border-orange-500/30 hover:border-orange-500/50 text-orange-300 rounded-lg text-xs transition-colors"
                              >
                                🔥 세션삭제
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 페이지 정보 */}
                <div className="mt-4 text-center text-gray-400 text-sm">
                  총 {data.detailedResponses.length}개의 응답이 표시됩니다.
                  <br />
                  <span className="text-xs text-gray-500">
                    💡 개별 응답 삭제 또는 세션 전체 삭제가 가능합니다.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
