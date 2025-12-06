import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// API Route를 동적으로 설정 (쿼리 파라미터 사용)
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const isGroupBuy = searchParams.get('isGroupBuy') === 'true';
    const isAdminVerified = searchParams.get('isAdminVerified') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');

    const products = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        ...(isGroupBuy ? { isGroupBuy: true } : {}),
        ...(isAdminVerified ? { isAdminVerified: true } : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      select: {
        id: true,
        title: true,
        thumbnailUrl: true,
        normalPrice: true,
        salePrice: true,
        discountRate: true,
        isGroupBuy: true,
        isAdminVerified: true,
        favoriteCount: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      products: products.map((p: typeof products[number]) => ({
        ...p,
        id: p.id.toString(),
      })),
    });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
