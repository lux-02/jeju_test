import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";

const geminiApiKey =
  process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const geminiClient = geminiApiKey
  ? new GoogleGenAI({ apiKey: geminiApiKey })
  : null;

// CSV 데이터를 파싱하는 함수
const parseCSV = (csvText) => {
  const lines = csvText.trim().split("\n");
  const headers = lines[0].split(",");
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",");
    const item = {};
    headers.forEach((header, index) => {
      item[header.trim()] = values[index] ? values[index].trim() : "";
    });
    data.push(item);
  }

  return data;
};

// CSV와 JSON 파일들을 읽어서 파싱하는 함수
const loadData = () => {
  try {
    const tourspotPath = path.join(process.cwd(), "lib", "tourspot.csv");
    const restaurantPath = path.join(process.cwd(), "lib", "restaurant.json");
    const hotelPath = path.join(process.cwd(), "lib", "hotel.csv");

    const tourspotCSV = fs.readFileSync(tourspotPath, "utf-8");
    const restaurantJSON = fs.readFileSync(restaurantPath, "utf-8");
    const hotelCSV = fs.readFileSync(hotelPath, "utf-8");

    // JSON 데이터 파싱
    const restaurantData = JSON.parse(restaurantJSON);
    const restaurants = restaurantData.bookmarkList.map((item) => {
      // 지역 분류 로직 개선
      let region = "제주";
      if (item.address.includes("서귀포")) {
        region = "서귀포";
      } else if (item.address.includes("제주시")) {
        region = "제주";
      } else if (
        item.address.includes("한림") ||
        item.address.includes("애월")
      ) {
        region = "제주";
      }

      // 인기점수 계산 (메모 길이, 타입 등을 고려)
      let popularityScore = "보통";
      if (item.memo && item.memo.length > 10) {
        popularityScore = "높음";
      }
      if (
        item.memo &&
        (item.memo.includes("맛집") ||
          item.memo.includes("👍") ||
          item.memo.includes("추천"))
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

    return {
      tourspots: parseCSV(tourspotCSV),
      restaurants: restaurants,
      hotels: parseCSV(hotelCSV),
    };
  } catch (error) {
    console.error("데이터 파일 로드 실패:", error);
    return { tourspots: [], restaurants: [], hotels: [] };
  }
};

// AI 맞춤 여행 코스 생성 API
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      userType,
      character,
      description,
      filters,
      filterText,
      selectedSpots,
      csvSpots,
      spotType,
      preferences,
    } = req.body;

    // 입력 데이터 검증
    if (!userType || !character) {
      return res.status(400).json({ error: "사용자 유형 정보가 필요합니다." });
    }

    // Gemini AI API 호출 준비
    if (!geminiApiKey || !geminiClient) {
      return res
        .status(500)
        .json({ error: "Gemini API 키가 설정되지 않았습니다." });
    }

    // 데이터 로드 (그라운드 지식으로 활용)
    const csvData = loadData();

    // 랜덤화 함수 - 배열을 섞어서 매번 다른 결과 생성
    const shuffleArray = (array) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    // 선택된 지역에 따라 데이터 필터링 및 랜덤화
    const regionFilter =
      filterText.region === "전체" ? null : filterText.region;

    const filteredTourspots = regionFilter
      ? shuffleArray(
          csvData.tourspots.filter((spot) => spot.지역 === regionFilter)
        ).slice(0, 8)
      : shuffleArray(csvData.tourspots).slice(0, 12);

    const filteredRestaurants = regionFilter
      ? shuffleArray(
          csvData.restaurants.filter(
            (restaurant) => restaurant.지역 === regionFilter
          )
        ).slice(0, 6)
      : shuffleArray(csvData.restaurants).slice(0, 8);

    const filteredHotels = regionFilter
      ? shuffleArray(
          csvData.hotels.filter((hotel) => hotel.지역 === regionFilter)
        ).slice(0, 4)
      : shuffleArray(csvData.hotels).slice(0, 6);

    // CSV 명소들과 기존 명소들 결합
    const allAvailableSpots = [
      ...selectedSpots,
      ...csvSpots.map((spot) => ({
        name: spot.name,
        address: spot.address,
        type: spot.type,
      })),
    ];

    // AI 프롬프트 생성 - 간소화된 버전으로 응답 길이 최적화
    const prompt = `
제주도 1박 2일 여행 코스를 JSON으로 작성해주세요.

여행자: ${userType} (${character})
조건: ${filterText.region} / ${filterText.mood} / ${filterText.weather} / ${
      filterText.companion
    }
생성ID: ${Date.now()}-${Math.random().toString(36).substr(2, 9)}

📍 중요: 매번 다른 장소와 다양한 코스를 제안해주세요!

🏞️ 관광지 옵션 (정확한 주소 포함):
${filteredTourspots
  .slice(0, 6) // 더 많은 옵션 제공
  .map((s, idx) => `${idx + 1}. ${s.도로명주소} (인기점수: ${s.인기점수})`)
  .join("\n")}

🍽️ 식당 옵션 (정확한 주소 포함) - 반드시 이 목록에서만 선택하세요:
${filteredRestaurants
  .slice(0, 6) // 더 많은 옵션 제공
  .map(
    (r, idx) =>
      `${idx + 1}. ${r.제목}: ${r.도로명주소} (인기점수: ${r.인기점수}, 타입: ${
        r.타입
      }, 메모: ${r.메모})`
  )
  .join("\n")}

🏨 숙소 옵션 (정확한 주소 포함):
${filteredHotels
  .slice(0, 3) // 더 많은 옵션 제공
  .map(
    (h, idx) =>
      `${idx + 1}. ${h.제목}: ${h.도로명주소} (인기점수: ${h.인기점수})`
  )
  .join("\n")}

JSON 형식:
{
  "title": "여행 제목",
  "summary": "한 줄 요약",
  "day1": {
    "morning": [{"time": "09:00", "activity": "활동명", "location": "위 목록의 정확한 도로명주소", "duration": "시간", "description": "설명", "tip": "팁"}],
    "afternoon": [{"time": "13:00", "activity": "활동명", "location": "위 목록의 정확한 도로명주소", "duration": "시간", "description": "설명", "tip": "팁"}],
    "evening": [{"time": "18:00", "activity": "활동명", "location": "위 목록의 정확한 도로명주소", "duration": "시간", "description": "설명", "tip": "팁"}]
  },
  "day2": {
    "morning": [{"time": "09:00", "activity": "활동명", "location": "위 목록의 정확한 도로명주소", "duration": "시간", "description": "설명", "tip": "팁"}],
    "afternoon": [{"time": "13:00", "activity": "활동명", "location": "위 목록의 정확한 도로명주소", "duration": "시간", "description": "설명", "tip": "팁"}]
  },
  "restaurants": [{"name": "식당명", "type": "식사 종류", "location": "위 목록의 정확한 도로명주소", "specialty": "메뉴"}],
  "accommodation": {"name": "숙소명", "type": "숙소 타입", "location": "위 목록의 정확한 도로명주소", "reason": "추천 이유"},
  "specialTips": ["팁1", "팁2"],
  "totalBudget": "예산",
  "transportTips": "교통 정보"
}

**중요한 요구사항:**
1. 위 데이터의 정확한 도로명주소를 location 필드에 반드시 포함하세요
2. 관광지/식당/숙소는 반드시 위 목록에서 선택하여 사용하세요  
3. 🍽️ 식당 정보는 반드시 위 식당 목록에서만 선택하여 사용하세요 - 절대 임의로 생성하지 마세요
4. ${spotType} 성향에 맞는 코스를 만들어주세요
5. 각 장소의 정확한 주소와 인기점수를 활용하세요
6. 🎲 매번 다른 조합의 장소들을 선택해서 다양한 코스를 만들어주세요
7. 🌟 창의적이고 독특한 일정 구성으로 차별화된 여행 경험을 제공하세요
8. 🔀 같은 조건이라도 항상 새로운 장소와 활동을 추천해주세요
9. ⚠️ 식당명과 주소는 반드시 제공된 데이터에서 정확히 복사하여 사용하세요

JSON만 응답하세요.`;

    let aiResponse;
    try {
      const aiResult = await geminiClient.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        },
      });

      aiResponse =
        aiResult?.text ||
        aiResult?.output_text ||
        (typeof aiResult?.response?.text === "function"
          ? aiResult.response.text()
          : aiResult?.response?.text) ||
        aiResult?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
        aiResult?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!aiResponse) {
        console.error("Gemini API 응답 형식 오류:", aiResult);
        return res
          .status(500)
          .json({ error: "AI 응답을 처리할 수 없습니다." });
      }
    } catch (sdkError) {
      console.error("Gemini API 오류:", sdkError);
      return res.status(500).json({ error: "AI 서비스에 연결할 수 없습니다." });
    }

    // JSON 응답 파싱 시도 - 강화된 오류 처리
    let courseData;
    try {
      // 응답 정리
      let cleanResponse = aiResponse.trim();

      // 코드 블록 제거
      cleanResponse = cleanResponse
        .replace(/```json\s*/, "")
        .replace(/```\s*$/, "");

      // JSON 블록만 추출
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        let jsonStr = jsonMatch[0];

        // 불완전한 JSON 복구 시도
        if (!jsonStr.endsWith("}")) {
          // 마지막 불완전한 부분 제거하고 닫기
          jsonStr = jsonStr.replace(/,\s*[^}]*$/, "") + "}";
        }

        courseData = JSON.parse(jsonStr);
      } else {
        courseData = JSON.parse(cleanResponse);
      }

      // 필수 필드 검증 및 보완
      if (!courseData.day1?.morning)
        courseData.day1 = { morning: [], afternoon: [], evening: [] };
      if (!courseData.day2?.morning)
        courseData.day2 = { morning: [], afternoon: [] };
    } catch (parseError) {
      console.error("JSON 파싱 오류:", parseError);
      console.log("AI 원본 응답:", aiResponse);

      // JSON 파싱에 실패하면 기본 응답 제공
      courseData = {
        title: `${character}를 위한 맞춤 제주 여행`,
        summary: "AI가 생성한 개인 맞춤 제주 여행 코스입니다.",
        day1: {
          morning: [
            {
              time: "09:00",
              activity: "여행 시작",
              location: "제주국제공항",
              duration: "1시간",
              description: "제주도 도착 및 렌터카 픽업",
              tip: "공항에서 렌터카를 미리 예약하시면 편리합니다.",
            },
          ],
          afternoon: [],
          evening: [],
        },
        day2: {
          morning: [],
          afternoon: [],
        },
        restaurants: [],
        accommodation: {
          name: "제주 감성 펜션",
          type: "펜션",
          location: "제주시",
          reason: "당신의 여행 스타일에 맞는 분위기 좋은 숙소",
        },
        specialTips: ["제주도는 렌터카 이용을 추천합니다."],
        totalBudget: "1인 기준 15-20만원",
        transportTips: "렌터카 또는 대중교통 이용",
      };
    }

    // 성공 응답
    res.status(200).json({
      success: true,
      course: courseData,
      userType,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("AI 코스 생성 오류:", error);
    res.status(500).json({
      error: "AI 코스 생성 중 오류가 발생했습니다.",
      details: error.message,
    });
  }
}
