import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId'); // 관리자가 특정 사용자 필터링

    // 현재 사용자 확인
    const currentUser = await prisma.user.findUnique({
      where: { id: BigInt(payload.userId) },
    });

    if (!currentUser) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 });
    }

    // 관리자가 아니면서 다른 사용자 조회 시도
    if (userId && !currentUser.isAdmin && userId !== payload.userId) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 });
    }

    // 조회할 사용자 ID 결정
    const targetUserId = userId ? BigInt(userId) : currentUser.id;

    const products = await prisma.product.findMany({
      where: {
        userId: targetUserId,
        status: 'ACTIVE',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isAdmin: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      products: products.map((p) => ({
        ...p,
        id: p.id.toString(),
        userId: p.userId?.toString(),
        user: p.user
          ? {
              id: p.user.id.toString(),
              email: p.user.email,
              isAdmin: p.user.isAdmin,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error('Get my products error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
