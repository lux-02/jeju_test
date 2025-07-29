import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import styles from "../styles/Restaurant.module.css";

export default function Restaurant() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  // 네이버 맵 인증 실패 처리
  useEffect(() => {
    window.navermap_authFailure = function () {
      console.error("네이버 맵 API 인증 실패");
      setLoading(false);
    };
  }, []);

  useEffect(() => {
    // 네이버 맵 API 로드
    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=wekbmk5o2c&submodules=geocoder`;
    script.async = true;
    script.onload = () => {
      console.log("네이버 맵 API 로드 완료");
      loadRestaurants();
    };
    script.onerror = () => {
      console.error("네이버 맵 API 로드 실패");
      setLoading(false);
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // restaurants 상태가 변경될 때마다 맵 초기화
  useEffect(() => {
    if (
      restaurants.length > 0 &&
      typeof window !== "undefined" &&
      window.naver
    ) {
      console.log("restaurants 변경됨, 맵 초기화 시작");
      setTimeout(() => {
        initMap();
      }, 100);
    }
  }, [restaurants]);

  const loadRestaurants = async () => {
    try {
      const response = await fetch("/api/restaurants");
      if (!response.ok) {
        throw new Error("API 응답 오류");
      }
      const data = await response.json();
      console.log("레스토랑 데이터 로드 완료:", data.length, "개");
      setRestaurants(data);
      setLoading(false);
    } catch (error) {
      console.error("레스토랑 데이터 로드 실패:", error);
      setLoading(false);
    }
  };

  const initMap = () => {
    console.log("initMap 호출됨");
    console.log(
      "window.naver:",
      typeof window !== "undefined" ? !!window.naver : "undefined"
    );
    console.log("restaurants.length:", restaurants.length);

    if (typeof window !== "undefined" && window.naver) {
      try {
        console.log("맵 초기화 조건 만족");
        const mapOptions = {
          center: new window.naver.maps.LatLng(33.4996, 126.5312), // 제주도 중심
          zoom: 10,
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: window.naver.maps.MapTypeControlStyle.DROPDOWN,
          },
          zoomControl: true,
          zoomControlOptions: {
            style: window.naver.maps.ZoomControlStyle.SMALL,
            position: window.naver.maps.Position.TOP_RIGHT,
          },
          // 다크모드 스타일 설정
          mapTypeId: window.naver.maps.MapTypeId.NORMAL,
          backgroundColor: "#1a1a1a",
          draggable: true,
          pinchZoom: true,
          scrollWheel: true,
          keyboardShortcuts: true,
          disableDoubleTapZoom: false,
          disableDoubleClickZoom: false,
          disableTwoFingerTapZoom: false,
          zoomControl: true,
          mapDataControl: false,
          scaleControl: false,
          logoControl: false,
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: window.naver.maps.MapTypeControlStyle.DROPDOWN,
            position: window.naver.maps.Position.TOP_LEFT,
          },
        };

        const mapElement = document.getElementById("map");
        console.log("맵 엘리먼트:", mapElement);

        if (!mapElement) {
          console.error("맵 엘리먼트를 찾을 수 없습니다");
          return;
        }

        const mapInstance = new window.naver.maps.Map("map", mapOptions);
        console.log("맵 인스턴스 생성 완료");
        setMap(mapInstance);

        // 마커 생성 (레스토랑 데이터가 있을 때만)
        if (restaurants.length > 0) {
          const newMarkers = restaurants.map((restaurant, index) => {
            // 커스텀 마커 HTML 생성
            const markerHtml = `
              <div style="
                background: linear-gradient(135deg,rgba(37, 71, 204, 0.42),rgba(10, 41, 193, 0.43));
                border: 1px solidrgba(255, 255, 255, 0.5);
                border-radius: 50%;
                width: 14px;
                height: 14px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 12px;
                font-weight: bold;
              ">
                
              </div>
            `;

            const marker = new window.naver.maps.Marker({
              position: new window.naver.maps.LatLng(
                restaurant.py,
                restaurant.px
              ),
              map: mapInstance,
              title: restaurant.name,
              icon: {
                content: markerHtml,
                size: new window.naver.maps.Size(20, 20),
                anchor: new window.naver.maps.Point(10, 10),
              },
            });

            // 클릭 이벤트 추가
            window.naver.maps.Event.addListener(marker, "click", () => {
              setSelectedRestaurant(restaurant);
            });

            return marker;
          });

          console.log("마커 생성 완료:", newMarkers.length, "개");
          setMarkers(newMarkers);
        } else {
          console.log("레스토랑 데이터가 없어서 마커를 생성하지 않습니다");
        }
      } catch (error) {
        console.error("맵 초기화 오류:", error);
      }
    } else {
      console.log("맵 초기화 조건 불만족");
      console.log(
        "- window.naver:",
        typeof window !== "undefined" ? !!window.naver : "undefined"
      );
      console.log("- restaurants.length:", restaurants.length);
    }
  };

  const handleRestaurantClick = (restaurant) => {
    setSelectedRestaurant(restaurant);

    // 맵에서 해당 위치로 이동
    if (map) {
      try {
        const position = new window.naver.maps.LatLng(
          restaurant.py,
          restaurant.px
        );
        map.setCenter(position);
        map.setZoom(15);
      } catch (error) {
        console.error("맵 이동 오류:", error);
      }
    }
  };

  const clearMarkers = () => {
    markers.forEach((marker) => {
      marker.setMap(null);
    });
    setMarkers([]);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>제주 맛집 리스트</title>
        <meta name="description" content="제주도 맛집 리스트와 네이버 맵" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* 네비게이션 */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-black/40 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-white font-bold text-xl">
              🗿 제주맹글이
            </Link>
            <div className="flex space-x-6">
              <Link
                href="/"
                className="text-white/80 hover:text-white transition-colors"
              >
                여행유형 테스트
              </Link>
              <Link href="/restaurant" className="text-white font-bold">
                맛집 리스트
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>제주 맛집 리스트</h1>
          <p className={styles.subtitle}>
            제주도의 맛집 {restaurants.length}곳을 지도에서 확인해보세요
          </p>
        </header>

        <div className={styles.content}>
          <div className={styles.mapContainer}>
            <div id="map" className={styles.map}></div>

            {selectedRestaurant && (
              <div className={styles.restaurantInfo}>
                <h3>{selectedRestaurant.name}</h3>
                <p>
                  <strong>주소:</strong> {selectedRestaurant.address}
                </p>
                {selectedRestaurant.memo && (
                  <p>
                    <strong>메모:</strong> {selectedRestaurant.memo}
                  </p>
                )}
                <p>
                  <strong>카테고리:</strong> {selectedRestaurant.mcidName}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
