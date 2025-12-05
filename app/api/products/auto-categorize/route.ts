import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/middleware/auth';
import {
  suggestCategoriesFromTitle,
  normalizeCategoryScores,
} from '@/lib/services/categoryClassifier';
import { getCategoryByCode } from '@/lib/services/categoryService';
import type { CategoryScore } from '@/lib/types/category';

/**
 * POST /api/products/auto-categorize
 * 상품명으로부터 카테고리 자동 추천
 *
 * Body: { title: string, topN?: number }
 * Response: { suggestedCategories: CategoryScore[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, topN = 3 } = body;

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: '상품명이 필요합니다' },
        { status: 400 }
      );
    }

    // 1. 상품명에서 카테고리 추천
    const suggestedCategories = suggestCategoriesFromTitle(title, topN);

    if (suggestedCategories.length === 0) {
      return NextResponse.json({
        message: '추천할 카테고리를 찾을 수 없습니다',
        suggestedCategories: [],
      });
    }

    // 2. 점수 정규화 (0~1 범위)
    const normalizedCategories = normalizeCategoryScores(suggestedCategories);

    // 3. DB에서 카테고리 상세 정보 가져오기
    const categoryDetails: CategoryScore[] = [];
    for (let i = 0; i < normalizedCategories.length; i++) {
      const cat = normalizedCategories[i];
      const category = await getCategoryByCode(cat.categoryCode);

      if (category) {
        categoryDetails.push({
          categoryId: category.id,
          categoryCode: category.code,
          categoryName: category.name,
          score: cat.score,
          isPrimary: i === 0, // 첫 번째가 primary
        });
      }
    }

    return NextResponse.json({
      suggestedCategories: categoryDetails,
    });
  } catch (error) {
    console.error('Auto categorize error:', error);
    return createErrorResponse(error);
  }
}
