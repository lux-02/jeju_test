import { supabase } from "../../lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { session_id, response_id } = req.query;

    if (!session_id && !response_id) {
      return res.status(400).json({
        success: false,
        error: "session_id 또는 response_id가 필요합니다.",
      });
    }

    if (session_id) {
      // 전체 세션 삭제
      const { error: responsesError } = await supabase
        .from("quiz_responses")
        .delete()
        .eq("session_id", session_id);

      const { error: resultsError } = await supabase
        .from("quiz_results")
        .delete()
        .eq("session_id", session_id);

      if (responsesError || resultsError) {
        return res.status(500).json({
          success: false,
          error: "세션 삭제 실패",
          details: { responsesError, resultsError },
        });
      }

      return res.status(200).json({
        success: true,
        message: `세션 ${session_id} 전체가 삭제되었습니다.`,
      });
    }

    if (response_id) {
      // 개별 응답 삭제
      const { error: responseError } = await supabase
        .from("quiz_responses")
        .delete()
        .eq("id", response_id);

      if (responseError) {
        return res.status(500).json({
          success: false,
          error: "응답 삭제 실패",
          details: responseError,
        });
      }

      return res.status(200).json({
        success: true,
        message: `응답 ${response_id}가 삭제되었습니다.`,
      });
    }
  } catch (error) {
    console.error("응답 삭제 중 오류:", error);
    return res.status(500).json({
      success: false,
      error: "서버 오류",
      details: error.message,
    });
  }
}
