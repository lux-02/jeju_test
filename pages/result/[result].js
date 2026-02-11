import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
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
  HiSparkles,
  HiArrowRight,
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

const TIME_SLOT_NAMES = {
  morning: "🌅 오전",
  afternoon: "☀️ 오후",
  evening: "🌙 저녁",
};

const DURATION_DAY_KEYS = {
  당일: ["day1"],
  "1박 2일": ["day1", "day2"],
  "2박 3일": ["day1", "day2", "day3"],
};

const AFFILIATE_OFFERS = {
  "A-C-E": {
    title: "제주 취다선 명상 & 요가 원데이 클래스 체험",
    url: "https://3ha.in/r/361696",
    thumbnail: "/result/affiliate/A-C-E.webp",
  },
  "A-C-F": {
    title: "제주 코티지 가든 컬러 헌팅 체험",
    url: "https://3ha.in/r/361695",
    thumbnail: "/result/affiliate/A-C-F.webp",
  },
  "A-D-E": {
    title: "제주도 스쿠버 다이빙 체험",
    url: "https://3ha.in/r/361698",
    thumbnail: "/result/affiliate/A-D-E.webp",
  },
  "A-D-F": {
    title: "제주 올패스 이용권",
    url: "https://3ha.in/r/361691",
    thumbnail: "/result/affiliate/A-D-F.webp",
  },
  "B-C-E": {
    title: "[제주] 선녀와나무꾼 테마파크",
    url: "https://3ha.in/r/361690",
    thumbnail: "/result/affiliate/B-C-E.webp",
  },
  "B-C-F": {
    title: "제주의 아름다운 섬, 4.3 역사 & 문화 투어",
    url: "https://3ha.in/r/361702",
    thumbnail: "/result/affiliate/B-C-F.webp",
  },
  "B-D-E": {
    title: "제주 전통 한복 야외 스냅 촬영",
    url: "https://3ha.in/r/361693",
    thumbnail: "/result/affiliate/B-D-E.webp",
  },
  "B-D-F": {
    title: "제주 최고의 일일 투어: 유네스코 및 필수 하이라이트 (동부/남서부)",
    url: "https://3ha.in/r/361700",
    thumbnail: "/result/affiliate/B-D-F.webp",
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
  const [failedPreviewVideos, setFailedPreviewVideos] = useState({});

  // 클릭 인디케이터 상태
  const [clickIndicator, setClickIndicator] = useState({
    show: false,
    isPlay: false,
  });

  const resultData = result ? RESULT_TYPES[result] : null;
  const resultName = result ? TYPE_MAPPING[result] : "";
  const affiliateOffer = result ? AFFILIATE_OFFERS[result] : null;

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
  const otherTypes = useMemo(
    () => Object.entries(RESULT_TYPES).filter(([code]) => code !== result),
    [result]
  );
  const aiCourseDays = useMemo(() => {
    if (!aiCourse) return [];

    const dayKeys = DURATION_DAY_KEYS[aiCourse.duration] || [
      "day1",
      "day2",
      "day3",
    ];

    return dayKeys
      .map((dayKey, index) => ({
        dayKey,
        label: `${index + 1}일차`,
        plan: aiCourse[dayKey],
      }))
      .filter(
        ({ plan }) =>
          plan &&
          typeof plan === "object" &&
          ["morning", "afternoon", "evening"].some((slot) =>
            Array.isArray(plan[slot])
          )
      );
  }, [aiCourse]);

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
      setFailedPreviewVideos({});
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
      <div className="gradient-bg flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-3xl border border-white/20 bg-black/40 p-8 text-center text-white backdrop-blur-xl">
          <h1 className="mb-4 text-2xl font-black">잘못된 접근입니다</h1>
          <p className="mb-6 text-white/80">올바른 결과 페이지가 아닙니다.</p>
          <Link
            href="/"
            className="inline-flex items-center rounded-xl border border-white/20 bg-white/10 px-5 py-3 font-semibold text-white transition-all hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-sky"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg text-slate-50">
      <Head>
        <title>{`제주맹글이 | ${resultData.name} - 나만의 제주 여행 스타일`}</title>
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

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-sky"
          >
            <span>←</span>
            홈으로
          </Link>
        </div>

        {/* 결과 카드 */}
        <div className="mb-8 rounded-3xl border border-white/20 bg-black/35 p-5 backdrop-blur-xl sm:p-7">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 mt-2 inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-5xl">
              {resultData.emoji}
            </div>
            <h1 className="mb-3 text-3xl font-black text-white sm:text-4xl">
              {resultData.name}
            </h1>
            <p className="mx-auto mb-6 max-w-2xl text-base text-white/85 sm:text-lg">
              {resultData.description}
            </p>
          </div>

          {/* 결과 영상/이미지 */}
          <div className="relative mx-auto mb-8 w-full max-w-xl">
            <div
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/20 bg-black shadow-2xl shadow-black/40"
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
                  e.currentTarget.style.display = "none";
                  setShowImage(true);
                }}
              >
                <source
                  src={`/result/vd/${result}.mp4`}
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
                <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                  <div className="rounded-full border border-white/20 bg-black/65 p-4 backdrop-blur-sm animate-ping">
                    {clickIndicator.isPlay ? (
                      <HiPlay className="w-8 h-8 text-white" />
                    ) : (
                      <HiPause className="w-8 h-8 text-white" />
                    )}
                  </div>
                </div>
              )}

              {/* 영상 컨트롤 오버레이 */}
              <div className="group absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition-all duration-300 hover:opacity-100">
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
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-jeju-ocean/80"
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
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-jeju-green/80"
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
                    className="rounded-full border border-white/20 bg-gradient-to-r from-jeju-sunset/80 to-jeju-tangerine/80 px-4 py-2 text-xs font-medium text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:from-jeju-tangerine/90 hover:to-jeju-sunset/90"
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

          <div className="mb-6 rounded-2xl border border-white/20 bg-white/10 p-6 text-center">
            <p className="text-lg text-white/95">💭 {resultData.character}</p>
          </div>

          {/* 특성 리스트 */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-6">
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

            <div className="rounded-2xl border border-white/20 bg-white/10 p-6">
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
          <div className="mb-8 text-center">
            <button
              onClick={openModal}
              disabled={loading}
              className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-jeju-ocean to-jeju-primary px-6 py-3 text-base font-bold text-white shadow-lg shadow-jeju-ocean/35 transition-all duration-200 hover:-translate-y-0.5 hover:from-jeju-primary hover:to-jeju-ocean disabled:cursor-not-allowed disabled:opacity-50"
            >
              <HiSparkles className="h-5 w-5" />
              AI 추천 맞춤 여행 코스 받기
            </button>
          </div>

          {/* AI 생성 코스 표시 */}
          {showCourse && aiCourse && (
            <div className="mb-8 rounded-2xl border border-white/20 bg-black/30 p-6 backdrop-blur-sm">
              <h3 className="mb-4 text-center text-2xl font-bold text-white">
                🎯 {resultData.name}을 위한 맞춤 코스
              </h3>
              <div className="mb-4 rounded-xl border border-white/15 bg-white/5 p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h4 className="text-xl font-bold text-white">
                    {aiCourse.title}
                  </h4>
                  {aiCourse.duration && (
                    <span className="inline-flex rounded-full border border-jeju-sky/45 bg-jeju-ocean/30 px-3 py-1 text-xs font-semibold text-white">
                      {aiCourse.duration}
                    </span>
                  )}
                </div>
                <p className="text-white/80">{aiCourse.summary}</p>
              </div>

              {aiCourseDays.map((day) => (
                <div key={day.dayKey} className="mb-6 last:mb-0">
                  <h4 className="mb-3 text-lg font-bold text-white">
                    📅 {day.label}
                  </h4>
                  <div className="space-y-4">
                    {["morning", "afternoon", "evening"].some(
                      (slot) => (day.plan?.[slot] || []).length > 0
                    ) ? (
                      ["morning", "afternoon", "evening"].map((timeSlot) => {
                        const activities = day.plan?.[timeSlot] || [];

                        if (activities.length === 0) return null;

                        return (
                          <div
                            key={`${day.dayKey}-${timeSlot}`}
                            className="rounded-lg border border-white/15 bg-white/5 p-4"
                          >
                            <h5 className="mb-2 font-semibold text-white">
                              {TIME_SLOT_NAMES[timeSlot]}
                            </h5>
                            {activities.map((activity, idx) => (
                              <div key={idx} className="mb-2 text-white/90">
                                <strong>{activity.time}</strong> -{" "}
                                {activity.activity}
                                <br />
                                <span className="text-sm text-white/70">
                                  📍 {activity.location} ({activity.duration})
                                </span>
                                {activity.tip && (
                                  <div className="mt-1 text-sm text-jeju-mint">
                                    💡 {activity.tip}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      })
                    ) : (
                      <div className="rounded-lg border border-dashed border-white/20 bg-white/5 p-4 text-sm text-white/70">
                        해당 일차의 추천 일정이 아직 비어 있어요. 다시 생성하면
                        더 구체적인 일정이 나올 수 있습니다.
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* 추천 맛집 */}
              {aiCourse.restaurants && aiCourse.restaurants.length > 0 && (
                <div className="mb-6">
                  <h4 className="mb-3 text-lg font-bold text-white">
                    🍽️ 추천 맛집
                  </h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {aiCourse.restaurants.map((restaurant, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-white/15 bg-white/5 p-4"
                      >
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
                  <h4 className="mb-3 text-lg font-bold text-white">
                    🏨 추천 숙소
                  </h4>
                  <div className="rounded-lg border border-white/15 bg-white/5 p-4">
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
                  <h4 className="mb-3 text-lg font-bold text-white">
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
                <div className="rounded-lg border border-jeju-sky/30 bg-jeju-ocean/20 p-4 text-center">
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

          {affiliateOffer && (
            <section className="mb-8 rounded-2xl border border-white/20 bg-black/30 p-6 backdrop-blur-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative h-40 w-full overflow-hidden rounded-xl border border-white/15 sm:h-28 sm:w-44 sm:flex-shrink-0">
                  <Image
                    src={affiliateOffer.thumbnail || `/result/img/${result}.png`}
                    alt={affiliateOffer.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 176px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/55">
                    유형 맞춤 추천 체험
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-white sm:text-xl">
                    {affiliateOffer.title}
                  </h3>
                  <p className="mt-1 text-sm text-white/70">
                    {resultName} 성향으로 여행할 때 동선에 자연스럽게 넣기 좋은
                    체험이에요.
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <a
                      href={affiliateOffer.url}
                      target="_blank"
                      rel="nofollow sponsored noopener noreferrer"
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-jeju-sunset to-jeju-tangerine px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:from-jeju-tangerine hover:to-jeju-sunset"
                    >
                      일정에 추가하기
                      <HiArrowRight className="h-4 w-4" />
                    </a>
                    
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs text-white/50">
                파트너 링크를 통해 예약 시 운영에 도움이 되는 수수료를 받을 수 있습니다.
              </p>
            </section>
          )}

          {/* 공유 버튼들 */}
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setShowShareModal(true)}
              className="inline-flex min-h-11 items-center rounded-xl border border-white/20 bg-white/10 px-5 py-3 font-semibold text-white transition-all hover:bg-white/20"
            >
              <span className="mr-2">📱</span>
              결과 공유하기
            </button>

            <Link
              href="/quiz"
              className="inline-flex min-h-11 items-center rounded-xl bg-gradient-to-r from-jeju-sunset to-jeju-tangerine px-5 py-3 font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:from-jeju-tangerine hover:to-jeju-sunset"
            >
              🔄 다시 테스트하기
            </Link>
          </div>
        </div>

        {/* 다른 유형 보기 - 이미지 캐러셀 */}
        <div>
          <div
            className="relative overflow-hidden rounded-2xl border border-white/20 bg-black/30 p-2 backdrop-blur-xl sm:p-3"
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
                    <div className="group relative h-full w-full cursor-pointer overflow-hidden rounded-2xl border border-white/15">
                      <div className="relative w-full h-full">
                        {/* 배경 영상/이미지 */}
                        <div className="absolute inset-0">
                          {/* 숏폼 영상 */}
                          <video
                            className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                              failedPreviewVideos[code] ? "hidden" : ""
                            }`}
                            autoPlay
                            muted
                            loop
                            playsInline
                            poster={`/result/img/${code}.png`}
                            onError={() => {
                              // 영상 로드 실패 시 이미지로 대체
                              setFailedPreviewVideos((prev) => ({
                                ...prev,
                                [code]: true,
                              }));
                            }}
                          >
                            <source
                              src={`/result/vd/${code}.mp4`}
                              type="video/mp4"
                            />
                          </video>

                          {/* 폴백 이미지 */}
                          <Image
                            src={`/result/img/${code}.png`}
                            alt={type.name}
                            fill
                            className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
                              failedPreviewVideos[code] ? "block" : "hidden"
                            }`}
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />

                          {/* 오버레이 */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>
                        </div>

                        {/* 콘텐츠 */}
                        <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-8">
                          <div className="text-center">
                            <div className="text-4xl md:text-5xl mb-3">
                              {type.emoji}
                            </div>
                            <h4 className="mb-2 text-2xl font-bold text-white transition-colors group-hover:text-jeju-mint md:text-3xl">
                              {TYPE_MAPPING[code]}
                            </h4>
                            <p className="text-white/90 text-sm md:text-base mb-3 leading-relaxed">
                              {type.description}
                            </p>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm transition-colors group-hover:bg-jeju-ocean/30">
                              <span>자세히 보기</span>
                              <HiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
              className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-jeju-ocean/80"
              aria-label="이전 슬라이드"
            >
              <HiChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={goToNextSlide}
              className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-jeju-ocean/80"
              aria-label="다음 슬라이드"
            >
              <HiChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 사용자 정보 입력 모달 */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/20 bg-slate-950/95 p-6 backdrop-blur-xl">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">
                  🤖 맞춤 여행 코스 생성
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-white/20 bg-white/5 px-2 py-1 text-gray-300 transition-colors hover:text-white"
                >
                  ✕
                </button>
              </div>

              <p className="mb-6 text-white/80">
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
                        className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                          userPreferences.region === region
                            ? "border-jeju-sky bg-jeju-ocean/40 text-white"
                            : "border-white/15 bg-white/10 text-white/80 hover:bg-white/20"
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
                        className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                          userPreferences.weather === weather
                            ? "border-jeju-sky bg-jeju-ocean/40 text-white"
                            : "border-white/15 bg-white/10 text-white/80 hover:bg-white/20"
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
                        className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                          userPreferences.companion === companion
                            ? "border-jeju-sky bg-jeju-ocean/40 text-white"
                            : "border-white/15 bg-white/10 text-white/80 hover:bg-white/20"
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
                          className={`rounded-lg border p-2 text-sm font-medium transition-all ${
                            userPreferences.mood === mood
                              ? "border-jeju-sky bg-jeju-ocean/40 text-white"
                              : "border-white/15 bg-white/10 text-white/80 hover:bg-white/20"
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
                        className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                          userPreferences.budget === budget
                            ? "border-jeju-sky bg-jeju-ocean/40 text-white"
                            : "border-white/15 bg-white/10 text-white/80 hover:bg-white/20"
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
                        className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                          userPreferences.duration === duration
                            ? "border-jeju-sky bg-jeju-ocean/40 text-white"
                            : "border-white/15 bg-white/10 text-white/80 hover:bg-white/20"
                        }`}
                      >
                        {duration}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 생성 버튼 */}
              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-white transition-colors hover:bg-white/20"
                >
                  취소
                </button>
                <button
                  onClick={() => generateAICourse(userPreferences)}
                  disabled={loading}
                  className="flex-[2] rounded-lg bg-gradient-to-r from-jeju-ocean to-jeju-primary px-6 py-3 text-white transition-all duration-200 hover:from-jeju-primary hover:to-jeju-ocean disabled:cursor-not-allowed disabled:opacity-50"
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
              <div className="mt-6 rounded-lg border border-white/15 bg-white/5 p-4">
                <p className="mb-2 text-sm text-white/60">현재 선택:</p>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-white/20 bg-slate-950/95 p-6 backdrop-blur-xl">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">
                  📱 결과 공유하기
                </h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="rounded-lg border border-white/20 bg-white/5 px-2 py-1 text-2xl text-gray-300 transition-colors hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* 결과 미리보기 */}
              <div className="mb-6 rounded-xl border border-white/15 bg-white/5 p-4">
                <div className="mb-4 flex items-center gap-4">
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
                <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <p className="mb-1 text-xs text-white/70">📝 공유될 내용:</p>
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
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/20 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 font-medium text-white transition-all duration-200 hover:from-purple-700 hover:to-pink-700"
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
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-jeju-mint px-6 py-4 font-medium text-white transition-all duration-200 hover:bg-jeju-mint/80"
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
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/20 bg-white/10 px-6 py-4 font-medium text-white transition-all duration-200 hover:bg-white/20"
                >
                  <span className="text-xl">💾</span>
                  이미지 다운로드
                </button>
              </div>

              {/* 안내 텍스트 */}
              <div className="mt-6 text-center text-sm text-white/60">
                <p>친구들과 함께 제주 여행 스타일을 비교해보세요! 🏝️</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="border-t border-white/10 bg-black/30 py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
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
