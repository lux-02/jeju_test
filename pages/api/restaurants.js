import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const filePath = path.join(process.cwd(), "lib", "restaurant.json");
    const fileContent = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(fileContent);

    // bookmarkList에서 필요한 정보만 추출
    const restaurants = data.bookmarkList.map((item) => ({
      bookmarkId: item.bookmarkId,
      name: item.name,
      address: item.address,
      px: item.px, // 경도
      py: item.py, // 위도
      memo: item.memo,
      mcidName: item.mcidName,
      type: item.type,
    }));

    res.status(200).json(restaurants);
  } catch (error) {
    console.error("레스토랑 데이터 로드 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
}
