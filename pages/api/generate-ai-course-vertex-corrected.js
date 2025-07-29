// 필요한 라이브러리 임포트
import { SearchServiceClient } from "@google-cloud/discoveryengine"; // Discovery Engine 클라이언트
import { GoogleAuth } from "google-auth-library"; // Google Cloud 인증
import { VertexAI } from "@google-cloud/vertexai"; // Vertex AI SDK (Gemini API용)

import fs from "fs";
import path from "path";

// Vertex AI 설정 (환경 변수에서 불러오기)
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID;
const LOCATION = "global"; // 데이터 스토어 생성 시 선택한 리전 (대부분 global)
const COLLECTION_ID = "default_collection";
const ENGINE_ID = "jejutestspot_1753769322859"; // 사용자의 엔진 ID
const SERVING_CONFIG_ID = "default_search"; // 기본 서빙 구성 ID

// Gemini 모델이 배포된 리전 (예: us-central1, asia-northeast3 등)
const GEMINI_MODEL_LOCATION = "us-central1";

// Discovery Engine 클라이언트 초기화 함수 (인증 포함)
async function getDiscoveryEngineClient() {
  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = new SearchServiceClient({
    auth: await auth.getClient(), // 인증된 클라이언트 사용
  });
  return client;
}

// Vertex AI Search (Discovery Engine)를 통한 관련 데이터 검색
async function searchRelevantData(fullQuery) {
  try {
    const client = await getDiscoveryEngineClient(); // 인증된 Discovery Engine 클라이언트

    // 서빙 구성 경로 설정 (올바른 형식)
    const servingConfig = `projects/${PROJECT_ID}/locations/${LOCATION}/collections/${COLLECTION_ID}/engines/${ENGINE_ID}/servingConfigs/${SERVING_CONFIG_ID}`;

    console.log("Discovery Engine 검색 시작...");
    console.log("서빙 구성:", servingConfig);
    console.log("검색 쿼리:", fullQuery);

    // Discovery Engine의 SearchRequest 구성
    const searchRequest = {
      servingConfig: servingConfig,
      query: fullQuery, // 사용자의 전체 질의
      pageSize: 20, // maxResults 대신 pageSize 사용
      contentSearchSpec: {
        snippetSpec: {
          returnSnippet: true, // 스니펫 반환 요청
        },
        // TODO: 여기 필터 구문은 실제 데이터 스토어의 스키마에 따라 조정해야 합니다.
        // 예: 만약 문서 메타데이터에 'type' 필드가 있다면 아래와 같이 사용합니다.
        // filter: 'type: "tourspot" OR type: "restaurant" OR type: "hotel"',
        // 이 예시에서는 필터를 제거하거나, 스키마에 맞게 수정해야 합니다.
      },
      queryExpansionSpec: {
        condition: "AUTO", // 쿼리 확장 자동 설정
      },
    };

    console.log("검색 요청:", JSON.stringify(searchRequest, null, 2));

    const [response] = await client.search(searchRequest);

    console.log("검색 응답 받음:", JSON.stringify(response, null, 2));

    const results = [];
    if (response.results) {
      for (const result of response.results) {
        // derivedStructData에서 메타데이터 추출 (JSONL에서 정의한 필드명 사용)
        const docData = result.document?.derivedStructData;
        if (docData) {
          results.push({
            제목: docData.명칭 || docData.제목 || "", // JSONL의 '명칭' 또는 '제목' 필드
            도로명주소: docData.도로명주소 || docData.address || "", // JSONL의 '도로명주소' 필드
            인기점수: docData.인기점수 || "보통", // JSONL의 '인기점수' 필드
            지역: docData.지역 || "제주", // JSONL의 '지역' 필드
            메모: docData.embedding_input || "", // JSONL의 'embedding_input' (설명) 필드
            타입: docData.type || "tourspot", // 데이터에 'type' 필드가 있다면 사용
            유사도점수: result.relevanceScore || 0, // Discovery Engine의 관련성 점수
          });
        }
      }
    }

    console.log("검색 결과:", results.length, "개");
    return results;
  } catch (error) {
    console.error("Discovery Engine Search 오류:", error);
    return [];
  }
}

// 기존 CSV 데이터 로드 (백업용) - 이 부분은 기존 로직을 유지합니다.
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
    return { tourspots: [], restaurants: [], hotels: [] }; // 초기화 수정
  }
};

// Vertex AI Search 기반 RAG 여행 코스 생성 API 핸들러
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      userType,
      character,
      description,
      filters, // filterText를 포함한 객체로 예상
      filterText, // 필터 텍스트 (지역, 분위기 등)
      selectedSpots = [],
      csvSpots = [],
      spotType,
      preferences,
    } = req.body;

    if (!userType || !character) {
      return res.status(400).json({ error: "사용자 유형 정보가 필요합니다." });
    }

    // 1. Vertex AI Search를 통한 관련 데이터 검색
    console.log("Vertex AI Search를 통한 관련 데이터 검색 중...");
    const fullQuery = `${userType} ${character} ${filterText.region} ${filterText.mood} ${filterText.weather} ${filterText.companion}`;
    const searchResults = await searchRelevantData(fullQuery);

    // 2. 검색 결과를 구조화된 데이터로 변환 (필드명은 searchRelevantData에서 반환하는 결과에 맞춰짐)
    const relevantSpots = [];
    const relevantRestaurants = [];
    const relevantHotels = [];

    searchResults.forEach((item) => {
      // JSONL 데이터에서 'type' 필드가 있다면 해당 값을 사용
      // 없으면 기본값 'tourspot' 사용 (JSONL 생성 시 타입 필드를 포함하는 것이 좋음)
      const type = item.타입 || "tourspot";

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
          relevantSpots.push(item); // 기본적으로 관광지로 처리
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

    // 5. Gemini AI API 호출 (Vertex AI SDK 사용)
    console.log("Gemini AI API 호출 중 (Vertex AI SDK)...");
    const vertex_ai = new VertexAI({
      project: PROJECT_ID,
      location: GEMINI_MODEL_LOCATION, // Gemini 모델이 사용 가능한 리전
    });
    const model = vertex_ai.getGenerativeModel({
      model: "gemini-1.5-flash", // 사용하려는 Gemini 모델
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096,
      },
    });

    const geminiResponse = await model.generateContent(prompt);
    const aiResponse = geminiResponse.text; // 응답 텍스트 추출

    // 6. JSON 응답 파싱 (기존 로직 유지, 더욱 견고하게 파싱하도록 개선)
    let courseData;
    try {
      let cleanResponse = aiResponse.trim();
      cleanResponse = cleanResponse
        .replace(/```json\s*/, "") // 시작 마크다운 제거
        .replace(/```\s*$/, ""); // 끝 마크다운 제거

      // JSON 객체로 시작하고 끝나는 부분을 명확히 찾기
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        let jsonStr = jsonMatch[0];
        try {
          courseData = JSON.parse(jsonStr);
        } catch (parseErrInner) {
          // 불완전하거나 형식 오류가 있는 JSON을 더 견고하게 파싱 시도
          console.warn(
            "Attempting robust JSON parse due to inner error:",
            parseErrInner
          );
          // 일반적인 문제 해결 (예: 마지막 콤마 제거, 닫히지 않은 괄호)
          jsonStr = jsonStr.replace(/,\s*([}\]])/g, "$1"); // Trailing commas before } or ]
          // 닫히지 않은 괄호 추가 (간단한 경우에만 유효)
          const openBraceCount = (jsonStr.match(/{/g) || []).length;
          const closeBraceCount = (jsonStr.match(/}/g) || []).length;
          const openBracketCount = (jsonStr.match(/\[/g) || []).length;
          const closeBracketCount = (jsonStr.match(/]/g) || []).length;

          if (openBraceCount > closeBraceCount) {
            jsonStr += "}".repeat(openBraceCount - closeBraceCount);
          }
          if (openBracketCount > closeBracketCount) {
            jsonStr += "]".repeat(openBracketCount - closeBracketCount);
          }
          courseData = JSON.parse(jsonStr);
        }
      } else {
        // `jsonMatch`가 없으면 전체 응답이 순수 JSON이라고 가정하고 파싱
        courseData = JSON.parse(cleanResponse);
      }

      // 필수 필드 검증 및 보완 (기존 로직 유지)
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
                (sum, r) => sum + (r.유사도점수 || 0), // '유사도점수' 필드 사용
                0
              ) / searchResults.length
            : 0,
      };
    } catch (parseError) {
      console.error("JSON 파싱 오류:", parseError);
      console.log("AI 원본 응답:", aiResponse);

      // JSON 파싱 실패 시 기본 응답 제공 (기존 로직 유지)
      courseData = {
        title: `${character}를 위한 맞춤 제주 여행 (RAG 기반 - 오류 발생)`,
        summary: "AI 응답 파싱 중 오류가 발생하여 기본 코스를 제공합니다.",
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
