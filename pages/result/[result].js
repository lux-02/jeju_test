import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { TYPE_MAPPING } from "../../lib/typeMapping";
// React Icons 추가
import {
  HiVolumeOff,
  HiVolumeUp,
  HiPlay,
  HiPause,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi";

// 8가지 돌하르방 유형 상세 정보
const RESULT_TYPES = {
  "A-C-E": {
    emoji: "📊",
    name: "체험형 돌하르방",
    title: "체험형 돌하르방",
    description: "완벽한 계획 없이는 출발할 수 없는 '찐 J형' 여행자",
    character: "엑셀로 감귤 익는 속도까지 계산하는 돌하르방",
    color: "from-jeju-ocean to-jeju-green",
    shadowColor: "hover:shadow-jeju",
    traits: [
      "✅ 모든 것이 계획대로 되어야 안심",
      "📅 여행 일정을 분 단위로 짜는 스타일",
      "🎯 목표 지향적이고 효율성을 추구",
      "📋 체크리스트 없으면 불안해하는 유형",
    ],
    recommendations: [
      "성산일출봉 일출 시간 정확히 체크하고 방문",
      "제주 올레길 코스별 소요시간 미리 확인",
      "유명 카페들의 대기시간까지 고려한 스케줄링",
      "렌터카 예약부터 주차장 위치까지 사전 조사",
    ],
  },
  "A-C-F": {
    emoji: "🍃",
    name: "자연형 돌하르방",
    title: "자연형 돌하르방",
    description: "계획적으로 움직이되, 조용한 힐링이 최고의 여정",
    character: "성산일출봉 아래서 명상하다 환청 듣는 돌하르방",
    color: "from-jeju-green to-jeju-mint",
    shadowColor: "hover:shadow-sunset",
    traits: [
      "🌿 자연과 함께하는 시간을 소중히 여김",
      "🧘‍♀️ 조용하고 평화로운 분위기 선호",
      "📖 혼자만의 시간도 즐길 줄 아는 유형",
      "🌅 느린 여행을 통해 진정한 휴식 추구",
    ],
    recommendations: [
      "한라산 둘레길에서 천천히 자연 만끽",
      "카멜리아힐에서 계절별 꽃 감상",
      "제주 해변에서 선셋 감상하며 힐링",
      "조용한 카페에서 제주 풍경 바라보며 독서",
    ],
  },
  "A-D-E": {
    emoji: "🥾",
    name: "액티비티형 돌하르방",
    title: "액티비티형 돌하르방",
    description: "'여행은 체력전'이라는 철학을 가진 액티비티 괴인",
    character: "새벽 5시에 한라산 찍고 바로 스노쿨링하러 가는 돌하르방",
    color: "from-jeju-sunset to-jeju-tangerine",
    shadowColor: "hover:shadow-glow",
    traits: [
      "⚡ 활동적이고 에너지가 넘치는 스타일",
      "🏃‍♂️ 체험과 액티비티로 가득 찬 일정 선호",
      "🎯 새로운 도전을 즐기는 모험가 기질",
      "💪 체력적으로 힘들어도 경험을 우선시",
    ],
    recommendations: [
      "한라산 등반으로 정상 정복하기",
      "제주 바다에서 스노쿨링/다이빙 체험",
      "ATV나 승마 등 스릴 넘치는 액티비티",
      "제주 올레길 완주 도전",
    ],
  },
  "A-D-F": {
    emoji: "🍖",
    name: "먹방형 돌하르방",
    title: "먹방형 돌하르방",
    description: "계획적 먹방러, 맛집 리스트는 이미 완벽하게 준비 완료",
    character: "흑돼지 먹고 바로 갈치조림 먹으러 가는 돌하르방",
    color: "from-jeju-tangerine to-jeju-sunset",
    shadowColor: "hover:shadow-food",
    traits: [
      "🍽️ 제주의 모든 유명 맛집 정복이 목표",
      "📝 미리 조사한 맛집 리스트로 동선 계획",
      "🥩 현지 특색 음식은 절대 놓칠 수 없는 유형",
      "📸 음식 사진은 기본, SNS 공유는 필수",
    ],
    recommendations: [
      "제주 3대 흑돼지 맛집 투어",
      "성게미역국, 갈치조림 등 제주 향토음식",
      "제주 감귤과 한라봉 직접 따기 체험",
      "제주 전통시장에서 로컬 푸드 탐방",
    ],
  },
  "B-C-E": {
    emoji: "📸",
    name: "레트로형 돌하르방",
    title: "레트로형 돌하르방",
    description: "즉흥적이면서도 감성 충만한 레트로 감성 여행자",
    character: "필름카메라로 돌담길 찍다가 길 잃는 돌하르방",
    color: "from-jeju-stone to-jeju-mint",
    shadowColor: "hover:shadow-retro",
    traits: [
      "📷 레트로하고 감성적인 분위기를 추구",
      "🎨 즉흥적이지만 분위기 있는 장소 선호",
      "🌸 인스타그램에 올릴 감성 사진에 진심",
      "🎵 분위기 좋은 카페와 소품샵 탐방 필수",
    ],
    recommendations: [
      "제주 돌담길과 전통 마을 골목 탐방",
      "감성 넘치는 제주 카페에서 필름 사진",
      "제주 해녀문화 체험과 포토존 방문",
      "제주 전통 공예 체험과 소품 만들기",
    ],
  },
  "B-C-F": {
    emoji: "🎨",
    name: "문화예술형 돌하르방",
    title: "문화예술형 돌하르방",
    description: "즉흥적이되 깊이 있는 문화 체험을 추구하는 예술가",
    character: "박물관에서 도슨트 설명보다 더 자세히 아는 돌하르방",
    color: "from-jeju-purple to-jeju-ocean",
    shadowColor: "hover:shadow-art",
    traits: [
      "🎭 제주의 역사와 문화에 깊은 관심",
      "🖼️ 박물관, 미술관 등 문화 공간 즐겨 방문",
      "📚 즉흥적이지만 의미 있는 경험 추구",
      "🎪 지역 축제나 문화 행사에 적극 참여",
    ],
    recommendations: [
      "제주 박물관과 민속촌에서 역사 탐방",
      "제주 현대미술관과 갤러리 투어",
      "제주 전통 문화 체험 (한지 만들기, 도자기)",
      "제주 지역 축제나 공연 관람",
    ],
  },
  "B-D-E": {
    emoji: "📷",
    name: "인생샷투어형 돌하르방",
    title: "인생샷투어형 돌하르방",
    description: "즉흥적으로 움직이며 인생샷 명소만 골라 다니는 여행자",
    character: "용두암에서 셀카 찍다 물에 빠졌는데 개좋아하는 돌하르방",
    color: "from-jeju-sunset to-jeju-stone",
    shadowColor: "hover:shadow-sunset",
    traits: [
      "📸 SNS용 완벽한 인생샷이 여행의 목적",
      "⚡ 즉흥적이고 트렌디한 핫플레이스 추구",
      "🌟 남들이 안 가본 숨은 포토존 발굴",
      "💫 여행 후 SNS 피드가 작품이 되는 유형",
    ],
    recommendations: [
      "성산일출봉과 우도의 황홀한 풍경 포착",
      "제주 카페의 예쁜 인테리어와 디저트 샷",
      "제주 해변의 선셋과 일출 타임랩스",
      "제주 독특한 건축물과 벽화 골목 탐방",
    ],
  },
  "B-D-F": {
    emoji: "🍶",
    name: "네트워킹형 돌하르방",
    title: "네트워킹형 돌하르방",
    description: "즉흥적으로 사람들과 어울리며 제주를 만끽하는 소셜러",
    character: "술집에서 현지인이랑 친해져서 숨은 맛집 알아내는 돌하르방",
    color: "from-jeju-ocean to-jeju-purple",
    shadowColor: "hover:shadow-social",
    traits: [
      "🍻 현지인들과의 만남과 교류 중시",
      "🎉 즉흥적이고 사교적인 여행 스타일",
      "🗣️ 새로운 사람들과의 네트워킹 즐김",
      "🎪 지역 축제나 이벤트에서 현지 문화 체험",
    ],
    recommendations: [
      "제주 현지인 추천 숨은 맛집과 술집 탐방",
      "제주 농장이나 체험 마을에서 현지인과 교류",
      "제주 전통 시장에서 상인들과의 소통",
      "제주 게스트하우스나 민박에서 여행자들과 정보 교환",
    ],
  },
};

export default function ResultPage() {
  const router = useRouter();
  const { result } = router.query;
  const [aiCourse, setAiCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCourse, setShowCourse] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [userPreferences, setUserPreferences] = useState({
    region: "전체",
    weather: "맑음",
    companion: "연인/친구",
    mood: "활동적",
    budget: "보통",
    duration: "1박 2일",
  });

  // 캐러셀 상태
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);

  // 영상 컨트롤 상태
  const [videoStates, setVideoStates] = useState({
    isPlaying: true,
    isMuted: true,
  });

  // 이미지/영상 전환 상태
  const [showImage, setShowImage] = useState(false);

  // 공유 모달 상태
  const [showShareModal, setShowShareModal] = useState(false);

  // 클릭 인디케이터 상태
  const [clickIndicator, setClickIndicator] = useState({
    show: false,
    isPlay: false,
  });

  const resultData = result ? RESULT_TYPES[result] : null;
  const resultName = result ? TYPE_MAPPING[result] : "";

  // 결과 유형에 따른 기본 선호도 매핑
  const getDefaultPreferences = (resultCode) => {
    const basePrefs = {
      region: "전체",
      weather: "맑음",
      companion: "연인/친구",
      budget: "보통",
      duration: "1박 2일",
    };

    // 유형별 기본 분위기 설정
    switch (resultCode) {
      case "A-C-E": // 체험형
      case "A-D-E": // 액티비티형
        return { ...basePrefs, mood: "활동적" };
      case "A-C-F": // 자연형
      case "B-C-F": // 문화예술형
        return { ...basePrefs, mood: "여유로운" };
      case "A-D-F": // 먹방형
        return { ...basePrefs, mood: "미식" };
      case "B-C-E": // 레트로형
      case "B-D-E": // 인생샷투어형
        return { ...basePrefs, mood: "감성적" };
      case "B-D-F": // 네트워킹형
        return { ...basePrefs, mood: "사교적" };
      default:
        return { ...basePrefs, mood: "활동적" };
    }
  };

  // AI 코스 생성 함수
  const generateAICourse = async (preferences) => {
    if (!result || !resultData) return;

    setLoading(true);
    try {
      // generate-ai-course.js API에 맞는 파라미터 구조
      const requestBody = {
        userType: resultData.name,
        character: resultData.character,
        description: resultData.description,
        spotType: resultName,
        filters: {
          region: preferences.region,
          weather: preferences.weather,
          companion: preferences.companion,
          mood: preferences.mood,
        },
        filterText: {
          region: preferences.region,
          weather: preferences.weather,
          companion: preferences.companion,
          mood: preferences.mood,
        },
        selectedSpots: [], // 기본 명소 (필요시 추가)
        csvSpots: [], // CSV 명소 (API에서 자동 로드)
        preferences: {
          budget: preferences.budget,
          duration: preferences.duration,
        },
      };

      const response = await fetch("/api/generate-ai-course", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (data.success) {
        setAiCourse(data.course);
        setShowCourse(true);
        setShowModal(false);
      } else {
        console.error("AI 코스 생성 실패:", data.error);
        alert("AI 코스 생성에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("AI 코스 생성 중 오류:", error);
      alert("AI 코스 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 모달 열기
  const openModal = () => {
    setUserPreferences(getDefaultPreferences(result));
    setShowModal(true);
  };

  // 다른 유형들 (현재 유형 제외)
  const otherTypes = Object.entries(RESULT_TYPES).filter(
    ([code]) => code !== result
  );

  // 캐러셀 자동 슬라이드 (호버 시 정지)
  useEffect(() => {
    if (!isCarouselHovered && otherTypes.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % otherTypes.length);
      }, 4000); // 4초마다 슬라이드

      return () => clearInterval(interval);
    }
  }, [isCarouselHovered, otherTypes.length]);

  // result 파라미터가 변경될 때마다 컴포넌트 상태 초기화
  useEffect(() => {
    if (result) {
      // 상태 초기화
      setAiCourse(null);
      setShowCourse(false);
      setShowModal(false);
      setShowShareModal(false);
      setShowImage(false);
      setCurrentSlide(0);

      // 비디오 상태 초기화
      setVideoStates({
        isPlaying: true,
        isMuted: true,
      });

      // 클릭 인디케이터 초기화
      setClickIndicator({
        show: false,
        isPlay: false,
      });
    }
  }, [result]);

  // 이전 슬라이드
  const goToPrevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + otherTypes.length) % otherTypes.length
    );
  };

  // 다음 슬라이드
  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % otherTypes.length);
  };

  // 특정 슬라이드로 이동
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // 공유 기능들
  const handleCopyLink = async () => {
    const shareUrl = `https://www.제주맹글이.site/result/${result}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("링크가 복사되었습니다! 📋");
    } catch (err) {
      console.error("링크 복사 실패:", err);
      alert("링크 복사에 실패했습니다.");
    }
  };

  const handleInstagramShare = async () => {
    const shareText = `나는 ${resultData.name}! ${resultData.description} - 제주맹글이에서 테스트해보세요!`;
    const shareUrl = `https://www.제주맹글이.site/result/${result}`;

    const shareData = {
      title: `제주맹글이 | ${resultData.name}`,
      text: shareText,
      url: shareUrl,
    };

    // 네이티브 share API가 지원되는지 확인
    if (navigator.share) {
      // canShare로 공유 가능 여부 먼저 확인
      if (navigator.canShare && navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
          return;
        } catch (err) {
          // 사용자가 취소했거나 오류 발생 시 폴백 처리
          if (err.name === "AbortError") {
            console.log("사용자가 공유를 취소했습니다.");
            return;
          }
          console.log("네이티브 공유 실패:", err);
        }
      } else {
        // canShare가 없거나 지원하지 않는 데이터인 경우
        try {
          await navigator.share(shareData);
          return;
        } catch (err) {
          if (err.name === "AbortError") {
            console.log("사용자가 공유를 취소했습니다.");
            return;
          }
          console.log("네이티브 공유 실패:", err);
        }
      }
    }

    // 폴백: 클립보드 복사 + 인스타그램 열기
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      alert("내용이 복사되었습니다! 인스타그램에 붙여넣어 주세요! 📱");
      window.open("https://www.instagram.com/", "_blank");
    } catch (err) {
      // 클립보드 접근도 실패한 경우
      console.error("클립보드 복사 실패:", err);
      window.open("https://www.instagram.com/", "_blank");
    }
  };

  const handleDownloadImage = async () => {
    try {
      const imageUrl = `/result/img/${result}.png`;
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `제주맹글이_${resultData.name}_결과.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert("이미지가 다운로드되었습니다! 💾");
    } catch (err) {
      console.error("이미지 다운로드 실패:", err);
      alert("이미지 다운로드에 실패했습니다.");
    }
  };

  if (!result || !resultData) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">잘못된 접근입니다</h1>
          <p className="mb-6">올바른 결과 페이지가 아닙니다.</p>
          <Link
            href="/"
            className="bg-jeju-ocean hover:bg-jeju-green text-white px-6 py-3 rounded-full transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Head>
        <title>제주맹글이 | {resultData.name} - 나만의 제주 여행 스타일</title>
        <meta
          name="description"
          content={`${resultData.description} - 제주도 맞춤 여행 코스와 추천 장소를 확인해보세요!`}
        />

        {/* Open Graph */}
        <meta
          property="og:title"
          content={`제주맹글이 | ${resultData.name} 결과`}
        />
        <meta property="og:description" content={resultData.description} />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={`https://www.제주맹글이.site/result/${result}`}
        />
        <meta
          property="og:image"
          content={`https://www.제주맹글이.site/result/img/${result}.png`}
        />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={`제주맹글이 | ${resultData.name} 결과`}
        />
        <meta name="twitter:description" content={resultData.description} />
        <meta
          name="twitter:image"
          content={`https://www.제주맹글이.site/result/img/${result}.png`}
        />

        {/* 추가 SEO */}
        <meta
          name="keywords"
          content={`제주도, 제주여행, ${resultName}, 돌하르방, 여행유형, 제주관광, 제주코스`}
        />
        <link
          rel="canonical"
          href={`https://www.제주맹글이.site/result/${result}`}
        />
      </Head>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        {/* 헤더 네비게이션 */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="text-white/80 hover:text-white transition-colors"
          >
            ← 홈으로
          </Link>
          <div className="flex gap-4">
            <Link
              href="/quiz"
              className="text-white/80 hover:text-white transition-colors"
            >
              다시 테스트
            </Link>
            <Link
              href="/result-dashboard"
              className="text-white/80 hover:text-white transition-colors"
            >
              결과 통계
            </Link>
          </div>
        </div>

        {/* 결과 카드 */}
        <div className="card-glass mb-8">
          <div className="text-center mb-8">
            <div className="text-6xl mt-4 mb-4">{resultData.emoji}</div>
            <h1 className="text-4xl font-black text-white mb-4">
              {resultData.name}
            </h1>
            <p className="text-xl text-white/90 mb-6">
              {resultData.description}
            </p>
          </div>

          {/* 결과 영상/이미지 */}
          <div className="relative w-full max-w-lg mx-auto mb-8">
            <div
              className="relative rounded-2xl overflow-hidden shadow-2xl bg-black cursor-pointer group"
              onClick={(e) => {
                // 컨트롤 버튼 클릭 시에는 영상 토글 방지
                if (e.target.closest("button")) return;

                const video = e.currentTarget.querySelector("video");
                const willPlay = video.paused;

                if (willPlay) {
                  video.play();
                  setVideoStates((prev) => ({ ...prev, isPlaying: true }));
                } else {
                  video.pause();
                  setVideoStates((prev) => ({ ...prev, isPlaying: false }));
                }

                // 클릭 인디케이터 표시
                setClickIndicator({ show: true, isPlay: willPlay });
                setTimeout(() => {
                  setClickIndicator({ show: false, isPlay: false });
                }, 600);
              }}
            >
              {/* 숏폼 영상 */}
              <video
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  showImage ? "opacity-0" : "opacity-100"
                }`}
                autoPlay
                muted
                loop
                playsInline
                poster={`/result/img/${result}.png`}
                onError={(e) => {
                  // 영상 로드 실패 시 이미지로 대체
                  e.target.style.display = "none";
                  setShowImage(true);
                }}
              >
                <source
                  src={`https://storage.googleapis.com/jeju__test/vd/${result}.mp4`}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>

              {/* 결과 이미지 (토글 가능) */}
              <Image
                src={`/result/img/${result}.png`}
                alt={resultData.name}
                fill
                className={`object-cover transition-opacity duration-300 ${
                  showImage ? "opacity-100" : "opacity-0"
                }`}
                priority
              />

              {/* 유튜브 스타일 클릭 인디케이터 */}
              {clickIndicator.show && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                  <div className="bg-black/60 backdrop-blur-sm rounded-full p-4 animate-ping">
                    {clickIndicator.isPlay ? (
                      <HiPlay className="w-8 h-8 text-white" />
                    ) : (
                      <HiPause className="w-8 h-8 text-white" />
                    )}
                  </div>
                </div>
              )}

              {/* 영상 컨트롤 오버레이 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 hover:opacity-100 transition-all duration-300 group">
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* 음소거 토글 버튼 */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        const video = e.target
                          .closest(".relative")
                          .querySelector("video");
                        video.muted = !video.muted;
                        setVideoStates((prev) => ({
                          ...prev,
                          isMuted: video.muted,
                        }));
                      }}
                      className="w-10 h-10 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-jeju-ocean/80 hover:scale-110 active:scale-95 transition-all duration-200 shadow-lg border border-white/20"
                      title={videoStates.isMuted ? "소리 켜기" : "소리 끄기"}
                    >
                      {videoStates.isMuted ? (
                        <HiVolumeOff className="w-4 h-4" />
                      ) : (
                        <HiVolumeUp className="w-4 h-4" />
                      )}
                    </button>

                    {/* 재생/일시정지 버튼 */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        const video = e.target
                          .closest(".relative")
                          .querySelector("video");
                        if (video.paused) {
                          video.play();
                          setVideoStates((prev) => ({
                            ...prev,
                            isPlaying: true,
                          }));
                        } else {
                          video.pause();
                          setVideoStates((prev) => ({
                            ...prev,
                            isPlaying: false,
                          }));
                        }
                      }}
                      className="w-10 h-10 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-jeju-green/80 hover:scale-110 active:scale-95 transition-all duration-200 shadow-lg border border-white/20"
                      title={videoStates.isPlaying ? "일시정지" : "재생"}
                    >
                      {videoStates.isPlaying ? (
                        <HiPause className="w-4 h-4" />
                      ) : (
                        <HiPlay className="w-4 h-4 ml-0.5" />
                      )}
                    </button>
                  </div>

                  {/* 이미지 미리보기 버튼 */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowImage(!showImage);
                    }}
                    className="bg-gradient-to-r from-jeju-sunset/80 to-jeju-tangerine/80 backdrop-blur-sm rounded-full px-4 py-2 text-white text-xs font-medium shadow-lg border border-white/20 hover:from-jeju-tangerine/90 hover:to-jeju-sunset/90 transition-all duration-200 hover:scale-105 active:scale-95"
                    title={showImage ? "영상으로 보기" : "이미지로 보기"}
                  >
                    <span className="text-yellow-300 animate-pulse">✨</span>
                    <span className="ml-1">
                      {showImage ? "영상 보기" : `${resultData.name} 미리보기`}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center bg-white/10 rounded-2xl p-6 mb-6">
            <p className="text-lg text-white/95">💭 {resultData.character}</p>
          </div>

          {/* 특성 리스트 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                🎯 당신의 여행 특성
              </h3>
              <ul className="space-y-3">
                {resultData.traits.map((trait, index) => (
                  <li key={index} className="text-white/90">
                    {trait}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                🗺️ 추천 여행 코스
              </h3>
              <ul className="space-y-3">
                {resultData.recommendations.map((rec, index) => (
                  <li key={index} className="text-white/90">
                    • {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI 코스 생성 버튼 */}
          <div className="text-center mb-8">
            <button
              onClick={openModal}
              disabled={loading}
              className="bg-gradient-to-r from-jeju-ocean to-jeju-green hover:from-jeju-green hover:to-jeju-ocean text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🤖 AI 추천 맞춤 여행 코스 받기
            </button>
          </div>

          {/* AI 생성 코스 표시 */}
          {showCourse && aiCourse && (
            <div className="rounded-2xl p-6 mb-8">
              <h3 className="text-2xl font-bold text-white mb-4 text-center">
                🎯 {resultData.name}을 위한 맞춤 코스
              </h3>
              <div className="bg-black/20 rounded-xl p-4 mb-4">
                <h4 className="text-xl font-bold text-white mb-2">
                  {aiCourse.title}
                </h4>
                <p className="text-white/80">{aiCourse.summary}</p>
              </div>

              {/* 1일차 */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-white mb-3">📅 1일차</h4>
                <div className="space-y-4">
                  {["morning", "afternoon", "evening"].map((timeSlot) => {
                    const activities = aiCourse.day1?.[timeSlot] || [];
                    const timeSlotNames = {
                      morning: "🌅 오전",
                      afternoon: "☀️ 오후",
                      evening: "🌙 저녁",
                    };

                    if (activities.length === 0) return null;

                    return (
                      <div
                        key={timeSlot}
                        className="bg-black/20 rounded-lg p-4"
                      >
                        <h5 className="font-semibold text-white mb-2">
                          {timeSlotNames[timeSlot]}
                        </h5>
                        {activities.map((activity, idx) => (
                          <div key={idx} className="text-white/90 mb-2">
                            <strong>{activity.time}</strong> -{" "}
                            {activity.activity}
                            <br />
                            <span className="text-sm text-white/70">
                              📍 {activity.location} ({activity.duration})
                            </span>
                            {activity.tip && (
                              <div className="text-sm text-jeju-mint mt-1">
                                💡 {activity.tip}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2일차 */}
              {aiCourse.day2 && (
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-white mb-3">
                    📅 2일차
                  </h4>
                  <div className="space-y-4">
                    {["morning", "afternoon"].map((timeSlot) => {
                      const activities = aiCourse.day2?.[timeSlot] || [];
                      const timeSlotNames = {
                        morning: "🌅 오전",
                        afternoon: "☀️ 오후",
                      };

                      if (activities.length === 0) return null;

                      return (
                        <div
                          key={timeSlot}
                          className="bg-black/20 rounded-lg p-4"
                        >
                          <h5 className="font-semibold text-white mb-2">
                            {timeSlotNames[timeSlot]}
                          </h5>
                          {activities.map((activity, idx) => (
                            <div key={idx} className="text-white/90 mb-2">
                              <strong>{activity.time}</strong> -{" "}
                              {activity.activity}
                              <br />
                              <span className="text-sm text-white/70">
                                📍 {activity.location} ({activity.duration})
                              </span>
                              {activity.tip && (
                                <div className="text-sm text-jeju-mint mt-1">
                                  💡 {activity.tip}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 추천 맛집 */}
              {aiCourse.restaurants && aiCourse.restaurants.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-white mb-3">
                    🍽️ 추천 맛집
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aiCourse.restaurants.map((restaurant, idx) => (
                      <div key={idx} className="bg-black/20 rounded-lg p-4">
                        <div className="text-white font-semibold">
                          {restaurant.name}
                        </div>
                        <div className="text-white/70 text-sm">
                          {restaurant.type}
                        </div>
                        <div className="text-white/60 text-xs">
                          {restaurant.location}
                        </div>
                        <div className="text-jeju-mint text-sm mt-1">
                          {restaurant.specialty}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 숙소 추천 */}
              {aiCourse.accommodation && (
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-white mb-3">
                    🏨 추천 숙소
                  </h4>
                  <div className="bg-black/20 rounded-lg p-4">
                    <div className="text-white font-semibold">
                      {aiCourse.accommodation.name}
                    </div>
                    <div className="text-white/70 text-sm">
                      {aiCourse.accommodation.type}
                    </div>
                    <div className="text-white/60 text-xs">
                      {aiCourse.accommodation.location}
                    </div>
                    <div className="text-jeju-mint text-sm mt-1">
                      {aiCourse.accommodation.reason}
                    </div>
                  </div>
                </div>
              )}

              {/* 여행 팁 */}
              {aiCourse.specialTips && aiCourse.specialTips.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-white mb-3">
                    💡 특별 팁
                  </h4>
                  <ul className="space-y-2">
                    {aiCourse.specialTips.map((tip, idx) => (
                      <li key={idx} className="text-white/90">
                        • {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 예산 정보 */}
              {aiCourse.totalBudget && (
                <div className="text-center bg-jeju-ocean/20 rounded-lg p-4">
                  <div className="text-white font-semibold">
                    💰 예상 총 예산: {aiCourse.totalBudget}
                  </div>
                  {aiCourse.transportTips && (
                    <div className="text-white/80 text-sm mt-2">
                      🚗 {aiCourse.transportTips}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 공유 버튼들 */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setShowShareModal(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-full transition-colors"
            >
              📱 결과 공유하기
            </button>

            <Link
              href="/quiz"
              className="bg-gradient-to-r from-jeju-sunset to-jeju-tangerine hover:from-jeju-tangerine hover:to-jeju-sunset text-white px-6 py-3 rounded-full transition-all duration-300"
            >
              🔄 다시 테스트하기
            </Link>
          </div>
        </div>

        {/* 다른 유형 보기 - 이미지 캐러셀 */}
        <div className="">
          <div
            className="relative overflow-hidden rounded-2xl"
            onMouseEnter={() => setIsCarouselHovered(true)}
            onMouseLeave={() => setIsCarouselHovered(false)}
          >
            {/* 메인 슬라이드 영역 */}
            <div className="relative h-80 md:h-96">
              {otherTypes.map(([code, type], index) => (
                <div
                  key={code}
                  className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                    index === currentSlide
                      ? "opacity-100 transform translate-x-0"
                      : index < currentSlide
                      ? "opacity-0 transform -translate-x-full"
                      : "opacity-0 transform translate-x-full"
                  }`}
                >
                  <Link href={`/result/${code}`}>
                    <div className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer group">
                      <div className="relative w-full h-full">
                        {/* 배경 영상/이미지 */}
                        <div className="absolute inset-0">
                          {/* 숏폼 영상 */}
                          <video
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            autoPlay
                            muted
                            loop
                            playsInline
                            poster={`/result/img/${code}.png`}
                            onError={(e) => {
                              // 영상 로드 실패 시 이미지로 대체
                              e.target.style.display = "none";
                              e.target.nextElementSibling.style.display =
                                "block";
                            }}
                          >
                            <source
                              src={`https://storage.googleapis.com/jeju__test/vd/${code}.mp4`}
                              type="video/mp4"
                            />
                          </video>

                          {/* 폴백 이미지 */}
                          <Image
                            src={`/result/img/${code}.png`}
                            alt={type.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105 hidden"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />

                          {/* 오버레이 */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        </div>

                        {/* 콘텐츠 */}
                        <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-8">
                          <div className="text-center">
                            <div className="text-4xl md:text-5xl mb-3">
                              {type.emoji}
                            </div>
                            <h4 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:text-jeju-mint transition-colors">
                              {TYPE_MAPPING[code]}
                            </h4>
                            <p className="text-white/90 text-sm md:text-base mb-3 leading-relaxed">
                              {type.description}
                            </p>
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white/90 text-sm group-hover:bg-jeju-ocean/30 transition-colors">
                              <span>자세히 보기</span>
                              <span className="transform group-hover:translate-x-1 transition-transform">
                                →
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {/* 네비게이션 화살표 */}
            <button
              onClick={goToPrevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/60 backdrop-blur-sm hover:bg-jeju-ocean/80 text-white rounded-full flex items-center justify-center transition-all duration-200 z-10 border border-white/20 hover:scale-110 active:scale-95 shadow-lg"
              aria-label="이전 슬라이드"
            >
              <HiChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={goToNextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/60 backdrop-blur-sm hover:bg-jeju-ocean/80 text-white rounded-full flex items-center justify-center transition-all duration-200 z-10 border border-white/20 hover:scale-110 active:scale-95 shadow-lg"
              aria-label="다음 슬라이드"
            >
              <HiChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 사용자 정보 입력 모달 */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">
                  🤖 맞춤 여행 코스 생성
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <p className="text-white/80 mb-6">
                {resultData.name}에게 딱 맞는 제주 여행 코스를 생성해드려요! 몇
                가지 정보를 알려주시면 더욱 정확한 추천을 받을 수 있습니다.
              </p>

              <div className="space-y-6">
                {/* 지역 선택 */}
                <div>
                  <label className="block text-white font-semibold mb-3">
                    🗺️ 선호 지역
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["전체", "제주시", "서귀포"].map((region) => (
                      <button
                        key={region}
                        onClick={() =>
                          setUserPreferences((prev) => ({ ...prev, region }))
                        }
                        className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                          userPreferences.region === region
                            ? "bg-jeju-ocean text-white"
                            : "bg-white/10 text-white/80 hover:bg-white/20"
                        }`}
                      >
                        {region}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 날씨/계절 */}
                <div>
                  <label className="block text-white font-semibold mb-3">
                    ☀️ 날씨/계절
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["맑음", "흐림", "비", "봄/가을"].map((weather) => (
                      <button
                        key={weather}
                        onClick={() =>
                          setUserPreferences((prev) => ({ ...prev, weather }))
                        }
                        className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                          userPreferences.weather === weather
                            ? "bg-jeju-ocean text-white"
                            : "bg-white/10 text-white/80 hover:bg-white/20"
                        }`}
                      >
                        {weather}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 동반자 */}
                <div>
                  <label className="block text-white font-semibold mb-3">
                    👥 누구와 함께?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["혼자", "연인/친구", "가족", "단체"].map((companion) => (
                      <button
                        key={companion}
                        onClick={() =>
                          setUserPreferences((prev) => ({ ...prev, companion }))
                        }
                        className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                          userPreferences.companion === companion
                            ? "bg-jeju-ocean text-white"
                            : "bg-white/10 text-white/80 hover:bg-white/20"
                        }`}
                      >
                        {companion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 여행 분위기 */}
                <div>
                  <label className="block text-white font-semibold mb-3">
                    🎭 여행 분위기
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["활동적", "여유로운", "감성적", "미식", "사교적"].map(
                      (mood) => (
                        <button
                          key={mood}
                          onClick={() =>
                            setUserPreferences((prev) => ({ ...prev, mood }))
                          }
                          className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                            userPreferences.mood === mood
                              ? "bg-jeju-ocean text-white"
                              : "bg-white/10 text-white/80 hover:bg-white/20"
                          }`}
                        >
                          {mood}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* 예산 */}
                <div>
                  <label className="block text-white font-semibold mb-3">
                    💰 예산 (1인 기준)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["절약", "보통", "여유"].map((budget) => (
                      <button
                        key={budget}
                        onClick={() =>
                          setUserPreferences((prev) => ({ ...prev, budget }))
                        }
                        className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                          userPreferences.budget === budget
                            ? "bg-jeju-ocean text-white"
                            : "bg-white/10 text-white/80 hover:bg-white/20"
                        }`}
                      >
                        {budget}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 여행 기간 */}
                <div>
                  <label className="block text-white font-semibold mb-3">
                    📅 여행 기간
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["당일", "1박 2일", "2박 3일"].map((duration) => (
                      <button
                        key={duration}
                        onClick={() =>
                          setUserPreferences((prev) => ({ ...prev, duration }))
                        }
                        className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                          userPreferences.duration === duration
                            ? "bg-jeju-ocean text-white"
                            : "bg-white/10 text-white/80 hover:bg-white/20"
                        }`}
                      >
                        {duration}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 생성 버튼 */}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => generateAICourse(userPreferences)}
                  disabled={loading}
                  className="flex-2 bg-gradient-to-r from-jeju-ocean to-jeju-green hover:from-jeju-green hover:to-jeju-ocean text-white py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      생성 중...
                    </div>
                  ) : (
                    "🚀 AI 코스 생성하기"
                  )}
                </button>
              </div>

              {/* 현재 선택된 옵션 미리보기 */}
              <div className="mt-6 p-4 bg-black/20 rounded-lg">
                <p className="text-white/60 text-sm mb-2">현재 선택:</p>
                <p className="text-white text-sm">
                  {userPreferences.region} • {userPreferences.weather} •{" "}
                  {userPreferences.companion} • {userPreferences.mood} •{" "}
                  {userPreferences.budget} 예산 • {userPreferences.duration}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 공유 모달 */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-2xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">
                  📱 결과 공유하기
                </h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-400 hover:text-white transition-colors text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* 결과 미리보기 */}
              <div className="bg-gradient-to-r from-jeju-ocean/20 to-jeju-green/20 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  {/* 결과 이미지 */}
                  <div className="flex-shrink-0">
                    <Image
                      src={`/result/img/${result}.png`}
                      alt={resultData.name}
                      width={80}
                      height={80}
                      className="rounded-lg object-cover border-2 border-white/20"
                    />
                  </div>

                  {/* 텍스트 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-2xl">{resultData.emoji}</div>
                      <h4 className="text-white font-bold text-lg">
                        {resultData.name}
                      </h4>
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed">
                      {resultData.description}
                    </p>
                  </div>
                </div>

                {/* 공유될 텍스트 미리보기 */}
                <div className="bg-black/20 rounded-lg p-3 border border-white/10">
                  <p className="text-white/70 text-xs mb-1">📝 공유될 내용:</p>
                  <p className="text-white/90 text-sm">
                    &ldquo;나는 {resultData.name}! {resultData.description} -
                    제주맹글이에서 테스트해보세요!&rdquo;
                  </p>
                  <p className="text-jeju-mint text-xs mt-2">
                    🔗 https://www.제주맹글이.site/result/{result}
                  </p>
                </div>
              </div>

              {/* 공유 옵션들 */}
              <div className="space-y-3">
                {/* 인스타그램 스토리 공유 */}
                <button
                  onClick={() => {
                    handleInstagramShare();
                    setShowShareModal(false);
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 font-medium"
                >
                  <span className="text-xl">📷</span>
                  Instagram Story에 공유
                </button>

                {/* 링크 복사 */}
                <button
                  onClick={() => {
                    handleCopyLink();
                    setShowShareModal(false);
                  }}
                  className="w-full bg-jeju-mint hover:bg-jeju-mint/80 text-white py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 font-medium"
                >
                  <span className="text-xl">🔗</span>
                  링크 복사
                </button>

                {/* 이미지 다운로드 */}
                <button
                  onClick={() => {
                    handleDownloadImage();
                    setShowShareModal(false);
                  }}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 font-medium border border-white/20"
                >
                  <span className="text-xl">💾</span>
                  이미지 다운로드
                </button>
              </div>

              {/* 안내 텍스트 */}
              <div className="mt-6 text-center text-white/60 text-sm">
                <p>친구들과 함께 제주 여행 스타일을 비교해보세요! 🏝️</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="border-t border-white/20 bg-black/30 backdrop-blur-sm py-8">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* 로고 */}
            <div className="flex items-center">
              <Image
                src="/logo.svg"
                alt="제주맹글이"
                width={162}
                height={24}
                className="h-6 w-auto"
              />
            </div>

            {/* 문의 정보 */}
            <div className="flex items-center gap-2 text-white/80">
              <span className="text-sm">문의:</span>
              <a
                href="mailto:darkwinterlab@gmail.com"
                className="text-jeju-mint hover:text-white transition-colors text-sm font-medium"
              >
                darkwinterlab@gmail.com
              </a>
            </div>
          </div>

          {/* 저작권 */}
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-white/60 text-xs">
              ©2025 제주맹글이 <br />
              AI가 생성한 결과는 오류가 있을 수 있습니다.
              <br />
              최종 판단은 사용자에게 있습니다.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// getStaticPaths를 사용하여 모든 가능한 결과 경로를 미리 생성
export async function getStaticPaths() {
  const resultCodes = [
    "A-C-E",
    "A-C-F",
    "A-D-E",
    "A-D-F",
    "B-C-E",
    "B-C-F",
    "B-D-E",
    "B-D-F",
  ];

  const paths = resultCodes.map((result) => ({
    params: { result },
  }));

  return { paths, fallback: false };
}

// getStaticProps는 빌드 시 각 페이지에 대한 정적 데이터를 생성
export async function getStaticProps({ params }) {
  const { result } = params;

  // 유효한 결과 코드인지 확인
  if (!TYPE_MAPPING[result]) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      result,
    },
    // 페이지를 재생성하는 주기 (초 단위) - 옵션
    // revalidate: 3600, // 1시간마다 재생성
  };
}
