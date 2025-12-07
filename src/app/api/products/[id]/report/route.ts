import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(
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
    const { reason } = await request.json();

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json({ error: '신고 사유를 입력해주세요' }, { status: 400 });
    }

    // 상품 확인
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다' }, { status: 404 });
    }

    // 이미 신고한 적이 있는지 확인
    const existingReport = await prisma.productReport.findUnique({
      where: {
        userId_productId: {
          userId: BigInt(payload.userId),
          productId,
        },
      },
    });

    if (existingReport) {
      return NextResponse.json({ error: '이미 신고한 상품입니다' }, { status: 400 });
    }

    // 신고 생성
    await prisma.productReport.create({
      data: {
        userId: BigInt(payload.userId),
        productId,
        reason,
      },
    });

    // 신고 수 증가
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        reportCount: {
          increment: 1,
        },
      },
    });

    // 신고 수가 3회 이상이면 자동 숨김
    if (updatedProduct.reportCount >= 3) {
      await prisma.product.update({
        where: { id: productId },
        data: { isHidden: true },
      });
    }

    return NextResponse.json({
      message: '신고가 접수되었습니다',
      reportCount: updatedProduct.reportCount,
      isHidden: updatedProduct.reportCount >= 3,
    });
  } catch (error) {
    console.error('Report product error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
