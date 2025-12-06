import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: '이메일을 입력해주세요' }, { status: 400 });
    }

    // 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // 보안상 동일한 메시지 반환
      return NextResponse.json({
        message: '비밀번호 재설정 링크가 이메일로 전송되었습니다',
      });
    }

    // 랜덤 토큰 생성
    const token = crypto.randomBytes(32).toString('hex');

    // 1시간 후 만료
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // 기존 토큰 삭제
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // 새 토큰 생성
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // 재설정 링크
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    // 이메일 전송
    await sendPasswordResetEmail(email, resetLink);

    return NextResponse.json({
      message: '비밀번호 재설정 링크가 이메일로 전송되었습니다',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
