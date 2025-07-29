import { SearchServiceClient } from "@google-cloud/discoveryengine";
import { GoogleAuth } from "google-auth-library";

// Vertex AI 설정
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID;
const LOCATION = "global";
const COLLECTION_ID = "default_collection";
const ENGINE_ID = "jejutestspot_1753769322859";
const SERVING_CONFIG_ID = "default_search";

// Discovery Engine 클라이언트 초기화 함수
async function getDiscoveryEngineClient() {
  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = new SearchServiceClient({
    auth: await auth.getClient(),
  });
  return client;
}

// Discovery Engine 테스트 API
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

    console.log("=== Discovery Engine 테스트 ===");
    console.log("프로젝트 ID:", PROJECT_ID);
    console.log("엔진 ID:", ENGINE_ID);
    console.log("검색 쿼리:", query);

    try {
      const client = await getDiscoveryEngineClient();

      // 서빙 구성 경로 설정 (올바른 형식)
      const servingConfig = `projects/${PROJECT_ID}/locations/${LOCATION}/collections/${COLLECTION_ID}/engines/${ENGINE_ID}/servingConfigs/${SERVING_CONFIG_ID}`;

      console.log("서빙 구성:", servingConfig);

      // Discovery Engine의 SearchRequest 구성
      const searchRequest = {
        servingConfig: servingConfig,
        query: query,
        pageSize: 10,
        contentSearchSpec: {
          snippetSpec: {
            returnSnippet: true,
          },
        },
        queryExpansionSpec: {
          condition: "AUTO",
        },
      };

      console.log("검색 요청:", JSON.stringify(searchRequest, null, 2));
      console.log("검색 요청 전송 중...");

      const [response] = await client.search(searchRequest);

      console.log("검색 응답 받음:", JSON.stringify(response, null, 2));

      if (response.results && response.results.length > 0) {
        const formattedResults = response.results.map((result, index) => {
          const docData = result.document?.derivedStructData;
          return {
            index: index + 1,
            title: docData?.명칭 || docData?.제목 || "제목 없음",
            address: docData?.도로명주소 || docData?.address || "주소 없음",
            type: docData?.type || "unknown",
            score: result.relevanceScore || 0,
            description: docData?.embedding_input || "",
            region: docData?.지역 || "제주",
            popularity: docData?.인기점수 || "보통",
          };
        });

        res.status(200).json({
          success: true,
          query: query,
          totalResults: response.results.length,
          results: formattedResults,
          message: "Discovery Engine 검색 성공!",
        });
      } else {
        res.status(200).json({
          success: true,
          query: query,
          totalResults: 0,
          results: [],
          message: "검색 결과가 없습니다.",
          response: response,
        });
      }
    } catch (searchError) {
      console.error("Discovery Engine 검색 오류:", searchError);

      res.status(500).json({
        error: "Discovery Engine 검색 실패",
        details: searchError.message,
        code: searchError.code,
        metadata: searchError.metadata,
        suggestion: "엔진 ID와 프로젝트 ID를 확인해주세요.",
        debug: {
          projectId: PROJECT_ID,
          engineId: ENGINE_ID,
          location: LOCATION,
          servingConfig: `projects/${PROJECT_ID}/locations/${LOCATION}/collections/${COLLECTION_ID}/engines/${ENGINE_ID}/servingConfigs/${SERVING_CONFIG_ID}`,
        },
      });
    }
  } catch (error) {
    console.error("Discovery Engine 테스트 오류:", error);
    res.status(500).json({
      error: "Discovery Engine 테스트 중 오류가 발생했습니다.",
      details: error.message,
      stack: error.stack,
    });
  }
}
