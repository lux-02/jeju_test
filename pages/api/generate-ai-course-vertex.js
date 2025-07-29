import { PredictionServiceClient } from "@google-cloud/aiplatform";

// Vertex AI Search 설정
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID;
const LOCATION = "us-central1"; // 또는 'asia-northeast3' (서울)
const SEARCH_ENGINE_ID = "jejutestspot_1753769391527";

// Vertex AI 클라이언트 초기화
const client = new PredictionServiceClient({
  apiEndpoint: `${LOCATION}-aiplatform.googleapis.com`,
});

// Vertex AI Search를 통한 관련 데이터 검색
async function searchRelevantData(query, userType, character, filters) {
  try {
    const searchRequest = {
      endpoint: `projects/${PROJECT_ID}/locations/${LOCATION}/indexEndpoints/${SEARCH_ENGINE_ID}`,
      instances: [
        {
          structValue: {
            fields: {
              query: {
                stringValue: `${userType} ${character} ${filters.region} ${filters.mood} ${filters.weather} ${filters.companion}`,
              },
            },
          },
        },
      ],
      parameters: {
        structValue: {
          fields: {
            maxResults: {
              numberValue: 20,
            },
            filter: {
              stringValue: `type = "tourspot" OR type = "restaurant" OR type = "hotel"`,
            },
          },
        },
      },
    };

    const [response] = await client.predict(searchRequest);

    if (response.predictions && response.predictions[0]) {
      return response.predictions[0].structValue.fields.results.listValue
        .values;
    }

    return [];
  } catch (error) {
    console.error("Vertex AI Search 오류:", error);
    return [];
  }
}

// 기존 CSV 데이터 로드 (백업용)
import fs from "fs";
import path from "path";

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

const loadData = () => {
  try {
    const tourspotPath = path.join(process.cwd(), "lib", "tourspot.csv");
    const restaurantPath = path.join(process.cwd(), "lib", "restaurant.json");
    const hotelPath = path.join(process.cwd(), "lib", "hotel.csv");

    const tourspotCSV = fs.readFileSync(tourspotPath, "utf-8");
    const restaurantJSON = fs.readFileSync(restaurantPath, "utf-8");
    const hotelCSV = fs.readFileSync(hotelPath, "utf-8");

    const restaurantData = JSON.parse(restaurantJSON);
    const restaurants = restaurantData.bookmarkList.map((item) => ({
      제목: item.name,
      도로명주소: item.address,
      인기점수: "높음",
      지역: item.address.includes("서귀포") ? "서귀포" : "제주",
      메모: item.memo || "",
      타입: item.mcidName || "음식점",
    }));

    return {
      tourspots: parseCSV(tourspotCSV),
      restaurants: restaurants,
      hotels: parseCSV(hotelCSV),
    };
  } catch (error) {
    console.error("데이터 파일 로드 실패:", error);
    return { tourspots: [], restaurants: [], restaurants: [], hotels: [] };
  }
};

// Vertex AI Search 기반 RAG 여행 코스 생성 API
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

    if (!userType || !character) {
      return res.status(400).json({ error: "사용자 유형 정보가 필요합니다." });
    }

    const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!geminiApiKey) {
      return res
        .status(500)
        .json({ error: "Gemini API 키가 설정되지 않았습니다." });
    }

    // 1. Vertex AI Search를 통한 관련 데이터 검색
    console.log("Vertex AI Search를 통한 관련 데이터 검색 중...");
    const searchResults = await searchRelevantData(
      `${userType} ${character} ${filterText.region} ${filterText.mood}`,
      userType,
      character,
      filterText
    );

    // 2. 검색 결과를 구조화된 데이터로 변환
    const relevantSpots = [];
    const relevantRestaurants = [];
    const relevantHotels = [];

    searchResults.forEach((result) => {
      const data = result.structValue.fields;
      const type = data.type?.stringValue || "tourspot";

      const item = {
        제목: data.title?.stringValue || data.name?.stringValue || "",
        도로명주소:
          data.address?.stringValue || data.location?.stringValue || "",
        인기점수: data.popularity?.stringValue || "보통",
        지역: data.region?.stringValue || "제주",
        메모: data.description?.stringValue || data.memo?.stringValue || "",
        타입: type,
        유사도점수: data.score?.numberValue || 0,
      };

      switch (type) {
        case "tourspot":
          relevantSpots.push(item);
          break;
        case "restaurant":
          relevantRestaurants.push(item);
          break;
        case "hotel":
          relevantHotels.push(item);
          break;
        default:
          relevantSpots.push(item);
      }
    });

    // 3. 검색 결과가 부족한 경우 기존 CSV 데이터로 보완
    const backupData = loadData();

    const finalSpots =
      relevantSpots.length > 0
        ? relevantSpots.slice(0, 8)
        : backupData.tourspots.slice(0, 8);

    const finalRestaurants =
      relevantRestaurants.length > 0
        ? relevantRestaurants.slice(0, 6)
        : backupData.restaurants.slice(0, 6);

    const finalHotels =
      relevantHotels.length > 0
        ? relevantHotels.slice(0, 4)
        : backupData.hotels.slice(0, 4);

    // 4. AI 프롬프트 생성 (RAG 기반)
    const prompt = `
제주도 1박 2일 여행 코스를 JSON으로 작성해주세요.

여행자: ${userType} (${character})
조건: ${filterText.region} / ${filterText.mood} / ${filterText.weather} / ${
      filterText.companion
    }
생성ID: ${Date.now()}-${Math.random().toString(36).substr(2, 9)}

🔍 AI 검색으로 찾은 맞춤 장소들:

🏞️ 관광지 (유사도 기반 추천):
${finalSpots
  .map(
    (s, idx) =>
      `${idx + 1}. ${s.도로명주소} (인기점수: ${s.인기점수}, 유사도: ${
        s.유사도점수?.toFixed(2) || "N/A"
      })`
  )
  .join("\n")}

🍽️ 식당 (유사도 기반 추천):
${finalRestaurants
  .map(
    (r, idx) =>
      `${idx + 1}. ${r.제목}: ${r.도로명주소} (인기점수: ${
        r.인기점수
      }, 유사도: ${r.유사도점수?.toFixed(2) || "N/A"})`
  )
  .join("\n")}

🏨 숙소 (유사도 기반 추천):
${finalHotels
  .map(
    (h, idx) =>
      `${idx + 1}. ${h.제목}: ${h.도로명주소} (인기점수: ${
        h.인기점수
      }, 유사도: ${h.유사도점수?.toFixed(2) || "N/A"})`
  )
  .join("\n")}

JSON 형식:
{
  "title": "여행 제목",
  "summary": "한 줄 요약",
  "searchQuality": "검색 품질 정보",
  "day1": {
    "morning": [{"time": "09:00", "activity": "활동명", "location": "위 목록의 정확한 도로명주소", "duration": "시간", "description": "설명", "tip": "팁", "relevanceScore": "유사도점수"}],
    "afternoon": [{"time": "13:00", "activity": "활동명", "location": "위 목록의 정확한 도로명주소", "duration": "시간", "description": "설명", "tip": "팁", "relevanceScore": "유사도점수"}],
    "evening": [{"time": "18:00", "activity": "활동명", "location": "위 목록의 정확한 도로명주소", "duration": "시간", "description": "설명", "tip": "팁", "relevanceScore": "유사도점수"}]
  },
  "day2": {
    "morning": [{"time": "09:00", "activity": "활동명", "location": "위 목록의 정확한 도로명주소", "duration": "시간", "description": "설명", "tip": "팁", "relevanceScore": "유사도점수"}],
    "afternoon": [{"time": "13:00", "activity": "활동명", "location": "위 목록의 정확한 도로명주소", "duration": "시간", "description": "설명", "tip": "팁", "relevanceScore": "유사도점수"}]
  },
  "restaurants": [{"name": "식당명", "type": "식사 종류", "location": "위 목록의 정확한 도로명주소", "specialty": "메뉴", "relevanceScore": "유사도점수"}],
  "accommodation": {"name": "숙소명", "type": "숙소 타입", "location": "위 목록의 정확한 도로명주소", "reason": "추천 이유", "relevanceScore": "유사도점수"},
  "specialTips": ["팁1", "팁2"],
  "totalBudget": "예산",
  "transportTips": "교통 정보"
}

**중요한 요구사항:**
1. 위 AI 검색 결과의 정확한 도로명주소를 location 필드에 반드시 포함하세요
2. 유사도 점수가 높은 장소들을 우선적으로 선택하세요
3. ${spotType} 성향에 맞는 코스를 만들어주세요
4. 🎯 검색 품질이 높은 장소들을 중심으로 일정을 구성하세요
5. 🌟 창의적이고 독특한 일정 구성으로 차별화된 여행 경험을 제공하세요
6. 🔍 Vertex AI Search의 검색 결과를 최대한 활용하여 정확한 추천을 제공하세요

JSON만 응답하세요.`;

    // 5. Gemini AI API 호출
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API 오류:", errorData);
      return res.status(500).json({ error: "AI 서비스에 연결할 수 없습니다." });
    }

    const data = await response.json();

    if (
      !data.candidates ||
      !data.candidates[0] ||
      !data.candidates[0].content
    ) {
      console.error("Gemini API 응답 형식 오류:", data);
      return res.status(500).json({ error: "AI 응답을 처리할 수 없습니다." });
    }

    const aiResponse = data.candidates[0].content.parts[0].text;

    // 6. JSON 응답 파싱
    let courseData;
    try {
      let cleanResponse = aiResponse.trim();
      cleanResponse = cleanResponse
        .replace(/```json\s*/, "")
        .replace(/```\s*$/, "");

      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        let jsonStr = jsonMatch[0];
        if (!jsonStr.endsWith("}")) {
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

      // 검색 품질 정보 추가
      courseData.searchQuality = {
        totalResults: searchResults.length,
        spotsFound: relevantSpots.length,
        restaurantsFound: relevantRestaurants.length,
        hotelsFound: relevantHotels.length,
        averageRelevanceScore:
          searchResults.length > 0
            ? searchResults.reduce(
                (sum, r) =>
                  sum + (r.structValue.fields.score?.numberValue || 0),
                0
              ) / searchResults.length
            : 0,
      };
    } catch (parseError) {
      console.error("JSON 파싱 오류:", parseError);
      console.log("AI 원본 응답:", aiResponse);

      // 기본 응답 제공
      courseData = {
        title: `${character}를 위한 맞춤 제주 여행 (RAG 기반)`,
        summary: "Vertex AI Search 기반 개인 맞춤 제주 여행 코스입니다.",
        searchQuality: {
          totalResults: searchResults.length,
          spotsFound: relevantSpots.length,
          restaurantsFound: relevantRestaurants.length,
          hotelsFound: relevantHotels.length,
          averageRelevanceScore: 0,
        },
        day1: {
          morning: [
            {
              time: "09:00",
              activity: "여행 시작",
              location: "제주국제공항",
              duration: "1시간",
              description: "제주도 도착 및 렌터카 픽업",
              tip: "공항에서 렌터카를 미리 예약하시면 편리합니다.",
              relevanceScore: 0,
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
          relevanceScore: 0,
        },
        specialTips: [
          "제주도는 렌터카 이용을 추천합니다.",
          "Vertex AI Search를 통해 맞춤 장소를 추천받았습니다.",
        ],
        totalBudget: "1인 기준 15-20만원",
        transportTips: "렌터카 또는 대중교통 이용",
      };
    }

    // 성공 응답
    res.status(200).json({
      success: true,
      course: courseData,
      userType,
      searchResults: {
        total: searchResults.length,
        spots: relevantSpots.length,
        restaurants: relevantRestaurants.length,
        hotels: relevantHotels.length,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Vertex AI RAG 코스 생성 오류:", error);
    res.status(500).json({
      error: "Vertex AI RAG 코스 생성 중 오류가 발생했습니다.",
      details: error.message,
    });
  }
}
