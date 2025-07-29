import { PredictionServiceClient } from "@google-cloud/aiplatform";

// Vertex AI Search 설정
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID;
const LOCATION = "us-central1"; // 또는 'asia-northeast3' (서울)
const SEARCH_ENGINE_ID =
  process.env.VERTEX_SEARCH_ENGINE_ID || "jejutestspot_1753769391527";

// Vertex AI 클라이언트 초기화
const client = new PredictionServiceClient({
  apiEndpoint: `${LOCATION}-aiplatform.googleapis.com`,
});

// Vertex AI Search 테스트 API
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "검색 쿼리가 필요합니다." });
    }

    if (!PROJECT_ID) {
      return res.status(500).json({
        error: "GOOGLE_CLOUD_PROJECT_ID 환경 변수가 설정되지 않았습니다.",
      });
    }

    console.log("Vertex AI Search 테스트 시작...");
    console.log("프로젝트 ID:", PROJECT_ID);
    console.log("검색 엔진 ID:", SEARCH_ENGINE_ID);
    console.log("검색 쿼리:", query);
    console.log("API 엔드포인트:", `${LOCATION}-aiplatform.googleapis.com`);

    const searchRequest = {
      endpoint: `projects/${PROJECT_ID}/locations/${LOCATION}/indexEndpoints/${SEARCH_ENGINE_ID}`,
      instances: [
        {
          structValue: {
            fields: {
              query: {
                stringValue: query,
              },
            },
          },
        },
      ],
      parameters: {
        structValue: {
          fields: {
            maxResults: {
              numberValue: 10,
            },
          },
        },
      },
    };

    console.log("검색 요청:", JSON.stringify(searchRequest, null, 2));
    console.log("검색 요청 전송 중...");
    const [response] = await client.predict(searchRequest);

    console.log("검색 응답 받음:", response);

    if (response.predictions && response.predictions[0]) {
      const results =
        response.predictions[0].structValue.fields.results.listValue.values;

      // 결과 정리
      const formattedResults = results.map((result, index) => {
        const data = result.structValue.fields;
        return {
          index: index + 1,
          title:
            data.title?.stringValue || data.name?.stringValue || "제목 없음",
          address:
            data.address?.stringValue ||
            data.location?.stringValue ||
            "주소 없음",
          type: data.type?.stringValue || "unknown",
          score: data.score?.numberValue || 0,
          description:
            data.description?.stringValue || data.memo?.stringValue || "",
          region: data.region?.stringValue || "제주",
        };
      });

      res.status(200).json({
        success: true,
        query: query,
        totalResults: results.length,
        results: formattedResults,
        rawResponse: response,
      });
    } else {
      res.status(200).json({
        success: true,
        query: query,
        totalResults: 0,
        results: [],
        message: "검색 결과가 없습니다.",
        rawResponse: response,
      });
    }
  } catch (error) {
    console.error("Vertex AI Search 테스트 오류:", error);
    res.status(500).json({
      error: "Vertex AI Search 테스트 중 오류가 발생했습니다.",
      details: error.message,
      stack: error.stack,
    });
  }
}
