import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { comparePassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // 사용자 조회
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다' }, { status: 401 });
    }

    if (!user.emailVerified) {
      return NextResponse.json({ error: '이메일 인증이 필요합니다' }, { status: 401 });
    }

    // 비밀번호 검증
    const isValid = await comparePassword(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다' }, { status: 401 });
    }

    // 로그인 시간 업데이트
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 로그인 액션 로그
    await prisma.userAction.create({
      data: {
        userId: user.id,
        actionType: 'LOGIN',
      },
    });

    // JWT 생성
    const token = generateToken({
      userId: user.id.toString(),
      email: user.email,
      isAdmin: user.isAdmin,
    });

    // 쿠키 설정
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60, // 15분
      sameSite: 'strict',
      path: '/',
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id.toString(),
        email: user.email,
        isAdmin: user.isAdmin,
      },
      shouldShowProfilePopup: !user.profileCompletedAt && !user.suppressProfilePopup,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
