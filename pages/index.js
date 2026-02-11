import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  HiPlay,
  HiStar,
  HiTrendingUp,
  HiUsers,
  HiChevronLeft,
  HiChevronRight,
  HiArrowRight,
  HiSparkles,
  HiChartBar,
  HiHeart,
  HiLightningBolt,
  HiCamera,
  HiGlobeAlt,
  HiUserGroup,
} from "react-icons/hi";

const PREVIEW_TYPES = [
  {
    icon: HiChartBar,
    name: "체험형 돌하르방",
    description: "완벽한 계획 없이는 출발할 수 없는 '찐 J형' 여행자",
    character: "엑셀로 감귤 익는 속도까지 계산하는 돌하르방",
    color: "from-jeju-ocean to-jeju-green",
    code: "A-C-E",
  },
  {
    icon: HiHeart,
    name: "자연형 돌하르방",
    description: "계획적으로 움직이되, 조용한 힐링이 최고의 여정",
    character: "성산일출봉 아래서 명상하다 환청 듣는 돌하르방",
    color: "from-jeju-green to-jeju-mint",
    code: "A-C-F",
  },
  {
    icon: HiLightningBolt,
    name: "액티비티형 돌하르방",
    description: "'여행은 체력전'이라는 철학을 가진 액티비티 괴인",
    character: "새벽 5시에 한라산 찍고 바로 스노쿨링하러 가는 돌하르방",
    color: "from-jeju-sunset to-jeju-tangerine",
    code: "A-D-E",
  },
  {
    icon: HiSparkles,
    name: "먹방형 돌하르방",
    description: "여행의 중심이 오로지 '먹는 것'에 있는 맛집 정복러",
    character: "흑돼지 집 가려고 비행기 시간 미루는 돌하르방",
    color: "from-jeju-tangerine to-jeju-coral",
    code: "A-D-F",
  },
  {
    icon: HiCamera,
    name: "레트로형 돌하르방",
    description: "계획보단 분위기를, 빠름보단 느림을 사랑하는 감성 여행자",
    character: "올레길 걷다 앉아서 인생 되돌아보는 돌하르방",
    color: "from-jeju-green to-jeju-mint",
    code: "B-C-E",
  },
  {
    icon: HiGlobeAlt,
    name: "문화예술형 돌하르방",
    description: "감성과 순간의 예쁨을 쫓아 제주를 떠도는 감성 탐험가",
    character: "감귤 창고 벽 앞에서 셀카 63장 찍는 돌하르방",
    color: "from-jeju-lavender to-jeju-coral",
    code: "B-C-F",
  },
  {
    icon: HiTrendingUp,
    name: "인생샷투어형 돌하르방",
    description:
      "무계획 여행 속에서도 액티비티와 SNS 업로드를 모두 챙기는 모험가",
    character: "용두암에서 셀카 찍다 물에 빠졌는데 개좋아하는 돌하르방",
    color: "from-jeju-sunset to-jeju-stone",
    code: "B-D-E",
  },
  {
    icon: HiUserGroup,
    name: "네트워킹형 돌하르방",
    description: "낯선 사람과의 대화에서 에너지를 얻는 인간소셜 제주러",
    character: "게하에서 1시간 만에 썸타고 2시간 뒤 싸우는 돌하르방",
    color: "from-jeju-coral to-jeju-lavender",
    code: "B-D-F",
  },
];

function CustomPieTooltip({ active, payload, totalResponses }) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0];
  const percentage = ((data.value / (totalResponses || 1)) * 100).toFixed(1);

  return (
    <div className="rounded-xl border border-white/20 bg-black/80 p-3 shadow-lg backdrop-blur-sm">
      <p className="font-semibold text-white">{data.name}</p>
      <p className="text-sm text-white/80">{`${data.value}명 (${percentage}%)`}</p>
    </div>
  );
}

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [statsData, setStatsData] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchStatsData = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard-data");
      const result = await response.json();

      if (response.ok && result.success) {
        setStatsData(result.data);
      }
    } catch (error) {
      console.error("통계 데이터 로드 실패:", error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsLoaded(true);
    fetchStatsData();
  }, [fetchStatsData]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % PREVIEW_TYPES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchStatsData();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchStatsData]);

  const rankedStats = useMemo(() => {
    if (!statsData?.finalResultStats) {
      return [];
    }

    return Object.entries(statsData.finalResultStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([type, count], index) => {
        const percentage = (
          (count / (statsData.totalResponses || 1)) *
          100
        ).toFixed(1);
        return { type, count, percentage, rank: index + 1 };
      });
  }, [statsData]);

  const activeType = PREVIEW_TYPES[currentSlide];

  return (
    <div className="min-h-screen text-slate-50">
      <Head>
        <title>제주맹글이 | 제주 돌하르방 여행유형 테스트</title>
        <meta
          name="description"
          content="9가지 밸런스 게임으로 나만의 제주 여행 성향을 찾고, AI 맞춤 코스 추천까지 받아보세요."
        />
        <meta
          property="og:title"
          content="제주맹글이 | 제주 돌하르방 여행유형 테스트"
        />
        <meta
          property="og:description"
          content="나만의 제주 여행 스타일을 진단하고 AI 맞춤 코스를 확인해보세요."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.제주맹글이.site/" />
        <meta
          property="og:image"
          content="https://www.제주맹글이.site/favicon.ico"
        />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <nav className="fixed left-4 right-4 top-4 z-50 rounded-2xl border border-white/20 bg-black/35 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-2 py-1.5 font-semibold text-white transition-colors hover:text-jeju-mint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-sky"
          >
            제주맹글이
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition-all hover:bg-white/20"
            >
              여행유형 테스트
            </Link>
            <Link
              href="https://oreum.xn--bj0b10u3zketa68a.site/"
              className="rounded-xl px-3 py-2 text-sm font-medium text-white/75 transition-colors hover:text-white"
            >
              오름모음
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-28 sm:px-6">
        <section className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-black/45 via-black/25 to-jeju-ocean/30 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-jeju-sky/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-jeju-sunset/20 blur-3xl" />

          <div className="relative z-10 max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/90">
              <HiSparkles className="h-4 w-4" />
              제주 여행 유형 테스트
            </div>

            <h1 className="mb-4 text-4xl font-black leading-tight sm:text-5xl md:text-6xl">
              <span className="text-gradient-jeju">제주맹글이</span>
              <span className="mt-2 block text-white">여행유형 테스트</span>
            </h1>

            <p className="max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
              밸런스 게임으로 당신의 제주 여행 성향을 진단하고, 결과에 맞춰 AI가
              여행 코스를 제안합니다.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/90">
                <HiLightningBolt className="h-4 w-4 text-jeju-cta" />
                1분 테스트
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/90">
                <HiChartBar className="h-4 w-4 text-jeju-sky" />
                8가지 유형 분석
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/90">
                <HiSparkles className="h-4 w-4 text-jeju-mint" />
                AI 코스 자동 생성
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/quiz"
                className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-jeju-ocean to-jeju-primary px-8 py-4 text-lg font-bold text-white shadow-lg shadow-jeju-ocean/30 transition-all duration-200 hover:-translate-y-0.5 hover:from-jeju-primary hover:to-jeju-ocean focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-sky"
              >
                <HiPlay className="h-5 w-5" />
                테스트 시작하기
                <HiArrowRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-5 text-sm text-white/80">
              <div className="inline-flex items-center gap-2">
                <HiUsers className="h-5 w-5 text-jeju-mint" />
                <span>{statsData?.totalResponses || 0}명 참여</span>
              </div>
              <div className="inline-flex items-center gap-2">
                <HiStar className="h-5 w-5 text-yellow-300" />
                <span>만족도 4.9/5</span>
              </div>
              <div className="inline-flex items-center gap-2">
                <HiTrendingUp className="h-5 w-5 text-jeju-cta" />
                <span>실시간 인기 테스트</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-black/35 p-4 backdrop-blur-xl sm:p-6">
            <div className="relative h-80 overflow-hidden rounded-2xl sm:h-96">
              {PREVIEW_TYPES.map((type, index) => {
                const TypeIcon = type.icon;

                return (
                  <div
                    key={type.code}
                    className={`absolute inset-0 transition-all duration-700 ease-out ${
                      index === currentSlide
                        ? "translate-x-0 opacity-100"
                        : index < currentSlide
                          ? "-translate-x-full opacity-0"
                          : "translate-x-full opacity-0"
                    }`}
                  >
                    <div className="relative h-full w-full overflow-hidden rounded-2xl">
                      <Image
                        src={`/result/img/${type.code}.png`}
                        alt={type.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 960px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20" />

                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center sm:p-10">
                        <div
                          className={`mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${type.color} shadow-lg`}
                        >
                          <TypeIcon className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="mb-3 text-2xl font-black text-white sm:text-3xl">
                          {type.name}
                        </h2>
                        <p className="mb-4 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
                          {type.description}
                        </p>
                        <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-xs text-white/85 sm:text-sm">
                          {type.character}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() =>
                setCurrentSlide(
                  (prev) =>
                    (prev - 1 + PREVIEW_TYPES.length) % PREVIEW_TYPES.length,
                )
              }
              aria-label="이전 슬라이드"
              className="absolute left-6 top-1/2 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/55 text-white transition-all hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-sky"
            >
              <HiChevronLeft className="h-6 w-6" />
            </button>

            <button
              onClick={() =>
                setCurrentSlide((prev) => (prev + 1) % PREVIEW_TYPES.length)
              }
              aria-label="다음 슬라이드"
              className="absolute right-6 top-1/2 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/55 text-white transition-all hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-sky"
            >
              <HiChevronRight className="h-6 w-6" />
            </button>

            <div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 gap-2">
              {PREVIEW_TYPES.map((type, index) => (
                <button
                  key={type.code}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`${type.name} 보기`}
                  className={`h-2.5 w-2.5 cursor-pointer rounded-full transition-all ${
                    index === currentSlide
                      ? "scale-125 bg-white"
                      : "bg-white/45"
                  }`}
                />
              ))}
            </div>
          </div>

          <div
            className={`mt-4 text-center text-sm text-white/70 ${isLoaded ? "animate-slide-up" : "opacity-0"}`}
          >
            현재 유형:{" "}
            <span className="font-semibold text-white">{activeType.name}</span>
          </div>
        </section>

        <section
          className={`mx-auto mt-12 max-w-5xl ${isLoaded ? "animate-slide-up" : "opacity-0"}`}
        >
          <div className="rounded-3xl border border-white/20 bg-black/35 p-6 backdrop-blur-xl sm:p-8">
            <div className="mb-6 text-center">
              <h3 className="text-2xl font-black text-white sm:text-3xl">
                실시간 결과 통계
              </h3>
              <p className="mt-2 text-sm text-white/75 sm:text-base">
                참여자 데이터가 30초 간격으로 업데이트됩니다.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="min-h-80">
                {statsLoading ? (
                  <div className="flex h-80 items-center justify-center">
                    <div className="text-center">
                      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                      <p className="mt-3 text-sm text-white/70">
                        통계 데이터 불러오는 중...
                      </p>
                    </div>
                  </div>
                ) : statsData?.pieChartData?.length ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={statsData.pieChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={118}
                        dataKey="value"
                        labelLine={false}
                        label={({ name, percent }) =>
                          percent > 0.07 ? `${name.slice(0, 6)}...` : ""
                        }
                      >
                        {statsData.pieChartData.map((entry, index) => (
                          <Cell
                            key={`pie-${entry.name}-${index}`}
                            fill={entry.fill}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={
                          <CustomPieTooltip
                            totalResponses={statsData?.totalResponses || 1}
                          />
                        }
                      />
                      <Legend
                        wrapperStyle={{ color: "#E2E8F0", fontSize: "12px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-80 items-center justify-center rounded-2xl border border-white/15 bg-white/5">
                    <p className="text-sm text-white/70">
                      아직 데이터가 없습니다. 첫 참여자가 되어보세요.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-center gap-4">
                <div className="rounded-2xl border border-white/15 bg-white/5 p-5 text-center">
                  <p className="text-sm text-white/70">총 참여자</p>
                  <p className="mt-1 text-4xl font-black text-jeju-sky">
                    {statsData?.totalResponses || 0}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
                  <h4 className="mb-3 text-lg font-bold text-white">
                    인기 TOP 3
                  </h4>
                  {rankedStats.length > 0 ? (
                    <div className="space-y-2.5">
                      {rankedStats.map((item) => (
                        <div
                          key={item.type}
                          className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3"
                        >
                          <div className="flex items-center gap-3 text-white">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-xs font-bold">
                              {item.rank}
                            </span>
                            <span className="font-medium">{item.type}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-white">
                              {item.count}명
                            </p>
                            <p className="text-xs text-white/65">
                              {item.percentage}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-white/65">
                      집계 데이터를 기다리는 중입니다.
                    </p>
                  )}
                </div>

                <p className="text-center text-xs text-white/50">
                  실시간 업데이트 • 30초 주기
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-black/30">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <Image
            src="/logo.svg"
            alt="제주맹글이"
            width={162}
            height={24}
            className="h-6 w-auto"
          />
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
