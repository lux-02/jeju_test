# Vertex AI Search 설정 가이드

이 문서는 제주 여행 AI 코스 생성기에 Vertex AI Search를 연동하는 방법을 설명합니다.

## 1. Google Cloud 프로젝트 설정

### 1.1 프로젝트 생성

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. 프로젝트 ID를 메모해두세요 (예: `my-jeju-project-123`)

### 1.2 API 활성화

다음 API들을 활성화하세요:

- Vertex AI API
- Vertex AI Search API
- Cloud Storage API

### 1.3 서비스 계정 생성

1. IAM & Admin > Service Accounts로 이동
2. "Create Service Account" 클릭
3. 서비스 계정 이름 입력 (예: `vertex-search-service`)
4. 역할 추가:
   - Vertex AI User
   - Vertex AI Search User
   - Storage Object Viewer
5. 키 생성 (JSON 형식) 및 다운로드

## 2. Vertex AI Search 엔진 설정

### 2.1 데이터 스토어 생성

1. Vertex AI > Search > Data stores로 이동
2. "Create data store" 클릭
3. 데이터 스토어 이름 입력 (예: `jeju-travel-data`)
4. 데이터 유형: "Structured data" 선택
5. 지역: `us-central1` 또는 `asia-northeast3` 선택

### 2.2 데이터 업로드

1. 생성된 데이터 스토어 클릭
2. "Import data" 클릭
3. 데이터 형식: JSON 선택
4. 데이터 업로드 방법 선택:
   - Cloud Storage에서 업로드
   - 직접 파일 업로드

### 2.3 데이터 형식 예시

```json
{
  "title": "성산일출봉",
  "address": "제주특별자치도 서귀포시 성산읍 일출로 284-12",
  "type": "tourspot",
  "region": "서귀포",
  "popularity": "높음",
  "description": "제주도에서 가장 아름다운 일출을 볼 수 있는 곳",
  "category": "자연경관",
  "tags": ["일출", "자연", "관광지"]
}
```

### 2.4 검색 엔진 생성

1. Vertex AI > Search > Search engines로 이동
2. "Create search engine" 클릭
3. 검색 엔진 이름 입력 (예: `jeju-travel-search`)
4. 데이터 스토어 선택: 위에서 생성한 데이터 스토어
5. 검색 설정 구성:
   - 검색 필드: title, description, tags
   - 필터 필드: type, region, category
   - 순위 필드: popularity

## 3. 환경 변수 설정

### 3.1 로컬 개발 환경

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Google Cloud Project ID
GOOGLE_CLOUD_PROJECT_ID=your-project-id-here

# Vertex AI Search Engine ID
VERTEX_SEARCH_ENGINE_ID=your-search-engine-id-here

# Google Cloud Service Account Key (JSON 파일 경로)
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json

# Gemini API Key
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key-here
```

### 3.2 Vercel 배포 환경

Vercel 대시보드에서 환경 변수를 설정하세요:

1. 프로젝트 설정 > Environment Variables
2. 다음 변수들을 추가:
   - `GOOGLE_CLOUD_PROJECT_ID`
   - `VERTEX_SEARCH_ENGINE_ID`
   - `GOOGLE_APPLICATION_CREDENTIALS` (서비스 계정 키 JSON 내용)
   - `NEXT_PUBLIC_GEMINI_API_KEY`

## 4. API 테스트

### 4.1 Vertex AI Search 테스트

```bash
curl -X POST http://localhost:3000/api/test-vertex-search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "로맨틱한 커플 여행"
  }'
```

### 4.2 RAG 기반 코스 생성 테스트

```bash
curl -X POST http://localhost:3000/api/generate-ai-course \
  -H "Content-Type: application/json" \
  -d '{
    "userType": "커플",
    "character": "로맨틱",
    "filterText": {
      "region": "제주",
      "mood": "평화로운",
      "weather": "맑음",
      "companion": "연인"
    },
    "useVertexSearch": true
  }'
```

## 5. 문제 해결

### 5.1 인증 오류

```
Error: Could not load the default credentials
```

**해결 방법:**

- 서비스 계정 키 파일 경로 확인
- `GOOGLE_APPLICATION_CREDENTIALS` 환경 변수 설정 확인
- 서비스 계정에 적절한 권한 부여

### 5.2 검색 엔진 오류

```
Error: Search engine not found
```

**해결 방법:**

- 검색 엔진 ID 확인
- 검색 엔진이 활성화되어 있는지 확인
- 프로젝트 ID가 올바른지 확인

### 5.3 데이터 스토어 오류

```
Error: Data store not found
```

**해결 방법:**

- 데이터 스토어가 생성되어 있는지 확인
- 데이터가 업로드되어 있는지 확인
- 검색 엔진이 올바른 데이터 스토어를 참조하는지 확인

## 6. 성능 최적화

### 6.1 검색 성능 향상

- 적절한 인덱스 설정
- 검색 필드 최적화
- 필터 조건 활용

### 6.2 비용 최적화

- 검색 요청 수 모니터링
- 캐싱 전략 수립
- 불필요한 API 호출 최소화

## 7. 모니터링

### 7.1 Google Cloud Console

- Vertex AI > Search > Search engines에서 사용량 확인
- Cloud Logging에서 오류 로그 확인

### 7.2 애플리케이션 로그

```javascript
// API 응답에서 검색 품질 정보 확인
{
  "success": true,
  "useVertexSearch": true,
  "searchQuality": {
    "totalResults": 15,
    "spotsFound": 8,
    "restaurantsFound": 4,
    "hotelsFound": 3,
    "averageRelevanceScore": 0.85
  }
}
```

## 8. 추가 리소스

- [Vertex AI Search 문서](https://cloud.google.com/vertex-ai-search)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Vertex AI API 참조](https://cloud.google.com/vertex-ai/docs/reference)
