// AI 맞춤 여행 코스 생성 API
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userType, character, description, filters, selectedSpots } =
      req.body;

    // 입력 데이터 검증
    if (!userType || !character) {
      return res.status(400).json({ error: "사용자 유형 정보가 필요합니다." });
    }

    // Gemini AI API 호출
    const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!geminiApiKey) {
      return res
        .status(500)
        .json({ error: "Gemini API 키가 설정되지 않았습니다." });
    }

    // AI 프롬프트 생성
    const prompt = `
당신은 제주도 여행 전문가입니다. 다음 정보를 바탕으로 개인 맞춤 1박 2일 제주 여행 코스를 상세히 작성해주세요.

**여행자 정보:**
- 돌하르방 유형: ${userType}
- 캐릭터: ${character}
- 성향 설명: ${description}

**선택된 필터:**
- 지역: ${filters.region === "all" ? "전체" : filters.region}
- 감정/무드: ${filters.mood === "all" ? "전체" : filters.mood}
- 날씨: ${filters.weather === "all" ? "전체" : filters.weather}
- 동행자: ${filters.companion === "all" ? "전체" : filters.companion}

**추천된 관심 장소들:**
${selectedSpots
  .map((spot) => `- ${spot.name} (${spot.region}, ${spot.mood})`)
  .join("\n")}

**요청사항:**
1. 위 여행자의 성향에 완벽하게 맞는 1박 2일 코스를 작성해주세요
2. 실제 제주도 장소들을 기반으로 구체적이고 현실적인 일정을 만들어주세요
3. 시간대별로 상세한 일정을 제공해주세요
4. 각 장소에서의 예상 소요시간과 이동시간도 포함해주세요
5. 식당, 카페, 숙소 추천도 포함해주세요
6. 해당 여행자 유형이 좋아할만한 특별한 체험이나 팁도 추가해주세요

**응답 형식:**
다음 JSON 형식으로만 응답해주세요:

{
  "title": "맞춤 여행 코스 제목",
  "summary": "코스 한 줄 요약",
  "day1": {
    "morning": [
      {
        "time": "09:00",
        "activity": "활동명",
        "location": "장소명",
        "duration": "소요시간",
        "description": "상세 설명",
        "tip": "여행자 유형별 특별 팁"
      }
    ],
    "afternoon": [...],
    "evening": [...]
  },
  "day2": {
    "morning": [...],
    "afternoon": [...]
  },
  "restaurants": [
    {
      "name": "식당명",
      "type": "식사 종류",
      "location": "위치",
      "specialty": "특징",
      "reason": "추천 이유"
    }
  ],
  "accommodation": {
    "name": "숙소명",
    "type": "숙소 유형",
    "location": "위치",
    "reason": "추천 이유"
  },
  "specialTips": [
    "여행자 유형에 맞는 특별한 팁들"
  ],
  "totalBudget": "예상 총 비용",
  "transportTips": "교통수단 추천"
}

JSON 형식으로만 응답하고, 다른 텍스트는 포함하지 마세요.
`;

    // Gemini AI API 호출
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
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
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

    // JSON 응답 파싱 시도
    let courseData;
    try {
      // JSON 형식만 추출 (```json ``` 제거)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        courseData = JSON.parse(jsonMatch[0]);
      } else {
        courseData = JSON.parse(aiResponse);
      }
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
