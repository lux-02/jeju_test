import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="ko">
      <Head>
        {/* 기본 메타데이터 */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FF6B35" />

        {/* 파비콘 */}
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" href="/favicon.ico?v=2" type="image/x-icon" />

        {/* SEO 메타데이터 */}
        <meta name="author" content="제주맹글이" />
        <meta
          name="keywords"
          content="제주도, 제주여행, 돌하르방, 여행유형테스트, 제주관광, 제주맹글이, 제주여행스타일, 제주도여행추천, 제주핫플레이스, 제주맛집, 제주액티비티, 제주힐링, 제주감성여행, 제주올레길, 제주카페, 제주숙소, 제주렌트카, 성산일출봉, 한라산, 우도, 섭지코지, 제주바다, 제주자연"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.제주맹글이.site/" />

        {/* 검색엔진 인증 */}
        <meta name="google-adsense-account" content="ca-pub-1884359786783237" />
        <meta
          name="naver-site-verification"
          content="0d3c93c9eb98ad1ac08c2e390af7e695e5e195c3"
        />
        <meta name="google-site-verification" content="" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
