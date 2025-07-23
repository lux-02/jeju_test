import { supabase } from "../../lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // 모든 응답 데이터 조회
    const { data: responses, error: responsesError } = await supabase
      .from("quiz_responses")
      .select("question_id, selected_option");

    // 최종 결과 데이터 조회
    const { data: results, error: resultsError } = await supabase
      .from("quiz_results")
      .select("final_result");

    if (responsesError || resultsError) {
      return res.status(500).json({
        success: false,
        error: "데이터 조회 실패",
        details: { responsesError, resultsError },
      });
    }

    // 질문별 응답 비율 계산
    const questionStats = {};

    // 1-9번 질문 초기화
    for (let i = 1; i <= 9; i++) {
      questionStats[i] = {};
    }

    responses.forEach((response) => {
      const questionId = response.question_id;
      const option = response.selected_option;

      if (questionStats[questionId]) {
        questionStats[questionId][option] =
          (questionStats[questionId][option] || 0) + 1;
      }
    });

    // 질문 제목 및 옵션 매핑
    const questionTitles = {
      1: { title: "Q1: 여행 계획", optionA: "계획형", optionB: "즉흥형" },
      2: {
        title: "Q2: 예상치 못한 상황",
        optionA: "계획형",
        optionB: "즉흥형",
      },
      3: { title: "Q3: 비상 상황", optionA: "계획형", optionB: "즉흥형" },
      4: { title: "Q4: 여유로운 오전", optionA: "차분형", optionB: "활동형" },
      5: { title: "Q5: 이상적인 여행", optionA: "차분형", optionB: "활동형" },
      6: { title: "Q6: 제주의 밤", optionA: "차분형", optionB: "활동형" },
      7: { title: "Q7: 제주 버킷리스트", optionA: "체험형", optionB: "감성형" },
      8: { title: "Q8: 추억 정리", optionA: "체험형", optionB: "감성형" },
      9: { title: "Q9: 마지막 하루", optionA: "체험형", optionB: "감성형" },
    };

    // 막대그래프용 데이터 변환
    const barChartData = [];
    for (let i = 1; i <= 9; i++) {
      const stats = questionStats[i] || {};
      const questionInfo = questionTitles[i];

      // Q1-3: A,B / Q4-6: C,D / Q7-9: E,F
      let option1, option2, option1Count, option2Count;

      if (i <= 3) {
        option1 = "A";
        option2 = "B";
        option1Count = stats[option1] || 0;
        option2Count = stats[option2] || 0;
      } else if (i <= 6) {
        option1 = "C";
        option2 = "D";
        option1Count = stats[option1] || 0;
        option2Count = stats[option2] || 0;
      } else {
        option1 = "E";
        option2 = "F";
        option1Count = stats[option1] || 0;
        option2Count = stats[option2] || 0;
      }

      barChartData.push({
        name: questionInfo.title,
        [questionInfo.optionA]: option1Count,
        [questionInfo.optionB]: option2Count,
        total: option1Count + option2Count,
      });
    }

    // 최종 결과 비율 계산
    const finalResultStats = {};
    results.forEach((result) => {
      finalResultStats[result.final_result] =
        (finalResultStats[result.final_result] || 0) + 1;
    });

    // 원형그래프용 데이터 변환 (상위 8개만)
    const pieChartData = Object.entries(finalResultStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([type, count], index) => ({
        name: type,
        value: count,
        fill: getColorByIndex(index),
      }));

    // 총 응답자 수
    const totalResponses = results.length;

    // 세부 응답 데이터 조회 (최근 50개)
    const { data: detailedResponses, error: detailedError } = await supabase
      .from("quiz_responses")
      .select(
        "id, session_id, question_id, selected_option, question_text, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(50);

    if (detailedError) {
      console.error("세부 응답 조회 오류:", detailedError);
    }

    return res.status(200).json({
      success: true,
      data: {
        barChartData,
        pieChartData,
        questionStats,
        finalResultStats,
        totalResponses,
        detailedResponses: detailedResponses || [],
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("대시보드 데이터 조회 중 오류:", error);
    return res.status(500).json({
      success: false,
      error: "서버 오류",
      details: error.message,
    });
  }
}

// 차트 색상 생성 함수
function getColorByIndex(index) {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FECA57",
    "#FF9FF3",
    "#54A0FF",
    "#5F27CD",
  ];
  return colors[index % colors.length];
}
