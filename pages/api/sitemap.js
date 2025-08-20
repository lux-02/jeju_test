// 동적 사이트맵 생성 API
export default function handler(req, res) {
  // 결과 코드들
  const resultCodes = [
    "A-C-E",
    "A-C-F",
    "A-D-E",
    "A-D-F",
    "B-C-E",
    "B-C-F",
    "B-D-E",
    "B-D-F",
  ];

  // 현재 날짜
  const today = new Date().toISOString().split("T")[0];

  // 사이트맵 XML 생성
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  
  <!-- 메인 페이지 -->
  <url>
    <loc>https://www.제주맹글이.site/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- 퀴즈 페이지 -->
  <url>
    <loc>https://www.제주맹글이.site/quiz</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- 레스토랑 페이지 -->
  <url>
    <loc>https://www.제주맹글이.site/restaurant</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- 결과 대시보드 -->
  <url>
    <loc>https://www.제주맹글이.site/result-dashboard</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- 결과 페이지들 -->
  ${resultCodes
    .map(
      (code) => `
  <url>
    <loc>https://www.제주맹글이.site/result/${code}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join("")}
  
</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=86400, stale-while-revalidate"
  ); // 24시간 캐시
  res.status(200).send(sitemap);
}
