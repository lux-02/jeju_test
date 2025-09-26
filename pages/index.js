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
// React Icons 추가
import {
  HiPlay,
  HiStar,
  HiTrendingUp,
  HiUsers,
  HiSparkles,
  HiChevronLeft,
  HiChevronRight,
  HiArrowRight,
} from "react-icons/hi";

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
        <div className="text-center relative px-2 sm:px-4">
          {/* 배경 효과 - 모바일 최적화 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-5 w-20 h-20 sm:w-32 sm:h-32 sm:top-20 sm:left-10 bg-jeju-ocean/20 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
            <div
              className="absolute top-20 right-8 w-24 h-24 sm:w-40 sm:h-40 sm:top-40 sm:right-20 bg-jeju-green/20 rounded-full blur-2xl sm:blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute bottom-10 left-1/4 w-16 h-16 sm:w-28 sm:h-28 sm:bottom-20 sm:left-1/3 bg-jeju-mint/20 rounded-full blur-2xl sm:blur-3xl animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>
          </div>

          <div className="relative z-10">
            {/* 돌하르방 캐릭터 */}
            <div className="relative rounded-3xl p-2 sm:mb-8">
              <div
                className={`text-7xl sm:text-8xl md:text-9xl mb-4 animate-float cursor-pointer transition-transform active:scale-125 touch-manipulation ${
                  isLoaded ? "animate-scale-in" : ""
                }`}
                onClick={() => {
                  // 클릭 시 재미있는 효과 - 모바일 최적화
                  const emoji = document.querySelector(".animate-float");
                  emoji.style.transform = "scale(1.3) rotate(360deg)";
                  setTimeout(() => {
                    emoji.style.transform = "";
                  }, 600);
                }}
              >
                🗿
              </div>
            </div>

            <div
              className={`mb-6 sm:mb-8 px-2 ${
                isLoaded ? "animate-slide-up" : "opacity-0"
              }`}
            >
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-tight mb-4 sm:mb-6">
                <span className="block text-gradient-jeju animate-gradient">
                  제주맹글이
                </span>
                <span className="text-white bg-300% relative text-3xl sm:text-4xl md:text-6xl">
                  여행유형 테스트
                  <HiSparkles className="inline ml-1 sm:ml-2 w-5 h-5 sm:w-6 sm:h-6 text-yellow-300 animate-pulse" />
                </span>
              </h1>

              <div className="relative mx-auto max-w-2xl">
                <div className="card-glass mb-4 sm:mb-6">
                  <div className="p-4 sm:p-6 md:p-8">
                    <p className="text-md sm:text-xl md:text-2xl font-bold text-white leading-relaxed mb-3 sm:mb-4">
                      나는 어떤 돌하르방 여행 유형일까? 🤔
                    </p>
                    <p className="text-sm sm:text-lg text-white/90 leading-relaxed">
                      밸런스 게임으로 나만의 제주 여행 성향을
                      <br /> 발견하고{" "}
                      <span className="text-jeju-mint font-semibold">
                        AI 맞춤 코스 추천
                      </span>
                      까지 받아보세요!
                    </p>
                  </div>
                </div>

                {/* 특징 배지들 - 모바일 최적화 */}
                <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12 sm:mb-8 px-2">
                  <div className="bg-gradient-to-r from-jeju-ocean/20 to-jeju-green/20 backdrop-blur-sm rounded-full px-3 py-1.5 sm:px-4 sm:py-2 border border-white/20">
                    <span className="text-white text-xs sm:text-sm font-medium">
                      ⚡ 1분 완료
                    </span>
                  </div>
                  <div className="bg-gradient-to-r from-jeju-green/20 to-jeju-mint/20 backdrop-blur-sm rounded-full px-3 py-1.5 sm:px-4 sm:py-2 border border-white/20">
                    <span className="text-white text-xs sm:text-sm font-medium">
                      🎯 8가지 유형
                    </span>
                  </div>
                  <div className="bg-gradient-to-r from-jeju-mint/20 to-jeju-coral/20 backdrop-blur-sm rounded-full px-3 py-1.5 sm:px-4 sm:py-2 border border-white/20">
                    <span className="text-white text-xs sm:text-sm font-medium">
                      🤖 AI 코스 생성
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 시작 버튼 섹션 */}
        <div
          className={`text-center mb-10 sm:mb-16 px-4 ${
            isLoaded ? "animate-scale-in" : "opacity-0"
          }`}
        >
          <div className="relative inline-block mb-6 sm:mb-8">
            <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-jeju-ocean via-jeju-green to-jeju-mint rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl opacity-30 animate-pulse"></div>
            <Link href="/quiz">
              <button className="relative bg-gradient-to-r from-jeju-ocean to-jeju-green hover:from-jeju-green hover:to-jeju-ocean text-white text-lg sm:text-xl md:text-2xl px-8 py-4 sm:px-12 sm:py-5 md:px-16 md:py-6 rounded-2xl sm:rounded-3xl font-black transition-all duration-300 transform active:scale-95 hover:scale-105 shadow-2xl group touch-manipulation">
                <span className="flex items-center justify-center gap-2 sm:gap-3">
                  <HiPlay className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                  테스트 시작하기
                  <HiSparkles className="w-5 h-5 sm:w-6 sm:h-6 group-hover:animate-spin" />
                </span>
              </button>
            </Link>
          </div>

          {/* 통계 미니 카드 - 모바일 최적화 */}
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8 text-white/80">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <HiUsers className="w-4 h-4 sm:w-5 sm:h-5 text-jeju-mint" />
              <span className="text-xs sm:text-sm font-medium">
                {statsData?.totalResponses || 0}명 참여
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <HiStar className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              <span className="text-xs sm:text-sm font-medium">평점 4.9</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <HiTrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-jeju-coral" />
              <span className="text-xs sm:text-sm font-medium">
                실시간 인기
              </span>
            </div>
          </div>
        </div>

        {/* 결과 미리보기 자동 슬라이드 캐러셀 */}

        <div className="mb-10">
          <div className="relative">
            {/* 메인 캐러셀 영역 - 모바일 최적화 */}
            <div className="relative h-72 sm:h-80 md:h-96 overflow-hidden rounded-xl sm:rounded-2xl">
              {previewTypes.map((type, index) => (
                <div
                  key={type.code}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                    index === currentSlide
                      ? "opacity-100 transform translate-x-0"
                      : index < currentSlide
                      ? "opacity-0 transform -translate-x-full"
                      : "opacity-0 transform translate-x-full"
                  }`}
                >
                  <div
                    className={`w-full h-full  rounded-xl sm:rounded-2xl relative overflow-hidden group active:scale-95 transition-transform touch-manipulation`}
                  >
                    {/* 배경 이미지 */}
                    <div className="absolute inset-0">
                      <Image
                        src={getResultImagePath(type.code)}
                        alt={type.name}
                        fill
                        className="object-cover opacity-30 group-active:opacity-50 transition-opacity duration-300"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      <div className="absolute"></div>
                    </div>

                    {/* 콘텐츠 - 모바일 최적화 */}
                    <div className="absolute inset-0 flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 text-center">
                      <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-3 sm:mb-4 transform group-active:scale-110 transition-transform duration-300">
                        {type.emoji}
                      </div>
                      <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-white mb-2 sm:mb-3 md:mb-4">
                        {type.name}
                      </h3>
                      <p className="text-white/90 text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-5 md:mb-6 leading-relaxed max-w-xs sm:max-w-sm md:max-w-lg px-2">
                        {type.description}
                      </p>
                      <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3 border border-white/30 max-w-xs sm:max-w-sm md:max-w-md">
                        <p className="text-white text-xs sm:text-sm font-medium leading-tight">
                          💭 {type.character}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 네비게이션 화살표 - 모바일 터치 최적화 */}
            <button
              onClick={() =>
                setCurrentSlide(
                  (prev) =>
                    (prev - 1 + previewTypes.length) % previewTypes.length
                )
              }
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/60 backdrop-blur-sm active:bg-black/80 text-white rounded-full flex items-center justify-center transition-all duration-200 z-10 active:scale-95 touch-manipulation"
            >
              <HiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button
              onClick={() =>
                setCurrentSlide((prev) => (prev + 1) % previewTypes.length)
              }
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/60 backdrop-blur-sm active:bg-black/80 text-white rounded-full flex items-center justify-center transition-all duration-200 z-10 active:scale-95 touch-manipulation"
            >
              <HiChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* 인디케이터 도트 - 모바일 터치 최적화 */}
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
              {previewTypes.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-200 touch-manipulation ${
                    index === currentSlide
                      ? "bg-white scale-125"
                      : "bg-white/40 active:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

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
            <div className="flex items-center space-x-4">
              <Image
                src="/logo.svg"
                alt="제주맹글이"
                width={162}
                height={24}
                className="h-6 w-auto"
              />
            </div>
            <div className="text-center md:text-right">
              <p className="text-white/60 text-sm">
                문의:{" "}
                <a
                  href="mailto:darkwinterlab@gmail.com"
                  className="text-jeju-mint hover:text-white transition-colors font-medium"
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
