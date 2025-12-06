import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';
import { generateToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // 유효성 검사
    if (!email || !password) {
      return NextResponse.json({ error: '이메일과 비밀번호를 입력해주세요' }, { status: 400 });
    }

    if (password.length < 5) {
      return NextResponse.json({ error: '비밀번호는 5자 이상이어야 합니다' }, { status: 400 });
    }

    // 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: '이메일 인증을 먼저 완료해주세요' }, { status: 400 });
    }

    // 이미 회원가입이 완료된 사용자인지 확인
    if (user.emailVerified && user.passwordHash) {
      return NextResponse.json({ error: '이미 가입된 사용자입니다' }, { status: 400 });
    }

    // 비밀번호 해시화
    const passwordHash = await bcrypt.hash(password, 10);

    // 사용자 정보 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        emailVerified: true,
      },
    });

    // 회원가입 액션 로그
    await prisma.userAction.create({
      data: {
        userId: updatedUser.id,
        actionType: 'SIGNUP',
      },
    });

    // JWT 토큰 생성
    const token = generateToken({
      userId: updatedUser.id.toString(),
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });

    // 쿠키에 토큰 저장
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60, // 15분
      sameSite: 'strict',
    });

    return NextResponse.json({
      message: '회원가입이 완료되었습니다',
      user: {
        id: updatedUser.id.toString(),
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
