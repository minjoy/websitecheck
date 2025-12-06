import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: '이메일과 인증 코드를 입력해주세요' }, { status: 400 });
    }

    // 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        emailVerificationTokens: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 });
    }

    // 가장 최근 인증 토큰 확인
    const latestToken = user.emailVerificationTokens[0];

    if (!latestToken) {
      return NextResponse.json({ error: '인증 코드를 먼저 요청해주세요' }, { status: 400 });
    }

    // 만료 시간 확인
    if (new Date() > latestToken.expiresAt) {
      return NextResponse.json({ error: '인증 코드가 만료되었습니다' }, { status: 400 });
    }

    // 코드 일치 확인
    if (latestToken.token !== code) {
      return NextResponse.json({ error: '인증 코드가 일치하지 않습니다' }, { status: 400 });
    }

    // 인증 성공 - 토큰 삭제
    await prisma.emailVerificationToken.delete({
      where: { id: latestToken.id },
    });

    return NextResponse.json({
      message: '이메일 인증이 완료되었습니다',
      verified: true,
    });
  } catch (error) {
    console.error('Verify code error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
