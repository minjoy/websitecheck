import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// 상품 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = BigInt(params.id);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isAdmin: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다' }, { status: 404 });
    }

    return NextResponse.json({
      product: {
        ...product,
        id: product.id.toString(),
        userId: product.userId?.toString(),
        user: product.user
          ? {
              id: product.user.id.toString(),
              email: product.user.email,
              isAdmin: product.user.isAdmin,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

// 상품 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const productId = BigInt(params.id);

    // 상품 찾기
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { user: true },
    });

    if (!product) {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다' }, { status: 404 });
    }

    // 권한 확인 (본인 또는 관리자)
    const currentUser = await prisma.user.findUnique({
      where: { id: BigInt(payload.userId) },
    });

    if (!currentUser) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 });
    }

    const isOwner = product.userId?.toString() === payload.userId;
    const isAdmin = currentUser.isAdmin;

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: '수정 권한이 없습니다' }, { status: 403 });
    }

    const {
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

    // 할인율 계산
    const discountRate =
      normalPrice > 0 ? Math.round(((normalPrice - salePrice) / normalPrice) * 100) : 0;

    // 상품 업데이트
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
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

    return NextResponse.json({
      message: '상품이 수정되었습니다',
      product: {
        ...updatedProduct,
        id: updatedProduct.id.toString(),
        userId: updatedProduct.userId?.toString(),
      },
    });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

// 상품 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const productId = BigInt(params.id);

    // 상품 찾기
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다' }, { status: 404 });
    }

    // 권한 확인 (본인 또는 관리자)
    const currentUser = await prisma.user.findUnique({
      where: { id: BigInt(payload.userId) },
    });

    if (!currentUser) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 });
    }

    const isOwner = product.userId?.toString() === payload.userId;
    const isAdmin = currentUser.isAdmin;

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: '삭제 권한이 없습니다' }, { status: 403 });
    }

    // 상품 삭제 (소프트 삭제)
    await prisma.product.update({
      where: { id: productId },
      data: { status: 'DELETED' },
    });

    return NextResponse.json({
      message: '상품이 삭제되었습니다',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
