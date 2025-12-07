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

    // 관리자 확인
    const user = await prisma.user.findUnique({
      where: { id: BigInt(payload.userId) },
    });

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId'); // 특정 사용자 필터

    const products = await prisma.product.findMany({
      where: {
        ...(userId && { userId: BigInt(userId) }),
        status: 'ACTIVE',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isAdmin: true,
            isBlacklisted: true,
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
              isBlacklisted: p.user.isBlacklisted,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error('Get admin products error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
