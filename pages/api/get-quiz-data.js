import { supabase } from "../../lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { session_id } = req.query;

    if (session_id) {
      // 특정 세션의 데이터 조회
      const { data: responses, error: responsesError } = await supabase
        .from("quiz_responses")
        .select("*")
        .eq("session_id", session_id)
        .order("question_id", { ascending: true });

      const { data: result, error: resultError } = await supabase
        .from("quiz_results")
        .select("*")
        .eq("session_id", session_id)
        .single();

      if (responsesError || resultError) {
        return res.status(500).json({
          success: false,
          error: "데이터 조회 실패",
          details: { responsesError, resultError },
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          session_id,
          responses,
          result,
        },
      });
    } else {
      // 전체 데이터 통계 조회
      const { data: allResults, error: allResultsError } = await supabase
        .from("quiz_results")
        .select("final_result, completed_at")
        .order("completed_at", { ascending: false })
        .limit(50);

      const { count: totalCount, error: countError } = await supabase
        .from("quiz_results")
        .select("*", { count: "exact", head: true });

      if (allResultsError || countError) {
        return res.status(500).json({
          success: false,
          error: "통계 조회 실패",
          details: { allResultsError, countError },
        });
      }

      // 결과별 통계 계산
      const resultStats = {};
      allResults.forEach((item) => {
        resultStats[item.final_result] =
          (resultStats[item.final_result] || 0) + 1;
      });

      return res.status(200).json({
        success: true,
        data: {
          totalCount,
          recentResults: allResults,
          resultStats,
        },
      });
    }
  } catch (error) {
    console.error("데이터 조회 중 오류:", error);
    return res.status(500).json({
      success: false,
      error: "서버 오류",
      details: error.message,
    });
  }
}
