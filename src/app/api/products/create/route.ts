import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: '유효하지 않은 토큰입니다' }, { status: 401 });
    }

    // 사용자 확인 및 블랙리스트 체크
    const user = await prisma.user.findUnique({
      where: { id: BigInt(payload.userId) },
    });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 });
    }

    if (user.isBlacklisted) {
      return NextResponse.json(
        { error: '신고/차단 되었습니다. 관리자에게 문의해 주세요' },
        { status: 403 }
      );
    }

    const {
      isGroupBuy,
      title,
      description,
      thumbnailUrl,
      externalUrl,
      normalPrice,
      salePrice,
      sourceSite,
      reviewCount,
      rating,
      pros,
      cons,
      summary,
      partnerLabel,
    } = await request.json();

    // 관리자 추천 특가는 관리자만 등록 가능
    if (!isGroupBuy && !user.isAdmin) {
      return NextResponse.json(
        { error: '관리자 추천 특가는 관리자만 등록할 수 있습니다' },
        { status: 403 }
      );
    }

    // 할인율 계산
    const discountRate =
      normalPrice > 0 ? Math.round(((normalPrice - salePrice) / normalPrice) * 100) : 0;

    // 상품 생성
    const product = await prisma.product.create({
      data: {
        userId: user.id,
        isGroupBuy,
        isAdminVerified: user.isAdmin,
        title,
        description,
        thumbnailUrl,
        externalUrl,
        normalPrice: parseInt(normalPrice),
        salePrice: parseInt(salePrice),
        discountRate,
        sourceSite,
        reviewCount: reviewCount ? parseInt(reviewCount) : null,
        rating: rating ? parseFloat(rating) : null,
        pros,
        cons,
        summary,
        partnerLabel,
      },
    });

    // 상품 생성 액션 로그
    await prisma.userAction.create({
      data: {
        userId: user.id,
        actionType: 'PRODUCT_CREATED',
        productId: product.id,
      },
    });

    // TODO: 카테고리 자동 분류 (나중에 구현)

    return NextResponse.json({
      message: '상품이 등록되었습니다',
      productId: product.id.toString(),
    });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
