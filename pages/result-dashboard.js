import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback, useMemo } from "react";
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
import {
  HiArrowLeft,
  HiChartBar,
  HiSparkles,
  HiUsers,
  HiTrendingUp,
  HiPlay,
  HiPause,
} from "react-icons/hi";

const BAR_COLORS = [
  "#38BDF8",
  "#F97316",
  "#2DD4BF",
  "#6366F1",
  "#FB7185",
  "#FB923C",
];

function QuestionBarTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-white/20 bg-black/85 p-3 shadow-lg backdrop-blur-sm">
      <p className="text-sm font-semibold text-white">{label}</p>
      {payload.map((entry) => {
        const total = entry.payload?.total || 1;
        const percentage = ((entry.value / total) * 100).toFixed(1);

        return (
          <p key={entry.dataKey} className="text-xs" style={{ color: entry.color }}>
            {`${entry.dataKey}: ${entry.value}명 (${percentage}%)`}
          </p>
        );
      })}
    </div>
  );
}

function ResultPieTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const item = payload[0];
  const totalResponses = item.payload.totalResponses || 1;
  const percentage = ((item.value / totalResponses) * 100).toFixed(1);

  return (
    <div className="rounded-xl border border-white/20 bg-black/85 p-3 shadow-lg backdrop-blur-sm">
      <p className="text-sm font-semibold text-white">{item.name}</p>
      <p className="text-xs text-white/75">{`${item.value}명 (${percentage}%)`}</p>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, description, valueClassName = "text-jeju-sky" }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-black/35 p-5 backdrop-blur-xl">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10">
        <Icon className="h-5 w-5 text-white" />
      </div>
      <p className="text-sm text-white/65">{title}</p>
      <p className={`mt-1 text-3xl font-black ${valueClassName}`}>{value}</p>
      <p className="mt-1 text-xs text-white/55">{description}</p>
    </div>
  );
}

export default function ResultDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard-data");
      const result = await response.json();

      if (response.ok && result.success) {
        setData(result.data);
        setLastUpdated(new Date(result.data.lastUpdated));
        setError(null);
      } else {
        setError(result.error || "대시보드 데이터를 불러오지 못했습니다.");
      }
    } catch (err) {
      setError("데이터 조회 중 오류가 발생했습니다.");
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!isAutoRefresh) {
      return undefined;
    }

    const interval = setInterval(() => {
      fetchData();
    }, 10000);

    return () => clearInterval(interval);
  }, [isAutoRefresh, fetchData]);

  const barKeys = useMemo(() => {
    if (!data?.barChartData?.length) {
      return [];
    }

    const keySet = new Set();
    data.barChartData.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (key !== "name" && key !== "total") {
          keySet.add(key);
        }
      });
    });

    return Array.from(keySet);
  }, [data?.barChartData]);

  const sortedResultStats = useMemo(() => {
    if (!data?.finalResultStats) {
      return [];
    }

    return Object.entries(data.finalResultStats)
      .sort(([, a], [, b]) => b - a)
      .map(([type, count], index) => ({
        rank: index + 1,
        type,
        count,
        percentage: ((count / (data.totalResponses || 1)) * 100).toFixed(1),
      }));
  }, [data?.finalResultStats, data?.totalResponses]);

  const isInitialLoading = loading && !data;

  return (
    <div className="min-h-screen gradient-bg text-slate-50">
      <Head>
        <title>제주 퀴즈 결과 대시보드</title>
        <meta
          name="description"
          content="제주 여행유형 테스트 결과를 실시간으로 모니터링하는 운영 대시보드"
        />
      </Head>

      <nav className="fixed left-4 right-4 top-4 z-50 rounded-2xl border border-white/20 bg-black/35 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-2 py-1.5 font-semibold text-white transition-colors hover:text-jeju-mint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-sky"
          >
            <Image src="/logo.svg" alt="제주맹글이" width={140} height={24} className="h-6 w-auto" />
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition-all hover:bg-white/20"
            >
              <HiArrowLeft className="h-4 w-4" />
              홈
            </Link>
            <Link
              href="/quiz"
              className="inline-flex min-h-10 items-center rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition-all hover:bg-white/20"
            >
              테스트
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-28 sm:px-6">
        <section className="mb-8 rounded-3xl border border-white/20 bg-black/35 p-5 backdrop-blur-xl sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/90 sm:text-sm">
                <HiChartBar className="h-4 w-4 text-jeju-sky" />
                Operations Dashboard
              </div>
              <h1 className="mt-4 text-2xl font-black text-white sm:text-3xl">
                실시간 결과 대시보드
              </h1>
              <p className="mt-2 text-sm text-white/70 sm:text-base">
                질문별 응답 흐름과 유형 분포를 실시간으로 모니터링합니다.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setIsAutoRefresh((prev) => !prev)}
                aria-pressed={isAutoRefresh}
                className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all ${
                  isAutoRefresh
                    ? "border-jeju-mint/60 bg-jeju-mint/25 text-white"
                    : "border-white/20 bg-white/10 text-white/75 hover:bg-white/20"
                }`}
              >
                {isAutoRefresh ? <HiPause className="h-4 w-4" /> : <HiPlay className="h-4 w-4" />}
                {isAutoRefresh ? "자동새로고침 ON" : "자동새로고침 OFF"}
              </button>

              <button
                onClick={fetchData}
                disabled={loading}
                className="inline-flex min-h-11 items-center rounded-xl bg-gradient-to-r from-jeju-ocean to-jeju-primary px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:from-jeju-primary hover:to-jeju-ocean disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "로딩 중..." : "새로고침"}
              </button>
            </div>
          </div>

          {lastUpdated && (
            <p className="mt-4 text-xs text-white/55 sm:text-sm">
              마지막 업데이트: {lastUpdated.toLocaleString("ko-KR")} • {isAutoRefresh ? "10초 자동 갱신" : "수동 갱신"}
            </p>
          )}
        </section>

        {isInitialLoading ? (
          <section className="rounded-3xl border border-white/20 bg-black/35 p-16 text-center backdrop-blur-xl">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/25 border-t-white" />
            <p className="mt-4 text-white/70">데이터 로딩 중...</p>
          </section>
        ) : error ? (
          <section className="rounded-3xl border border-red-400/40 bg-red-500/10 p-8 text-center">
            <h3 className="text-lg font-bold text-red-200">데이터 로드 오류</h3>
            <p className="mt-2 text-sm text-red-100/90">{error}</p>
          </section>
        ) : (
          <div className="space-y-8">
            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <StatCard
                icon={HiUsers}
                title="총 참여자"
                value={`${data?.totalResponses || 0}명`}
                description="누적 응답 수"
                valueClassName="text-jeju-sky"
              />
              <StatCard
                icon={HiSparkles}
                title="발견된 유형"
                value={`${Object.keys(data?.finalResultStats || {}).length}개`}
                description="현재까지 관측된 결과 타입"
                valueClassName="text-jeju-mint"
              />
              <StatCard
                icon={HiTrendingUp}
                title="업데이트 모드"
                value={isAutoRefresh ? "10초" : "수동"}
                description={isAutoRefresh ? "자동 갱신 활성화" : "수동 갱신 모드"}
                valueClassName="text-jeju-cta"
              />
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="rounded-3xl border border-white/20 bg-black/35 p-5 backdrop-blur-xl sm:p-6">
                <h3 className="mb-5 text-lg font-bold text-white sm:text-xl">
                  질문별 응답 비율 (Q1~Q9)
                </h3>
                {data?.barChartData?.length ? (
                  <ResponsiveContainer width="100%" height={440}>
                    <BarChart data={data.barChartData} margin={{ top: 16, right: 20, left: 4, bottom: 56 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                      <XAxis
                        dataKey="name"
                        stroke="#CBD5E1"
                        fontSize={11}
                        angle={-40}
                        textAnchor="end"
                        height={74}
                      />
                      <YAxis stroke="#CBD5E1" fontSize={11} />
                      <Tooltip content={<QuestionBarTooltip />} />
                      {barKeys.map((key, index) => (
                        <Bar key={key} dataKey={key} name={key} fill={BAR_COLORS[index % BAR_COLORS.length]} radius={[4, 4, 0, 0]} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[440px] items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-sm text-white/60">
                    막대그래프 데이터가 없습니다.
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-white/20 bg-black/35 p-5 backdrop-blur-xl sm:p-6">
                <h3 className="mb-5 text-lg font-bold text-white sm:text-xl">
                  최종 결과 유형 분포
                </h3>
                {data?.pieChartData?.length ? (
                  <ResponsiveContainer width="100%" height={440}>
                    <PieChart>
                      <Pie
                        data={data.pieChartData.map((item) => ({
                          ...item,
                          totalResponses: data.totalResponses,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        outerRadius={128}
                        dataKey="value"
                      >
                        {data.pieChartData.map((entry, index) => (
                          <Cell key={`pie-${entry.name}-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<ResultPieTooltip />} />
                      <Legend wrapperStyle={{ color: "#E2E8F0", fontSize: "12px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[440px] items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-sm text-white/60">
                    원형그래프 데이터가 없습니다.
                  </div>
                )}
              </div>
            </section>

            {sortedResultStats.length > 0 && (
              <section className="rounded-3xl border border-white/20 bg-black/35 p-5 backdrop-blur-xl sm:p-6">
                <h3 className="mb-5 text-lg font-bold text-white sm:text-xl">유형별 상세 통계</h3>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead>
                      <tr className="border-b border-white/15 text-white/65">
                        <th className="px-4 py-3 text-left">순위</th>
                        <th className="px-4 py-3 text-left">유형</th>
                        <th className="px-4 py-3 text-right">참여자 수</th>
                        <th className="px-4 py-3 text-right">비율</th>
                        <th className="px-4 py-3 text-left">분포</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedResultStats.map((item) => (
                        <tr key={item.type} className="border-b border-white/10 hover:bg-white/5">
                          <td className="px-4 py-3 text-white/60">#{item.rank}</td>
                          <td className="px-4 py-3 font-semibold text-white">{item.type}</td>
                          <td className="px-4 py-3 text-right font-semibold text-jeju-sky">{item.count}명</td>
                          <td className="px-4 py-3 text-right font-semibold text-jeju-mint">{item.percentage}%</td>
                          <td className="px-4 py-3">
                            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-jeju-ocean to-jeju-cta"
                                style={{ width: `${item.percentage}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {data?.detailedResponses?.length > 0 && (
              <section className="rounded-3xl border border-white/20 bg-black/35 p-5 backdrop-blur-xl sm:p-6">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
                  <h3 className="text-lg font-bold text-white sm:text-xl">세부 응답 데이터</h3>
                  <span className="text-xs text-white/60 sm:text-sm">최근 {data.detailedResponses.length}개</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-sm">
                    <thead>
                      <tr className="border-b border-white/15 text-white/65">
                        <th className="px-4 py-3 text-left">ID</th>
                        <th className="px-4 py-3 text-left">세션</th>
                        <th className="px-4 py-3 text-center">질문</th>
                        <th className="px-4 py-3 text-center">선택</th>
                        <th className="px-4 py-3 text-center">응답 시간</th>
                        <th className="px-4 py-3 text-center">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.detailedResponses.map((response) => {
                        const token = response.session_id?.split("_")?.[1] || response.session_id || "-";

                        return (
                          <tr key={response.id} className="border-b border-white/10 hover:bg-white/5">
                            <td className="px-4 py-3 font-mono text-white/70">#{response.id}</td>
                            <td className="px-4 py-3 font-mono text-xs text-white/55">{token.slice(0, 8)}...</td>
                            <td className="px-4 py-3 text-center">
                              <span className="rounded-full border border-jeju-sky/40 bg-jeju-ocean/20 px-2.5 py-1 text-xs font-semibold text-jeju-sky">
                                Q{response.question_id}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                  ["A", "C", "E"].includes(response.selected_option)
                                    ? "bg-jeju-mint/20 text-jeju-mint"
                                    : "bg-jeju-cta/20 text-jeju-cta"
                                }`}
                              >
                                {response.selected_option}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center text-xs text-white/65">
                              {new Date(response.created_at).toLocaleString("ko-KR", {
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="rounded-lg border border-jeju-mint/40 bg-jeju-mint/15 px-3 py-1 text-xs font-semibold text-jeju-mint">
                                데이터 보존됨
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <p className="mt-4 text-center text-xs text-white/50 sm:text-sm">
                  모든 데이터는 통계 목적으로 안전하게 보관됩니다.
                </p>
              </section>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-white/10 bg-black/30">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <Image src="/logo.svg" alt="제주맹글이" width={162} height={24} className="h-6 w-auto" />
          <p className="text-sm text-white/65">
            문의:{" "}
            <a
              href="mailto:darkwinterlab@gmail.com"
              className="font-medium text-jeju-mint transition-colors hover:text-white"
            >
              darkwinterlab@gmail.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
