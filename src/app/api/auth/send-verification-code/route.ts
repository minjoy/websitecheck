import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateVerificationCode, sendVerificationEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: '유효한 이메일을 입력해주세요' }, { status: 400 });
    }

    // 이미 가입된 이메일인지 확인
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.emailVerified) {
      return NextResponse.json({ error: '이미 가입된 이메일입니다' }, { status: 400 });
    }

    // 4자리 랜덤 인증 코드 생성
    const code = generateVerificationCode();

    // 5분 후 만료
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // 기존 사용자가 있으면 해당 사용자 ID, 없으면 임시 사용자 생성
    let userId: bigint;

    if (existingUser) {
      userId = existingUser.id;

      // 기존 인증 토큰 삭제
      await prisma.emailVerificationToken.deleteMany({
        where: { userId },
      });
    } else {
      // 임시 사용자 생성 (비밀번호는 나중에 설정)
      const tempUser = await prisma.user.create({
        data: {
          email,
          passwordHash: '', // 임시값
          emailVerified: false,
        },
      });
      userId = tempUser.id;
    }

    // 새 인증 토큰 생성
    await prisma.emailVerificationToken.create({
      data: {
        userId,
        token: code,
        expiresAt,
      },
    });

    // 이메일 전송
    const emailSent = await sendVerificationEmail(email, code);

    if (!emailSent) {
      return NextResponse.json({ error: '이메일 전송에 실패했습니다' }, { status: 500 });
    }

    return NextResponse.json({
      message: '인증 코드가 이메일로 전송되었습니다',
      expiresIn: 300, // 5분 (초 단위)
    });
  } catch (error) {
    console.error('Send verification code error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
