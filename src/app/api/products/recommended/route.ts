import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');

    // 쿠키에서 토큰 확인 (로그인 선택사항)
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    let userId: bigint | null = null;
    let userCategoryWeights: Record<string, number> = {};

    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        userId = BigInt(payload.userId);

        // 사용자의 카테고리 가중치 가져오기
        const weights = await prisma.userCategoryWeight.findMany({
          where: { userId },
          include: { category: true },
        });

        for (const w of weights) {
          userCategoryWeights[w.categoryId.toString()] = w.weight;
        }
      }
    }

    // 상품 조회 (활성 상태, 숨김 아님)
    const products = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        isHidden: false,
      },
      include: {
        productCategoriesMaps: {
          include: {
            category: true,
          },
          where: {
            isPrimary: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            isAdmin: true,
          },
        },
      },
      take: 100, // 최대 100개 가져와서 점수 계산
    });

    // 각 상품에 점수 계산
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scoredProducts = products.map((product: any) => {
      let score = 0;

      // 기본 인기도 점수
      score += product.favoriteCount * 3;
      score += product.clickCount * 1;
      score += product.viewCount * 0.1;

      // 할인율 점수
      score += product.discountRate * 0.5;

      // 카테고리 가중치 적용 (로그인한 사용자만)
      if (userId && product.productCategoriesMaps.length > 0) {
        const categoryId = product.productCategoriesMaps[0].categoryId.toString();
        const weight = userCategoryWeights[categoryId] || 1;
        score *= weight;
      }

      return {
        ...product,
        score,
      };
    });

    // 점수순으로 정렬
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    scoredProducts.sort((a: any, b: any) => b.score - a.score);

    // 상위 N개 선택
    const recommended = scoredProducts.slice(0, limit);

    return NextResponse.json({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      products: recommended.map((p: any) => ({
        id: p.id.toString(),
        userId: p.userId?.toString(),
        title: p.title,
        description: p.description,
        thumbnailUrl: p.thumbnailUrl,
        externalUrl: p.externalUrl,
        normalPrice: p.normalPrice,
        salePrice: p.salePrice,
        discountRate: p.discountRate,
        sourceSite: p.sourceSite,
        reviewCount: p.reviewCount,
        rating: p.rating,
        pros: p.pros,
        cons: p.cons,
        summary: p.summary,
        partnerLabel: p.partnerLabel,
        isGroupBuy: p.isGroupBuy,
        isAdminVerified: p.isAdminVerified,
        viewCount: p.viewCount,
        clickCount: p.clickCount,
        favoriteCount: p.favoriteCount,
        reportCount: p.reportCount,
        createdAt: p.createdAt,
        user: p.user
          ? {
              id: p.user.id.toString(),
              email: p.user.email,
              isAdmin: p.user.isAdmin,
            }
          : null,
        category:
          p.productCategoriesMaps.length > 0
            ? {
                id: p.productCategoriesMaps[0].category.id.toString(),
                name: p.productCategoriesMaps[0].category.name,
                code: p.productCategoriesMaps[0].category.code,
              }
            : null,
        recommendationScore: p.score,
      })),
      isPersonalized: !!userId,
    });
  } catch (error) {
    console.error('Get recommended products error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
