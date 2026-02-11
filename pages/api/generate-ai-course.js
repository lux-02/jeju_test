import fs from "fs";
import path from "path";
import OpenAI from "openai";

const openaiApiKey = process.env.OPENAI_API_KEY || "";
const openaiModel = process.env.OPENAI_MODEL || "gpt-4.1-mini";

const TRIP_DURATIONS = ["당일", "1박 2일", "2박 3일"];
const DEFAULT_DURATION = "1박 2일";

let cachedCsvData = null;

const parseCSV = (csvText) => {
  const lines = csvText.trim().split("\n");
  const headers = lines[0].split(",");
  const data = [];

  for (let i = 1; i < lines.length; i += 1) {
    const values = lines[i].split(",");
    const item = {};
    headers.forEach((header, index) => {
      item[header.trim()] = values[index] ? values[index].trim() : "";
    });
    data.push(item);
  }

  return data;
};

const loadData = () => {
  if (cachedCsvData) {
    return cachedCsvData;
  }

  try {
    const tourspotPath = path.join(process.cwd(), "lib", "tourspot.csv");
    const restaurantPath = path.join(process.cwd(), "lib", "restaurant.json");
    const hotelPath = path.join(process.cwd(), "lib", "hotel.csv");

    const tourspotCSV = fs.readFileSync(tourspotPath, "utf-8");
    const restaurantJSON = fs.readFileSync(restaurantPath, "utf-8");
    const hotelCSV = fs.readFileSync(hotelPath, "utf-8");

    const restaurantData = JSON.parse(restaurantJSON);
    const restaurants = restaurantData.bookmarkList.map((item) => {
      let region = "제주";

      if (item.address.includes("서귀포")) {
        region = "서귀포";
      } else if (
        item.address.includes("제주시") ||
        item.address.includes("한림") ||
        item.address.includes("애월")
      ) {
        region = "제주";
      }

      let popularityScore = "보통";
      if (item.memo && item.memo.length > 10) {
        popularityScore = "높음";
      }

      if (
        item.memo &&
        (item.memo.includes("맛집") || item.memo.includes("👍") || item.memo.includes("추천"))
      ) {
        popularityScore = "매우높음";
      }

      return {
        제목: item.name,
        도로명주소: item.address,
        인기점수: popularityScore,
        지역: region,
        메모: item.memo || "",
        타입: item.mcidName || "음식점",
        카테고리: item.mcid || "DINING",
        좌표: {
          x: item.px,
          y: item.py,
        },
      };
    });

    cachedCsvData = {
      tourspots: parseCSV(tourspotCSV),
      restaurants,
      hotels: parseCSV(hotelCSV),
    };

    return cachedCsvData;
  } catch (error) {
    console.error("데이터 파일 로드 실패:", error);
    return { tourspots: [], restaurants: [], hotels: [] };
  }
};

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const normalizeDuration = (duration) =>
  TRIP_DURATIONS.includes(duration) ? duration : DEFAULT_DURATION;

const createEmptyDayPlan = () => ({
  morning: [],
  afternoon: [],
  evening: [],
});

const normalizeDayPlan = (dayPlan) => {
  if (!dayPlan || typeof dayPlan !== "object") {
    return createEmptyDayPlan();
  }

  return {
    morning: Array.isArray(dayPlan.morning) ? dayPlan.morning : [],
    afternoon: Array.isArray(dayPlan.afternoon) ? dayPlan.afternoon : [],
    evening: Array.isArray(dayPlan.evening) ? dayPlan.evening : [],
  };
};

const getBudgetByPreference = (budgetPreference, duration) => {
  const budgetByDuration = {
    당일: {
      절약: "1인 기준 6-10만원",
      보통: "1인 기준 10-15만원",
      여유: "1인 기준 18-25만원",
    },
    "1박 2일": {
      절약: "1인 기준 12-18만원",
      보통: "1인 기준 18-28만원",
      여유: "1인 기준 30-45만원",
    },
    "2박 3일": {
      절약: "1인 기준 20-30만원",
      보통: "1인 기준 30-45만원",
      여유: "1인 기준 50만원 이상",
    },
  };

  return (
    budgetByDuration[duration]?.[budgetPreference] ||
    budgetByDuration[duration]?.보통 ||
    "1인 기준 18-28만원"
  );
};

const normalizeAccommodation = (accommodation) => {
  if (!accommodation || typeof accommodation !== "object") {
    return null;
  }

  return {
    name: accommodation.name || "추천 숙소",
    type: accommodation.type || "호텔",
    location: accommodation.location || "제주시",
    reason: accommodation.reason || "여행 동선을 고려한 접근성 좋은 숙소",
  };
};

const normalizeCourseData = (rawCourse, requestedDuration, requestedBudget) => {
  // Always honor the user's selected duration.
  const duration = normalizeDuration(requestedDuration || rawCourse?.duration);

  const normalized = {
    title: rawCourse?.title || "맞춤 제주 여행 코스",
    summary: rawCourse?.summary || "선택한 조건에 맞춰 생성된 여행 코스입니다.",
    duration,
    day1: normalizeDayPlan(rawCourse?.day1),
    day2: null,
    day3: null,
    restaurants: Array.isArray(rawCourse?.restaurants) ? rawCourse.restaurants : [],
    accommodation: normalizeAccommodation(rawCourse?.accommodation),
    specialTips: Array.isArray(rawCourse?.specialTips) ? rawCourse.specialTips : [],
    totalBudget:
      rawCourse?.totalBudget || getBudgetByPreference(requestedBudget, duration),
    transportTips:
      rawCourse?.transportTips || "렌터카 또는 대중교통 이용을 권장합니다.",
  };

  if (duration === "1박 2일") {
    normalized.day2 = normalizeDayPlan(rawCourse?.day2);
    if (!normalized.accommodation) {
      normalized.accommodation = {
        name: "제주 감성 숙소",
        type: "호텔/펜션",
        location: "제주시",
        reason: "1박 일정에 맞춰 접근성과 휴식 편의를 고려했습니다.",
      };
    }
  }

  if (duration === "2박 3일") {
    normalized.day2 = normalizeDayPlan(rawCourse?.day2);
    normalized.day3 = normalizeDayPlan(rawCourse?.day3);
    if (!normalized.accommodation) {
      normalized.accommodation = {
        name: "제주 중심 숙소",
        type: "호텔/리조트",
        location: "제주시",
        reason: "2박 3일 일정에서 동선 효율이 좋은 위치입니다.",
      };
    }
  }

  if (duration === "당일") {
    normalized.day2 = null;
    normalized.day3 = null;
    normalized.accommodation = null;
  }

  if (normalized.specialTips.length === 0) {
    normalized.specialTips = ["입장 시간과 휴무일을 미리 확인해 동선을 최적화하세요."];
  }

  return normalized;
};

const courseSchema = {
  name: "jeju_trip_course",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "title",
      "summary",
      "duration",
      "day1",
      "day2",
      "day3",
      "restaurants",
      "accommodation",
      "specialTips",
      "totalBudget",
      "transportTips",
    ],
    properties: {
      title: { type: "string" },
      summary: { type: "string" },
      duration: {
        type: "string",
        enum: TRIP_DURATIONS,
      },
      day1: { $ref: "#/$defs/dayPlan" },
      day2: {
        anyOf: [{ $ref: "#/$defs/dayPlan" }, { type: "null" }],
      },
      day3: {
        anyOf: [{ $ref: "#/$defs/dayPlan" }, { type: "null" }],
      },
      restaurants: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["name", "type", "location", "specialty"],
          properties: {
            name: { type: "string" },
            type: { type: "string" },
            location: { type: "string" },
            specialty: { type: "string" },
          },
        },
      },
      accommodation: {
        anyOf: [{ $ref: "#/$defs/accommodation" }, { type: "null" }],
      },
      specialTips: {
        type: "array",
        items: { type: "string" },
      },
      totalBudget: { type: "string" },
      transportTips: { type: "string" },
    },
    $defs: {
      dayPlan: {
        type: "object",
        additionalProperties: false,
        required: ["morning", "afternoon", "evening"],
        properties: {
          morning: { $ref: "#/$defs/activityArray" },
          afternoon: { $ref: "#/$defs/activityArray" },
          evening: { $ref: "#/$defs/activityArray" },
        },
      },
      accommodation: {
        type: "object",
        additionalProperties: false,
        required: ["name", "type", "location", "reason"],
        properties: {
          name: { type: "string" },
          type: { type: "string" },
          location: { type: "string" },
          reason: { type: "string" },
        },
      },
      activityArray: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: [
            "time",
            "activity",
            "location",
            "duration",
            "description",
            "tip",
          ],
          properties: {
            time: { type: "string" },
            activity: { type: "string" },
            location: { type: "string" },
            duration: { type: "string" },
            description: { type: "string" },
            tip: { type: "string" },
          },
        },
      },
    },
  },
};

const buildPrompt = ({
  userType,
  character,
  spotType,
  filterText,
  duration,
  budget,
  filteredTourspots,
  filteredRestaurants,
  filteredHotels,
  allAvailableSpots,
}) => `
제주 여행 코스를 JSON으로 작성해주세요.

여행자: ${userType} (${character})
여행 기간: ${duration}
예산 성향: ${budget}
조건: ${filterText.region} / ${filterText.mood} / ${filterText.weather} / ${filterText.companion}
생성ID: ${Date.now()}-${Math.random().toString(36).slice(2, 11)}

중요: 매번 다른 장소와 다양한 코스를 제안해주세요.

관광지 옵션 (정확한 주소 포함):
${filteredTourspots
  .slice(0, 8)
  .map((s, idx) => `${idx + 1}. ${s.제목}: ${s.도로명주소} (인기점수: ${s.인기점수})`)
  .join("\n")}

식당 옵션 (정확한 주소 포함) - 반드시 이 목록에서만 선택:
${filteredRestaurants
  .slice(0, 8)
  .map(
    (r, idx) =>
      `${idx + 1}. ${r.제목}: ${r.도로명주소} (인기점수: ${r.인기점수}, 타입: ${r.타입}, 메모: ${r.메모})`,
  )
  .join("\n")}

숙소 옵션 (정확한 주소 포함):
${filteredHotels
  .slice(0, 4)
  .map((h, idx) => `${idx + 1}. ${h.제목}: ${h.도로명주소} (인기점수: ${h.인기점수})`)
  .join("\n")}

추가로 고려할 사용자 선택 장소:
${
  allAvailableSpots.length > 0
    ? allAvailableSpots
        .slice(0, 8)
        .map(
          (spot, idx) =>
            `${idx + 1}. ${spot.name || "장소명 미상"} (${spot.type || "기타"}): ${spot.address || "주소 정보 없음"}`,
        )
        .join("\n")
    : "없음"
}

여행 기간 규칙 (매우 중요):
1) duration은 반드시 "${duration}" 으로 반환하세요.
2) duration이 "당일"이면 day1만 채우고 day2=null, day3=null, accommodation=null로 반환하세요.
3) duration이 "1박 2일"이면 day1/day2를 채우고 day3=null로 반환하세요.
4) duration이 "2박 3일"이면 day1/day2/day3를 모두 채우세요.
5) 각 day의 morning/afternoon/evening 슬롯에는 최소 1개 활동을 권장합니다.

일반 규칙:
1) location에는 반드시 위 목록의 정확한 도로명주소를 사용하세요.
2) 관광지/식당/숙소는 반드시 위 목록에서 선택하세요.
3) 식당 정보는 절대 임의 생성하지 말고 제공된 목록을 사용하세요.
4) ${spotType} 성향에 맞게 코스를 구성하세요.
5) 같은 조건이어도 새로운 조합과 차별화된 일정을 제안하세요.
6) 예산 성향(${budget})에 맞는 총예산(totalBudget)을 제시하세요.
7) 최종 출력은 JSON만 반환하세요.
`;

const fallbackCourse = (character, duration, budgetPreference) => {
  const normalizedDuration = normalizeDuration(duration);

  return normalizeCourseData(
    {
      title: `${character}를 위한 맞춤 제주 여행`,
      summary: `${normalizedDuration} 일정에 맞춰 생성된 기본 여행 코스입니다.`,
      duration: normalizedDuration,
      day1: {
        morning: [
          {
            time: "09:00",
            activity: "여행 시작",
            location: "제주국제공항",
            duration: "1시간",
            description: "제주도 도착 및 렌터카 픽업",
            tip: "공항에서 렌터카를 미리 예약하면 편리합니다.",
          },
        ],
        afternoon: [],
        evening: [],
      },
      day2: normalizedDuration === "당일" ? null : createEmptyDayPlan(),
      day3: normalizedDuration === "2박 3일" ? createEmptyDayPlan() : null,
      restaurants: [],
      accommodation:
        normalizedDuration === "당일"
          ? null
          : {
              name: "제주 감성 숙소",
              type: "호텔/펜션",
              location: "제주시",
              reason: "여행 스타일에 맞는 접근성 좋은 숙소",
            },
      specialTips: ["여행 전 영업시간/휴무일을 확인하세요."],
      totalBudget: getBudgetByPreference(budgetPreference, normalizedDuration),
      transportTips: "렌터카 또는 대중교통 이용",
    },
    normalizedDuration,
    budgetPreference,
  );
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      userType,
      character,
      filterText = {},
      selectedSpots = [],
      csvSpots = [],
      spotType = "여행자",
      preferences = {},
    } = req.body || {};

    if (!userType || !character) {
      return res.status(400).json({ error: "사용자 유형 정보가 필요합니다." });
    }

    if (!openaiApiKey) {
      return res.status(500).json({ error: "OPENAI_API_KEY가 설정되지 않았습니다." });
    }

    const requestedDuration = normalizeDuration(preferences.duration);
    const requestedBudget = preferences.budget || "보통";

    const client = new OpenAI({ apiKey: openaiApiKey });
    const csvData = loadData();

    const region = filterText.region || "전체";
    const regionFilter = region === "전체" ? null : region;

    const filteredTourspots = regionFilter
      ? shuffleArray(csvData.tourspots.filter((spot) => spot.지역 === regionFilter)).slice(0, 10)
      : shuffleArray(csvData.tourspots).slice(0, 14);

    const filteredRestaurants = regionFilter
      ? shuffleArray(csvData.restaurants.filter((restaurant) => restaurant.지역 === regionFilter)).slice(0, 8)
      : shuffleArray(csvData.restaurants).slice(0, 10);

    const filteredHotels = regionFilter
      ? shuffleArray(csvData.hotels.filter((hotel) => hotel.지역 === regionFilter)).slice(0, 5)
      : shuffleArray(csvData.hotels).slice(0, 8);

    const normalizedCsvSpots = csvSpots.map((spot) => ({
      name: spot?.name,
      address: spot?.address,
      type: spot?.type,
    }));

    const allAvailableSpots = [...selectedSpots, ...normalizedCsvSpots];

    const prompt = buildPrompt({
      userType,
      character,
      spotType,
      duration: requestedDuration,
      budget: requestedBudget,
      filterText: {
        region: filterText.region || "전체",
        mood: filterText.mood || "활동적",
        weather: filterText.weather || "맑음",
        companion: filterText.companion || "연인/친구",
      },
      filteredTourspots,
      filteredRestaurants,
      filteredHotels,
      allAvailableSpots,
    });

    let aiResponse;

    try {
      const completion = await client.chat.completions.create({
        model: openaiModel,
        temperature: 0.9,
        messages: [
          {
            role: "system",
            content:
              "너는 제주 여행 코스 플래너다. 지정된 목록의 장소만 사용하고, 선택된 여행 기간을 반드시 준수하며, 유효한 JSON만 반환한다.",
          },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: courseSchema,
        },
      });

      aiResponse = completion.choices?.[0]?.message?.content;
    } catch (schemaError) {
      console.warn("OpenAI JSON schema 모드 실패, json_object로 재시도:", schemaError?.message);

      const completion = await client.chat.completions.create({
        model: openaiModel,
        temperature: 0.9,
        messages: [
          {
            role: "system",
            content:
              "너는 제주 여행 코스 플래너다. 지정된 목록의 장소만 사용하고, 선택된 여행 기간을 반드시 준수하며, 유효한 JSON 오브젝트만 반환한다.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      });

      aiResponse = completion.choices?.[0]?.message?.content;
    }

    if (!aiResponse) {
      return res.status(500).json({ error: "AI 응답을 처리할 수 없습니다." });
    }

    let courseData;

    try {
      const parsed = JSON.parse(aiResponse);
      courseData = normalizeCourseData(parsed, requestedDuration, requestedBudget);
    } catch (parseError) {
      console.error("OpenAI 응답 JSON 파싱 오류:", parseError);
      console.log("OpenAI 원본 응답:", aiResponse);
      courseData = fallbackCourse(character, requestedDuration, requestedBudget);
    }

    return res.status(200).json({
      success: true,
      course: courseData,
      userType,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("AI 코스 생성 오류:", error);
    return res.status(500).json({
      error: "AI 코스 생성 중 오류가 발생했습니다.",
      details: error.message,
    });
  }
}
