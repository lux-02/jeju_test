import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";

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

  // Supabase에 퀴즈 응답을 저장하는 함수
  const saveQuizResponse = async (
    sessionId,
    questionId,
    axis,
    selectedOption,
    finalResult = null
  ) => {
    try {
      const { data, error } = await supabase.from("quiz_responses").insert([
        {
          session_id: sessionId,
          question_id: questionId,
          axis: axis,
          selected_option: selectedOption,
          final_result: finalResult,
          question_text: QUESTIONS[questionId - 1].question,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("퀴즈 응답 저장 오류:", error);
      } else {
        console.log("퀴즈 응답 저장 성공:", data);
      }
    } catch (err) {
      console.error("데이터베이스 연결 오류:", err);
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

    // 현재 답변을 데이터베이스에 저장
    await saveQuizResponse(
      sessionId,
      currentQuestion + 1, // 질문 ID (1부터 시작)
      currentAxis,
      optionId
    );

    setIsAnimating(true);

    // 다음 질문으로 이동 또는 결과 페이지로
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
    }, 600);
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
    <div className="min-h-screen gradient-bg">
      <Head>
        <title>제주 돌하르방 여행유형 테스트 - Q{currentQuestion + 1}</title>
        <meta
          name="description"
          content={`제주여행 성향을 알아보는 트렌디한 밸런스 게임 - ${currentQ?.theme}`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8 min-h-screen">
        {/* 헤더 */}
        <div
          className={`flex items-center justify-between mb-8 ${
            isLoaded ? "animate-slide-up" : "opacity-0"
          }`}
        >
          <Link href="/">
            <div className="group flex items-center text-white/80 hover:text-white transition-colors cursor-pointer">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mr-3 group-hover:bg-white/30 transition-colors">
                <span className="text-xl">←</span>
              </div>
              <span className="font-medium">처음으로</span>
            </div>
          </Link>

          <div className="glass-effect px-4 py-2 rounded-full">
            <span className="text-white font-bold">
              {currentQuestion + 1} / {QUESTIONS.length}
            </span>
          </div>
        </div>

        {/* 진행바 */}
        <div className={`mb-16 ${isLoaded ? "animate-slide-up" : "opacity-0"}`}>
          <div className="relative">
            <div className="w-full bg-white/20 backdrop-blur-sm rounded-full h-4 mb-4">
              <div
                className="bg-gradient-to-r from-jeju-sunset to-jeju-ocean h-4 rounded-full transition-all duration-1000 ease-out shadow-glow relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-gradient"></div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-white/80 text-sm font-medium">
                {Math.round(progress)}% 완료
              </span>
              <span className="text-white/80 text-sm font-medium">
                거의 다 왔어요! 🗿✨
              </span>
            </div>
          </div>
        </div>

        {/* 질문 섹션 */}
        <div
          className={`max-w-4xl mx-auto text-center mb-16 ${
            isAnimating ? "animate-scale-in" : ""
          } ${isLoaded ? "animate-slide-up" : "opacity-0"}`}
        >
          {/* 질문 테마 */}
          <div className="mb-8">
            <div className="relative">
              <div
                className={`absolute -inset-4 bg-gradient-to-r ${currentQ?.bgGradient} rounded-6xl blur-3xl opacity-20`}
              ></div>
              <div className="relative">
                <div className="text-7xl mb-8 animate-float">🗿</div>
                <div className="glass-effect inline-block px-6 py-3 rounded-full mb-6">
                  <span className="text-white font-bold text-lg">
                    {currentQuestion + 1}번째 질문
                  </span>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-black text-white mb-8 leading-relaxed">
            {currentQ?.question}
          </h2>
        </div>

        {/* 선택지 */}
        <div className="max-w-3xl mx-auto space-y-6">
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
                  group relative w-full text-left overflow-hidden
                  bg-white/10 backdrop-blur-md border border-white/30 
                  rounded-6xl p-8 transition-all duration-500
                  hover:bg-white/20 hover:border-white/50 hover:scale-105 hover:shadow-glow
                  ${
                    isAnimating
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:-translate-y-2"
                  }
                `}
              >
                {/* 배경 그라디언트 효과 */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${option.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-6xl`}
                ></div>

                <div className="relative z-10 flex items-center space-x-6">
                  {/* 이모지 */}
                  <div className="text-5xl group-hover:scale-125 transition-transform duration-500 animate-float">
                    {option.emoji}
                  </div>

                  {/* 텍스트 콘텐츠 */}
                  <div className="flex-1">
                    <p className="font-bold text-xl md:text-2xl text-white leading-relaxed group-hover:text-jeju-sand transition-colors duration-300">
                      {option.text}
                    </p>
                  </div>

                  {/* 화살표 */}
                  <div className="text-white/60 group-hover:text-white group-hover:translate-x-2 transition-all duration-300">
                    <span className="text-3xl">→</span>
                  </div>
                </div>

                {/* 호버 시 나타나는 파동 효과 */}
                <div className="absolute inset-0 rounded-6xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 rounded-6xl animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                </div>
              </button>
            </div>
          ))}
        </div>

        {/* 하단 안내 */}
        <div
          className={`text-center mt-20 ${
            isLoaded ? "animate-slide-up" : "opacity-0"
          }`}
        >
          <div className="inline-block px-8 py-4 rounded-full">
            <p className="text-white/90 font-medium">
              💡 직감적으로 선택해주세요! 정답은 없어요 😊
            </p>
          </div>
        </div>
      </main>

      {/* 다이나믹 배경 효과 */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r ${currentQ?.bgGradient} rounded-full blur-3xl opacity-20 animate-pulse-soft`}
        ></div>
        <div
          className={`absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r ${currentQ?.bgGradient} rounded-full blur-3xl opacity-20 animate-pulse-soft`}
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
