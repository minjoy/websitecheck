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
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // 토큰 검증
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: BigInt(payload.userId) },
      select: {
        id: true,
        email: true,
        isAdmin: true,
        isBlacklisted: true,
        profileCompletedAt: true,
        suppressProfilePopup: true,
      },
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        id: user.id.toString(),
        email: user.email,
        isAdmin: user.isAdmin,
        isBlacklisted: user.isBlacklisted,
        profileCompleted: !!user.profileCompletedAt,
        suppressProfilePopup: user.suppressProfilePopup,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
