import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";
import { HiArrowLeft, HiArrowRight, HiSparkles } from "react-icons/hi";

// 실제 질문 데이터
const QUESTIONS = [
  // X축: 여행 스타일 (A vs B)
  {
    id: 1,
    axis: "X",
    question: "여행 전에 하는 행동은?",
    theme: "🗺️ 여행 계획",
    bgGradient: "from-jeju-ocean to-jeju-sky",
    options: [
      {
        id: "A",
        emoji: "📋",
        text: "코스 짜다 눈물 남… 지도에 74개 핀 꽂음",
        desc: "계획형",
        color: "from-jeju-ocean to-jeju-green",
      },
      {
        id: "B",
        emoji: "✈️",
        text: "비행기만 있으면 됨. 숙소? 가서 정함",
        desc: "즉흥형",
        color: "from-jeju-sunset to-jeju-tangerine",
      },
    ],
  },
  {
    id: 2,
    axis: "X",
    question: "일정 중 변수 생기면?",
    theme: "🌦️ 예상치 못한 상황",
    bgGradient: "from-jeju-sky to-jeju-mint",
    options: [
      {
        id: "A",
        emoji: "😰",
        text: "플랜 틀어지면 온몸에 두드러기 남",
        desc: "계획형",
        color: "from-jeju-ocean to-jeju-stone",
      },
      {
        id: "B",
        emoji: "🌧️",
        text: '갑자기 비 와도 "와~ 갬성 있다" 하고 우산 안 씀',
        desc: "즉흥형",
        color: "from-jeju-coral to-jeju-lavender",
      },
    ],
  },
  {
    id: 3,
    axis: "X",
    question: "숙소 앞에서 갑자기 태풍 경보가 떴다면?",
    theme: "🌪️ 비상 상황",
    bgGradient: "from-jeju-stone to-jeju-lavender",
    options: [
      {
        id: "A",
        emoji: "🦺",
        text: "비 와도 예정대로! 우비 입고라도 일정 강행",
        desc: "계획형",
        color: "from-jeju-green to-jeju-ocean",
      },
      {
        id: "B",
        emoji: "😌",
        text: "이건 운명이야… 숙소에서 빈둥거리기로 마음의 평화 얻음",
        desc: "즉흥형",
        color: "from-jeju-sunset to-jeju-coral",
      },
    ],
  },
  // Y축: 에너지 방식 (C vs D)
  {
    id: 4,
    axis: "Y",
    question: "오전 일정이 비었을 때?",
    theme: "🌅 여유로운 오전",
    bgGradient: "from-jeju-green to-jeju-sky",
    options: [
      {
        id: "C",
        emoji: "🏖️",
        text: "모래사장에 누워서 2시간 멍 때림",
        desc: "차분형",
        color: "from-jeju-sky to-jeju-mint",
      },
      {
        id: "D",
        emoji: "🪂",
        text: "스카이다이빙 검색 중임. 심장 뛰어야 여행",
        desc: "활동형",
        color: "from-jeju-sunset to-jeju-stone",
      },
    ],
  },
  {
    id: 5,
    axis: "Y",
    question: "내가 꿈꾸는 제주 여행은?",
    theme: "💭 이상적인 여행",
    bgGradient: "from-jeju-mint to-jeju-lavender",
    options: [
      {
        id: "C",
        emoji: "🚶‍♀️",
        text: "말 한 마디 안 하고 조용히 걷는 올레길",
        desc: "차분형",
        color: "from-jeju-green to-jeju-sky",
      },
      {
        id: "D",
        emoji: "🤿",
        text: "스노클링하고 제트스키 타다 체력 고갈",
        desc: "활동형",
        color: "from-jeju-tangerine to-jeju-coral",
      },
    ],
  },
  {
    id: 6,
    axis: "Y",
    question: "밤이 되면?",
    theme: "🌙 제주의 밤",
    bgGradient: "from-jeju-lavender to-jeju-stone",
    options: [
      {
        id: "C",
        emoji: "🌙",
        text: "풀벌레 소리 들으며 혼자 산책",
        desc: "차분형",
        color: "from-jeju-lavender to-jeju-mint",
      },
      {
        id: "D",
        emoji: "🍻",
        text: "게하 사람들과 새벽 4시까지 술자리 털기",
        desc: "활동형",
        color: "from-jeju-coral to-jeju-sunset",
      },
    ],
  },
  // Z축: 중심 관심사 (E vs F)
  {
    id: 7,
    axis: "Z",
    question: "제주에서 가장 하고 싶은 건?",
    theme: "🏝️ 제주 버킷리스트",
    bgGradient: "from-jeju-coral to-jeju-ocean",
    options: [
      {
        id: "E",
        emoji: "🤿",
        text: "2시간 동안 기다려서 해녀 체험하기",
        desc: "체험형",
        color: "from-jeju-ocean to-jeju-green",
      },
      {
        id: "F",
        emoji: "☕",
        text: "2시간 동안 기다려서 감성 카페 가기",
        desc: "감성형",
        color: "from-jeju-coral to-jeju-lavender",
      },
    ],
  },
  {
    id: 8,
    axis: "Z",
    question: "여행 사진첩을 보면?",
    theme: "📸 추억 정리",
    bgGradient: "from-jeju-tangerine to-jeju-green",
    options: [
      {
        id: "E",
        emoji: "🐚",
        text: "전복 따다 웃긴 사진 46장",
        desc: "체험형",
        color: "from-jeju-sky to-jeju-green",
      },
      {
        id: "F",
        emoji: "📸",
        text: "색감 보정한 디저트 사진이 앨범 커버임",
        desc: "감성형",
        color: "from-jeju-sunset to-jeju-coral",
      },
    ],
  },
  {
    id: 9,
    axis: "Z",
    question: "제주에서 하루만 더 머물 수 있다면?",
    theme: "⏰ 마지막 하루",
    bgGradient: "from-jeju-sunset to-jeju-mint",
    options: [
      {
        id: "E",
        emoji: "🗿",
        text: "못 해본 체험 하나 더! 돌하르방 만들기 클래스 신청",
        desc: "체험형",
        color: "from-jeju-stone to-jeju-ocean",
      },
      {
        id: "F",
        emoji: "🍊",
        text: "못 찍은 감성샷 하나 더! 감귤색 벽 앞에서 인증샷",
        desc: "감성형",
        color: "from-jeju-tangerine to-jeju-lavender",
      },
    ],
  },
];

export default function Quiz() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    setIsLoaded(true);
    // 고유한 세션 ID 생성
    const newSessionId = `quiz_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    setSessionId(newSessionId);
  }, []);

  // 뒤로가기 함수 추가
  const handleGoBack = () => {
    if (currentQuestion === 0) {
      // 첫 번째 질문에서는 홈으로
      router.push("/");
    } else {
      // 이전 질문으로
      const previousQuestion = currentQuestion - 1;
      const currentAxis = QUESTIONS[previousQuestion].axis;

      // 이전 답변 제거
      const newAnswers = { ...answers };
      if (newAnswers[currentAxis] && newAnswers[currentAxis].length > 0) {
        newAnswers[currentAxis].pop(); // 마지막 답변 제거
        if (newAnswers[currentAxis].length === 0) {
          delete newAnswers[currentAxis]; // 빈 배열이면 키 자체 삭제
        }
      }

      setAnswers(newAnswers);
      setCurrentQuestion(previousQuestion);
    }
  };

  // 최종 결과를 저장하는 함수
  const saveFinalResult = async (sessionId, answers, finalResult) => {
    try {
      const { data, error } = await supabase.from("quiz_results").insert([
        {
          session_id: sessionId,
          final_result: finalResult,
          answers: JSON.stringify(answers), // 모든 답변을 JSON으로 저장
          completed_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("최종 결과 저장 오류:", error);
      } else {
        console.log("최종 결과 저장 성공:", data);
      }
    } catch (err) {
      console.error("최종 결과 저장 중 오류:", err);
    }
  };

  const handleAnswer = async (optionId) => {
    if (isAnimating || !sessionId) return;

    // 답변 저장
    const currentAxis = QUESTIONS[currentQuestion].axis;
    const newAnswers = {
      ...answers,
      [currentAxis]: [...(answers[currentAxis] || []), optionId],
    };
    setAnswers(newAnswers);

    setIsAnimating(true);

    // 다음 질문으로 이동 또는 결과 페이지로 (600ms → 300ms로 변경)
    setTimeout(async () => {
      if (currentQuestion < QUESTIONS.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setIsAnimating(false);
      } else {
        // 결과 계산 및 최종 결과 저장
        const result = calculateResult(newAnswers);

        // 최종 결과를 별도로 저장
        await saveFinalResult(sessionId, newAnswers, result);

        router.push(`/result/${result}`);
      }
    }, 300); // 600ms에서 300ms로 변경
  };

  const calculateResult = (answers) => {
    // X축 (A vs B) - 여행 스타일
    const xAnswers = answers.X || [];
    const aCount = xAnswers.filter((ans) => ans === "A").length;
    const bCount = xAnswers.filter((ans) => ans === "B").length;
    const xResult = aCount > bCount ? "A" : "B";

    // Y축 (C vs D) - 에너지 방식
    const yAnswers = answers.Y || [];
    const cCount = yAnswers.filter((ans) => ans === "C").length;
    const dCount = yAnswers.filter((ans) => ans === "D").length;
    const yResult = cCount > dCount ? "C" : "D";

    // Z축 (E vs F) - 중심 관심사
    const zAnswers = answers.Z || [];
    const eCount = zAnswers.filter((ans) => ans === "E").length;
    const fCount = zAnswers.filter((ans) => ans === "F").length;
    const zResult = eCount > fCount ? "E" : "F";

    return `${xResult}-${yResult}-${zResult}`;
  };

  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
  const currentQ = QUESTIONS[currentQuestion];

  return (
    <div className="min-h-screen gradient-bg text-slate-50">
      <Head>
        <title>{`제주맹글이 | 제주 돌하르방 여행유형 테스트 - Q${currentQuestion + 1}/9`}</title>
        <meta
          name="description"
          content={`제주여행 성향을 알아보는 트렌디한 밸런스 게임 - ${currentQ?.theme} | 제주도 여행 전 필수 테스트로 나만의 제주 여행 스타일 발견하기`}
        />

        {/* Open Graph */}
        <meta
          property="og:title"
          content={`제주맹글이 | 돌하르방 여행유형 테스트 - ${currentQ?.theme}`}
        />
        <meta
          property="og:description"
          content="제주도 여행 성향 테스트 진행 중! 나만의 제주 여행 스타일을 찾아보세요"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.제주맹글이.site/quiz" />
        <meta
          property="og:image"
          content="https://www.제주맹글이.site/favicon.ico"
        />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta
          name="twitter:title"
          content={`제주맹글이 | 돌하르방 여행유형 테스트 - ${currentQ?.theme}`}
        />
        <meta
          name="twitter:description"
          content="제주도 여행 성향 테스트 진행 중!"
        />

        {/* 추가 SEO */}
        <meta
          name="keywords"
          content="제주도, 제주여행, 돌하르방, 여행유형테스트, 제주관광, 밸런스게임, 제주여행스타일"
        />
        <link rel="canonical" href="https://www.제주맹글이.site/quiz" />
      </Head>

      <nav className="fixed left-4 right-4 top-4 z-50 rounded-2xl border border-white/20 bg-black/35 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-2 py-1.5 font-semibold text-white transition-colors hover:text-jeju-mint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-sky"
          >
            <Image
              src="/logo.svg"
              alt="제주맹글이"
              width={140}
              height={24}
              className="h-6 w-auto"
            />
          </Link>
          <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white">
            Q{currentQuestion + 1} / {QUESTIONS.length}
          </div>
        </div>
      </nav>

      <main className="mx-auto min-h-screen w-full max-w-5xl px-4 pb-16 pt-28 sm:px-6">
        <div
          className={`mb-8 rounded-2xl border border-white/20 bg-black/35 p-4 backdrop-blur-xl sm:p-5 ${
            isLoaded ? "animate-slide-up" : "opacity-0"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={handleGoBack}
              className="group inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-sky"
            >
              <HiArrowLeft className="h-4 w-4" />
              {currentQuestion === 0 ? "처음으로" : "이전 질문"}
            </button>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/95">
              <HiSparkles className="h-4 w-4 text-jeju-sky" />
              여행 성향 진단 진행 중
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-white/70 sm:text-sm">
              <span>{Math.round(progress)}% 완료</span>
              <span>거의 다 왔어요</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-white/15">
              <div
                className="relative h-full rounded-full bg-gradient-to-r from-jeju-sunset to-jeju-primary transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-gradient"></div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`mx-auto mb-8 max-w-4xl rounded-3xl border border-white/20 bg-black/35 p-6 text-center backdrop-blur-xl sm:p-8 ${
            isAnimating ? "animate-scale-in" : ""
          } ${isLoaded ? "animate-slide-up" : "opacity-0"}`}
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/90 sm:text-sm">
            <span className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${currentQ?.bgGradient}`} />
            {currentQ?.theme}
          </div>

          <h2 className="text-2xl font-black leading-relaxed text-white sm:text-4xl">
            {currentQ?.question}
          </h2>
        </div>

        <div className="mx-auto max-w-3xl space-y-4 sm:space-y-5">
          {currentQ?.options.map((option, index) => (
            <div
              key={option.id}
              className={`${
                isLoaded && !isAnimating ? "animate-slide-up" : "opacity-0"
              }`}
              style={{
                animationDelay: `${index * 0.2 + 0.3}s`,
                animationFillMode: "forwards",
              }}
            >
              <button
                onClick={() => handleAnswer(option.id)}
                disabled={isAnimating}
                className={`
                  group relative w-full overflow-hidden rounded-2xl border border-white/25 bg-black/35 p-5 text-left backdrop-blur-xl
                  transition-all duration-300 hover:-translate-y-0.5 hover:border-white/45 hover:bg-black/45 hover:shadow-glow
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-sky
                  ${
                    isAnimating
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }
                `}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${option.color} opacity-0 transition-opacity duration-300 group-hover:opacity-20`}
                ></div>

                <div className="relative z-10 flex items-center gap-4 sm:gap-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-3xl transition-transform duration-300 group-hover:scale-105">
                    {option.emoji}
                  </div>

                  <div className="flex-1">
                    <p className="text-lg font-bold leading-relaxed text-white sm:text-xl">
                      {option.text}
                    </p>
                    <p className="mt-1 text-sm font-medium text-white/70">
                      {option.desc}
                    </p>
                  </div>

                  <HiArrowRight className="h-5 w-5 text-white/70 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white" />
                </div>
              </button>
            </div>
          ))}
        </div>

        <div
          className={`text-center mt-10 ${
            isLoaded ? "animate-slide-up" : "opacity-0"
          }`}
        >
          <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-5 py-3">
            <p className="text-sm font-medium text-white/85">
              직감적으로 선택해도 괜찮아요. 정답은 없습니다.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 bg-black/30">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <Image
            src="/logo.svg"
            alt="제주맹글이"
            width={162}
            height={24}
            className="h-6 w-auto"
          />
          <div className="flex items-center gap-2 text-sm text-white/70">
            <span>문의:</span>
            <a
              href="mailto:darkwinterlab@gmail.com"
              className="font-medium text-jeju-mint transition-colors hover:text-white"
            >
              darkwinterlab@gmail.com
            </a>
          </div>
        </div>
      </footer>

      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-r ${currentQ?.bgGradient} opacity-20 blur-3xl animate-pulse-soft`}
        ></div>
        <div
          className={`absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-r ${currentQ?.bgGradient} opacity-20 blur-3xl animate-pulse-soft`}
          style={{ animationDelay: "1s" }}
        ></div>
      </div>
    </div>
  );
}
