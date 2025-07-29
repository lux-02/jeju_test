// 환경 변수 설정 상태 확인 API
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const envStatus = {
      geminiApiKey: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
      googleCloudProjectId: !!process.env.GOOGLE_CLOUD_PROJECT_ID,
      vertexSearchEngineId: !!process.env.VERTEX_SEARCH_ENGINE_ID,
      googleApplicationCredentials:
        !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
    };

    const missingVars = [];
    if (!envStatus.geminiApiKey) missingVars.push("NEXT_PUBLIC_GEMINI_API_KEY");
    if (!envStatus.googleCloudProjectId)
      missingVars.push("GOOGLE_CLOUD_PROJECT_ID");
    if (!envStatus.vertexSearchEngineId)
      missingVars.push("VERTEX_SEARCH_ENGINE_ID");
    if (!envStatus.googleApplicationCredentials)
      missingVars.push("GOOGLE_APPLICATION_CREDENTIALS");

    const vertexSearchReady =
      envStatus.geminiApiKey &&
      envStatus.googleCloudProjectId &&
      envStatus.vertexSearchEngineId &&
      envStatus.googleApplicationCredentials;

    res.status(200).json({
      success: true,
      envStatus,
      missingVars,
      vertexSearchReady,
      message: vertexSearchReady
        ? "모든 환경 변수가 설정되어 있습니다. Vertex AI Search를 사용할 수 있습니다."
        : "일부 환경 변수가 설정되지 않았습니다. 기본 모드로만 작동합니다.",
    });
  } catch (error) {
    console.error("환경 변수 확인 오류:", error);
    res.status(500).json({
      error: "환경 변수 확인 중 오류가 발생했습니다.",
      details: error.message,
    });
  }
}
