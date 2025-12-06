import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: '토큰과 비밀번호를 입력해주세요' }, { status: 400 });
    }

    if (password.length < 5) {
      return NextResponse.json({ error: '비밀번호는 5자 이상이어야 합니다' }, { status: 400 });
    }

    // 토큰 찾기
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      return NextResponse.json({ error: '유효하지 않은 토큰입니다' }, { status: 400 });
    }

    // 만료 확인
    if (new Date() > resetToken.expiresAt) {
      return NextResponse.json({ error: '토큰이 만료되었습니다' }, { status: 400 });
    }

    // 사용 여부 확인
    if (resetToken.used) {
      return NextResponse.json({ error: '이미 사용된 토큰입니다' }, { status: 400 });
    }

    // 비밀번호 해시화
    const passwordHash = await bcrypt.hash(password, 10);

    // 비밀번호 업데이트
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    });

    // 토큰 사용 처리
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    return NextResponse.json({
      message: '비밀번호가 재설정되었습니다',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
