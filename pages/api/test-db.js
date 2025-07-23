import { supabase } from "../../lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // 테스트 세션 ID 생성
    const testSessionId = `test_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // 1. quiz_responses 테이블에 테스트 데이터 삽입
    const { data: responseData, error: responseError } = await supabase
      .from("quiz_responses")
      .insert([
        {
          session_id: testSessionId,
          question_id: 1,
          axis: "X",
          selected_option: "A",
          question_text: "테스트 질문",
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (responseError) {
      console.error("quiz_responses 삽입 오류:", responseError);
      return res.status(500).json({
        success: false,
        error: "quiz_responses 테이블 삽입 실패",
        details: responseError,
      });
    }

    // 2. quiz_results 테이블에 테스트 데이터 삽입
    const { data: resultData, error: resultError } = await supabase
      .from("quiz_results")
      .insert([
        {
          session_id: testSessionId,
          final_result: "A-C-E",
          answers: JSON.stringify({ X: ["A"], Y: ["C"], Z: ["E"] }),
          completed_at: new Date().toISOString(),
        },
      ])
      .select();

    if (resultError) {
      console.error("quiz_results 삽입 오류:", resultError);
      return res.status(500).json({
        success: false,
        error: "quiz_results 테이블 삽입 실패",
        details: resultError,
      });
    }

    // 3. 저장된 데이터 조회 테스트
    const { data: savedResponses, error: selectError } = await supabase
      .from("quiz_responses")
      .select("*")
      .eq("session_id", testSessionId);

    if (selectError) {
      console.error("데이터 조회 오류:", selectError);
      return res.status(500).json({
        success: false,
        error: "데이터 조회 실패",
        details: selectError,
      });
    }

    return res.status(200).json({
      success: true,
      message: "데이터베이스 연결 및 저장 성공!",
      data: {
        sessionId: testSessionId,
        insertedResponse: responseData,
        insertedResult: resultData,
        savedResponses: savedResponses,
      },
    });
  } catch (error) {
    console.error("데이터베이스 테스트 중 오류:", error);
    return res.status(500).json({
      success: false,
      error: "서버 오류",
      details: error.message,
    });
  }
}
