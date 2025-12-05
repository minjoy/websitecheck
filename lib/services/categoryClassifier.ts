// ========================================
// 상품 카테고리 자동 분류 서비스
// ========================================

import { CATEGORY_KEYWORD_MAP, getKeywordWeight } from './categoryKeywords';
import { CategoryCode, CategoryScore } from '../types/category';

/**
 * 불용어 목록 (의미 없는 토큰 제거용)
 */
const STOP_WORDS = new Set([
  '의', '가', '이', '은', '들', '는', '좀', '잘', '걍', '과', '도', '를', '으로', '자', '에',
  '와', '한', '하다', '공식', '정품', '신상', '새상품', '무료배송', '당일발송',
  '빠른배송', '특가', '할인', '세일', '이벤트', '증정', '사은품', '선물',
  '추천', '인기', '베스트', '1위', '판매량', '리뷰', '별점', '좋은',
  '+', '-', '/', '|', '[', ']', '(', ')', '{', '}', '<', '>',
]);

/**
 * 상품명 토크나이징
 * - 특수문자 제거
 * - 공백 기준 split
 * - 불용어 제거
 * - 소문자 변환
 *
 * @param title 상품명
 * @returns 토큰 배열
 */
export function tokenizeTitle(title: string): string[] {
  if (!title) return [];

  // 1. 특수문자를 공백으로 치환 (단, 알파벳과 한글, 숫자는 유지)
  let cleaned = title.replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣0-9]/g, ' ');

  // 2. 소문자 변환
  cleaned = cleaned.toLowerCase();

  // 3. 공백 기준 split
  const tokens = cleaned.split(/\s+/).filter(token => token.length > 0);

  // 4. 불용어 제거 및 짧은 토큰(1글자) 제거
  const filtered = tokens.filter(token => {
    return token.length > 1 && !STOP_WORDS.has(token);
  });

  return filtered;
}

/**
 * 토큰 배열에서 카테고리별 점수 계산
 *
 * @param tokens 토큰 배열
 * @returns 카테고리별 점수 맵
 */
export function computeCategoryScoresFromTokens(
  tokens: string[]
): Map<CategoryCode, number> {
  const scores = new Map<CategoryCode, number>();

  // 모든 카테고리 코드 초기화
  const categoryCodes = Object.keys(CATEGORY_KEYWORD_MAP) as CategoryCode[];
  categoryCodes.forEach(code => scores.set(code, 0));

  // 각 토큰에 대해
  tokens.forEach(token => {
    // 모든 카테고리를 순회하면서 키워드 매칭
    categoryCodes.forEach(categoryCode => {
      const weight = getKeywordWeight(categoryCode, token);
      if (weight > 0) {
        const currentScore = scores.get(categoryCode) || 0;
        scores.set(categoryCode, currentScore + weight);
      }
    });
  });

  return scores;
}

/**
 * 카테고리 점수에서 상위 N개 선택
 *
 * @param scores 카테고리별 점수 맵
 * @param topN 선택할 카테고리 개수 (기본 3개)
 * @returns 상위 카테고리 점수 배열
 */
export function selectTopCategories(
  scores: Map<CategoryCode, number>,
  topN: number = 3
): Array<{ categoryCode: CategoryCode; score: number }> {
  // 점수가 0보다 큰 카테고리만 필터링
  const validScores = Array.from(scores.entries())
    .filter(([_, score]) => score > 0)
    .map(([categoryCode, score]) => ({ categoryCode, score }));

  // 점수 기준 내림차순 정렬
  validScores.sort((a, b) => b.score - a.score);

  // 상위 N개만 선택
  return validScores.slice(0, topN);
}

/**
 * 상품명으로부터 카테고리 자동 추천 (전체 파이프라인)
 *
 * @param title 상품명
 * @param topN 추천할 카테고리 개수 (기본 3개)
 * @returns 추천 카테고리 배열
 */
export function suggestCategoriesFromTitle(
  title: string,
  topN: number = 3
): Array<{ categoryCode: CategoryCode; score: number }> {
  // 1. 토크나이징
  const tokens = tokenizeTitle(title);

  if (tokens.length === 0) {
    return [];
  }

  // 2. 카테고리 점수 계산
  const scores = computeCategoryScoresFromTokens(tokens);

  // 3. 상위 N개 선택
  const topCategories = selectTopCategories(scores, topN);

  return topCategories;
}

/**
 * 정규화된 점수 계산 (0~1 범위)
 *
 * @param rawScore 원본 점수
 * @param maxScore 최대 점수
 * @returns 0~1 사이의 정규화된 점수
 */
export function normalizeScore(rawScore: number, maxScore: number): number {
  if (maxScore === 0) return 0;
  return Math.min(rawScore / maxScore, 1.0);
}

/**
 * 카테고리 점수 배열을 정규화
 *
 * @param categories 카테고리 점수 배열
 * @returns 정규화된 카테고리 점수 배열
 */
export function normalizeCategoryScores(
  categories: Array<{ categoryCode: CategoryCode; score: number }>
): Array<{ categoryCode: CategoryCode; score: number }> {
  if (categories.length === 0) return [];

  const maxScore = Math.max(...categories.map(c => c.score));

  return categories.map(cat => ({
    categoryCode: cat.categoryCode,
    score: normalizeScore(cat.score, maxScore),
  }));
}

/**
 * 디버그용: 상품명 분석 결과 출력
 */
export function analyzeTitle(title: string): {
  tokens: string[];
  scores: Record<string, number>;
  topCategories: Array<{ categoryCode: CategoryCode; score: number }>;
} {
  const tokens = tokenizeTitle(title);
  const scoresMap = computeCategoryScoresFromTokens(tokens);
  const topCategories = selectTopCategories(scoresMap, 5);

  const scores: Record<string, number> = {};
  scoresMap.forEach((score, code) => {
    if (score > 0) {
      scores[code] = score;
    }
  });

  return {
    tokens,
    scores,
    topCategories,
  };
}
