# 제주 여행 AI 코스 생성기

제주도 여행을 위한 AI 기반 맞춤 여행 코스 생성 애플리케이션입니다.

## 주요 기능

- 🎯 **개인 맞춤 여행 코스**: 사용자 유형과 성향에 따른 맞춤 여행 계획
- 📁 **파일 데이터 기반 AI**: CSV/JSON 파일을 직접 학습하여 정확한 장소 추천
- 📍 **실제 장소 데이터**: 제주도 실제 관광지, 식당, 숙소 정보 활용
- 🌤️ **날씨 및 분위기 고려**: 여행 조건에 따른 최적 코스 생성
- 💰 **예산 및 교통 정보**: 실용적인 여행 정보 제공

## 기술 스택

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI**: Google Gemini AI (파일 데이터 직접 학습)
- **Data**: CSV/JSON 파일 기반 실제 제주도 장소 데이터
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## 설치 및 실행

### 1. 프로젝트 클론 및 의존성 설치

```bash
git clone <repository-url>
cd jeju_test
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
# Gemini API Key (필수)
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Google Cloud Project ID (선택사항)
GOOGLE_CLOUD_PROJECT_ID=your_google_cloud_project_id_here

# Vertex AI Search Engine ID (선택사항)
VERTEX_SEARCH_ENGINE_ID=jejutestspot_1753769391527

# Google Cloud Service Account Key (선택사항)
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

## 파일 데이터 기반 AI 학습

### 1. 데이터 파일 구조

프로젝트의 `lib/` 디렉토리에 다음 파일들이 포함되어 있습니다:

- `tourspot.csv`: 제주도 관광지 정보 (1,392개 장소)
- `restaurant.json`: 제주도 식당 정보
- `hotel.csv`: 제주도 숙소 정보

### 2. AI 학습 방식

- CSV/JSON 파일을 직접 읽어서 Gemini AI에 전달
- 실제 제주도 장소 정보를 바탕으로 정확한 주소와 장소명 제공
- 파일 업로드 없이 로컬 데이터를 직접 활용

### 3. API 엔드포인트

#### 파일 데이터 기반 여행 코스 생성

```
POST /api/generate-ai-course
```

#### 데이터 파일 테스트

```
POST /api/test-db
```

### 4. 요청 예시

```javascript
// 파일 데이터 기반 코스 생성
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
    useVertexSearch: false, // Vertex AI Search 사용 여부
  }),
});

// Vertex AI Search 기반 코스 생성
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
    useVertexSearch: true, // Vertex AI Search 사용
  }),
});
```

## 데이터 구조

### 관광지 데이터 (tourspot.csv)

- 제목, 도로명주소, 인기점수, 지역, 메모

### 식당 데이터 (restaurant.json)

- 제목, 도로명주소, 인기점수, 지역, 메모, 타입

### 숙소 데이터 (hotel.csv)

- 제목, 도로명주소, 인기점수, 지역, 메모

## 배포

### Vercel 배포

```bash
npm run build
vercel --prod
```

### 환경 변수 설정 (Vercel)

Vercel 대시보드에서 다음 환경 변수를 설정하세요:

- `NEXT_PUBLIC_GEMINI_API_KEY`
- `GOOGLE_CLOUD_PROJECT_ID`
- `VERTEX_SEARCH_ENGINE_ID`
- `GOOGLE_APPLICATION_CREDENTIALS`

## 라이센스

MIT License

## 기여

프로젝트에 기여하고 싶으시다면 Pull Request를 보내주세요.
