// 돌하르방 유형 코드와 유형명 매핑
export const TYPE_MAPPING = {
  "A-C-E": "체험형",
  "A-C-F": "힐링형",
  "A-D-E": "액티비티형",
  "A-D-F": "먹방형",
  "B-C-E": "레트로형",
  "B-C-F": "문화예술형",
  "B-D-E": "인생샷투어형",
  "B-D-F": "네트워킹형",
};

// 코드를 유형명으로 변환하는 헬퍼 함수
export const getTypeName = (code) => {
  return TYPE_MAPPING[code] || code;
};
