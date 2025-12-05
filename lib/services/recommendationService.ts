// ========================================
// 추천 시스템 서비스 (기초 버전)
// ========================================

import db from '@/lib/db';
import type { LifeStage, JobIndustry } from '../types/profile';

/**
 * 사용자 프로필 기반 카테고리 가중치 계산
 *
 * @param userId 사용자 ID
 * @returns 카테고리 ID → 가중치 맵
 */
export async function getUserCategoryWeights(
  userId: number
): Promise<Map<number, number>> {
  const weights = new Map<number, number>();

  // 사용자 프로필 조회
  const [users] = await db.query(
    `SELECT life_stage, job_industry, age_group
     FROM users WHERE id = ?`,
    [userId]
  );

  if (!Array.isArray(users) || users.length === 0) {
    // 사용자 정보 없으면 균일 가중치 (1.0)
    return weights;
  }

  const user = users[0] as {
    life_stage: LifeStage | null;
    job_industry: JobIndustry | null;
    age_group: string | null;
  };

  // 모든 카테고리 ID 가져오기
  const [categories] = await db.query(
    'SELECT id, code FROM product_categories'
  );

  interface CategoryRow {
    id: number;
    code: string;
  }

  const categoryMap = new Map<string, number>();
  (categories as CategoryRow[]).forEach(cat => {
    categoryMap.set(cat.code, cat.id);
    weights.set(cat.id, 1.0); // 기본 가중치 1.0
  });

  // ========================================
  // 생활 단계에 따른 가중치 조정
  // ========================================
  if (user.life_stage) {
    switch (user.life_stage) {
      case 'PARENTS_BABY_0_3':
      case 'PARENTS_CHILD_4_7':
      case 'PARENTS_CHILD_8_13':
        // 육아 관련 카테고리 가중치 증가
        addWeight(weights, categoryMap, 'BABY_MOM', 2.5);
        addWeight(weights, categoryMap, 'CLEANING_ORGANIZING', 1.5);
        addWeight(weights, categoryMap, 'HEALTH_WELLNESS', 1.3);
        break;

      case 'SINGLE':
        // 1인 가구: 간편 식품, 소형 가전
        addWeight(weights, categoryMap, 'SMALL_APPLIANCE', 1.5);
        addWeight(weights, categoryMap, 'FOOD_BEVERAGE', 1.4);
        addWeight(weights, categoryMap, 'LIVING_ITEM', 1.3);
        break;

      case 'COUPLE_NO_CHILD':
        // 신혼/커플: 홈데코, 리빙, 가구
        addWeight(weights, categoryMap, 'HOME_DECO', 1.8);
        addWeight(weights, categoryMap, 'FURNITURE_INTERIOR', 1.6);
        addWeight(weights, categoryMap, 'KITCHEN_ITEM', 1.4);
        break;

      case 'MULTI_GENERATION':
        // 다세대: 주방, 청소, 생활용품
        addWeight(weights, categoryMap, 'KITCHEN_ITEM', 1.5);
        addWeight(weights, categoryMap, 'CLEANING_ORGANIZING', 1.5);
        addWeight(weights, categoryMap, 'LIVING_ITEM', 1.4);
        break;
    }
  }

  // ========================================
  // 직업에 따른 가중치 조정
  // ========================================
  if (user.job_industry) {
    switch (user.job_industry) {
      case 'IT_DEV':
      case 'DESIGN_CREATIVE':
        // IT/크리에이티브: 전자기기, 사무용품
        addWeight(weights, categoryMap, 'ELECTRONICS', 1.8);
        addWeight(weights, categoryMap, 'OFFICE_WORK', 1.5);
        break;

      case 'MEDICAL_HEALTH':
        // 의료/건강: 건강/웰니스
        addWeight(weights, categoryMap, 'HEALTH_WELLNESS', 2.0);
        break;

      case 'HOME_MAKER':
        // 주부: 주방, 청소, 육아
        addWeight(weights, categoryMap, 'KITCHEN_ITEM', 1.8);
        addWeight(weights, categoryMap, 'CLEANING_ORGANIZING', 1.7);
        addWeight(weights, categoryMap, 'BABY_MOM', 1.5);
        break;

      case 'STUDENT':
        // 학생: 문구, 전자기기, 패션
        addWeight(weights, categoryMap, 'OFFICE_WORK', 1.6);
        addWeight(weights, categoryMap, 'ELECTRONICS', 1.5);
        addWeight(weights, categoryMap, 'FASHION_CLOTHING', 1.4);
        break;

      case 'SELF_EMPLOYED':
        // 자영업: 주방, 식품, 사무용품
        addWeight(weights, categoryMap, 'KITCHEN_ITEM', 1.5);
        addWeight(weights, categoryMap, 'FOOD_BEVERAGE', 1.4);
        addWeight(weights, categoryMap, 'OFFICE_WORK', 1.3);
        break;
    }
  }

  return weights;
}

/**
 * 헬퍼 함수: 카테고리 가중치 추가
 */
function addWeight(
  weights: Map<number, number>,
  categoryMap: Map<string, number>,
  categoryCode: string,
  additionalWeight: number
): void {
  const categoryId = categoryMap.get(categoryCode);
  if (categoryId) {
    const currentWeight = weights.get(categoryId) || 1.0;
    weights.set(categoryId, currentWeight * additionalWeight);
  }
}

/**
 * 상품의 카테고리 벡터 조회
 *
 * @param productId 상품 ID
 * @returns 카테고리 ID → 점수 맵
 */
export async function getProductCategoryVector(
  productId: number
): Promise<Map<number, number>> {
  const vector = new Map<number, number>();

  const [rows] = await db.query(
    `SELECT category_id, score
     FROM product_categories_map
     WHERE product_id = ?`,
    [productId]
  );

  interface VectorRow {
    category_id: number;
    score: number;
  }

  (rows as VectorRow[]).forEach(row => {
    vector.set(row.category_id, row.score);
  });

  return vector;
}

/**
 * 사용자-상품 추천 점수 계산
 *
 * 공식: Σ_c ( user_weight[c] * product_score[c] )
 *
 * @param userId 사용자 ID
 * @param productId 상품 ID
 * @returns 추천 점수
 */
export async function computeProductScoreForUser(
  userId: number,
  productId: number
): Promise<number> {
  // 1. 사용자 카테고리 가중치
  const userWeights = await getUserCategoryWeights(userId);

  // 2. 상품 카테고리 벡터
  const productVector = await getProductCategoryVector(productId);

  // 3. 내적 계산
  let score = 0;
  productVector.forEach((productScore, categoryId) => {
    const userWeight = userWeights.get(categoryId) || 1.0;
    score += userWeight * productScore;
  });

  return score;
}

/**
 * 사용자를 위한 상품 목록 정렬 (추천 점수 기준)
 *
 * @param userId 사용자 ID
 * @param productIds 상품 ID 배열
 * @returns 추천 점수 기준 정렬된 상품 ID 배열
 */
export async function sortProductsByRecommendationScore(
  userId: number,
  productIds: number[]
): Promise<Array<{ productId: number; score: number }>> {
  const productScores: Array<{ productId: number; score: number }> = [];

  for (const productId of productIds) {
    const score = await computeProductScoreForUser(userId, productId);
    productScores.push({ productId, score });
  }

  // 점수 기준 내림차순 정렬
  productScores.sort((a, b) => b.score - a.score);

  return productScores;
}

/**
 * 카테고리 기반 추천 상품 조회 (간단 버전)
 *
 * @param userId 사용자 ID
 * @param limit 결과 개수
 * @returns 추천 상품 ID 배열
 */
export async function getRecommendedProducts(
  userId: number,
  limit: number = 20
): Promise<number[]> {
  // 1. 모든 활성 상품 조회
  const [products] = await db.query(
    `SELECT id FROM products WHERE status = 'ACTIVE' ORDER BY created_at DESC LIMIT ?`,
    [limit * 3] // 많이 가져와서 정렬 후 필터링
  );

  interface ProductRow {
    id: number;
  }

  const productIds = (products as ProductRow[]).map(p => p.id);

  if (productIds.length === 0) {
    return [];
  }

  // 2. 추천 점수 계산 및 정렬
  const scored = await sortProductsByRecommendationScore(userId, productIds);

  // 3. 상위 N개 반환
  return scored.slice(0, limit).map(item => item.productId);
}
