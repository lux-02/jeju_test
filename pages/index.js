import Head from "next/head";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [statsData, setStatsData] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // 실시간 통계 데이터 가져오기
  const fetchStatsData = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard-data");
      const result = await response.json();

      if (result.success) {
        setStatsData(result.data);
        setStatsLoading(false);
      }
    } catch (error) {
      console.error("통계 데이터 로드 실패:", error);
      setStatsLoading(false);
    }
  }, []);

  // 초기 통계 데이터 로드
  useEffect(() => {
    fetchStatsData();
  }, [fetchStatsData]);

  // 자동 캐러셀 (5초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % previewTypes.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // 실시간 통계 업데이트 (30초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStatsData();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchStatsData]);

  // 결과 이미지 경로 유틸리티 함수
  const getResultImagePath = (code) => {
    return `/result/img/${code}.png`;
  };

  // 통계 그래프 커스텀 툴팁
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = (
        (data.value / statsData?.totalResponses || 1) * 100
      ).toFixed(1);

      return (
        <div className="bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-white/80 text-sm">{`${data.value}명 (${percentage}%)`}</p>
        </div>
      );
    }
    return null;
  };

  // 8가지 돌하르방 유형 미리보기 데이터
  const previewTypes = [
    {
      emoji: "📊",
      name: "체험형 돌하르방",
      title: "체험형 돌하르방",
      description: "완벽한 계획 없이는 출발할 수 없는 '찐 J형' 여행자",
      character: "엑셀로 감귤 익는 속도까지 계산하는 돌하르방",
      color: "from-jeju-ocean to-jeju-green",
      shadowColor: "hover:shadow-jeju",
      code: "A-C-E",
    },
    {
      emoji: "🍃",
      name: "자연형 돌하르방",
      title: "자연형 돌하르방",
      description: "계획적으로 움직이되, 조용한 힐링이 최고의 여정",
      character: "성산일출봉 아래서 명상하다 환청 듣는 돌하르방",
      color: "from-jeju-green to-jeju-mint",
      shadowColor: "hover:shadow-sunset",
      code: "A-C-F",
    },
    {
      emoji: "🥾",
      name: "액티비티형 돌하르방",
      title: "액티비티형 돌하르방",
      description: "'여행은 체력전'이라는 철학을 가진 액티비티 괴인",
      character: "새벽 5시에 한라산 찍고 바로 스노쿨링하러 가는 돌하르방",
      color: "from-jeju-sunset to-jeju-tangerine",
      shadowColor: "hover:shadow-glow",
      code: "A-D-E",
    },
    {
      emoji: "🍖",
      name: "먹방형 돌하르방",
      title: "먹방형 돌하르방",
      description: "여행의 중심이 오로지 '먹는 것'에 있는 맛집 정복러",
      character: "흑돼지 집 가려고 비행기 시간 미루는 돌하르방",
      color: "from-jeju-tangerine to-jeju-coral",
      shadowColor: "hover:shadow-sunset",
      code: "A-D-F",
    },
    {
      emoji: "🌿",
      name: "레트로형 돌하르방",
      title: "레트로형 돌하르방",
      description:
        "계획보단 분위기를, 빠름보단 느림을 사랑하는 진짜 레트로 감성러",
      character: "올레길 걷다 앉아서 인생 되돌아보는 돌하르방",
      color: "from-jeju-green to-jeju-mint",
      shadowColor: "hover:shadow-jeju",
      code: "B-C-E",
    },
    {
      emoji: "📷",
      name: "문화예술형 돌하르방",
      title: "문화예술형 돌하르방",
      description: "감성과 순간의 예쁨을 쫓아 제주를 떠도는 감성 탐험가",
      character: "감귤 창고 벽 앞에서 셀카 63장 찍는 돌하르방",
      color: "from-jeju-lavender to-jeju-coral",
      shadowColor: "hover:shadow-glow",
      code: "B-C-F",
    },
    {
      emoji: "🌊",
      name: "인생샷투어형 돌하르방",
      title: "인생샷투어형 돌하르방",
      description:
        "무계획 여행 속에서도 액티비티와 SNS 업로드를 모두 챙기는 모험가",
      character: "용두암에서 셀카 찍다 물에 빠졌는데 개좋아하는 돌하르방",
      color: "from-jeju-sunset to-jeju-stone",
      shadowColor: "hover:shadow-sunset",
      code: "B-D-E",
    },
    {
      emoji: "🍶",
      name: "네트워킹형 돌하르방",
      title: "네트워킹형 돌하르방",
      description: "낯선 사람과의 대화에서 에너지를 얻는 인간소셜 제주러",
      character: "게하에서 1시간 만에 썸타고 2시간 뒤 싸우는 돌하르방",
      color: "from-jeju-coral to-jeju-lavender",
      shadowColor: "hover:shadow-glow",
      code: "B-D-F",
    },
  ];

  return (
    <div className="min-h-screen">
      <Head>
        <title>
          제주맹글이 | 제주 돌하르방 여행유형 테스트 ✨ 나만의 제주 여행 스타일
          찾기
        </title>
        <meta
          name="description"
          content="🗿 제주도 여행 전 필수! 나는 어떤 돌하르방 여행 유형일까? 9가지 트렌디한 밸런스 게임으로 알아보는 제주여행 성향 테스트! 제주 액티비티, 제주 맛집, 제주 힐링 스팟까지 - MZ세대를 위한 제주 감성 여행 진단"
        />

        {/* Open Graph 메타 태그 */}
        <meta
          property="og:title"
          content="제주맹글이 | 제주 돌하르방 여행유형 테스트"
        />
        <meta
          property="og:description"
          content="제주도 여행 전 필수! 나만의 제주 여행 스타일을 찾아보세요! 돌하르방 여행유형 테스트로 제주 액티비티, 맛집, 힐링 스팟 추천받기"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.제주맹글이.site/" />
        <meta
          property="og:image"
          content="https://www.제주맹글이.site/favicon.ico"
        />
        <meta property="og:image:alt" content="제주맹글이 돌하르방 캐릭터" />
        <meta property="og:locale" content="ko_KR" />
        <meta property="og:site_name" content="제주맹글이" />

        {/* Twitter Card 메타 태그 */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="제주맹글이 | 제주 돌하르방 여행유형 테스트"
        />
        <meta
          name="twitter:description"
          content="제주도 여행 전 필수! 나만의 제주 여행 스타일을 찾아보세요!"
        />
        <meta
          name="twitter:image"
          content="https://www.제주맹글이.site/favicon.ico"
        />

        {/* 추가 SEO 메타 태그 */}
        <meta name="geo.region" content="KR-49" />
        <meta name="geo.placename" content="제주도" />
        <meta name="geo.position" content="33.499621;126.531219" />
        <meta name="ICBM" content="33.499621, 126.531219" />

        {/* 구조화된 데이터 (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "제주맹글이",
              alternateName: "제주 돌하르방 여행유형 테스트",
              description:
                "제주도 여행 전 필수! 나는 어떤 돌하르방 여행 유형일까? 9가지 트렌디한 밸런스 게임으로 알아보는 제주여행 성향 테스트",
              url: "https://www.제주맹글이.site/",
              applicationCategory: "TravelApplication",
              operatingSystem: "Web Browser",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "KRW",
              },
              author: {
                "@type": "Organization",
                name: "제주맹글이",
              },
              publisher: {
                "@type": "Organization",
                name: "제주맹글이",
                logo: {
                  "@type": "ImageObject",
                  url: "https://www.제주맹글이.site/favicon.ico",
                },
              },
              about: [
                {
                  "@type": "Place",
                  name: "제주도",
                  geo: {
                    "@type": "GeoCoordinates",
                    latitude: 33.499621,
                    longitude: 126.531219,
                  },
                },
                {
                  "@type": "Thing",
                  name: "여행",
                  sameAs: "https://ko.wikipedia.org/wiki/여행",
                },
                {
                  "@type": "Thing",
                  name: "돌하르방",
                  sameAs: "https://ko.wikipedia.org/wiki/돌하르방",
                },
              ],
              keywords:
                "제주도, 제주여행, 돌하르방, 여행유형테스트, 제주관광, 제주액티비티, 제주맛집, 제주힐링",
              inLanguage: "ko",
              potentialAction: {
                "@type": "PlayAction",
                target: "https://www.제주맹글이.site/quiz",
              },
            }),
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Quiz",
              name: "제주 돌하르방 여행유형 테스트",
              description:
                "9가지 밸런스 게임으로 알아보는 나만의 제주 여행 스타일",
              about: {
                "@type": "Place",
                name: "제주도",
                alternateName: "Jeju Island",
              },
              educationalLevel: "beginner",
              timeRequired: "PT5M",
              numberOfQuestions: 9,
              assesses: "여행 성향",
              hasPart: previewTypes.map((type, index) => ({
                "@type": "Question",
                name: `질문 ${index + 1}`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: type.name,
                },
              })),
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "KRW",
              },
            }),
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "제주맹글이",
                  item: "https://www.제주맹글이.site/",
                },
              ],
            }),
          }}
        />
      </Head>

      {/* 네비게이션 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-white font-bold text-xl">
              🗿 제주맹글이
            </Link>
            <div className="flex space-x-6">
              <Link
                href="/"
                className="text-white font-bold hover:text-white transition-colors"
              >
                여행유형 테스트
              </Link>
              <Link
                href="https://oreum.xn--bj0b10u3zketa68a.site/"
                className="text-white/60 font-bold hover:text-white transition-colors"
              >
                오름모음
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 min-h-screen pt-20">
        {/* 메인 히어로 섹션 */}
        <div className="text-center">
          <div className="relative rounded-3xl p-2">
            {/* 캐러셀 메인 슬라이드 */}
            <div
              className={`text-8xl mb-8 animate-float ${
                isLoaded ? "animate-scale-in" : ""
              }`}
            >
              🗿
            </div>
          </div>
          <div
            className={`mb-2 ${isLoaded ? "animate-slide-up" : "opacity-0"}`}
          >
            <h1 className="text-4xl md:text-6xl font-black leading-tight">
              <span className="block  text-gradient-jeju animate-gradient">
                제주맹글이
              </span>
              <span className="text-white bg-300%">여행유형 테스트</span>
            </h1>

            <div className="relative mx-auto max-w-lg">
              <div className="absolute rounded-4xl blur opacity-25"></div>
              <div className="relative backdrop-blur-sm p-6 ">
                <p className="text-md font-medium text-gradient-jeju leading-relaxed">
                  나는 어떤 돌하르방 여행 유형일까?
                  <br />
                  <span className="text-md text-white">
                    밸런스 게임으로 나만의 여행 성향을 발견!
                    <br />
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 시작 버튼 섹션 */}
        <div
          className={`text-center mb-10 ${
            isLoaded ? "animate-scale-in" : "opacity-0"
          }`}
        >
          <div className="relative inline-block mb-4">
            <div className="absolute -inset-2 rounded-6xl blur-lg opacity-20 animate-pulse-soft"></div>
            <Link href="/quiz">
              <button className="relative btn-primary text-xl px-12 py-6 font-black hover-glow jeju-wave">
                ✨ 테스트 시작하기 ✨
              </button>
            </Link>
          </div>
        </div>

        {/* 테스트 안내 */}
        <div
          className={`max-w-3xl mx-auto mb-16 ${
            isLoaded ? "animate-slide-up" : "opacity-0"
          }`}
        >
          <div className="relative">
            <div className="relative card-glass">
              <div className="flex flex-col p-4 ">
                <div className="flex flex-col gap-4 ">
                  <div className="flex items-center">
                    <span className="text-white font-medium">
                      1. 총 9개의 밸런스 게임 질문
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-white font-medium">
                      2. 직감적으로 선택하는 것이 가장 정확
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-white font-medium">
                      3. 정답은 없으니 편안하게 선택
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-white font-medium">
                      4. 결과는 SNS로 친구들과 공유
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 결과 미리보기 자동 슬라이드 캐러셀 */}
        <div
          className={`max-w-6xl mx-auto mb-16 ${
            isLoaded ? "animate-slide-up" : "opacity-0"
          }`}
          style={{ animationDelay: "0.3s" }}
        ></div>

        {/* 실시간 통계 원형 그래프 */}
        <div
          className={`max-w-4xl mx-auto mb-16 ${
            isLoaded ? "animate-slide-up" : "opacity-0"
          }`}
          style={{ animationDelay: "0.5s" }}
        >
          <div className="card-glass">
            <div className="text-center pt-4 mb-4">
              <h3 className="text-3xl font-black text-white mb-4">
                📊 실시간 결과 통계
              </h3>
              <p className="text-white/80 mb-6">
                지금까지 참여한 사람들의 결과 분포를 <br /> 실시간으로
                확인해보세요!
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 통계 그래프 */}
              <div className="flex flex-col justify-center">
                {statsLoading ? (
                  <div className="flex items-center justify-center h-80">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                      <p className="text-white/80">통계 데이터 로딩 중...</p>
                    </div>
                  </div>
                ) : statsData?.pieChartData &&
                  statsData.pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={statsData.pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          percent > 5 ? `${name.substring(0, 6)}...` : ""
                        }
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statsData.pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Legend
                        wrapperStyle={{ color: "#9CA3AF", fontSize: "12px" }}
                        layout="horizontal"
                        align="center"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-80">
                    <div className="text-center">
                      <div className="text-4xl mb-4">📊</div>
                      <p className="text-white/80">아직 데이터가 없어요!</p>
                      <p className="text-white/60 text-sm mt-2">
                        첫 번째 참여자가 되어보세요!
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 통계 정보 */}
              <div className="flex flex-col justify-center space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-400 mb-2">
                    {statsData?.totalResponses || 0}
                  </div>
                  <div className="text-white/80">총 참여자 수</div>
                </div>

                <div className=" p-6 rounded-4xl">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                    <span className="text-2xl mr-2">🔥</span>
                    인기 순위 TOP 3
                  </h4>

                  {statsData?.finalResultStats ? (
                    <div className="space-y-3">
                      {Object.entries(statsData.finalResultStats)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 3)
                        .map(([type, count], index) => {
                          const percentage = (
                            (count / statsData.totalResponses) *
                            100
                          ).toFixed(1);
                          const medals = ["🥇", "🥈", "🥉"];

                          return (
                            <div
                              key={type}
                              className="flex items-center justify-between p-3 bg-white/10 rounded-2xl"
                            >
                              <div className="flex items-center">
                                <span className="text-lg mr-3">
                                  {medals[index]}
                                </span>
                                <span className="text-white font-medium">
                                  {type}
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="text-white font-bold">
                                  {count}명
                                </div>
                                <div className="text-white/60 text-sm">
                                  {percentage}%
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center text-white/60 py-4">
                      데이터를 기다리는 중...
                    </div>
                  )}
                </div>

                <div className="text-center text-white/40 text-xs">
                  실시간 업데이트 • 30초마다 갱신
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900/50 backdrop-blur-sm border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-white/80 text-sm">Copyright © 제주맹글이</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-white/60 text-sm">
                문의:{" "}
                <a
                  href="mailto:darkwinterlab@gmail.com"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  darkwinterlab@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
