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

    // 관리자 확인
    const admin = await prisma.user.findUnique({
      where: { id: BigInt(payload.userId) },
    });

    if (!admin || !admin.isAdmin) {
      return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 });
    }

    const { userId, blacklist } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: '사용자 ID가 필요합니다' }, { status: 400 });
    }

    // 사용자 블랙리스트 상태 업데이트
    await prisma.user.update({
      where: { id: BigInt(userId) },
      data: { isBlacklisted: blacklist },
    });

    return NextResponse.json({
      message: blacklist ? '사용자가 블랙리스트에 추가되었습니다' : '블랙리스트에서 해제되었습니다',
    });
  } catch (error) {
    console.error('Blacklist error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
