# 제주 여행 AI 코스 생성기

제주도 여행을 위한 AI 기반 맞춤 여행 코스 생성 애플리케이션입니다.

## 주요 기능

- 개인 맞춤 여행 코스: 사용자 유형과 성향에 따른 맞춤 여행 계획
- 파일 데이터 기반 AI 추천: CSV/JSON 실제 데이터 기반 장소 추천
- 실제 장소 데이터 활용: 제주도 관광지, 식당, 숙소 정보 사용
- 날씨/분위기/동행 조건 반영
- 예산/교통 정보 포함 일정 제안

## 기술 스택

- Frontend: Next.js, React, Tailwind CSS
- Backend: Next.js API Routes
- AI: OpenAI GPT (`gpt-4.1-mini` 기본)
- Data: CSV/JSON 기반 제주 장소 데이터
- Database: Supabase (PostgreSQL)
- Deployment: Vercel

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일에 아래 값을 설정하세요.

```env
# OpenAI API Key (필수)
OPENAI_API_KEY=your_openai_api_key_here

# OpenAI 모델 (선택, 기본값: gpt-4.1-mini)
OPENAI_MODEL=gpt-4.1-mini
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속.

## API

### 여행 코스 생성

`POST /api/generate-ai-course`

요청 예시:

```javascript
const response = await fetch("/api/generate-ai-course", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    userType: "커플",
    character: "로맨틱",
    filterText: {
      region: "제주",
      mood: "평화로운",
      weather: "맑음",
      companion: "연인",
    },
    spotType: "로맨틱 여행",
  }),
});
```

## 데이터 파일

`lib/` 디렉토리:

- `tourspot.csv`: 제주 관광지 정보
- `restaurant.json`: 제주 식당 정보
- `hotel.csv`: 제주 숙소 정보

## 배포

```bash
npm run build
vercel --prod
```

Vercel 환경 변수:

- `OPENAI_API_KEY`
- `OPENAI_MODEL` (옵션)

## 라이선스

MIT
