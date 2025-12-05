// 상품 조회 및 클릭 추적 시스템

interface ProductStats {
  viewCount: number;
  clickCount: number;
  favoriteCount: number;
  lastViewed: string;
}

interface ProductAnalytics {
  [productId: string]: ProductStats;
}

const ANALYTICS_STORAGE_KEY = 'product_analytics';

// 상품 통계 가져오기
export function getProductStats(productId: string): ProductStats {
  if (typeof window === 'undefined') {
    return { viewCount: 0, clickCount: 0, favoriteCount: 0, lastViewed: new Date().toISOString() };
  }

  const data = localStorage.getItem(ANALYTICS_STORAGE_KEY);
  const analytics: ProductAnalytics = data ? JSON.parse(data) : {};

  return analytics[productId] || { viewCount: 0, clickCount: 0, favoriteCount: 0, lastViewed: new Date().toISOString() };
}

// 모든 상품 통계 가져오기
export function getAllProductStats(): ProductAnalytics {
  if (typeof window === 'undefined') return {};

  const data = localStorage.getItem(ANALYTICS_STORAGE_KEY);
  return data ? JSON.parse(data) : {};
}

// 상품 조회수 증가
export function trackProductView(productId: string): void {
  if (typeof window === 'undefined') return;

  const analytics = getAllProductStats();
  const stats = analytics[productId] || { viewCount: 0, clickCount: 0, favoriteCount: 0, lastViewed: new Date().toISOString() };

  stats.viewCount += 1;
  stats.lastViewed = new Date().toISOString();

  analytics[productId] = stats;
  localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(analytics));

  // 이벤트 발생
  window.dispatchEvent(new CustomEvent('product-view', { detail: { productId, stats } }));
}

// 상품 클릭수 증가 (URL 클릭 시)
export function trackProductClick(productId: string): void {
  if (typeof window === 'undefined') return;

  const analytics = getAllProductStats();
  const stats = analytics[productId] || { viewCount: 0, clickCount: 0, favoriteCount: 0, lastViewed: new Date().toISOString() };

  stats.clickCount += 1;
  stats.lastViewed = new Date().toISOString();

  analytics[productId] = stats;
  localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(analytics));

  // 이벤트 발생
  window.dispatchEvent(new CustomEvent('product-click', { detail: { productId, stats } }));
}

// 즐겨찾기 수 업데이트
export function updateFavoriteCount(productId: string, isFavorite: boolean): void {
  if (typeof window === 'undefined') return;

  const analytics = getAllProductStats();
  const stats = analytics[productId] || { viewCount: 0, clickCount: 0, favoriteCount: 0, lastViewed: new Date().toISOString() };

  stats.favoriteCount += isFavorite ? 1 : -1;
  if (stats.favoriteCount < 0) stats.favoriteCount = 0;

  analytics[productId] = stats;
  localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(analytics));

  // 이벤트 발생
  window.dispatchEvent(new CustomEvent('product-favorite', { detail: { productId, stats, isFavorite } }));
}

// 상품 작성자에게 표시할 통계 정보
export function getProductStatsForAuthor(productId: string): ProductStats & { engagementRate: number } {
  const stats = getProductStats(productId);
  const engagementRate = stats.viewCount > 0
    ? ((stats.clickCount + stats.favoriteCount) / stats.viewCount * 100)
    : 0;

  return {
    ...stats,
    engagementRate: Math.round(engagementRate * 100) / 100,
  };
}

// 인기도 점수 계산 (정렬에 사용)
export function calculatePopularityScore(productId: string): number {
  const stats = getProductStats(productId);

  // 가중치: 조회수 1점, 클릭 3점, 즐겨찾기 5점
  const score = (stats.viewCount * 1) + (stats.clickCount * 3) + (stats.favoriteCount * 5);

  return score;
}

// 상품 목록을 인기도 순으로 정렬
export function sortByPopularity<T extends { id: string }>(products: T[]): T[] {
  return [...products].sort((a, b) => {
    const scoreA = calculatePopularityScore(a.id);
    const scoreB = calculatePopularityScore(b.id);
    return scoreB - scoreA;
  });
}

// 카테고리 + 인기도 기반 추천 정렬
export function sortByRelevance<T extends { id: string; category: string }>(
  products: T[],
  userInterests: string[]
): T[] {
  if (userInterests.length === 0) {
    // 관심사가 없으면 인기도 순으로만 정렬
    return sortByPopularity(products);
  }

  return [...products].sort((a, b) => {
    // 인기도 점수
    const popularityA = calculatePopularityScore(a.id);
    const popularityB = calculatePopularityScore(b.id);

    // 카테고리 매칭 점수 (일치하면 50점 보너스)
    const categoryA = userInterests.includes(a.category) ? 50 : 0;
    const categoryB = userInterests.includes(b.category) ? 50 : 0;

    // 총점 계산
    const totalA = popularityA + categoryA;
    const totalB = popularityB + categoryB;

    return totalB - totalA;
  });
}
