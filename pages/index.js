import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // 8가지 돌하르방 유형 미리보기 데이터
  const previewTypes = [
    {
      emoji: "📏",
      name: "계획돌하르방",
      color: "from-jeju-ocean to-jeju-sky",
      shadowColor: "hover:shadow-jeju",
      code: "A-C-E",
    },
    {
      emoji: "🍀",
      name: "힐링돌하르방",
      color: "from-jeju-green to-jeju-mint",
      shadowColor: "hover:shadow-sunset",
      code: "A-C-F",
    },
    {
      emoji: "💪",
      name: "근육돌하르방",
      color: "from-jeju-sunset to-jeju-tangerine",
      shadowColor: "hover:shadow-glow",
      code: "A-D-E",
    },
    {
      emoji: "🍜",
      name: "먹방돌하르방",
      color: "from-jeju-tangerine to-jeju-coral",
      shadowColor: "hover:shadow-sunset",
      code: "A-D-F",
    },
    {
      emoji: "🌿",
      name: "올레돌하르방",
      color: "from-jeju-green to-jeju-sky",
      shadowColor: "hover:shadow-jeju",
      code: "B-C-E",
    },
    {
      emoji: "🕯️",
      name: "감성돌하르방",
      color: "from-jeju-lavender to-jeju-coral",
      shadowColor: "hover:shadow-glow",
      code: "B-C-F",
    },
    {
      emoji: "🧗‍♂️",
      name: "모험돌하르방",
      color: "from-jeju-sunset to-jeju-stone",
      shadowColor: "hover:shadow-sunset",
      code: "B-D-E",
    },
    {
      emoji: "🥳",
      name: "인싸돌하르방",
      color: "from-jeju-coral to-jeju-lavender",
      shadowColor: "hover:shadow-glow",
      code: "B-D-F",
    },
  ];

  return (
    <div className="min-h-screen gradient-bg">
      <Head>
        <title>
          제주 돌하르방 여행유형 테스트 ✨ 나만의 제주 여행 스타일 찾기
        </title>
        <meta
          name="description"
          content="🗿 나는 어떤 돌하르방 여행 유형일까? 9가지 트렌디한 밸런스 게임으로 알아보는 제주여행 성향 테스트! MZ세대를 위한 감성 여행 진단"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />

        {/* 소셜 미디어 메타 태그 */}
        <meta property="og:title" content="제주 돌하르방 여행유형 테스트" />
        <meta
          property="og:description"
          content="나만의 제주 여행 스타일을 찾아보세요!"
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <main className="container mx-auto px-4 py-8 min-h-screen">
        {/* 메인 히어로 섹션 */}
        <div className="text-center mb-16 pt-8">
          <div
            className={`text-8xl mb-8 animate-float ${
              isLoaded ? "animate-scale-in" : ""
            }`}
          >
            🗿
          </div>

          <div
            className={`mb-6 ${isLoaded ? "animate-slide-up" : "opacity-0"}`}
          >
            <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
              <span className="block  text-gradient-jeju animate-gradient">
                제주맹글이
              </span>
              <span className="text-white bg-300%">여행유형 테스트</span>
            </h1>

            <div className="relative mx-auto max-w-lg">
              <div className="absolute -inset-1 bg-gradient-to-r from-jeju-sunset to-jeju-ocean rounded-4xl blur opacity-25"></div>
              <div className="relative backdrop-blur-sm p-6 ">
                <p className="text-md font-medium text-white leading-relaxed">
                  🌴 나는 어떤 돌하르방 여행 유형일까? 🌴
                  <br />
                  <span className="text-md text-white">
                    9가지 밸런스 게임으로
                    <br />
                  </span>
                  <span className="font-bold text-gradient-jeju">
                    나만의 제주여행 성향 발견
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 시작 버튼 섹션 */}
        <div
          className={`text-center mb-20 ${
            isLoaded ? "animate-scale-in" : "opacity-0"
          }`}
        >
          <div className="relative inline-block mb-4">
            <div className="absolute -inset-2 bg-gradient-to-r from-jeju-coral to-jeju-lavender rounded-6xl blur-lg opacity-20 animate-pulse-soft"></div>
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
            <div className="absolute -inset-1 bg-gradient-to-r from-jeju-ocean to-jeju-green rounded-6xl blur opacity-20"></div>
            <div className="relative card-glass border-l-4 border-jeju-ocean">
              <div className="flex items-center mb-6">
                <div className="text-3xl mr-4">📋</div>
                <h3 className="font-black text-2xl text-white">
                  테스트 가이드
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="w-8 h-8 bg-gradient-to-r from-jeju-ocean to-jeju-sky rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">
                      1
                    </span>
                    <span className="text-white font-medium">
                      총 9개의 밸런스 게임 질문
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-8 h-8 bg-gradient-to-r from-jeju-sunset to-jeju-coral rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">
                      2
                    </span>
                    <span className="text-white font-medium">
                      직감적으로 선택하는 것이 가장 정확
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="w-8 h-8 bg-gradient-to-r from-jeju-green to-jeju-mint rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">
                      3
                    </span>
                    <span className="text-white font-medium">
                      정답은 없으니 편안하게 선택
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-8 h-8 bg-gradient-to-r from-jeju-lavender to-jeju-coral rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">
                      4
                    </span>
                    <span className="text-white font-medium">
                      결과는 SNS로 친구들과 공유
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
